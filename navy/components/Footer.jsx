import Link from 'next/link';

const COLS = [
  { h: 'Courses', links: [['All courses','/courses'],['Flagship MasterClasses','/courses'],['Finance tools','/courses'],['Free courses','/courses']] },
  { h: 'Placements', links: [['Job board','/jobs'],['Placement program','/course/placement'],['Hall of fame','/about'],['Hire from us','/contact']] },
  { h: 'Company', links: [['About us','/about'],['Contact','/contact'],['Become a mentor','/contact'],['B2B training','/contact']] },
  { h: 'Support', links: [['My learning','/dashboard'],['Refund policy','/about'],['Terms of use','/about'],['Verify a certificate','/about']] }
];

export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-grid">
          <div>
            <Link href="/" className="logo" style={{ color: '#fff', marginBottom: 16 }}>
              <span className="mark">TB</span><span>THINKING BRIDGE</span>
            </Link>
            <p style={{ maxWidth: '32ch', marginTop: 16 }}>
              Practical finance training built by people who did the work — then placed 20,000 others who wanted to.
            </p>
          </div>
          {COLS.map(c => (
            <div key={c.h}>
              <h5>{c.h}</h5>
              {c.links.map(([label, href], i) => <Link key={i} href={href}>{label}</Link>)}
            </div>
          ))}
        </div>
        <div className="ft-bot">
          <span>© {new Date().getFullYear()} Thinking Bridge. All rights reserved.</span>
          <span>connect@thinkingbridge.in · 9650147313</span>
        </div>
      </div>
    </footer>
  );
}
