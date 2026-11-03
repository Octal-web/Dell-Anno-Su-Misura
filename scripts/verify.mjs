import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://127.0.0.1:5173/su-misura/', { waitUntil: 'networkidle' });
    console.log(`Loaded ${viewport.width}px`);
    await page.locator('.hero img').first().waitFor();
    for (const selector of ['.hero-swiper', '.process-swiper']) {
      const slider = page.locator(selector);
      await slider.scrollIntoViewIfNeeded();
      await slider.locator('.swiper-pagination-bullet').nth(1).click();
      await page.waitForTimeout(750);
      if (!(await slider.locator('.swiper-pagination-bullet').nth(1).getAttribute('class')).includes('active')) throw new Error(`Pagination failed: ${selector}`);
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(750);
      if (!(await slider.locator('.swiper-pagination-bullet').nth(2).getAttribute('class')).includes('active')) throw new Error(`Keyboard failed: ${selector}`);
    }
    console.log(`Carousels passed ${viewport.width}px`);
    await page.evaluate(async () => {
      for (const img of document.images) { img.loading = 'eager'; }
      await Promise.all(Array.from(document.images, img => img.decode().catch(() => {})));
    });
    const state = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, broken: Array.from(document.images).filter(i => !i.complete || !i.naturalWidth).map(i => i.src), h1: document.querySelectorAll('h1').length }));
    if (state.overflow || state.broken.length || state.h1 !== 1) throw new Error(JSON.stringify(state));
    await page.locator('.hero-swiper .swiper-pagination-bullet').first().click();
    await page.locator('.process-swiper .swiper-pagination-bullet').first().click();
    await page.waitForTimeout(750);
    await page.evaluate(() => scrollTo(0, 0));
    await fs.mkdir('.qa', { recursive: true });
    await page.screenshot({ path: `.qa/site-${viewport.width}.png`, fullPage: true });
    console.log(`PASS ${viewport.width}px: images, no overflow, both carousels, keyboard, no runtime errors`);
    await page.close();
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally { await browser.close(); }
