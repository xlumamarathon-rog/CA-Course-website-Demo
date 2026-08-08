export default function Stars({ rating = 5 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for (let i = 0; i < 5; i++) s += i < full ? '★' : (i === full && half ? '★' : '☆');
  return <span aria-label={rating + ' out of 5'}>{s}</span>;
}
