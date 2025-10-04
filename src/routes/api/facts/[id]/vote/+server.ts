import { json } from '@sveltejs/kit';
import { vote, getFact } from '$lib/db';
import { getOrCreateSession } from '$lib/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
  const sessionId = getOrCreateSession(cookies);
  const { voteType } = await request.json();
  
  if (voteType !== 'up' && voteType !== 'down') {
    return json({ error: 'Ungültiger Vote-Typ' }, { status: 400 });
  }
  
  const factId = params.id;
  const fact = getFact(factId, sessionId);
  
  if (!fact) {
    return json({ error: 'Fakt nicht gefunden' }, { status: 404 });
  }
  
  if (fact.created_by_session === sessionId) {
    return json({ error: 'Du kannst nicht für deinen eigenen Fakt voten' }, { status: 403 });
  }
  
  vote(factId, sessionId, voteType);
  
  const updatedFact = getFact(factId, sessionId);
  return json(updatedFact);
};

