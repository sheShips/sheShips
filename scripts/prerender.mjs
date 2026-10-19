import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'
import { chromium } from 'playwright'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const PORT = 4179
const ORIGIN = `http://localhost:${PORT}`
const ROOT_TAG = '<div id="root"></div>'

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`prerender: could not find ${label}`)
  return html.replace(pattern, replacement)
}

function setMetaContent(html, attr, key, value) {
  const pattern = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`)
  return replaceOnce(html, pattern, `$1${escapeHtml(value)}$2`, `${attr}="${key}"`)
}

function setTitle(html, value) {
  return replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(value)}</title>`, 'title')
}

function fillRoot(html, markup) {
  if (markup.length < 1000) throw new Error('prerender: rendered page is nearly empty')
  if (!html.includes(ROOT_TAG)) throw new Error('prerender: could not find the empty #root')
  return html.replace(ROOT_TAG, `<div id="root">${markup}</div>`)
}

async function render(context, path) {
  const page = await context.newPage()
  await page.goto(`${ORIGIN}${path}`, { waitUntil: 'load' })
  await page.waitForSelector('#root[data-ready]', { state: 'attached' })
  await page.waitForTimeout(600)
  const result = await page.evaluate(() => {
    const meta = (selector) => document.head.querySelector(selector)?.getAttribute('content') ?? ''
    return {
      markup: document.getElementById('root').innerHTML,
      title: document.title,
      description: meta('meta[name="description"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogUrl: meta('meta[property="og:url"]'),
      canonical: document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
      faqLd: document.head.querySelector('script[data-she-ships-faq]')?.textContent ?? null,
    }
  })
  await page.close()
  return result
}

async function write(path, html) {
  const file = resolve(dist, path)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
  console.log(`[prerender] wrote dist/${path}`)
}

const template = await readFile(resolve(dist, 'index.html'), 'utf8')
const server = await preview({ root, logLevel: 'warn', preview: { port: PORT, strictPort: true, open: false } })
const browser = await chromium.launch()

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== ORIGIN || url.pathname.endsWith('/events.php')) return route.abort()
    return route.continue()
  })

  const home = await render(context, '/')
  await write('index.html', fillRoot(template, home.markup))

  const faq = await render(context, '/faq')
  if (!faq.faqLd) throw new Error('prerender: FAQ page did not add its FAQPage data')
  let faqHtml = setTitle(template, faq.title)
  faqHtml = setMetaContent(faqHtml, 'name', 'description', faq.description)
  faqHtml = setMetaContent(faqHtml, 'property', 'og:url', faq.ogUrl)
  faqHtml = setMetaContent(faqHtml, 'property', 'og:title', faq.ogTitle)
  faqHtml = setMetaContent(faqHtml, 'property', 'og:description', faq.ogDescription)
  faqHtml = replaceOnce(faqHtml, /(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(faq.canonical)}$2`, 'canonical')
  const faqLd = faq.faqLd.replace(/</g, '\\u003c')
  faqHtml = replaceOnce(faqHtml, /<\/head>/, `  <script type="application/ld+json" id="faq-ld-static">${faqLd}</script>\n  </head>`, '</head>')
  await write('faq/index.html', fillRoot(faqHtml, faq.markup))

  const privacy = await render(context, '/privacy')
  let privacyHtml = setTitle(template, privacy.title)
  privacyHtml = setMetaContent(privacyHtml, 'name', 'description', privacy.description)
  privacyHtml = setMetaContent(privacyHtml, 'property', 'og:url', privacy.ogUrl)
  privacyHtml = setMetaContent(privacyHtml, 'property', 'og:title', privacy.ogTitle)
  privacyHtml = setMetaContent(privacyHtml, 'property', 'og:description', privacy.ogDescription)
  privacyHtml = replaceOnce(privacyHtml, /(<link rel="canonical" href=")[^"]*(")/, `$1${escapeHtml(privacy.canonical)}$2`, 'canonical')
  await write('privacy/index.html', fillRoot(privacyHtml, privacy.markup))

  const missing = await render(context, '/this-page-does-not-exist')
  let missingHtml = setTitle(template, 'Page not found | She Ships')
  missingHtml = replaceOnce(missingHtml, /\s*<link rel="canonical"[^>]*>/, '', 'canonical')
  missingHtml = setMetaContent(missingHtml, 'name', 'robots', 'noindex')
  await write('404.html', fillRoot(missingHtml, missing.markup))
} finally {
  await browser.close()
  await server.close()
}
