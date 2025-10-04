import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { password } = await request.json();
  
  if (password !== ADMIN_PASSWORD) {
    return json({ error: 'Falsches Passwort' }, { status: 401 });
  }
  
  cookies.set('admin_auth', ADMIN_PASSWORD, {
    path: '/',
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  
  return json({ success: true });
};

