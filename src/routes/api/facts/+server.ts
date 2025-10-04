import { json } from '@sveltejs/kit';
import { createFact, getRandomFacts } from '$lib/db';
import { getOrCreateSession } from '$lib/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, cookies }) => {
  const sessionId = getOrCreateSession(cookies);
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  const facts = getRandomFacts(Math.min(limit, 50), sessionId);
  return json(facts);
};

const MAX_CONTENT_LENGTH = 280;
const MIN_CONTENT_LENGTH = 10;
const MAX_AUTHOR_LENGTH = 30;
const MIN_AUTHOR_LENGTH = 2;

function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

function validateContent(content: string): string | null {
  const trimmed = sanitizeInput(content);
  
  if (trimmed.length === 0) {
    return 'Inhalt ist erforderlich';
  }
  
  if (trimmed.length < MIN_CONTENT_LENGTH) {
    return `Inhalt ist zu kurz (min. ${MIN_CONTENT_LENGTH} Zeichen)`;
  }
  
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    return `Inhalt ist zu lang (max. ${MAX_CONTENT_LENGTH} Zeichen)`;
  }
  
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  if (urlPattern.test(trimmed)) {
    return 'URLs sind nicht erlaubt';
  }
  
  const htmlPattern = /<[^>]*>/g;
  if (htmlPattern.test(trimmed)) {
    return 'HTML-Tags sind nicht erlaubt';
  }
  
  const repeatedCharsPattern = /(.)\1{9,}/;
  if (repeatedCharsPattern.test(trimmed)) {
    return 'Zu viele wiederholte Zeichen';
  }
  
  return null;
}

function validateAuthorName(name: string): string | null {
  const trimmed = sanitizeInput(name);
  
  if (trimmed.length === 0) {
    return 'Name ist erforderlich';
  }
  
  if (trimmed.length < MIN_AUTHOR_LENGTH) {
    return `Name ist zu kurz (min. ${MIN_AUTHOR_LENGTH} Zeichen)`;
  }
  
  if (trimmed.length > MAX_AUTHOR_LENGTH) {
    return `Name ist zu lang (max. ${MAX_AUTHOR_LENGTH} Zeichen)`;
  }
  
  const specialCharsPattern = /[<>{}[\]\\\/]/;
  if (specialCharsPattern.test(trimmed)) {
    return 'Ungültige Zeichen im Namen';
  }
  
  return null;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  const sessionId = getOrCreateSession(cookies);
  
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }
  
  const { content, authorName } = body;
  
  if (typeof content !== 'string' || typeof authorName !== 'string') {
    return json({ error: 'Ungültige Datentypen' }, { status: 400 });
  }
  
  const contentError = validateContent(content);
  if (contentError) {
    return json({ error: contentError }, { status: 400 });
  }
  
  const authorError = validateAuthorName(authorName);
  if (authorError) {
    return json({ error: authorError }, { status: 400 });
  }
  
  const sanitizedContent = sanitizeInput(content);
  const sanitizedAuthor = sanitizeInput(authorName);
  
  const fact = createFact(sanitizedContent, sanitizedAuthor, sessionId);
  return json(fact, { status: 201 });
};

