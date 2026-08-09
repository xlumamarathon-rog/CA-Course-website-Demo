'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminShell from './AdminShell';
import Thumb from './Thumb';
import { useCourses, slugify, blankCourse, readCourses } from '@/lib/store';
import { mediaPut } from '@/lib/storage';
import { parseDur, fmtLong, fmt } from '@/lib/data';

const CATS = [
  { id: 'flagship', label: 'Flagship MasterClass' },
  { id: 'tools', label: 'Finance Tools' },
  { id: 'free', label: 'Free Course' }
];
const TYPES = [
  { id: 'video', label: 'Video' },
  { id: 'file', label: 'Downloadable resource' },
  { id: 'quiz', label: 'Quiz' }
];

export default function CourseEditor({ courseId }) {
  const router = useRouter();
  const courses = useCourses();
  const isNew = !courseId;

  const [c, setC] = useState(blankCourse());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('details');
  const [saved, setSaved] = useState('');
  const [err, setErr] = useState('');
  const fileRefs = useRef({});

  /* load the existing course once storage is ready */
  useEffect(() => {
    if (isNew || loaded || !courses.ready) return;
    const found = courses.get(courseId);
    if (found) {
      setC(JSON.parse(JSON.stringify(found)));
      setLoaded(true);
    }
  }, [courses.ready, courseId, isNew, loaded, courses]);

  const set = (patch) => { setC(prev => Object.assign({}, prev, patch)); setSaved(''); };

  /* ---------- sections & lessons ---------- */
  const setSection = (si, patch) => set({
    sections: c.sections.map((s, i) => (i === si ? Object.assign({}, s, patch) : s))
  });
  const addSection = () => set({
    sections: c.sections.concat([{ title: 'Section ' + (c.sections.length + 1), lectures: [] }])
  });
  const removeSection = (si) => set({ sections: c.sections.filter((_, i) => i !== si) });
  const moveSection = (si, dir) => {
    const arr = c.sections.slice();
    const j = si + dir;
    if (j < 0 || j >= arr.length) return;
    const t = arr[si]; arr[si] = arr[j]; arr[j] = t;
    set({ sections: arr });
  };
  const setLesson = (si, li, patch) => setSection(si, {
    lectures: c.sections[si].lectures.map((l, i) => (i === li ? Object.assign({}, l, patch) : l))
  });
  const addLesson = (si) => setSection(si, {
    lectures: c.sections[si].lectures.concat([{ title: '', dur: '10:00', type: 'video', src: '' }])
  });
  const removeLesson = (si, li) => setSection(si, {
    lectures: c.sections[si].lectures.filter((_, i) => i !== li)
  });

  /* ---------- video "upload" ----------
     No storage backend, so we create a blob URL. It plays immediately in
     this session; on reload the lesson falls back to the sample video. */
  const onPick = async (si, li, file) => {
    if (!file) return;
    setLesson(si, li, { upload: file.name, size: 'saving…' });
    try {
      const id = await mediaPut(file, file.name);          // Blob -> IndexedDB
      setLesson(si, li, {
        src: 'idb:' + id,
        upload: file.name,
        size: (file.size / 1048576).toFixed(1) + ' MB',
        title: c.sections[si].lectures[li].title || file.name.replace(/\.[^.]+$/, '')
      });
    } catch (e) {
      // no IndexedDB — fall back to a session-only object URL
      setLesson(si, li, {
        src: URL.createObjectURL(file),
        upload: file.name + ' (session only)',
        size: (file.size / 1048576).toFixed(1) + ' MB'
      });
    }
  };

  /* ---------- list fields ---------- */
  const setListItem = (key, i, v) => set({ [key]: c[key].map((x, j) => (j === i ? v : x)) });
  const addListItem = (key) => set({ [key]: (c[key] || []).concat(['']) });
  const removeListItem = (key, i) => set({ [key]: c[key].filter((_, j) => j !== i) });

  /* ---------- save ---------- */
  const save = (publish) => {
    setErr('');
    const id = c.id || slugify(c.title);
    if (!c.title.trim()) { setErr('The course needs a title.'); setTab('details'); return; }
    if (!id) { setErr('Could not build a URL from that title — add a slug manually.'); setTab('details'); return; }
    if (isNew && readCourses().some(x => x.id === id)) {
      setErr('A course already uses the URL /course/' + id + '. Change the title or the slug.');
      setTab('details'); return;
    }
    const lessons = c.sections.reduce((a, s) => a + s.lectures.length, 0);
    if (lessons === 0) { setErr('Add at least one lesson before saving.'); setTab('curriculum'); return; }

    const payload = Object.assign({}, c, {
      id,
      published: publish === undefined ? c.published : publish,
      price: Number(c.price) || 0,
      mrp: Number(c.mrp) || Number(c.price) || 0,
      hours: Number(c.hours) || 0,
      templates: Number(c.templates) || 0,
      rating: Number(c.rating) || 5,
      reviews: Number(c.reviews) || 0,
      learners: Number(c.learners) || 0,
      initials: c.initials || (c.instructor || 'TB').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(),
      lectures: lessons
    });

    if (isNew) courses.create(payload); else courses.update(courseId, payload);
    setC(payload);
    setSaved(publish === true ? 'Published — it is live on the site now.'
      : publish === false ? 'Saved as a draft.' : 'Changes saved.');
    if (isNew) router.push('/admin/courses/' + id);
  };

  const lessonCount = c.sections.reduce((a, s) => a + s.lectures.length, 0);
  const runtime = c.sections.reduce((a, s) => a + s.lectures.reduce((b, l) => b + parseDur(l.dur), 0), 0);

  if (!isNew && !loaded && courses.ready && !courses.get(courseId)) {
    return (
      <AdminShell title="Course not found">
        <div className="panel">
          <p>No course with the id <code className="mono">{courseId}</code>.</p>
          <Link href="/admin/courses" className="btn btn-p btn-sm">Back to courses</Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={isNew ? 'New course' : 'Edit course'}
      action={
        <>
          {!isNew && <Link href={'/course/' + c.id} className="btn btn-s btn-sm">View on site</Link>}
          <button className="btn btn-s btn-sm" onClick={() => save(false)}>Save draft</button>
          <button className="btn btn-p btn-sm" onClick={() => save(true)}>
            {c.published === false || isNew ? 'Publish' : 'Save & keep live'}
          </button>
        </>
      }
    >
      {err && <div className="ok" style={{ background: '#FDECEA', color: 'var(--danger)' }}>
        <span style={{ fontWeight: 700 }}>!</span><span>{err}</span>
      </div>}
      {saved && <div className="ok">
        <span style={{ fontWeight: 700 }}>✓</span>
        <span>{saved} {!isNew && <Link href={'/course/' + c.id} style={{ textDecoration: 'underline' }}>Open it →</Link>}</span>
      </div>}

      <div className="tabs" style={{ padding: 0, marginBottom: 24 }}>
        {[['details', 'Details'], ['curriculum', 'Curriculum (' + lessonCount + ')'], ['marketing', 'Marketing copy']]
          .map(([id, label]) => (
            <button key={id} className={'tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{label}</button>
          ))}
      </div>

      <div className="ed-grid">
        <div>
          {/* ---------------- DETAILS ---------------- */}
          {tab === 'details' && (
            <div className="panel">
              <div className="field wide">
                <label>Course title <span className="req">*</span></label>
                <input value={c.title} onChange={e => set({ title: e.target.value, id: isNew ? slugify(e.target.value) : c.id })}
                  placeholder="Transfer Pricing MasterClass" />
              </div>
              <div className="field wide">
                <label>URL slug</label>
                <input value={c.id} onChange={e => set({ id: slugify(e.target.value) })} placeholder="transfer-pricing" className="mono" />
                <div className="help">The course will live at /course/{c.id || 'your-slug'}</div>
              </div>
              <div className="field wide">
                <label>One-line promise</label>
                <input value={c.tag} onChange={e => set({ tag: e.target.value })}
                  placeholder="Defend a transfer pricing position end to end." />
                <div className="help">Shown under the title on the sales page. Say the outcome, not the topic.</div>
              </div>

              <div className="field-row" style={{ maxWidth: 'none' }}>
                <div className="field"><label>Instructor</label>
                  <input value={c.instructor} onChange={e => set({ instructor: e.target.value })} placeholder="CA Sanat Goyal" /></div>
                <div className="field"><label>Credential / former firm</label>
                  <input value={c.exFirm} onChange={e => set({ exFirm: e.target.value })} placeholder="Ex-EY" /></div>
              </div>

              <div className="field-row" style={{ maxWidth: 'none' }}>
                <div className="field"><label>Category</label>
                  <select value={c.cat} onChange={e => set({ cat: e.target.value })}>
                    {CATS.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select></div>
                <div className="field"><label>Badge</label>
                  <select value={c.badge || ''} onChange={e => set({ badge: e.target.value })}>
                    <option value="">No badge</option>
                    {['Best-selling', 'New', 'Free', 'Combo'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select></div>
              </div>

              <div className="field-row" style={{ maxWidth: 'none' }}>
                <div className="field"><label>Price (₹)</label>
                  <input type="number" min="0" value={c.price} onChange={e => set({ price: e.target.value })} />
                  <div className="help">Set 0 to make it free — the paywall is skipped.</div></div>
                <div className="field"><label>List price / MRP (₹)</label>
                  <input type="number" min="0" value={c.mrp} onChange={e => set({ mrp: e.target.value })} />
                  <div className="help">Shown struck through. Must be higher than the price.</div></div>
              </div>

              <div className="field-row" style={{ maxWidth: 'none' }}>
                <div className="field"><label>Hours of content</label>
                  <input type="number" min="0" value={c.hours} onChange={e => set({ hours: e.target.value })} /></div>
                <div className="field"><label>Templates included</label>
                  <input type="number" min="0" value={c.templates} onChange={e => set({ templates: e.target.value })} /></div>
              </div>

              <div className="field-row" style={{ maxWidth: 'none' }}>
                <div className="field"><label>Level</label>
                  <input value={c.level} onChange={e => set({ level: e.target.value })} placeholder="Intermediate" /></div>
                <div className="field"><label>Language</label>
                  <input value={c.lang} onChange={e => set({ lang: e.target.value })} placeholder="English + Hindi" /></div>
              </div>

              <div className="field-row" style={{ maxWidth: 'none' }}>
                <div className="field"><label>Rating</label>
                  <input type="number" step="0.1" min="0" max="5" value={c.rating} onChange={e => set({ rating: e.target.value })} /></div>
                <div className="field"><label>Review count</label>
                  <input type="number" min="0" value={c.reviews} onChange={e => set({ reviews: e.target.value })} /></div>
              </div>
            </div>
          )}

          {/* ---------------- CURRICULUM ---------------- */}
          {tab === 'curriculum' && (
            <div>
              {c.sections.map((s, si) => (
                <div className="panel ed-sec" key={si}>
                  <div className="ed-sec-h">
                    <div className="field wide" style={{ margin: 0, flex: 1 }}>
                      <input value={s.title} onChange={e => setSection(si, { title: e.target.value })}
                        placeholder={'Section ' + (si + 1) + ' title'} style={{ fontWeight: 600 }} />
                    </div>
                    <div className="ed-sec-act">
                      <button className="iconbtn" onClick={() => moveSection(si, -1)} title="Move up">↑</button>
                      <button className="iconbtn" onClick={() => moveSection(si, 1)} title="Move down">↓</button>
                      <button className="iconbtn danger" onClick={() => removeSection(si)} title="Delete section">✕</button>
                    </div>
                  </div>

                  {s.lectures.map((l, li) => (
                    <div className="ed-lec" key={li}>
                      <span className="ed-num tnum">{li + 1}</span>
                      <div className="ed-lec-body">
                        <div className="ed-lec-row">
                          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 'none' }}>
                            <input value={l.title} onChange={e => setLesson(si, li, { title: e.target.value })}
                              placeholder="Lesson title" />
                          </div>
                          <div className="field" style={{ margin: 0, width: 110 }}>
                            <input value={l.dur} onChange={e => setLesson(si, li, { dur: e.target.value })}
                              placeholder="12:30" className="mono" />
                          </div>
                          <div className="field" style={{ margin: 0, width: 150 }}>
                            <select value={l.type || 'video'} onChange={e => setLesson(si, li, { type: e.target.value })}>
                              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                          </div>
                          <button className="iconbtn danger" onClick={() => removeLesson(si, li)} title="Delete lesson">✕</button>
                        </div>

                        {(l.type || 'video') === 'video' && (
                          <div className="ed-vid">
                            <div className="field" style={{ margin: 0, flex: 1, maxWidth: 'none' }}>
                              <input value={l.src || ''} onChange={e => setLesson(si, li, { src: e.target.value, upload: '' })}
                                placeholder="Paste a video URL (mp4, CDN, Cloudflare Stream…)" />
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--muted)' }}>or</span>
                            <button className="btn btn-s btn-sm" onClick={() => fileRefs.current[si + '-' + li]?.click()}>
                              Upload video
                            </button>
                            <input type="file" accept="video/*" style={{ display: 'none' }}
                              ref={el => { fileRefs.current[si + '-' + li] = el; }}
                              onChange={e => onPick(si, li, e.target.files && e.target.files[0])} />
                            {l.upload && (
                              <span className="uploaded" title="Stored in IndexedDB — survives a reload">
                                ✓ {l.upload} · {l.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button className="btn btn-t" onClick={() => addLesson(si)} style={{ marginTop: 8 }}>+ Add lesson</button>
                </div>
              ))}

              <button className="btn btn-s" onClick={addSection}>+ Add section</button>

              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 20, maxWidth: '70ch' }}>
                Uploaded video is written to the browser's IndexedDB as a real file and <b>survives a reload</b> —
                no server involved. Manage or delete the stored clips in Admin → Database. For production, paste a
                hosted URL instead.
              </p>
            </div>
          )}

          {/* ---------------- MARKETING ---------------- */}
          {tab === 'marketing' && (
            <div className="panel">
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>What you will be able to do</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>Capabilities, not modules. These sell the course.</p>
              {(c.outcomes || []).map((o, i) => (
                <div className="ed-lec-row" key={i} style={{ marginBottom: 12 }}>
                  <div className="field" style={{ margin: 0, flex: 1, maxWidth: 'none' }}>
                    <input value={o} onChange={e => setListItem('outcomes', i, e.target.value)}
                      placeholder="Draft a transfer pricing study that survives scrutiny" />
                  </div>
                  <button className="iconbtn danger" onClick={() => removeListItem('outcomes', i)}>✕</button>
                </div>
              ))}
              <button className="btn btn-t" onClick={() => addListItem('outcomes')}>+ Add outcome</button>

              <h3 style={{ fontSize: 17, margin: '32px 0 6px' }}>Who this is for</h3>
              {(c.forWhom || []).map((o, i) => (
                <div className="ed-lec-row" key={i} style={{ marginBottom: 12 }}>
                  <div className="field" style={{ margin: 0, flex: 1, maxWidth: 'none' }}>
                    <input value={o} onChange={e => setListItem('forWhom', i, e.target.value)}
                      placeholder="CA finalists targeting transfer pricing roles" />
                  </div>
                  <button className="iconbtn danger" onClick={() => removeListItem('forWhom', i)}>✕</button>
                </div>
              ))}
              <button className="btn btn-t" onClick={() => addListItem('forWhom')}>+ Add audience</button>
            </div>
          )}
        </div>

        {/* ---------------- LIVE PREVIEW ---------------- */}
        <aside className="ed-side">
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="adm-ph"><h3>Card preview</h3></div>
            <div style={{ padding: 20 }}>
              <div className="cc" style={{ cursor: 'default' }}>
                <Thumb title={c.title || 'Course title'} badge={c.badge} />
                <div className="body">
                  <h4>{c.title || 'Course title'}</h4>
                  <p className="by">{c.instructor || 'Instructor'} {c.exFirm ? '· ' + c.exFirm : ''}</p>
                  <div className="facts">
                    <span>{c.hours || 0}+ hrs</span>
                    <span>{c.templates || 0} templates</span>
                    <span className="st">★ {c.rating || 0}</span>
                  </div>
                  <div className="foot">
                    <div>
                      {Number(c.price) === 0
                        ? <div className="price"><span className="free">Free</span></div>
                        : <>
                            <div className="price">
                              <span className="now">{fmt(Number(c.price) || 0)}</span>
                              {Number(c.mrp) > Number(c.price) && <span className="was">{fmt(Number(c.mrp))}</span>}
                            </div>
                            {Number(c.mrp) > Number(c.price) &&
                              <span className="save">Save {fmt(Number(c.mrp) - Number(c.price))}</span>}
                          </>}
                    </div>
                    <span className="btn btn-sm btn-p">Enrol</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="adm-ph" style={{ borderTop: '1px solid var(--border)' }}><h3>Summary</h3></div>
            <ul className="tok" style={{ padding: '8px 20px 20px' }}>
              <li><span className="k">status</span><span className="v">{c.published === false ? 'Draft' : 'Live'}</span></li>
              <li><span className="k">url</span><span className="v mono">/course/{c.id || '—'}</span></li>
              <li><span className="k">sections</span><span className="v">{c.sections.length}</span></li>
              <li><span className="k">lessons</span><span className="v">{lessonCount}</span></li>
              <li><span className="k">runtime</span><span className="v">{fmtLong(runtime)}</span></li>
              <li><span className="k">videos uploaded</span><span className="v">
                {c.sections.reduce((a, s) => a + s.lectures.filter(l => l.upload).length, 0)}
              </span></li>
            </ul>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
