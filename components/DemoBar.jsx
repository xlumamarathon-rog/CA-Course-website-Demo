'use client';
import { useTheme } from '@/lib/theme';

export default function DemoBar() {
  const { theme, setTheme } = useTheme();
  const isAmber = theme === 'amber';

  return (
    <div className="demobar">
      <span className="lbl">Client demo</span>
      <div className="seg" role="group" aria-label="Accent direction">
        <button className={isAmber ? 'on' : ''} onClick={() => setTheme('amber')} aria-pressed={isAmber}>
          A · Amber
        </button>
        <button className={!isAmber ? 'on' : ''} onClick={() => setTheme('navy')} aria-pressed={!isAmber}>
          B · Navy
        </button>
      </div>
      <span className="spacer" />
      <span className="hint">
        Showing <span className="dirname">{isAmber ? 'Direction A — Amber Continuity' : 'Direction B — Navy Authority'}</span>
        {'  ·  '}your choice is saved on this device
      </span>
    </div>
  );
}
