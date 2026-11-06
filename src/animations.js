import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const splitTargets = '.intro-copy, .intro-outro, .process > .eyebrow, .solutions-copy h2, .solutions-copy p, .mosaic-copy h2, .mosaic-copy p, .closing-banner p, .footer p';
const revealTargets = '.intro .photo, .mosaic .tile';
const parallaxTargets = ['.kitchen-banner', '.solutions-banner', '.closing-banner'];

export function useSiteAnimations() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Hero: entrada da foto e do logo, depois parallax e fade ao rolar
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero .photo img', { scale: 1.14, duration: 2.4, ease: 'power2.out' })
        .from('.hero > .logo img', { autoAlpha: 0, yPercent: 25, duration: 1.4 }, .35)
        // fromTo explícito: com .from o GSAP lia opacity 0 como valor final e os dots ficavam invisíveis
        .fromTo('.hero .swiper-pagination', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, .8);
      const heroScroll = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-swiper', { yPercent: 22, ease: 'none', scrollTrigger: heroScroll });
      gsap.to('.hero > .logo', { yPercent: -60, autoAlpha: 0, ease: 'none', scrollTrigger: { ...heroScroll, end: '60% top' } });

      // Textos: linhas surgem de dentro de uma máscara
      gsap.utils.toArray(splitTargets).forEach(el => SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: self => gsap.from(self.lines, {
          yPercent: 105, duration: 1.15, ease: 'power4.out', stagger: .085,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
      }));

      // Fotos: cortina de baixo para cima com zoom-out da imagem
      gsap.utils.toArray(revealTargets).forEach(photo => {
        const order = Array.from(photo.parentElement.children).indexOf(photo);
        gsap.timeline({ delay: (order % 4) * .12, scrollTrigger: { trigger: photo, start: 'top 90%', once: true } })
          .fromTo(photo, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
          .from(photo.querySelector('img'), { scale: 1.3, duration: 2, ease: 'expo.out' }, .1);
      });

      // Banners de largura total: parallax da imagem
      parallaxTargets.forEach(selector => {
        const img = document.querySelector(`${selector} img`);
        gsap.fromTo(img, { yPercent: -8, scale: 1.2 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: selector, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
      gsap.from('.solutions-banner .scroll-cue', { autoAlpha: 0, y: 30, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.solutions-banner', start: 'center 75%', once: true } });

      // Processo: o carrossel sobe junto do título
      gsap.from('.process-swiper', { autoAlpha: 0, y: 70, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: '.process', start: 'top 75%', once: true } });

      // Rodapé
      gsap.from('.footer .logo', { autoAlpha: 0, y: 40, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.footer .logo', start: 'top 95%', once: true } });
    });
  });
}

// Anima o conteúdo do slide ativo do carrossel de processo
export function animateProcessSlide(swiper) {
  if (prefersReducedMotion()) return;
  const slide = swiper.slides[swiper.activeIndex];
  if (!slide) return;
  gsap.fromTo(slide.querySelectorAll('.process-copy > *'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12, delay: .1, overwrite: true });
  gsap.fromTo(slide.querySelector('.photo img'), { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'expo.out', overwrite: true });
}
