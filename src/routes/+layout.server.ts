import { getOrCreateSession, getUsername } from '$lib/session';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
  const sessionId = getOrCreateSession(cookies);
  const username = getUsername(cookies);
  return {
    sessionId,
    username
  };
};

