'use client';
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

/* In-app confirmation, replacing window.confirm(). Native dialogs are
   unstyled, show the origin, and cannot be driven by automated tests. */
const Ctx = createContext(() => Promise.resolve(false));

export function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null);   // { title, body, confirmLabel, danger }
  const resolver = useRef(null);
  const btnRef = useRef(null);

  const confirm = useCallback((opts) => {
    const o = typeof opts === 'string' ? { body: opts } : (opts || {});
    setReq({
      title: o.title || 'Are you sure?',
      body: o.body || '',
      confirmLabel: o.confirmLabel || 'Confirm',
      cancelLabel: o.cancelLabel || 'Cancel',
      danger: !!o.danger
    });
    return new Promise(resolve => { resolver.current = resolve; });
  }, []);

  const close = (val) => {
    setReq(null);
    if (resolver.current) { resolver.current(val); resolver.current = null; }
  };

  useEffect(() => {
    if (!req) return;
    btnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req]);

  return (
    <Ctx.Provider value={confirm}>
      {children}
      {req && (
        <div className="cfm-backdrop" role="presentation" onClick={() => close(false)}>
          <div className="cfm" role="alertdialog" aria-modal="true" aria-labelledby="cfm-t"
            onClick={e => e.stopPropagation()}>
            <h3 id="cfm-t">{req.title}</h3>
            {req.body && <p>{req.body}</p>}
            <div className="cfm-actions">
              <button className="btn btn-s" onClick={() => close(false)}>{req.cancelLabel}</button>
              <button ref={btnRef} className={'btn ' + (req.danger ? 'btn-danger' : 'btn-p')}
                onClick={() => close(true)}>
                {req.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useConfirm = () => useContext(Ctx);
