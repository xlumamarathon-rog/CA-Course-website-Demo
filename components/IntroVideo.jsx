'use client';
import { useState, useRef } from 'react';
import { useMediaSrc } from '@/lib/storage';
import { VID } from '@/lib/data';

/* The one thing a signed-out visitor may watch: a course's introduction.
   Accepts a hosted URL or an `idb:<id>` reference to an uploaded Blob. */
export default function IntroVideo({ src, title }) {
  const resolved = useMediaSrc(src || '');
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  const play = () => {
    const v = ref.current;
    if (!v) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => setFailed(true));
  };

  return (
    <div className={'intro' + (playing ? ' playing' : '')}>
      <div className="intro-stage">
        {!failed && (
          <video
            ref={ref}
            playsInline
            controls={playing}
            preload="metadata"
            key={resolved || 'intro'}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          >
            <source src={resolved || VID} type="video/mp4" />
          </video>
        )}

        {failed && (
          <div className="intro-fallback">
            <span className="kicker">Course introduction</span>
            <span className="t">{title}</span>
            <span className="q">Preview unavailable in this browser</span>
          </div>
        )}

        {!playing && !failed && (
          <button className="intro-play" onClick={play} aria-label="Play course introduction">
            <span className="intro-play-btn">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="intro-play-tx">Watch the introduction</span>
          </button>
        )}
      </div>
    </div>
  );
}
