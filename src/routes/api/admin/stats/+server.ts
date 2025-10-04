import { json } from '@sveltejs/kit';
import { getDetailedAdminStats } from '$lib/db';
import type { RequestHandler } from './$types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const GET: RequestHandler = async ({ cookies }) => {
  const isAuthenticated = cookies.get('admin_auth') === ADMIN_PASSWORD;
  
  if (!isAuthenticated) {
    return json({ error: 'Nicht autorisiert' }, { status: 401 });
  }
  
  const stats = getDetailedAdminStats();
  return json(stats);
};

