import sharp from "sharp"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = path.join(__dirname, "logo-source.png")
const rough = path.join(__dirname, "logo-icon-rough.png")
const out = path.join(__dirname, "logo-icon-trimmed.png")

// Zgrubny wykrój lewej części (sam kwadrat z ikoną, bez napisu "Leadow CRM"),
// potem trim() automatycznie dotnie do faktycznego atramentu (obrys kwadratu + ikona).
await sharp(src)
  .extract({ left: 0, top: 380, width: 395, height: 470 })
  .toFile(rough)

await sharp(rough).trim({ background: "#ffffff", threshold: 10 }).toFile(out)

const meta = await sharp(out).metadata()
console.log(JSON.stringify(meta, null, 2))
