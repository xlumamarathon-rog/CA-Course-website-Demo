import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import LearnView from '@/components/LearnView';
import { push } from './setup.jsx';

const read = k => JSON.parse(window.localStorage.getItem('tb.' + k) || 'null');
const write = (k, v) => window.localStorage.setItem('tb.' + k, JSON.stringify(v));

describe('sign-in page', () => {
  it('lists the three demo accounts under the button', async () => {
    render(<LoginPage />);
    expect(await screen.findByText('Demo credentials')).toBeTruthy();
    expect(screen.getByText(/admin@thinkingbridge\.in/)).toBeTruthy();
    expect(screen.getByText(/learner@thinkingbridge\.in/)).toBeTruthy();
    expect(screen.getByText(/student@thinkingbridge\.in/)).toBeTruthy();
  });

  it('fills email AND password when a credential card is clicked', async () => {
    const u = userEvent.setup();
    render(<LoginPage />);
    await screen.findByText('Demo credentials');

    const email = screen.getByPlaceholderText('you@firm.com');
    const pass = screen.getByPlaceholderText('••••••••');
    expect(email.value).toBe('');
    expect(pass.value).toBe('');

    await u.click(screen.getByText('Learner — has purchased').closest('button'));

    expect(email.value).toBe('learner@thinkingbridge.in');
    expect(pass.value).toBe('learner123');
  });

  it('rejects a wrong password and accepts the right one', async () => {
    const u = userEvent.setup();
    render(<LoginPage />);
    await screen.findByText('Demo credentials');

    await u.type(screen.getByPlaceholderText('you@firm.com'), 'learner@thinkingbridge.in');
    await u.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await u.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText(/Incorrect password/)).toBeTruthy();
    expect(read('user')).toBe(null);

    await u.clear(screen.getByPlaceholderText('••••••••'));
    await u.type(screen.getByPlaceholderText('••••••••'), 'learner123');
    await u.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(read('user')).toBeTruthy());
    expect(read('user').email).toBe('learner@thinkingbridge.in');
    expect(read('user').role).toBe('user');
  });

  it('sends an admin to the admin panel', async () => {
    const u = userEvent.setup();
    render(<LoginPage />);
    await screen.findByText('Demo credentials');
    await u.click(screen.getByText(/admin@thinkingbridge\.in/).closest('button'));
    await u.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(read('user').role).toBe('admin'));
    expect(push).toHaveBeenCalledWith('/admin');
  });
});

describe('course access gating', () => {
  it('blocks a signed-out visitor with the sign-in gate', async () => {
    render(<LearnView id="audit" />);
    expect(await screen.findByText('Sign in to start learning')).toBeTruthy();
    expect(screen.queryAllByText(/Lesson 1 of/).length).toBe(0);
  });

  it('blocks a signed-in learner who has not purchased', async () => {
    write('user', { name: 'Rahul', email: 'student@thinkingbridge.in', role: 'user' });
    write('purchases', { 'student@thinkingbridge.in': [] });
    render(<LearnView id="audit" />);
    expect(await screen.findByText('You do not own this course yet')).toBeTruthy();
    expect(screen.queryAllByText(/Lesson 1 of/).length).toBe(0);
  });

  it('opens the player once the course is owned', async () => {
    write('user', { name: 'Priya', email: 'learner@thinkingbridge.in', role: 'user' });
    write('purchases', { 'learner@thinkingbridge.in': ['audit'] });
    render(<LearnView id="audit" />);
    expect((await screen.findAllByText(/Lesson 1 of 18/)).length).toBeGreaterThan(0);
    expect(screen.queryByText('You do not own this course yet')).toBe(null);
  });

  it('lets an admin preview without buying', async () => {
    write('user', { name: 'Admin', email: 'admin@thinkingbridge.in', role: 'admin' });
    write('purchases', { 'admin@thinkingbridge.in': [] });
    render(<LearnView id="audit" />);
    expect((await screen.findAllByText(/Lesson 1 of 18/)).length).toBeGreaterThan(0);
  });

  it('unlocks a free course for any signed-in account', async () => {
    write('user', { name: 'Rahul', email: 'student@thinkingbridge.in', role: 'user' });
    write('purchases', { 'student@thinkingbridge.in': [] });
    render(<LearnView id="placement" />);
    expect((await screen.findAllByText(/Lesson 1 of 7/)).length).toBeGreaterThan(0);
  });
});
