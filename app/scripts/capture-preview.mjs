/**
 * Capture light and dark screenshots of ALphoto and save them to public/.
 *
 * Usage:
 *   npm run capture:preview                        # defaults to https://a-lphoto.vercel.app/
 *   npm run capture:preview -- http://localhost:5173
 */

import { chromium } from '@playwright/test'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const url = process.argv[2] ?? 'https://a-lphoto.vercel.app/'
const __dirname = dirname(fileURLToPath(import.meta.url))

const outLight = resolve(__dirname, '../public/alphoto-preview-light.png')
const outDark  = resolve(__dirname, '../public/alphoto-preview-dark.png')

console.log(`Capturing: ${url}`)

const browser = await chromium.launch()

async function capture(colorScheme, outPath) {
  const page = await browser.newPage()
  await page.emulateMedia({ colorScheme })
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1280, height: 800 } })
  await page.close()
  console.log(`Screenshot saved → ${outPath}`)
}

await capture('light', outLight)
await capture('dark',  outDark)

await browser.close()
console.log('Done.')
