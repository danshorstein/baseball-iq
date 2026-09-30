import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { LESSON_INTROS } from '../src/data/lessonIntros';
const heading = `# Baseball IQ video production briefs

Give Claude the shared direction below and one lesson brief at a time. The eight core lessons each have a 30-second introduction. Keep the interactive field and quizzes after the video: the video explains the idea, and the app lets a child apply it.

## Shared direction — copy into every request

Create a polished, 30-second, 16:9 paper cut animation for youth baseball players aged 6–14 and their families. Use textured paper, layered shadows, warm cream, field green, navy, red accents, smooth restrained camera movement, and a readable overhead baseball diamond. Make players neutral figures labeled by position, without real names, logos, or uniforms tied to a particular team. Keep large on-screen labels brief and within the central safe area so they remain readable on a phone. Keep the ball, bases, and throw paths easy to follow. Do not show fielders or runners teleporting, colliding, crossing base paths incorrectly, or making an out without the required touch or tag.

Use a warm, clear adult narrator at about 135–145 words per minute. Speak the exact narration supplied, expand position abbreviations naturally (for example, “SS” is “shortstop”), and leave short pauses. Use gentle, upbeat instrumental background music without vocals, licensed for public web use; mix it well below the voice and fade it in and out. Add a restrained ball or glove sound only when it helps explain the play. No autoplay, flashing transitions, or embedded controls.

There are six scenes, each approximately five seconds. Match the voiceover to those scenes. The timing is a production target: prioritize clear narration, and keep the total around 30 seconds. Do not insert new league-specific rules. Rules vary by organization, age, division, and tournament; these videos teach the general defensive idea. Use the described player count only as an example, with no claim that all teams use it.

Deliver an MP4 with H.264 video and AAC audio, 1280×720 or 1920×1080, 24 or 30 fps, yuv420p, and fast-start metadata. Aim for under 8 MB. Also deliver a matching English WebVTT caption file, a JPG poster frame, and the voiceover transcript. The filenames are specified below. Use narration captions rather than extra graphics that obscure the play.

The app already includes draft WebVTT captions timed to six five-second scenes. Retiming those captions to the finished voiceover is part of production. Upload no child-specific information or footage.
`;
let output = heading;
await mkdir(new URL('../public/videos/', import.meta.url), { recursive: true });
for (const [id, intro] of Object.entries(LESSON_INTROS)) {
  output += `\n## ${intro.title}\n\nFiles: ${id}.mp4, ${id}.vtt, ${id}.jpg, ${id}-transcript.txt\n\nTeaching goal: ${intro.overview}\n\n`;
  let captions = 'WEBVTT\n\n';
  for (const [i, scene] of intro.scenes.entries()) {
    const from = `00:00:${String(i * 5).padStart(2, '0')}.000`;
    const to = `00:00:${String((i + 1) * 5).padStart(2, '0')}.000`;
    output += `### ${i * 5}–${(i + 1) * 5} seconds\n\nVisual: ${scene.visual}\n\nVoiceover: “${scene.narration}”\n\n`;
    captions += `${i + 1}\n${from} --> ${to}\n${scene.narration}\n\n`;
  }
  const captionPath = new URL(`../public/videos/${id}.vtt`, import.meta.url);
  // Keep retimed production captions when a finished MP4 has been added.
  if (!existsSync(captionPath) || !existsSync(new URL(`../public/videos/${id}.mp4`, import.meta.url))) {
    await writeFile(captionPath, captions.trimEnd() + '\n');
  }
}
output += `\n## Optional later videos\n\nAfter the eight lessons, useful extras would be a 30-second welcome (“BALL → BASE → BACKUP”), a setup walkthrough showing why team type and league rules are separate, and a batter-contact comparison showing a deeper versus shallower outfield. These are later content ideas; there are no dedicated video slots for them yet. Keep any setup walkthrough independent of Ponte Vedra or Julington Creek unless those leagues verify the exact division rules.\n\n## Add the finished assets\n\nPlace the MP4, VTT, and JPG together in cubs-baseball-iq/public/videos/. The lesson ID is the filename. Run npm run build:pages and commit the rebuilt root index.html plus videos/ when using branch-based Pages hosting, or let the included Pages workflow build and publish them. Restart the development server after adding a new MP4 so it discovers the new filename. Missing videos show a written intro; a failed video shows the transcript and lets the child continue.\n\nThe app does not require watching to the end. Playback has ordinary browser controls, captions, no autoplay, and a transcript. MP4s stay separate from the HTML bundle and load only on their lesson.\n`;
await writeFile(new URL('../../docs/VIDEO_BRIEFS.md', import.meta.url), output);
console.log('Wrote eight video briefs and draft captions; preserved finished-video captions.');
