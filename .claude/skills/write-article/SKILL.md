---
name: write-article
description: Write in-depth technical blog articles for Ghost CMS using the signature Endy Muhardin narrative opening + OpenStick README tutorial style. Handles research, outline, full draft generation, and direct Ghost Admin API push. Triggers on "tulis artikel", "write article", "buat artikel blog", "draft artikel".
---

# Write Technical Blog Article

Write high-quality technical blog articles for Yuke's personal engineering blog,
blending **Endy Muhardin's narrative problem solving** with **OpenStick README's
meticulous, checkpoint-driven tutorial structure**.

## Signature Writing Style

Articles combine two distinct technical writing traditions:

### 1. The Endy Muhardin Opening (Narrative & Survey)

- **Lead directly with a real-world story:** Start with a grounded project context
  (a specific project, role, scale, budget, client/event constraint). No generic
  introductions like "In today's fast-paced world...".
- **The relatable crisis:** Describe the exact moment something broke or became
  painful (e.g., participants submitting registration files right before a tight
  deadline when a deploy triggers a 502 Bad Gateway).
- **Practical honesty:** Acknowledge real constraints freely (e.g., "for a 2 million
  IDR campus side project, running Kubernetes is operational suicide").
- **Survey the landscape before choosing:** Before introducing the solution, explore
  and evaluate 3-4 existing approaches (e.g., Blue-Green, Swarm/K8s, Kamal/Dokku,
  CLI plugins) with their real-world trade-offs.
- **Summary comparison table:** Feature a clean markdown table comparing methods by
  setup complexity, resource overhead, proxy requirements, and ideal use cases.

### 2. The OpenStick README Architecture (Tutorial & Checkpoints)

- **ASCII diagrams:** Illustrate concepts and state transitions with standard ASCII
  characters (`+`, `-`, `|`, `-->`, `==>`). Never use exotic Unicode box-drawing
  glyphs that might misalign across different fonts.
- **Explicit prerequisites:** Bulleted list of assumptions, required tools, and
  architectural constraints.
- **Structured warning and note callouts:**
  - `> **Catatan:**` for normal quirks, expected behavior, or container numbering.
  - `> **Peringatan:**` for destructive actions, hardware risks, or prerequisites.
- **Numbered installation and setup steps:** Break implementation into bite-sized,
  logically grouped subsections (e.g., 1. Proxy, 2. Compose config, 3. Healthcheck, 4. First deploy).
- **Mandatory checkpoints:** Every step must include a verification check:
  _"Cek apakah sudah berhasil: jalankan `...`. Jika muncul `...`, jangan lanjut!"_
- **Visual proof of success:** Always provide a command that demonstrates the fix
  in action (e.g., continuous `curl` loop showing consistent HTTP 200 during rollout).
- **Deep-dive on edge cases:** Dedicate full sections to non-trivial engineering
  details that most tutorials skip (e.g., in-flight request draining, backward-compatible
  database migrations, graceful SIGTERM shutdowns).
- **Production-ready script:** Provide a complete, reusable bash script with `set -euo pipefail`.

## House Rules and Constraints

- **No em dashes, no section signs:** Never use Unicode em dashes (`\x{2014}`, `\x{2013}`)
  or section signs (`\x{00A7}`). Always use a plain ASCII hyphen `-`. Run this check before saving:
  `grep -rnP '[\x{2013}\x{2014}\x{00A7}]' <file>`
- **Voice:** Indonesian (`lang-id`) or English (`lang-en`). For Indonesian, use
  "aku" for the author, "kamu" for the reader, and "kita" when walking through
  steps together.
- **Tone:** Technical, authentic, confident, approachable, slightly witty, but
  never arrogant. Avoid buzzwords and hype.
- **Code snippets:** Always declare syntax languages (`bash`, `yaml`, `text`, `javascript`, etc.).

## Standard Article Outline

1. **Opening Story (3-5 paragraphs):** Project context, problem, why `docker compose up -d` breaks.
2. **Kenapa [Cara Lama] Bermasalah:** Deep dive into mechanics, cold start, ASCII timeline.
3. **Berbagai Metode Alternatif:** Survey of 3-4 options + comparison table.
4. **Kenalan dengan [Solusi]:** Core concept, 3-step mechanics, ASCII diagram.
5. **Persyaratan:** Architecture prerequisites and constraints.
6. **Instalasi:** Commands + checkpoint check.
7. **Setup Langkah demi Langkah:**
   - 1. Setup proxy / network
   - 2. Service configuration (before vs after)
   - 3. Healthcheck configuration
   - 4. First rollout execution + continuous curl verification
8. **Penanganan Kasus Lanjutan (e.g., Draining / Graceful Shutdown):** Pre-stop hooks,
   handling in-flight requests.
9. **Script Deploy Lengkap:** Production bash script + database migration guidance.
10. **Catatan dan Batasan:** Honest list of caveats and operational limits.
11. **Penutup:** Reflection, key takeaways, and references.

## Ghost Admin API Workflow

When updating or pushing articles to Ghost:

1. **Authentication:** Generate a short-lived HS256 JWT using `GHOST_ADMIN_KEY` (`id:secret`):
   - Header: `{"alg": "HS256", "typ": "JWT", "kid": id}`
   - Payload: `{"iat": now, "exp": now + 300, "aud": "/admin/"}`
   - Signature: HMAC-SHA256 of `header.payload` with `Buffer.from(secret, 'hex')`.
2. **Pushing HTML:** Send `PUT /ghost/api/admin/posts/{id}/?source=html` with headers:
   `Authorization: Ghost <token>`, `Accept-Version: v6.0`, `Content-Type: application/json`.
3. **Post Payload:** Include `updated_at`, `html`, `custom_excerpt`, and `tags`.
4. **Verification:** Always fetch the draft back via Admin API to confirm HTML, lexical,
   headings count, and excerpt are properly persisted.
