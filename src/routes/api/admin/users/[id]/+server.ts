import { json } from '@sveltejs/kit';
import { deleteUserAndFacts } from '$lib/db';
import type { RequestHandler } from './$types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const DELETE: RequestHandler = async ({ params, cookies }) => {
  const isAuthenticated = cookies.get('admin_auth') === ADMIN_PASSWORD;
  
  if (!isAuthenticated) {
    return json({ error: 'Nicht autorisiert' }, { status: 401 });
  }
  
  const success = deleteUserAndFacts(params.id);
  
  if (!success) {
    return json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
  }
  
  return json({ success: true });
};

