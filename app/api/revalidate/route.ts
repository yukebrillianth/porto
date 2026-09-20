import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { postTags } from '@/lib/hashnode';
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

/** Hashnode publication webhook, e.g. `post_published`. */
interface HashnodeWebhookBody {
  eventType?: string;
  data?: {
    post?: { id?: string; slug?: string };
  };
}

/** Manual/legacy shape: revalidate an explicit tag. */
interface ManualWebhookBody {
  type?: 'tag';
  value?: string;
}

type WebhookBody = HygraphWebhookBody & HashnodeWebhookBody & ManualWebhookBody;

/** Timing-safe-ish comparison to avoid leaking the secret via response time. */
function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;

  let diff = 0;

  for (let i = 0; i < provided.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }

  return diff === 0;
}

/** Work out which namespaced tags a payload should invalidate. */
function resolveTags(body: WebhookBody): string[] {
  // Explicit tag — manual curl or a custom webhook.
  if (body.type === 'tag' && body.value) {
    return [body.value];
  }

  // Hashnode: any post_* event.
  if (body.eventType?.startsWith('post')) {
    const slug = body.data?.post?.slug;
    return slug ? [postTags.all, postTags.bySlug(slug)] : [postTags.all];
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
 * Revalidation webhook shared by Hygraph and Hashnode.
 *
 * Both senders must present the shared secret as `X-Webhook-Secret`; anything
 * else gets a 401. The payload is mapped onto namespaced cache tags so a
 * publish busts exactly one entry plus its collection — never the whole site.
 *
 * @example
 * // curl -X POST https://yukebrillianth.my.id/api/revalidate \
 * //   -H 'X-Webhook-Secret: <secret>' \
 * //   -H 'Content-Type: application/json' \
 * //   -d '{"type":"tag","value":"project:robocon-2025"}'
 */
export async function POST(req: Request) {
  const headerList = await headers();
  const provided =
    headerList.get('x-webhook-secret') ??
    headerList.get('x-hashnode-signature') ??
    '';

  const expected = env.HYGRAPH_WEBHOOK_SECRET ?? env.WEBHOOK_SECRET;

  if (!expected || !provided || !secretMatches(provided, expected)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as WebhookBody;
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
