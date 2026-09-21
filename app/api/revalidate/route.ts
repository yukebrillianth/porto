import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '@/lib/env';
import { postTags } from '@/lib/ghost';
import { projectTags } from '@/lib/hygraph';

/**
 * Hygraph content webhook. `data` carries the model fields, and `__typename`
 * (or the operation payload) tells us which model fired.
 */
interface HygraphWebhookBody {
  operation?: string;
  data?: {
    __typename?: string;
    slug?: string;
  };
}

/**
 * Ghost content webhook, configured under Ghost Admin -> Settings ->
 * Integrations -> Custom integration -> Add webhook (`post.published`,
 * `post.updated`, `post.deleted`). Ghost nests the resource under
 * `post.current`, with `post.previous` holding the changed fields only.
 */
interface GhostWebhookBody {
  post?: {
    current?: { id?: string; slug?: string; status?: string };
    previous?: { slug?: string };
  };
}

/** Manual/legacy shape: revalidate an explicit tag. */
interface ManualWebhookBody {
  type?: 'tag';
  value?: string;
}

type WebhookBody = HygraphWebhookBody & GhostWebhookBody & ManualWebhookBody;

/** Timing-safe comparison for shared webhook secrets. */
function secretMatches(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/** Verify Ghost's legacy X-Ghost-Signature header. */
function verifyGhostSignature(
  signature: string,
  timestamp: string,
  body: string,
  secret: string
): boolean {
  const match = signature.match(/^sha256=([a-f0-9]+),\s*t=(\d+)$/i);
  if (!match || match[2] !== timestamp) return false;

  const expected = createHmac('sha256', secret)
    .update(`${body}${timestamp}`)
    .digest('hex');

  return secretMatches(match[1].toLowerCase(), expected);
}

/** Work out which namespaced tags a payload should invalidate. */
function resolveTags(body: WebhookBody): string[] {
  // Explicit tag - manual curl or a custom webhook.
  if (body.type === 'tag' && body.value) {
    return [body.value];
  }

  // Ghost: any post.* event. A slug change busts both the old and new entry.
  if (body.post) {
    const current = body.post.current?.slug;
    const previous = body.post.previous?.slug;
    const slugs = [current, previous].filter((slug): slug is string =>
      Boolean(slug)
    );

    return [postTags.all, ...new Set(slugs.map(postTags.bySlug))];
  }

  // Hygraph: model name decides the namespace.
  const typename = body.data?.__typename?.toLowerCase();
  const slug = body.data?.slug;

  if (typename?.includes('portfolio') || typename?.includes('project')) {
    return slug
      ? [projectTags.all, projectTags.bySlug(slug)]
      : [projectTags.all];
  }

  if (typename?.includes('post')) {
    return slug ? [postTags.all, postTags.bySlug(slug)] : [postTags.all];
  }

  return [];
}

/**
 * Revalidation webhook shared by Hygraph and Ghost.
 *
 * Hygraph uses the shared `X-Webhook-Secret` header. Ghost uses its native
 * `X-Ghost-Signature` plus `X-Ghost-Request-Timestamp`. The payload is mapped
 * onto namespaced cache tags so a publish busts exactly one entry plus its
 * collection - never the whole site.
 *
 * Ghost webhooks are configured under Ghost Admin -> Settings -> Integrations
 * -> Custom integration -> Add webhook, pointing at this route.
 *
 * @example
 * // curl -X POST https://www.yukebrillianth.com/api/revalidate \
 * //   -H 'X-Webhook-Secret: <secret>' \
 * //   -H 'Content-Type: application/json' \
 * //   -d '{"type":"tag","value":"project:robocon-2025"}'
 */
export async function POST(req: Request) {
  const headerList = await headers();
  const ghostSignature = headerList.get('x-ghost-signature');
  const ghostTimestamp = headerList.get('x-ghost-request-timestamp');
  // Ghost's webhook uses its own signature header. Fall back to the shared
  // secret so existing deployments work before GHOST_WEBHOOK_SECRET is added.
  const ghostSecret =
    env.GHOST_WEBHOOK_SECRET ??
    env.HYGRAPH_WEBHOOK_SECRET ??
    env.WEBHOOK_SECRET;
  const rawBody = await req.text();
  const provided =
    headerList.get('x-webhook-secret') ??
    headerList.get('xwebhooksecret') ??
    headerList.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';

  const sharedSecret = env.HYGRAPH_WEBHOOK_SECRET ?? env.WEBHOOK_SECRET;
  const validGhostSignature =
    Boolean(ghostSecret && ghostSignature && ghostTimestamp) &&
    verifyGhostSignature(
      ghostSignature ?? '',
      ghostTimestamp ?? '',
      rawBody,
      ghostSecret ?? ''
    );
  const validSharedSecret = Boolean(
    sharedSecret && provided && secretMatches(provided, sharedSecret)
  );

  if (!validGhostSignature && !validSharedSecret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody) as WebhookBody;
    const tags = resolveTags(body);

    if (tags.length === 0) {
      return NextResponse.json(
        { message: 'Could not resolve a cache tag from the payload' },
        { status: 400 }
      );
    }

    for (const tag of tags) {
      revalidateTag(tag, 'max');
    }

    return NextResponse.json({ revalidated: true, tags });
  } catch {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }
}
