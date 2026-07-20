import sharp from "sharp"
import { fileURLToPath } from "node:url"
import path from "node:path"
import fs from "node:fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const publicDir = path.join(root, "public")

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

const iconPng = path.join(__dirname, "logo-icon-trimmed.png") // pełna ikona z obrysem kwadratu (marka)

async function render(inputFile, size, outFile, { flatten = true } = {}) {
  let img = sharp(inputFile).resize(size, size, { fit: "contain", background: "#ffffff" })
  if (flatten) img = img.flatten({ background: "#ffffff" })
  await img.png().toFile(path.join(publicDir, outFile))
  console.log("wrote", outFile)
}

async function renderMaskable(size, outFile) {
  // Ikona maskable: sam glif (bez rysowanego obrysu kwadratu — obrys daje system),
  // wyśrodkowany w bezpiecznej strefie (glif ~55% całości), pełne tło na krawędzie.
  const inner = await sharp(iconPng)
    .extract({ left: 48, top: 48, width: 189, height: 185 })
    .toBuffer()

  const glyphSize = Math.round(size * 0.55)
  const resizedGlyph = await sharp(inner)
    .resize(glyphSize, glyphSize, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 3, background: "#ffffff" },
  })
    .composite([{ input: resizedGlyph, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, outFile))
  console.log("wrote", outFile)
}

async function main() {
  await render(iconPng, 192, "pwa-192.png")
  await render(iconPng, 512, "pwa-512.png")
  await render(iconPng, 180, "apple-touch-icon.png")
  await render(iconPng, 32, "favicon-32.png")
  await renderMaskable(512, "pwa-maskable-512.png")

  // Mniejsza wersja do odznaki w Sidebar / na ekranie logowania.
  await sharp(iconPng).resize(96, 96, { fit: "contain", background: "#ffffff" }).png().toFile(path.join(publicDir, "logo-mark.png"))
  console.log("wrote logo-mark.png")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
