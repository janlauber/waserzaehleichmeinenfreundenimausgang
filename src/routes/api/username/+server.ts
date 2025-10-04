import { json } from '@sveltejs/kit';
import { setUsername } from '$lib/session';
import type { RequestHandler } from './$types';

const MAX_USERNAME_LENGTH = 30;
const MIN_USERNAME_LENGTH = 2;

function sanitizeUsername(username: string): string {
  return username.trim().replace(/\s+/g, ' ');
}

function validateUsername(username: string): string | null {
  const trimmed = sanitizeUsername(username);
  
  if (trimmed.length === 0) {
    return 'Name ist erforderlich';
  }
  
  if (trimmed.length < MIN_USERNAME_LENGTH) {
    return `Name ist zu kurz (min. ${MIN_USERNAME_LENGTH} Zeichen)`;
  }
  
  if (trimmed.length > MAX_USERNAME_LENGTH) {
    return `Name ist zu lang (max. ${MAX_USERNAME_LENGTH} Zeichen)`;
  }
  
  const specialCharsPattern = /[<>{}[\]\\\/]/;
  if (specialCharsPattern.test(trimmed)) {
    return 'Ungültige Zeichen im Namen';
  }
  
  return null;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }
  
  const { username } = body;
  
  if (typeof username !== 'string') {
    return json({ error: 'Ungültiger Datentyp' }, { status: 400 });
  }
  
  const error = validateUsername(username);
  if (error) {
    return json({ error }, { status: 400 });
  }
  
  const sanitized = sanitizeUsername(username);
  setUsername(cookies, sanitized);
  return json({ success: true });
};

