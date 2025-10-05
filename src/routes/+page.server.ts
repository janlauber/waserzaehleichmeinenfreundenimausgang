import { getRandomFacts } from '$lib/db';
import { getOrCreateSession, getUsername } from '$lib/session';
import type { PageServerLoad } from './$types';

const DEBUG = process.env.DEBUG === 'true';

export const load: PageServerLoad = ({ cookies }) => {
  const startTime = Date.now();
  if (DEBUG) console.log('[PAGE] Loading home page');
  
  const sessionId = getOrCreateSession(cookies);
  const username = getUsername(cookies);
  const initialFacts = getRandomFacts(10, sessionId);
  
  if (DEBUG) console.log(`[PAGE] Home page loaded in ${Date.now() - startTime}ms`);
  
  return {
    initialFacts,
    username,
    sessionId
  };
};

