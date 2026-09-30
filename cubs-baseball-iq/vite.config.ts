import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const videoDirectory = fileURLToPath(new URL('./public/videos/', import.meta.url))
const media = Object.fromEntries((existsSync(videoDirectory) ? readdirSync(videoDirectory) : [])
  .filter((name) => /^[a-z0-9-]+\.mp4$/.test(name))
  .map((video) => {
    const id = video.slice(0, -4)
    const captions = existsSync(videoDirectory + id + '.vtt') ? id + '.vtt' : undefined
    const poster = existsSync(videoDirectory + id + '.jpg') ? id + '.jpg' : undefined
    const transcriptPath = videoDirectory + id + '-transcript.txt'
    const transcript = existsSync(transcriptPath) ? readFileSync(transcriptPath, 'utf8').trim() : undefined
    return [id, { video, captions, poster, transcript }]
  }))

// `npm run build` → normal static site in dist/
// `npm run build:single` → one self-contained dist-single/index.html (easy to share/host anywhere)
export default defineConfig(({ mode }) => ({
  base: './',
  define: { __TRAINING_MEDIA__: JSON.stringify(media) },
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'single' ? { outDir: 'dist-single' } : {},
}))
