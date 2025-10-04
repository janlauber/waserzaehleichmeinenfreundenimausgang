import { redirect } from '@sveltejs/kit';
import { getAllFacts, getAllUsers, getUsersByName } from '$lib/db';
import type { PageServerLoad } from './$types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const load: PageServerLoad = ({ cookies }) => {
  const isAuthenticated = cookies.get('admin_auth') === ADMIN_PASSWORD;
  
  if (!isAuthenticated) {
    throw redirect(303, '/admin/login');
  }
  
  const facts = getAllFacts();
  const sessions = getAllUsers();
  const users = getUsersByName();
  
  return {
    facts,
    sessions,
    users
  };
};

