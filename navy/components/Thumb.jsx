/* Self-contained thumbnail — CSS only, so nothing can ever 404. */
export default function Thumb({ title, badge, small, className }) {
  return (
    <div className={'thumb' + (small ? ' sm' : '') + (className ? ' ' + className : '')}>
      {badge && <span className={'badge' + (badge.toLowerCase() === 'free' ? ' free' : '')}>{badge}</span>}
      <span className="corner" />
      <span className="corner2" />
      <span className="tt">{title}</span>
    </div>
  );
}
