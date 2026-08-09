'use client';
import { useState, useEffect, useRef } from 'react';
import AdminShell from '@/components/AdminShell';
import { useConfirm } from '@/components/Confirm';
import { SEEDS } from '@/lib/seeds';
import {
  getDb, dbStats, replaceDb, clearAll, exportDbFile, getEngine,
  mediaList, mediaDelete, mediaClear, estimate, SCHEMA_VERSION
} from '@/lib/storage';

const kb = (b) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB');

export default function AdminDatabase() {
  const [stats, setStats] = useState(null);
  const [media, setMedia] = useState([]);
  const [quota, setQuota] = useState(null);
  const [raw, setRaw] = useState('');
  const [msg, setMsg] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const fileRef = useRef(null);
  const confirm = useConfirm();

  const refresh = () => {
    setStats(dbStats());
    setRaw(JSON.stringify(getDb(), null, 2));
    mediaList().then(setMedia).catch(() => setMedia([]));
    estimate().then(setQuota).catch(() => setQuota(null));
  };

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener('ll:change', h);
    return () => window.removeEventListener('ll:change', h);
  }, []);

  const say = (kind, text) => { setMsg({ kind, text }); setTimeout(() => setMsg(null), 3500); };

  const loadSeed = async (seed) => {
    const ok = await confirm({
      title: 'Load “' + seed.name + '”?',
      body: 'This replaces the database on this device with that scenario.',
      confirmLabel: 'Load state'
    });
    if (!ok) return;
    replaceDb(seed.build());
    refresh();
    say('ok', seed.name + ' loaded — every page is already showing it.');
  };

  const onImport = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const res = replaceDb(JSON.parse(String(r.result)));
        if (res.error) return say('err', res.error);
        refresh();
        say('ok', 'Imported ' + file.name + '.');
      } catch (e) { say('err', 'That file is not valid JSON.'); }
    };
    r.readAsText(file);
  };

  const applyRaw = () => {
    try {
      const res = replaceDb(JSON.parse(raw));
      if (res.error) return say('err', res.error);
      refresh();
      say('ok', 'Database replaced from the editor.');
    } catch (e) { say('err', 'Invalid JSON — ' + e.message); }
  };

  const engine = getEngine();
  const mediaBytes = media.reduce((a, m) => a + (m.size || 0), 0);
  const quotaPct = quota && quota.quota ? (quota.usage / quota.quota) * 100 : 0;

  return (
    <AdminShell
      title="Database"
      action={
        <>
          <button className="btn btn-s btn-sm" onClick={() => fileRef.current?.click()}>Import JSON</button>
          <button className="btn btn-p btn-sm" onClick={() => exportDbFile()}>Export JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
            onChange={e => { onImport(e.target.files && e.target.files[0]); e.target.value = ''; }} />
        </>
      }
    >
      {msg && (
        <div className="ok" style={msg.kind === 'err' ? { background: '#FDECEA', color: 'var(--danger)' } : undefined}>
          <span style={{ fontWeight: 700 }}>{msg.kind === 'err' ? '!' : '✓'}</span><span>{msg.text}</span>
        </div>
      )}

      <p style={{ color: 'var(--secondary)', fontSize: 15, maxWidth: '78ch', marginTop: 0 }}>
        The demo runs on a real local database in the browser —{' '}
        <b>{engine === 'indexeddb' ? 'IndexedDB' : engine === 'localstorage' ? 'localStorage (fallback)' : 'memory'}</b>,
        database <code className="mono">ledgerline</code>. Two stores: <code className="mono">kv</code> holds the
        JSON collections, <code className="mono">media</code> holds uploaded video as real Blobs. Nothing leaves the device.
      </p>

      <div className="g4" style={{ margin: '28px 0' }}>
        <div className="panel stat-card">
          <div className="n" style={{ fontSize: 20, lineHeight: 1.3 }}>
            {engine === 'indexeddb' ? 'IndexedDB' : engine === 'localstorage' ? 'localStorage' : 'Memory'}
          </div>
          <div className="l">Engine</div>
          <div className="s">{engine === 'indexeddb' ? 'Blobs supported' : 'IndexedDB unavailable here'}</div>
        </div>
        <div className="panel stat-card">
          <div className="n tnum">{stats ? stats.collections.length : 0}</div>
          <div className="l">Collections</div>
          <div className="s">Schema v{SCHEMA_VERSION}</div>
        </div>
        <div className="panel stat-card">
          <div className="n tnum">{stats ? kb(stats.bytes) : '—'}</div>
          <div className="l">JSON data</div>
          <div className="s">Courses, accounts, progress</div>
        </div>
        <div className="panel stat-card">
          <div className="n tnum">{kb(mediaBytes)}</div>
          <div className="l">Stored video</div>
          <div className="s">{media.length} file{media.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      {quota && (
        <div className="panel" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
            <span>Origin storage used</span>
            <span className="tnum">{kb(quota.usage)} of {kb(quota.quota)} available</span>
          </div>
          <div className="pbar"><i style={{ width: Math.max(0.6, quotaPct) + '%' }} /></div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '12px 0 0' }}>
            The browser grants this origin roughly {kb(quota.quota)} — hundreds of times what localStorage allowed,
            which is why uploaded video can be kept here rather than thrown away on reload.
          </p>
        </div>
      )}

      {/* ---------- seeds ---------- */}
      <h3 style={{ fontSize: 19, margin: '0 0 6px' }}>Seed presets</h3>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
        Each replaces the database with a complete, known state — useful for rehearsing a walkthrough
        or resetting between two client meetings.
      </p>
      <div className="g3" style={{ marginBottom: 36 }}>
        {SEEDS.map(s => (
          <div className="panel seedcard" key={s.id}>
            <h4 style={{ fontSize: 17, marginBottom: 8 }}>{s.name}</h4>
            <p style={{ fontSize: 14, color: 'var(--secondary)', flex: 1, margin: 0 }}>{s.blurb}</p>
            <button className="btn btn-s btn-sm" style={{ marginTop: 18 }} onClick={() => loadSeed(s)}>
              Load this state
            </button>
          </div>
        ))}
      </div>

      {/* ---------- collections ---------- */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
        <div className="adm-ph"><h3>kv store — collections</h3></div>
        <div style={{ padding: '16px 24px', overflowX: 'auto' }}>
          <table className="tb">
            <thead><tr><th>Key</th><th>Shape</th><th>Records</th></tr></thead>
            <tbody>
              {stats && stats.collections.length > 0 ? stats.collections.map(c => (
                <tr key={c.key}>
                  <td className="mono">{c.key}</td>
                  <td style={{ color: 'var(--muted)' }}>{c.type}</td>
                  <td className="tnum">{c.count}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{ padding: '28px 0', textAlign: 'center', color: 'var(--muted)' }}>
                  Empty — load a seed preset above.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- media ---------- */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
        <div className="adm-ph">
          <h3>media store — uploaded video</h3>
          {media.length > 0 && (
            <button className="btn btn-t" style={{ fontSize: 13, color: 'var(--danger)' }}
              onClick={async () => {
                const ok = await confirm({ title: 'Delete all stored video?',
                  body: media.length + ' clip' + (media.length === 1 ? '' : 's') + ' will be removed from IndexedDB.',
                  confirmLabel: 'Delete all', danger: true });
                if (ok) mediaClear().then(refresh);
              }}>
              Delete all
            </button>
          )}
        </div>
        <div style={{ padding: '16px 24px', overflowX: 'auto' }}>
          <table className="tb">
            <thead><tr><th>File</th><th>Type</th><th>Size</th><th>Uploaded</th><th></th></tr></thead>
            <tbody>
              {media.length > 0 ? media.map(m => (
                <tr key={m.id}>
                  <td>
                    <b style={{ fontWeight: 600 }}>{m.name}</b>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>idb:{m.id}</div>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{m.type || '—'}</td>
                  <td className="tnum">{kb(m.size)}</td>
                  <td style={{ color: 'var(--muted)' }}>{new Date(m.at).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-s btn-sm" style={{ color: 'var(--danger)' }}
                      onClick={() => mediaDelete(m.id).then(refresh)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ padding: '28px 0', textAlign: 'center', color: 'var(--muted)' }}>
                  No uploads yet. Add a lesson video in Courses → edit → Curriculum.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- raw editor ---------- */}
      <div className="panel" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 19, marginBottom: 6 }}>Raw document</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
              Edit the JSON directly and apply. Invalid JSON is rejected before anything is written.
            </p>
          </div>
          <button className="btn btn-s btn-sm" onClick={() => setShowRaw(v => !v)}>
            {showRaw ? 'Hide' : 'Show'} JSON
          </button>
        </div>
        {showRaw && (
          <>
            <textarea className="notepad mono" style={{ marginTop: 20, minHeight: 320, fontSize: 12.5 }}
              value={raw} onChange={e => setRaw(e.target.value)} spellCheck={false} />
            <div className="btn-row" style={{ marginTop: 16 }}>
              <button className="btn btn-p btn-sm" onClick={applyRaw}>Apply JSON</button>
              <button className="btn btn-s btn-sm" onClick={refresh}>Revert</button>
            </div>
          </>
        )}
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '16px 0 0' }}>
          Export writes the kv store only. Video Blobs are not embedded in the JSON — a few clips would
          make the file enormous. Move media by re-uploading, or point lessons at hosted URLs.
        </p>
      </div>

      {/* ---------- danger ---------- */}
      <div className="panel" style={{ borderColor: '#F3C9C4', background: '#FEF7F6' }}>
        <h3 style={{ fontSize: 17, marginBottom: 6, color: 'var(--danger)' }}>Wipe the database</h3>
        <p style={{ fontSize: 14, color: 'var(--secondary)', margin: '0 0 18px', maxWidth: '64ch' }}>
          Clears both stores — every course, account, purchase, note, homepage setting and uploaded clip
          on this device. The catalogue falls back to the six seed courses on the next read.
        </p>
        <button className="btn btn-s btn-sm" style={{ color: 'var(--danger)', borderColor: '#E7A9A2' }}
          onClick={async () => {
            const ok = await confirm({ title: 'Erase the entire database?',
              body: 'Both stores are cleared — courses, accounts, purchases, notes, settings and uploaded video.',
              confirmLabel: 'Erase everything', danger: true });
            if (ok) { clearAll(); refresh(); say('ok', 'Database wiped.'); }
          }}>
          Erase everything
        </button>
      </div>
    </AdminShell>
  );
}
