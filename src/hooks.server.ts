import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  if (event.url.pathname.startsWith('/_app/immutable/')) {
    response.headers.set('cache-control', 'public, max-age=31536000, immutable');
  } else if (event.url.pathname.startsWith('/_app/')) {
    response.headers.set('cache-control', 'public, max-age=3600');
  } else if (event.url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)$/)) {
    response.headers.set('cache-control', 'public, max-age=86400');
  }

  return response;
};

