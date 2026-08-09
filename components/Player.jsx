'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { VID, flatLessons, parseDur, fmtTime } from '@/lib/data';
import { useProgress, useNotes, useMediaSrc } from '@/lib/storage';

const AUTO_NEXT_SECONDS = 5;
const SPEEDS = [1, 1.25, 1.5, 1.75, 2];

export default function Player({ course }) {
  const lessons = useMemo(() => flatLessons(course), [course]);
  const { done, last, markDone, unmarkDone, setLast, setSeconds, doneCount, ready } = useProgress(course.id);
  const { list: notes, add: addNote, remove: removeNote } = useNotes(course.id);

  const [idx, setIdx] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [sim, setSim] = useState(false);          // fallback when the video file can't load
  const [openSec, setOpenSec] = useState({ 0: true });
  const [tab, setTab] = useState('overview');
  const [countdown, setCountdown] = useState(null); // null | seconds remaining
  const [noteText, setNoteText] = useState('');

  const videoRef = useRef(null);
  const simTimer = useRef(null);
  const cdTimer = useRef(null);

  const current = lessons[idx] || lessons[0];
  const lesson = current ? current.lesson : null;
  const isVideo = lesson && lesson.type === 'video';
  const nextIdx = idx + 1 < lessons.length ? idx + 1 : null;
  const next = nextIdx !== null ? lessons[nextIdx] : null;
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  /* --- restore the last lesson from device storage (once) --- */
  useEffect(() => {
    if (ready && !hydrated) {
      const start = Math.min(last || 0, lessons.length - 1);
      setIdx(start);
      const sIdx = lessons[start] ? lessons[start].s : 0;
      setOpenSec({ [sIdx]: true });
      setHydrated(true);
    }
  }, [ready, hydrated, last, lessons]);

  const clearTimers = () => {
    if (simTimer.current) { clearInterval(simTimer.current); simTimer.current = null; }
    if (cdTimer.current) { clearInterval(cdTimer.current); cdTimer.current = null; }
  };

  /* --- lesson change: reset the stage --- */
  useEffect(() => {
    clearTimers();
    setCountdown(null);
    setTime(0);
    setPlaying(false);
    const fallback = lesson ? parseDur(lesson.dur) : 0;
    setDur(fallback || (isVideo ? 300 : 0));
    if (hydrated) setLast(idx);
    const v = videoRef.current;
    if (v && isVideo && !sim) { try { v.currentTime = 0; v.load(); } catch (e) {} }
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, hydrated]);

  /* --- persist watch position --- */
  useEffect(() => {
    if (!hydrated || time <= 0) return;
    const t = setTimeout(() => setSeconds(idx, time), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(time / 5), idx, hydrated]);

  /* Advancing past a lesson completes it, the way every course player behaves.
     Only forward moves count — jumping back to revisit should not tick things. */
  const goTo = useCallback((i, { complete = false } = {}) => {
    if (i < 0 || i >= lessons.length) return;
    if (complete && i > idx) markDone(idx);
    setIdx(i);
    const sIdx = lessons[i].s;
    setOpenSec(o => Object.assign({}, o, { [sIdx]: true }));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, idx]);

  const finishLesson = useCallback(() => {
    markDone(idx);
    setPlaying(false);
    clearTimers();
    if (nextIdx !== null) {
      setCountdown(AUTO_NEXT_SECONDS);
      let n = AUTO_NEXT_SECONDS;
      cdTimer.current = setInterval(() => {
        n -= 1;
        if (n <= 0) {
          clearTimers();
          setCountdown(null);
          goTo(nextIdx);
        } else {
          setCountdown(n);
        }
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, nextIdx, goTo]);

  /* --- simulated playback (used if the media file is unreachable, or for quiz/file lessons) --- */
  const runSim = useCallback(() => {
    clearTimers();
    simTimer.current = setInterval(() => {
      setTime(t => {
        const nt = t + 0.25 * speed;
        if (nt >= dur) { finishLesson(); return dur; }
        return nt;
      });
    }, 250);
  }, [dur, speed, finishLesson]);

  const play = () => {
    if (countdown !== null) { clearTimers(); setCountdown(null); }
    if (isVideo && !sim) {
      const v = videoRef.current;
      if (v) {
        v.playbackRate = speed;
        const p = v.play();
        if (p && p.catch) p.catch(() => { setSim(true); setPlaying(true); runSim(); });
      }
    } else {
      setPlaying(true);
      runSim();
    }
  };

  const pause = () => {
    if (isVideo && !sim) { const v = videoRef.current; if (v) v.pause(); }
    else { clearTimers(); setPlaying(false); }
  };

  const toggle = () => (playing ? pause() : play());

  const seek = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    const t = ratio * dur;
    setTime(t);
    if (isVideo && !sim) { const v = videoRef.current; if (v) v.currentTime = t; }
  };

  const nudge = (delta) => {
    const t = Math.min(dur, Math.max(0, time + delta));
    setTime(t);
    if (isVideo && !sim) { const v = videoRef.current; if (v) v.currentTime = t; }
  };

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    const s = SPEEDS[(i + 1) % SPEEDS.length];
    setSpeed(s);
    if (isVideo && !sim) { const v = videoRef.current; if (v) v.playbackRate = s; }
    if (playing && (sim || !isVideo)) runSim();
  };

  const fullscreen = () => {
    const el = videoRef.current && videoRef.current.parentElement;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
  };

  /* --- keyboard shortcuts, like every real player --- */
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') nudge(10);
      else if (e.key === 'ArrowLeft') nudge(-10);
      else if (e.key === 'n' && nextIdx !== null) goTo(nextIdx, { complete: true });
      else if (e.key === 'f') fullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, time, dur, idx, nextIdx]);

  const saveNote = () => {
    if (!noteText.trim()) return;
    addNote({ idx, at: Math.floor(time), text: noteText.trim(), ts: Date.now() });
    setNoteText('');
  };

  const progressPct = dur ? Math.min(100, (time / dur) * 100) : 0;
  const RING = 2 * Math.PI * 30;

  const resolvedSrc = useMediaSrc(lesson && lesson.src ? lesson.src : '');

  const files = useMemo(
    () => lessons.filter(x => x.lesson.type === 'file').map(x => x.lesson),
    [lessons]
  );

  return (
    <div className="pl">
      {/* ================= MAIN ================= */}
      <div className="pl-main">
        <div className={'stage' + (playing ? ' playing' : ' paused') + (sim || !isVideo ? ' sim' : '')}>
          <video
            ref={videoRef}
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={e => { if (e.currentTarget.duration) setDur(e.currentTarget.duration); }}
            onEnded={finishLesson}
            onError={() => setSim(true)}
            key={resolvedSrc || 'default'}
          >
            <source src={resolvedSrc || VID} type="video/mp4" />
          </video>

          {/* fallback / non-video stage */}
          <div className="simscreen">
            <span className="kicker">
              {isVideo ? 'Lesson ' + (idx + 1) + ' of ' + lessons.length
                : lesson && lesson.type === 'file' ? 'Downloadable resource' : 'Knowledge check'}
            </span>
            <span className="st">{lesson ? lesson.title : ''}</span>
            {isVideo ? (
              playing ? (
                <span className="eq"><i /><i /><i /><i /><i /></span>
              ) : (
                <button className="simplay" onClick={play}>
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  {time > 0 ? 'Resume' : 'Play lesson'}
                </button>
              )
            ) : (
              <button className="btn btn-d" onClick={finishLesson} style={{ marginTop: 8 }}>
                {lesson && lesson.type === 'file' ? 'Download and continue' : 'Complete and continue'}
              </button>
            )}
          </div>

          {isVideo && !playing && countdown === null && (
            <button className="bigplay" onClick={play} aria-label="Play lesson">
              <div><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
            </button>
          )}

          {/* auto-advance overlay */}
          {countdown !== null && next && (
            <div className="nextup on">
              <span className="k">Up next</span>
              <span className="t">{next.lesson.title}</span>
              <div className="ring">
                <svg viewBox="0 0 64 64">
                  <circle className="bg" cx="32" cy="32" r="30" />
                  <circle
                    className="fg" cx="32" cy="32" r="30"
                    style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - countdown / AUTO_NEXT_SECONDS) }}
                  />
                </svg>
                <span className="num">{countdown}</span>
              </div>
              <div className="btn-row" style={{ justifyContent: 'center' }}>
                <button className="btn btn-d" onClick={() => { clearTimers(); setCountdown(null); goTo(nextIdx); }}>
                  Play next now
                </button>
                <button className="btn btn-o" onClick={() => { clearTimers(); setCountdown(null); }}>
                  Stay here
                </button>
              </div>
            </div>
          )}

          {countdown === null && !next && done[idx] && !playing && isVideo && (
            <div className="nextup on">
              <span className="k">Course complete</span>
              <span className="t">You finished {course.title}.</span>
              <Link href="/dashboard" className="btn btn-d">Go to my learning</Link>
            </div>
          )}
        </div>

        {/* ---------- CONTROLS ---------- */}
        <div className="ctrl">
          <div className="scrub" onClick={seek} role="slider" aria-label="Seek"
            aria-valuenow={Math.floor(time)} aria-valuemin={0} aria-valuemax={Math.floor(dur)}>
            <div className="track"><div className="fill" style={{ width: progressPct + '%' }} /></div>
            <span className="knob" style={{ left: progressPct + '%' }} />
          </div>
          <div className="ctrl-row">
            <button className="cbtn big" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing
                ? <svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
            </button>
            <button className="cbtn" onClick={() => nudge(-10)} aria-label="Back 10 seconds">
              <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" /></svg>
            </button>
            <button className="cbtn" onClick={() => nudge(10)} aria-label="Forward 10 seconds">
              <svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z" /></svg>
            </button>
            {nextIdx !== null && (
              <button className="cbtn" onClick={() => goTo(nextIdx, { complete: true })} aria-label="Next lesson">
                <svg viewBox="0 0 24 24"><path d="M6 5l9 7-9 7V5zm10 0h2v14h-2z" /></svg>
              </button>
            )}
            <span className="time">{fmtTime(time)} / {fmtTime(dur)}</span>
            <span className="grow" />
            <button className="spd" onClick={cycleSpeed} aria-label="Playback speed">{speed}×</button>
            <button className="cbtn" onClick={fullscreen} aria-label="Fullscreen">
              <svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z" /></svg>
            </button>
          </div>
        </div>

        {/* ---------- LESSON HEADER ---------- */}
        <div className="pl-head">
          <div className="kk">{current ? current.sTitle : ''} · Lesson {idx + 1} of {lessons.length}</div>
          <h1>{lesson ? lesson.title : ''}</h1>
          <div className="meta">
            <span>{course.instructor}</span>
            <span>·</span>
            <span className="tnum">{lesson ? lesson.dur : ''}</span>
            <span>·</span>
            <button
              className="btn btn-t"
              onClick={() => (done[idx] ? unmarkDone(idx) : markDone(idx))}
              style={{ fontSize: 15 }}
            >
              {done[idx] ? '✓ Completed — mark as unwatched' : 'Mark as complete'}
            </button>
          </div>
        </div>

        {/* ---------- NEXT CHAPTER (the strip below the video) ---------- */}
        {next ? (
          <div className="nextbar">
            <div className="thumb sm" style={{ aspectRatio: '16/9' }}>
              <span className="corner" /><span className="tt">{next.sTitle}</span>
            </div>
            <div className="txt">
              <div className="k">Next chapter</div>
              <div className="t">{next.lesson.title}</div>
              <div className="d">{next.sTitle} · {next.lesson.dur}</div>
            </div>
            <div className="acts">
              <button className="btn btn-p" onClick={() => goTo(nextIdx, { complete: true })}>Next chapter →</button>
              {idx > 0 && <button className="btn btn-s" onClick={() => goTo(idx - 1)}>Previous</button>}
            </div>
          </div>
        ) : (
          <div className="nextbar">
            <div className="txt">
              <div className="k">Last chapter</div>
              <div className="t">You have reached the end of {course.title}</div>
              <div className="d">Submit the capstone to unlock your certificate</div>
            </div>
            <div className="acts">
              <Link href="/dashboard" className="btn btn-p">Go to my learning</Link>
              {idx > 0 && <button className="btn btn-s" onClick={() => goTo(idx - 1)}>Previous</button>}
            </div>
          </div>
        )}

        {/* ---------- TABS ---------- */}
        <div className="tabs">
          {[['overview', 'Overview'], ['notes', 'Notes' + (notes.length ? ' (' + notes.length + ')' : '')],
            ['resources', 'Resources'], ['qa', 'Q&A']].map(([id, label]) => (
            <button key={id} className={'tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        <div className={'tabpane' + (tab === 'overview' ? ' on' : '')}>
          <h3>About this course</h3>
          <p style={{ maxWidth: '68ch' }}>{course.tag}</p>
          <h4>By the end you will be able to</h4>
          <ul>{course.outcomes.map((o, i) => <li key={i}>{o}</li>)}</ul>
          <h4>Your instructor</h4>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span className="av lg ac">{course.initials}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{course.instructor}</div>
              <div style={{ color: 'var(--muted)', fontSize: 15 }}>{course.exFirm} · {course.hours}+ hrs on this course</div>
            </div>
          </div>
        </div>

        <div className={'tabpane' + (tab === 'notes' ? ' on' : '')}>
          <h3>Your notes</h3>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>
            Saved on this device at the current timestamp — {fmtTime(time)}.
          </p>
          <textarea
            className="notepad"
            placeholder="What did you want to remember from this lesson?"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn btn-p" onClick={saveNote} disabled={!noteText.trim()}>
              Save note at {fmtTime(time)}
            </button>
          </div>
          <div className="notelist">
            {notes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 15 }}>No notes yet.</p>}
            {notes.map(n => (
              <div className="noteitem" key={n.ts}>
                <div className="ts">
                  Lesson {n.idx + 1} · {fmtTime(n.at)}
                  <button className="btn btn-t" style={{ fontSize: 12, marginLeft: 12 }} onClick={() => removeNote(n.ts)}>
                    Delete
                  </button>
                </div>
                {n.text}
              </div>
            ))}
          </div>
        </div>

        <div className={'tabpane' + (tab === 'resources' ? ' on' : '')}>
          <h3>Downloads</h3>
          <p style={{ fontSize: 15, color: 'var(--muted)' }}>{files.length} templates included with this course.</p>
          {files.map((f, i) => (
            <div className="res" key={i}>
              <span className="ext">XLSX</span>
              <span className="nm">{f.title}</span>
              <button className="btn btn-s btn-sm">Download</button>
            </div>
          ))}
          <div className="res">
            <span className="ext">PDF</span>
            <span className="nm">Complete course handbook</span>
            <button className="btn btn-s btn-sm">Download</button>
          </div>
        </div>

        <div className={'tabpane' + (tab === 'qa' ? ' on' : '')}>
          <h3>Questions on this lesson</h3>
          <div className="qa">
            <div className="q">Do we need the client&apos;s ERP access to complete the capstone?</div>
            <p className="a">No — the capstone ships with an extracted trial balance and ledger dump, which is what you would receive on a real engagement anyway.</p>
            <div className="who">Answered by {course.instructor} · 2 days ago</div>
          </div>
          <div className="qa">
            <div className="q">Is the template compatible with Excel 2016?</div>
            <p className="a">Yes. Dynamic array formulas are avoided in the shared templates for exactly this reason; the modelling course covers them separately.</p>
            <div className="who">Answered by teaching assistant · 5 days ago</div>
          </div>
          <div className="field wide" style={{ marginTop: 32 }}>
            <label>Ask a question</label>
            <textarea rows={3} placeholder="Be specific — the instructor answers within 48 hours." />
          </div>
          <button className="btn btn-p">Post question</button>
        </div>
      </div>

      {/* ================= SIDEBAR ================= */}
      <aside className="pl-side">
        <div className="sh">
          <div className="tt">{course.title}</div>
          <div className="pr">
            <span>{pct}% complete</span>
            <span>{doneCount} / {lessons.length}</span>
          </div>
          <div className="pbar"><i style={{ width: pct + '%' }} /></div>
        </div>

        <div className="list">
          {course.sections.map((s, si) => {
            const secs = s.lectures.reduce((a, l) => a + parseDur(l.dur), 0);
            const flatStart = lessons.findIndex(x => x.s === si);
            return (
              <div key={si} className={'sgroup' + (openSec[si] ? ' open' : '')}>
                <button className="sgroup-h" onClick={() => setOpenSec(o => Object.assign({}, o, { [si]: !o[si] }))}>
                  <span className="cv">▶</span>
                  <span className="tl">{s.title}</span>
                  <span className="mt">{s.lectures.length} · {fmtTime(secs)}</span>
                </button>
                <div className="sgroup-b">
                  {s.lectures.map((l, li) => {
                    const flat = flatStart + li;
                    return (
                      <button
                        key={li}
                        className={'plec' + (flat === idx ? ' cur' : '') + (done[flat] ? ' done' : '')}
                        onClick={() => goTo(flat)}
                      >
                        <span
                          className="cb"
                          role="checkbox"
                          aria-checked={!!done[flat]}
                          aria-label={(done[flat] ? 'Mark incomplete: ' : 'Mark complete: ') + l.title}
                          onClick={(ev) => {
                            ev.stopPropagation();          // tick without navigating
                            done[flat] ? unmarkDone(flat) : markDone(flat);
                          }}
                        >{done[flat] ? '✓' : ''}</span>
                        <span className="tx">
                          <span className="tl">{l.title}</span>
                          <span className="dm">
                            <span>{l.type === 'file' ? '⤓ Resource' : l.type === 'quiz' ? '✎ Quiz' : '▶ Video'}</span>
                            <span>{l.dur}</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
