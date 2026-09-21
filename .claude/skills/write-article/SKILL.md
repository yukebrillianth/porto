---
name: write-article
description: Write in-depth technical blog articles for Ghost CMS using the signature Endy Muhardin narrative opening + OpenStick README tutorial style. Handles research, outline, full draft generation, and direct Ghost Admin API push. Triggers on "tulis artikel", "write article", "buat artikel blog", "draft artikel".
---

# Write Technical Blog Article

Write high-impact, in-depth ("daging"), and engaging technical blog articles for
Yuke's personal engineering blog. The signature style blends **Endy Muhardin's
narrative problem solving & real-world survey** with **OpenStick README's meticulous,
checkpoint-driven tutorial architecture**, delivered in an authentic, witty, and
casual tech-community voice.

## Signature Writing Style

### 1. Voice, Tone, and Personality ("Santai, Gaul, tapi Daging")

- **Dev Community / Tech Twitter vibe:** Use authentic Indonesian developer slang
  and natural conversational language (e.g., "wkwkwk", "jir", "bjir", "ngab",
  "sat-set", "overkill kuadrat", "jebakan batman").
- **Expressive with emojis:** Use contextual emojis at emotional beats (`😅`, `😭`,
  `💀`, `🤣`, `🔥`, `🎉`).
- **Relatable self-deprecation & real stakes:** Ground the narrative with real
  project constraints without sugarcoating (e.g., "solo dev, deadline mepet, mana
  bayarannya kecil wkwkwk cuma 2jt...").
- **Giphy / Meme cards:** Embed 2-3 well-timed GIFs at key emotional moments
  (e.g., panic during a 502 error, chaos of overengineering, relief when deploy succeeds):
  ```html
  <figure class="kg-card kg-image-card">
    <img
      src="https://media.giphy.com/media/<id>/giphy.gif"
      alt="Description"
      class="kg-image"
      loading="lazy"
    />
    <figcaption>Lucu, relatable caption wkwkwk</figcaption>
  </figure>
  ```
- **"Daging" first:** Never sacrifice technical rigor for humor. Every command,
  config parameter, architecture diagram, and edge case must be 100% accurate,
  thorough, and production-tested.

### 2. The Endy Muhardin Opening (Narrative & Survey)

- **Punchy opening story:** Start immediately with the real project context and the
  exact moment of crisis (e.g., participants submitting files right before deadline
  when deploy drops connections). Keep it punchy and engaging.
- **Why the old way fails:** Break down the technical root cause (e.g., recreate vs
  replace, cold boot time, incoming vs in-flight request failures).
- **Survey the landscape before choosing:** Before introducing the chosen solution,
  evaluate 3-4 existing alternatives (e.g., Blue-Green manual, Docker Swarm/K8s,
  Kamal/Dokku, CLI plugins) with honest real-world trade-offs.
- **Summary comparison table:** Feature a clean markdown table comparing methods by
  setup complexity, resource overhead, proxy requirements, and ideal use cases.

### 3. The OpenStick README Architecture (Tutorial & Checkpoints)

- **ASCII diagrams:** Illustrate concepts and state transitions with standard ASCII
  characters (`+`, `-`, `|`, `-->`, `==>`). Never use exotic Unicode box-drawing
  glyphs that might misalign across different fonts.
- **Explicit prerequisites:** Bulleted list of assumptions, required tools, and
  architectural constraints (e.g., dynamic proxy required, no hardcoded ports/names).
- **Structured warning and note callouts:**
  - `> **Catatan:**` for normal quirks, expected behavior, or container numbering.
  - `> **Peringatan:**` for destructive actions, hardware risks, or prerequisites.
- **Numbered setup steps with before/after blocks:** Clear, incremental progression
  with before/after code blocks.
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
- **Code snippets:** Always declare syntax languages (`bash`, `yaml`, `text`, `javascript`, etc.).

## Standard Article Outline

1. **Opening Story (3-5 punchy paragraphs + Giphy):** Project context, panic moment, why it matters.
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
11. **Penutup (+ Giphy):** Reflection, key takeaways, and references.

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
