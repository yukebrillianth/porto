import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

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
 * Both senders must present the shared secret as `X-Webhook-Secret`; anything
 * else gets a 401. The payload is mapped onto namespaced cache tags so a
 * publish busts exactly one entry plus its collection - never the whole site.
 *
 * Ghost webhooks are configured under Ghost Admin -> Settings -> Integrations
 * -> Custom integration -> Add webhook, pointing at this route.
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
    headerList.get('xwebhooksecret') ??
    headerList.get('authorization')?.replace(/^Bearer\s+/i, '') ??
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
