'use client';
/* Infinite logo ribbon. The list is duplicated so the loop is seamless;
   the copy is aria-hidden so screen readers hear each name once. */
export default function Marquee({ items, speed = 42 }) {
  return (
    <div className="mq" style={{ '--mq-speed': speed + 's' }}>
      <div className="mq-track">
        <ul className="mq-list">
          {items.map(i => <li key={i}>{i}</li>)}
        </ul>
        <ul className="mq-list" aria-hidden="true">
          {items.map(i => <li key={i + '-2'}>{i}</li>)}
        </ul>
      </div>
      <span className="mq-fade left" aria-hidden="true" />
      <span className="mq-fade right" aria-hidden="true" />
    </div>
  );
}
