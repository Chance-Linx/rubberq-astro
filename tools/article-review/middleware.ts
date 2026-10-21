import { defineMiddleware } from 'astro:middleware';
import { records, recordsBySlug } from './records';

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.hostname !== '127.0.0.1') return new Response('Local review only', { status: 403 });
  Object.assign(context.locals, { rubberqLocalArticleReview: true, rubberqArticleReviewPosts: records.map(record => record.post) });
  let response: Response;
  if (context.url.pathname === '/blog' || context.url.pathname === '/blog/') {
    response = await context.rewrite(new URL('/__review/blog' + context.url.search, context.url));
  } else if (context.url.pathname.startsWith('/blog/')) {
    let slug: string;
    try { slug = decodeURIComponent(context.url.pathname.slice('/blog/'.length)); }
    catch { return new Response(null, { status: 404 }); }
    const record = recordsBySlug.get(slug);
    response = record ? await context.rewrite(new URL(record.reviewUrl, context.url)) : new Response(null, { status: 404 });
  } else {
    response = await next();
  }
  return response;
});
