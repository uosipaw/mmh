import { readdir, mkdir, rm, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
const root = process.cwd();
const output = path.join(root, 'dist');
const external = new Set(['images/mwah.gif', 'images/Your paragraph text.zip']);
const extension = /\.(html|css|js|json|svg|png|jpe?g|webp|gif|ico|mp4|mp3|wav|ogg|ttf|otf|woff2?|zip)$/i;
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
async function copy(relative) {
  const source = path.join(root, relative);
  const info = await stat(source);
  if (info.isDirectory()) {
    for (const name of await readdir(source)) await copy(path.join(relative, name));
  } else if (extension.test(relative) && !external.has(relative)) {
    if (info.size > 25 * 1024 * 1024) throw new Error(`Cloudflare asset exceeds 25 MiB: ${relative}`);
    const destination = path.join(output, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
}
for (const name of await readdir(root)) {
  if (['images', 'fonts', 'spreads', 'tarot-studio'].includes(name) || /^[^.][^/]*\.(html|css|js|json)$/i.test(name) && !['package.json', 'package-lock.json'].includes(name) && !name.endsWith('.test.js')) await copy(name);
}
await build();
console.log('Existing pages and /beads packaged in dist/');
