import { json } from '@sveltejs/kit';
import { remapUserFacts } from '$lib/db';
import type { RequestHandler } from './$types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const isAuthenticated = cookies.get('admin_auth') === ADMIN_PASSWORD;
  
  if (!isAuthenticated) {
    return json({ error: 'Nicht autorisiert' }, { status: 401 });
  }
  
  const { from, to } = await request.json();
  
  if (!from || !to) {
    return json({ error: 'Session-IDs erforderlich' }, { status: 400 });
  }
  
  const success = remapUserFacts(from, to);
  
  if (!success) {
    return json({ error: 'Keine Fakten zum Verschieben gefunden' }, { status: 404 });
  }
  
  return json({ success: true, count: success });
};

