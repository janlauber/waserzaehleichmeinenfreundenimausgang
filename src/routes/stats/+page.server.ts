import { getStats } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  return getStats();
};
