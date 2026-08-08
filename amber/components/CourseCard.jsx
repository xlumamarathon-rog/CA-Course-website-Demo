'use client';
import Link from 'next/link';
import Thumb from './Thumb';
import Stars from './Stars';
import { fmt } from '@/lib/data';
import { usePurchases } from '@/lib/store';

export default function CourseCard({ course: c }) {
  const { has } = usePurchases();
  const owned = has(c);
  const free = c.price === 0;
  const saving = (c.mrp || 0) - c.price;

  return (
    <Link href={'/course/' + c.id} className="cc">
      <Thumb title={c.title} badge={c.published === false ? 'Draft' : c.badge} />
      <div className="body">
        <h4>{c.title}</h4>
        <p className="by">{c.instructor}{c.exFirm ? ' · ' + c.exFirm : ''}</p>
        <div className="facts">
          <span>{c.hours}+ hrs</span>
          <span>{c.templates} templates</span>
          <span className="st"><Stars rating={c.rating} /> {c.rating}</span>
          <span>({Number(c.reviews || 0).toLocaleString('en-IN')})</span>
        </div>
        <div className="foot">
          <div>
            {free ? (
              <div className="price"><span className="free">Free</span></div>
            ) : (
              <>
                <div className="price">
                  <span className="now">{fmt(c.price)}</span>
                  {saving > 0 && <span className="was">{fmt(c.mrp)}</span>}
                </div>
                {saving > 0 && <span className="save">Save {fmt(saving)} · 30%</span>}
              </>
            )}
          </div>
          <span className={'btn btn-sm ' + (owned ? 'btn-s' : 'btn-p')}>
            {owned ? 'Continue' : free ? 'Start free' : 'Enrol'}
          </span>
        </div>
      </div>
    </Link>
  );
}
