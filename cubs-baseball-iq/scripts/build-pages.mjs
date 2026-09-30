import { copyFile, cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const artifact = fileURLToPath(new URL('../dist-single/index.html', import.meta.url));
const output = fileURLToPath(new URL('../dist-pages/', import.meta.url));
const legacy = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Baseball IQ</title></head><body><p><a href="./index.html">Open Baseball IQ</a></p><script>location.replace('./index.html'+location.search+location.hash)</script></body></html>\n`;
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(artifact, root + 'index.html');
await copyFile(artifact, output + 'index.html');
await writeFile(root + 'cubs-baseball-iq.html', legacy);
await writeFile(output + 'cubs-baseball-iq.html', legacy);
await writeFile(output + '.nojekyll', '');
const videos = fileURLToPath(new URL('../dist-single/videos/', import.meta.url));
// These directories contain generated assets; public/videos is the source.
await rm(root + 'videos', { recursive: true, force: true });
if (existsSync(videos)) {
  await cp(videos, output + 'videos', { recursive: true });
  await cp(videos, root + 'videos', { recursive: true });
}
console.log('Updated root index.html and built dist-pages/ for GitHub Pages.');
