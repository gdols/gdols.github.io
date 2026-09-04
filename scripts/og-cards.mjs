/**
 * Genera una tarjeta social 1200x630 por entrada del blog.
 *
 * Las capturas de los posts son verticales o cuadradas, y X recorta las
 * tarjetas grandes a 1,91:1. Pegarlas tal cual dejaría fuera casi todo, así
 * que aquí se componen: la captura entera, sin recortar, centrada sobre el
 * fondo de la marca, con el mismo color que /og.png.
 *
 * La imagen de origen es el campo `image` del frontmatter si existe, y si no
 * la primera imagen del cuerpo. Una entrada sin ninguna de las dos no genera
 * tarjeta y cae en /og.png, que es el respaldo del sitio.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const BLOG_DIR = "src/content/blog";
const PUBLIC_DIR = "public";
const OUT_DIR = join(PUBLIC_DIR, "og");

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING = 40;
const BACKGROUND = { r: 18, g: 18, b: 18, alpha: 1 }; // #121212, el de /og.png

/** Primera imagen local del post: `image:` del frontmatter, o la primera del cuerpo. */
export function sourceImageFor(markdown) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const declared = frontmatter?.[1].match(/^image:\s*["']?(\/[^"'\s]+)["']?\s*$/m);
  if (declared) return declared[1];

  const body = frontmatter ? markdown.slice(frontmatter[0].length) : markdown;
  const inline = body.match(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/);
  return inline?.[1] ?? null;
}

async function buildCard(slug, source) {
  const file = join(PUBLIC_DIR, source);
  if (!existsSync(file)) {
    console.warn(`  ${slug}: la imagen ${source} no existe, se salta`);
    return false;
  }

  const shot = await sharp(file)
    .resize(WIDTH - PADDING * 2, HEIGHT - PADDING * 2, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer();

  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: shot, gravity: "center" }])
    .png()
    .toFile(join(OUT_DIR, `${slug}.png`));

  return true;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const posts = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  let made = 0;

  for (const file of posts) {
    const slug = basename(file, ".md");
    const source = sourceImageFor(readFileSync(join(BLOG_DIR, file), "utf8"));

    if (!source) {
      console.log(`  ${slug}: sin imagen, usará /og.png`);
      continue;
    }
    if (await buildCard(slug, source)) {
      console.log(`  ${slug}: tarjeta desde ${source}`);
      made += 1;
    }
  }

  console.log(`\n${made} tarjeta(s) en ${OUT_DIR}/`);
}

// La pagina de post importa sourceImageFor, asi que solo generamos al ejecutar el script.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
