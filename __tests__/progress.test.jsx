import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Player from '@/components/Player';
import { read, write } from '@/lib/storage';
import { findCourse } from '@/lib/data';

const signIn = () => {
  write('user', { name: 'Priya', email: 'learner@ledgerline.in', role: 'user' });
  write('purchases', { 'learner@ledgerline.in': ['audit'] });
};

describe('lesson progress survives finishing a lesson', () => {
  it('counts a lesson finished by playing it to the end', async () => {
    signIn();
    render(<Player course={findCourse('audit')} />);
    await screen.findAllByText(/Lesson 1 of 18/);
    expect(screen.getByText('0 / 18')).toBeTruthy();

    // the video reaching its end is what marks a lesson complete
    const video = document.querySelector('video');
    await act(async () => { fireEvent.ended(video); });

    await waitFor(() => expect(screen.getByText('1 / 18')).toBeTruthy());
    expect(read('progress', {}).audit.done['0']).toBe(true);
  });

  it('completes the lesson you leave when you press Next chapter', async () => {
    signIn();
    const u = userEvent.setup();
    render(<Player course={findCourse('audit')} />);
    await screen.findAllByText(/Lesson 1 of 18/);
    expect(screen.getByText('0 / 18')).toBeTruthy();

    // never touched the video — just moved on, as a learner skimming would
    await u.click(screen.getByRole('button', { name: /Next chapter/ }));

    await waitFor(() => expect(screen.getAllByText(/Lesson 2 of 18/).length).toBeGreaterThan(0));
    expect(screen.getByText('1 / 18')).toBeTruthy();
    expect(read('progress', {}).audit.done['0']).toBe(true);
  });

  it('lets the sidebar checkbox toggle a lesson without navigating away', async () => {
    signIn();
    const u = userEvent.setup();
    render(<Player course={findCourse('audit')} />);
    await screen.findAllByText(/Lesson 1 of 18/);

    const box = screen.getByRole('checkbox', { name: /Mark complete: Materiality/ });
    await u.click(box);

    await waitFor(() => expect(screen.getByText('1 / 18')).toBeTruthy());
    // still on lesson 1 — ticking is not navigation
    expect(screen.getAllByText(/Lesson 1 of 18/).length).toBeGreaterThan(0);
    expect(read('progress', {}).audit.done['2']).toBe(true);

    await u.click(screen.getByRole('checkbox', { name: /Mark incomplete: Materiality/ }));
    await waitFor(() => expect(screen.getByText('0 / 18')).toBeTruthy());
  });

  it('keeps that lesson complete after auto-advancing to the next one', async () => {
    signIn();
    render(<Player course={findCourse('audit')} />);
    await screen.findAllByText(/Lesson 1 of 18/);

    const video = document.querySelector('video');
    await act(async () => { fireEvent.ended(video); });
    await waitFor(() => expect(screen.getByText('1 / 18')).toBeTruthy());

    // now move on, exactly as the countdown does
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: /Next chapter/ }));

    await waitFor(() => expect(screen.getAllByText(/Lesson 2 of 18/).length).toBeGreaterThan(0));

    // THE BUG: advancing must not wipe the completion just recorded
    expect(screen.getByText('1 / 18')).toBeTruthy();
    expect(read('progress', {}).audit.done['0']).toBe(true);
    expect(read('progress', {}).audit.last).toBe(1);
  });
});
