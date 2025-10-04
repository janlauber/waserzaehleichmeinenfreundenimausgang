import { getRandomFacts } from '$lib/db';
import { getOrCreateSession, getUsername } from '$lib/session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
  const sessionId = getOrCreateSession(cookies);
  const username = getUsername(cookies);
  const initialFacts = getRandomFacts(10, sessionId);
  
  return {
    initialFacts,
    username,
    sessionId
  };
};

