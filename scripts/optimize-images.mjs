import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const contactOnly = process.argv.includes('--contact');
const source = path.resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || '../Assets Site');
const output = path.resolve('public/images');
await fs.mkdir(output, { recursive: true });
await fs.mkdir('src', { recursive: true });
await fs.mkdir('.qa', { recursive: true });
const manifest = {};
const thumbs = [];
const upscaled = [];
// Fotos de largura total (hero e banners) ganham a versão 2400
const fullWidth = ['1-1', '1-2', '1-3', '1-4', '3-1', '5-1', 'footer-1'];
// Recortes centrais (largura/altura): `crop` para o desktop e `mobile` para telas até 600px (arquivos -m-).
// Cada recorte precisa conter toda a área visível da foto no layout correspondente.
const art = {
  '1-1': { crop: 4 / 3, mobile: 9 / 16 }, '1-2': { mobile: 9 / 16 }, '1-3': { mobile: 9 / 16 }, '1-4': { mobile: 9 / 16 },
  '5-1': { mobile: 1 }, 'footer-1': { crop: 4 / 3, mobile: 1 },
};
// Gera as larguras de um recorte; o 2400 sempre tem a largura do nome (ampliado se preciso)
async function writeVariants(input, meta, name, widths, ratio) {
  const width = ratio ? Math.min(meta.width, Math.round(meta.height * ratio)) : meta.width;
  const height = ratio ? Math.round(width / ratio) : meta.height;
  for (const w of contactOnly ? [] : widths) {
    const enlarge = w === 2400;
    if (enlarge && w > width) upscaled.push(`${name}-${w}.webp (original ${width}px)`);
    const dest = path.join(output, `${name}-${w}.webp`);
    await sharp(input).rotate().resize({ width: w, height: ratio && Math.round(w / ratio), withoutEnlargement: !enlarge }).webp({ quality: 80, effort: 4 }).toFile(dest);
    optimizedBytes += (await fs.stat(dest)).size;
  }
  return { width, height, widths };
}
let originalBytes = 0;
let optimizedBytes = 0;
for (const dir of (await fs.readdir(source, { withFileTypes: true })).filter(d => d.isDirectory())) {
  const group = dir.name.match(/^\d+/)?.[0] || (dir.name.startsWith('Logo') ? 'logo' : 'footer');
  const files = (await fs.readdir(path.join(source, dir.name))).filter(f => /\.(jpg|png|jpeg)$/i.test(f)).sort();
  for (const [index, file] of files.entries()) {
    const input = path.join(source, dir.name, file);
    const id = `${group}-${index + 1}`;
    const meta = await sharp(input).metadata();
    originalBytes += (await fs.stat(input)).size;
    const widths = group === 'logo' ? [400, 800] : fullWidth.includes(id) ? [480, 960, 1600, 2400] : [480, 960, 1600];
    const { crop, mobile } = art[id] || {};
    manifest[id] = { ...await writeVariants(input, meta, id, widths, crop), source: `${dir.name}/${file}` };
    if (mobile) manifest[id].mobile = await writeVariants(input, meta, `${id}-m`, [480, 960, 1600], mobile);
    const thumb = await sharp(input).rotate().resize(180, 140, { fit: 'contain', background: '#ddd' }).flatten({ background: '#ddd' }).jpeg().toBuffer();
    thumbs.push({ id, thumb });
    console.log(`Optimized ${id}: ${file}`);
  }
}
if (!contactOnly) await fs.writeFile('src/images.json', JSON.stringify(manifest, null, 2));
const cols = 6;
const composites = thumbs.flatMap(({ id, thumb }, i) => {
  const left = (i % cols) * 180;
  const top = Math.floor(i / cols) * 166;
  const label = Buffer.from(`<svg width="180" height="26"><rect width="180" height="26" fill="white"/><text x="8" y="18" font-size="16">${id}</text></svg>`);
  return [{ input: thumb, left, top }, { input: label, left, top: top + 140 }];
});
await sharp({ create: { width: cols * 180, height: Math.ceil(thumbs.length / cols) * 166, channels: 3, background: 'white' } }).composite(composites).jpeg().toFile('.qa/contact-sheet.jpg');
console.log(JSON.stringify({ originalMB: +(originalBytes / 1048576).toFixed(2), allResponsiveVariantsMB: +(optimizedBytes / 1048576).toFixed(2) }));
if (upscaled.length) console.log(`Ampliados (substitua por originais maiores):\n  ${upscaled.join('\n  ')}`);
