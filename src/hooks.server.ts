import type { Handle } from '@sveltejs/kit';

const DEBUG = process.env.DEBUG === 'true';

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  if (DEBUG) {
    console.log(`[${requestId}] ${event.request.method} ${event.url.pathname}`);
  }
  
  const response = await resolve(event);
  
  const duration = Date.now() - startTime;
  
  if (event.url.pathname.startsWith('/_app/immutable/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (event.url.pathname === '/' || event.url.pathname.startsWith('/_app/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  if (DEBUG) {
    console.log(`[${requestId}] ${event.url.pathname} - ${response.status} - ${duration}ms`);
  }
  
  return response;
};

