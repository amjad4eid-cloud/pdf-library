import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin';
const ADMIN_VALUE = '1';

export function isAuthed() {
  const store = cookies();
  return store.get(COOKIE_NAME)?.value === ADMIN_VALUE;
}

export function setAuthed() {
  const store = cookies();
  store.set(COOKIE_NAME, ADMIN_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export function clearAuth() {
  const store = cookies();
  store.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });
}

export function sha256Hex(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}
