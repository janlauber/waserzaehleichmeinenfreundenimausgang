import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'waserzaehleichmeinenfreundenimausgang_session';
const USERNAME_COOKIE_NAME = 'waserzaehleichmeinenfreundenimausgang_username';
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export function getOrCreateSession(cookies: any): string {
  let sessionId = cookies.get(SESSION_COOKIE_NAME);
  
  if (!sessionId) {
    sessionId = uuidv4();
    cookies.set(SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }
  
  return sessionId;
}

export function getUsername(cookies: any): string | undefined {
  return cookies.get(USERNAME_COOKIE_NAME);
}

export function setUsername(cookies: any, username: string): void {
  cookies.set(USERNAME_COOKIE_NAME, username, {
    path: '/',
    maxAge: SESSION_MAX_AGE,
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
}

