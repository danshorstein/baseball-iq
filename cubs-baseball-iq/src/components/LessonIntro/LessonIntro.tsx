import { useState } from 'react';
import { LESSON_INTROS } from '../../data/lessonIntros';

declare const __TRAINING_MEDIA__: Record<string, { video: string; captions?: string; poster?: string; transcript?: string }>;

/** Videos stay separate from the single HTML file so they can stream on demand. */
export function LessonIntro({ id, onStart }: { id: string; onStart: () => void }) {
  const intro = LESSON_INTROS[id];
  const media = __TRAINING_MEDIA__[id];
  const [failed, setFailed] = useState(false);
  if (!intro) return <button className="btn btn-primary" onClick={onStart}>Start lesson ▶</button>;
  const asset = (name: string) => `${import.meta.env.BASE_URL}videos/${name}`;
  const transcript = media?.transcript || intro.scenes.map((scene) => scene.narration).join(' ');
  return <section className="card lesson-intro" aria-label="Lesson introduction">
    <div className="hero-kicker">{media ? 'Short video introduction' : 'Before you begin'}</div>
    <h2>{intro.title}</h2>
    <p>{intro.overview}</p>
    {media && !failed && <video className="lesson-video" controls playsInline preload="metadata" poster={media.poster ? asset(media.poster) : undefined} aria-label={`${intro.title} introduction`} onError={() => setFailed(true)}>
      <source src={asset(media.video)} type="video/mp4" onError={() => setFailed(true)} />
      {media.captions && <track kind="captions" src={asset(media.captions)} srcLang="en" label="English" default />}
      Your browser cannot play this video. Read the transcript below.
    </video>}
    {failed && <p role="status">The video could not load. You can read the explanation below and start the lesson.</p>}
    <details className="intro-transcript"><summary>{media ? 'Read the video transcript' : 'Read the full explanation'}</summary>{transcript.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</details>
    <button className="btn btn-accent btn-big btn-wide" onClick={onStart}>{media ? 'Continue to practice ▶' : 'Start lesson ▶'}</button>
    <p className="muted small">Watch or read, then try the animated plays and questions. You can continue at any time.</p>
  </section>;
}
