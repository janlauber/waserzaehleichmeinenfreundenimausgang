import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('admin_auth', {
    path: '/'
  });
  
  return json({ success: true });
};

