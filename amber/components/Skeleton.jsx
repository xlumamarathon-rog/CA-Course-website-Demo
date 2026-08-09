/* Shimmer placeholders shown while the catalogue resolves from device storage. */
export function SkeletonCard() {
  return (
    <div className="sk-card" aria-hidden="true">
      <div className="sk sk-thumb" />
      <div className="sk-body">
        <div className="sk sk-line w90" />
        <div className="sk sk-line w60" />
        <div className="sk sk-line w40 sm" />
        <div className="sk-foot">
          <div className="sk sk-line w30" />
          <div className="sk sk-btn" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4, className = 'g4' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
