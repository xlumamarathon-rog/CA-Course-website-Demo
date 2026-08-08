import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Player from '@/components/Player';
import Checkout from '@/components/Checkout';
import CourseEditor from '@/components/CourseEditor';
import CoursesPage from '@/app/courses/page';
import DemoBar from '@/components/DemoBar';
import { ThemeProvider } from '@/lib/theme';
import { findCourse } from '@/lib/data';

const read = k => JSON.parse(window.localStorage.getItem('tb.' + k) || 'null');
const write = (k, v) => window.localStorage.setItem('tb.' + k, JSON.stringify(v));
const signIn = (email = 'learner@thinkingbridge.in', role = 'user') => {
  write('user', { name: 'Priya Sharma', email, role });
  write('purchases', { [email]: ['audit'] });
};

describe('course player', () => {
  it('advances to the next chapter and records progress', async () => {
    const u = userEvent.setup();
    signIn();
    render(<Player course={findCourse('audit')} />);

    expect((await screen.findAllByText(/Lesson 1 of 18/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('How an audit actually gets staffed and run').length).toBeGreaterThan(0);

    // the "Next chapter" strip below the player
    expect(screen.getByText('Next chapter')).toBeTruthy();
    await u.click(screen.getByRole('button', { name: /Next chapter/ }));

    await waitFor(() => expect(screen.getAllByText(/Lesson 2 of 18/).length).toBeGreaterThan(0));
    expect(screen.getAllByText('Reading a trial balance like an auditor').length).toBeGreaterThan(0);

    // last lesson is remembered on the device
    await waitFor(() => expect(read('progress').audit.last).toBe(1));
  });

  it('marks a lesson complete and updates the progress counter', async () => {
    const u = userEvent.setup();
    signIn();
    render(<Player course={findCourse('audit')} />);
    await screen.findAllByText(/Lesson 1 of 18/);

    expect(screen.getByText('0 / 18')).toBeTruthy();
    await u.click(screen.getByRole('button', { name: 'Mark as complete' }));

    await waitFor(() => expect(screen.getByText('1 / 18')).toBeTruthy());
    expect(read('progress').audit.done['0']).toBe(true);
  });

  it('saves a timestamped note', async () => {
    const u = userEvent.setup();
    signIn();
    render(<Player course={findCourse('audit')} />);
    await screen.findAllByText(/Lesson 1 of 18/);

    await u.click(screen.getByRole('button', { name: /^Notes/ }));
    await u.type(screen.getByPlaceholderText(/What did you want to remember/), 'Materiality drives scope');
    await u.click(screen.getByRole('button', { name: /Save note at/ }));

    await waitFor(() => expect(read('notes').audit.length).toBe(1));
    expect(read('notes').audit[0].text).toBe('Materiality drives scope');
    expect(screen.getByText('Materiality drives scope')).toBeTruthy();
  });

  it('jumps to any lesson from the curriculum sidebar', async () => {
    const u = userEvent.setup();
    signIn();
    render(<Player course={findCourse('audit')} />);
    await screen.findAllByText(/Lesson 1 of 18/);

    await u.click(screen.getByText('Materiality — the number that shapes everything'));
    await waitFor(() => expect(screen.getAllByText(/Lesson 3 of 18/).length).toBeGreaterThan(0));
  });
});

describe('checkout', () => {
  it('applies COMBO30, recalculates, and records the purchase', async () => {
    const u = userEvent.setup();
    write('user', { name: 'Rahul Verma', email: 'student@thinkingbridge.in', role: 'user' });
    write('purchases', { 'student@thinkingbridge.in': [] });
    render(<Checkout course={findCourse('audit')} />);

    // list price before the coupon
    expect((await screen.findAllByText('₹4,284')).length).toBeGreaterThan(0);

    // card details arrive pre-filled
    expect(screen.getByDisplayValue('4242 4242 4242 4242')).toBeTruthy();
    expect(screen.getByDisplayValue('12 / 28')).toBeTruthy();
    expect(screen.getByDisplayValue('student@thinkingbridge.in')).toBeTruthy();

    // a bad coupon is rejected
    await u.type(screen.getByPlaceholderText('Coupon code'), 'NOPE99');
    await u.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByText(/not valid on this course/)).toBeTruthy();

    // the real one works
    await u.clear(screen.getByPlaceholderText('Coupon code'));
    await u.type(screen.getByPlaceholderText('Coupon code'), 'COMBO30');
    await u.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByText(/COMBO30 applied — you saved ₹1,285/)).toBeTruthy();

    // pay
    await u.click(screen.getByRole('button', { name: /Pay ₹2,999 securely/ }));
    expect(await screen.findByText('You are in.')).toBeTruthy();
    await waitFor(() =>
      expect(read('purchases')['student@thinkingbridge.in']).toContain('audit'));
  });
});

describe('admin backend', () => {
  it('creates and publishes a course that then appears in the public catalogue', async () => {
    const u = userEvent.setup();
    write('user', { name: 'Admin', email: 'admin@thinkingbridge.in', role: 'admin' });

    const { unmount } = render(<CourseEditor />);
    await screen.findByText('New course');

    await u.type(screen.getByPlaceholderText('Transfer Pricing MasterClass'), 'Ind AS MasterClass');
    await u.type(screen.getByPlaceholderText('CA Sanat Goyal'), 'CA Test Instructor');

    // add a lesson in the curriculum tab
    await u.click(screen.getByRole('button', { name: /Curriculum/ }));
    await u.type(screen.getAllByPlaceholderText('Lesson title')[0], 'Opening lesson');

    await u.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() => {
      const saved = read('courses').find(c => c.id === 'ind-as-masterclass');
      expect(saved).toBeTruthy();
      expect(saved.published).toBe(true);
      expect(saved.sections[0].lectures[0].title).toBe('Opening lesson');
    });

    unmount();

    // the public catalogue now lists it
    render(<CoursesPage />);
    expect((await screen.findAllByText('Ind AS MasterClass')).length).toBeGreaterThan(0);
    expect(screen.getByText(/Showing 7 of 7 courses/)).toBeTruthy();
  });

  it('unpublishing hides a course from the catalogue', async () => {
    const seeded = read('courses');
    render(<CoursesPage />);
    expect(await screen.findByText(/Showing 6 of 6 courses/)).toBeTruthy();
    expect(screen.getAllByText('Audit MasterClass — Statutory & Internal').length).toBeGreaterThan(0);

    // simulate the admin toggling it to draft
    const { COURSES } = await import('@/lib/data');
    write('courses', COURSES.map(c => c.id === 'audit' ? { ...c, published: false } : { ...c, published: true }));
    window.dispatchEvent(new CustomEvent('tb:change', { detail: { key: 'courses' } }));

    await waitFor(() => expect(screen.getByText(/Showing 5 of 5 courses/)).toBeTruthy());
    expect(screen.queryAllByText('Audit MasterClass — Statutory & Internal').length).toBe(0);
  });
});

describe('design direction switch', () => {
  it('flips the theme and remembers it', async () => {
    const u = userEvent.setup();
    render(<ThemeProvider><DemoBar /></ThemeProvider>);

    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('navy'));

    await u.click(screen.getByRole('button', { name: /A · Amber/ }));
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('amber'));
    expect(read('theme')).toBe('amber');

    await u.click(screen.getByRole('button', { name: /B · Navy/ }));
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('navy'));
    expect(read('theme')).toBe('navy');
  });
});
