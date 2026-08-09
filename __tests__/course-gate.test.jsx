import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CourseDetail from '@/components/CourseDetail';
import { write } from '@/lib/storage';

describe('signed-out visitors cannot see course content', () => {
  it('hides every lesson title and offers the introduction instead', async () => {
    render(<CourseDetail id="audit" />);

    // the locked outline lists section names only
    expect(await screen.findByText('Sign in to see the curriculum')).toBeTruthy();
    expect(screen.getByText('Course introduction')).toBeTruthy();
    expect(screen.getAllByText('Foundations of audit').length).toBeGreaterThan(0);

    // …but no actual lesson is named anywhere on the page
    expect(screen.queryByText('How an audit actually gets staffed and run')).toBe(null);
    expect(screen.queryByText('Materiality — the number that shapes everything')).toBe(null);
    expect(screen.queryByText('Sampling that survives review')).toBe(null);
  });

  it('reveals the curriculum once signed in', async () => {
    write('user', { name: 'Priya', email: 'learner@ledgerline.in', role: 'user' });
    render(<CourseDetail id="audit" />);

    expect(await screen.findByText('How an audit actually gets staffed and run')).toBeTruthy();
    expect(screen.queryByText('Sign in to see the curriculum')).toBe(null);
  });

  it('offers the buying option to a signed-in visitor who has not purchased', async () => {
    write('user', { name: 'Rahul', email: 'student@ledgerline.in', role: 'user' });
    write('purchases', { 'student@ledgerline.in': [] });
    render(<CourseDetail id="audit" />);

    // curriculum is visible, but the purchase prompt is there
    expect(await screen.findByText('You do not own this course yet')).toBeTruthy();
    expect(screen.getAllByText('Buy this course').length).toBeGreaterThan(0);
    expect(screen.getByText('How an audit actually gets staffed and run')).toBeTruthy();
    // and the intro video is offered as a preview
    expect(screen.getByText('Course introduction')).toBeTruthy();
  });

  it('drops the purchase prompt once the course is owned', async () => {
    write('user', { name: 'Priya', email: 'learner@ledgerline.in', role: 'user' });
    write('purchases', { 'learner@ledgerline.in': ['audit'] });
    render(<CourseDetail id="audit" />);

    await waitFor(() =>
      expect(screen.getByText('How an audit actually gets staffed and run')).toBeTruthy());
    expect(screen.queryByText('You do not own this course yet')).toBe(null);
  });

  it('respects the admin switch that turns the gate off', async () => {
    write('site', { access: { requireLoginForCurriculum: false, showLockedOutline: true } });
    render(<CourseDetail id="audit" />);

    await waitFor(() =>
      expect(screen.getByText('How an audit actually gets staffed and run')).toBeTruthy());
    expect(screen.queryByText('Sign in to see the curriculum')).toBe(null);
  });
});
