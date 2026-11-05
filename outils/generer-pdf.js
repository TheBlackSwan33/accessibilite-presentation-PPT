// Régénère presentation-powerpoint-accessible.pdf à partir de index.html.
// Usage : FONT_DIR=<fichiers woff2 d'Open Sans> ICONS_DIR=<icônes simple-icons> node outils/generer-pdf.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const racine = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const ICONS = process.env.ICONS_DIR, FONTS = process.env.FONT_DIR;
  if (ICONS) await p.route('**/simple-icons@*/icons/*.svg', r => r.fulfill({
    contentType: 'image/svg+xml', body: fs.readFileSync(path.join(ICONS, r.request().url().split('/').pop())) }));
  await p.route('**fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body: '' }));
  await p.goto('file://' + path.join(racine, 'index.html'), { waitUntil: 'load' });
  if (FONTS) {
    const f = (w, st) => `@font-face{font-family:'Open Sans';font-weight:${w};font-style:${st};src:url(data:font/woff2;base64,${
      fs.readFileSync(path.join(FONTS, `open-sans-latin-${w}-${st}.woff2`)).toString('base64')}) format('woff2');}`;
    await p.addStyleTag({ content: [f(400, 'normal'), f(600, 'normal'), f(700, 'normal'), f(800, 'normal'), f(400, 'italic')].join('') });
  }
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  await p.pdf({ path: path.join(racine, 'presentation-powerpoint-accessible.pdf'), printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  await b.close();
})();
