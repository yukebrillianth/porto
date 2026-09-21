---
name: write-article
description: Write in-depth technical blog articles for Ghost CMS using the signature Endy Muhardin narrative opening + OpenStick README tutorial style. Handles research, outline, full draft generation, and direct Ghost Admin API push. Triggers on "tulis artikel", "write article", "buat artikel blog", "draft artikel".
---

# Write Technical Blog Article

Write high-impact, in-depth ("daging"), and engaging technical blog articles for
Yuke's personal engineering blog. The signature style blends **Endy Muhardin's
narrative problem solving & real-world survey** with **OpenStick README's meticulous,
checkpoint-driven tutorial architecture**, delivered in an authentic, witty, and
conversational dev voice using the pronoun **"saya"**.

## Article Lifecycle Workflow

Every article follows a strict 6-stage production pipeline:

```text
1. Riset             Investigasi topik, source code, repo tools, issue tracker, benchmark
      |
2. Bikin Kerangka    Susun H2/H3 ber-checkpoint, timeline downtime, tabel survey opsi
      |
3. Write             Tulis draf lengkap (pembuka cerita nyata + tutorial teknis solid)
      |
4. Review            Validasi akurasi teknis, house rules, pronoun "saya", format kartu
      |
5. Generate Artifacts  Generate diagram/bagan/grafis visual (menggantikan ASCII art)
      |
6. Review Vision     Audit visual asset terhadap design token dan kontras layar
```

## Signature Writing Style

### 1. Voice, Tone, and Personality ("Santai, Gaul, tapi Daging")

- **Pronoun: Selalu gunakan "saya", JANGAN gunakan "aku".** (Mengikuti gaya blog Endy Muhardin: dewasa, profesional, namun tetap akrab dan grounded).
- **Dev Community vibe:** Gunakan bahasa gaul teknis yang natural dan ceplas-ceplos (e.g., "wkwkwk", "jir", "bjir", "ngab", "sat-set", "overkill kuadrat", "jebakan batman").
- **Ekspresif dengan emoji:** Sertakan emoji kontekstual pada momen emosional (`😅`, `😭`, `💀`, `🤣`, `🔥`, `🎉`).
- **Relatable self-deprecation & real stakes:** Ceritakan kendala nyata tanpa jaim (e.g., "solo dev, deadline mepet, mana bayarannya kecil wkwkwk cuma 2jt...").
- **Meme / GIF handling:**
  - GIF **wajib di-upload langsung ke CDN Ghost** via endpoint `/ghost/api/admin/images/upload/` agar tidak terkena proteksi hotlink pihak ketiga ("content not available").
  - Sematkan 2-3 GIF yang tepat sasaran di momen emosional (panik 502, overengineering K8s, kelegaan deploy sukses).
- **"Daging" nomor satu:** Jangan pernah korbankan kedalaman teknis demi lelucon. Semua konfigurasi, kode, checkpoint, dan arsitektur harus 100% presisi dan siap pakai di server produksi.

### 2. The Endy Muhardin Opening (Narrative & Survey)

- **Punchy opening story:** Buka langsung dengan cerita project riil dan momen krisis spesifik (misal: peserta upload belasan berkas pendaftaran di jam penutupan lalu server kena 502).
- **Bedah akar masalah teknis:** Jelaskan mekanisme di balik kegagalan (recreate vs replace, cold boot runtime, incoming vs in-flight failure).
- **Survey lanskap solusi:** Sebelum masuk ke solusi utama, ulas 3-4 alternatif umum (Blue-Green manual, Swarm/K8s, Kamal/Dokku, CLI plugin) beserta trade-off realistisnya.
- **Tabel perbandingan ringkas:** Sajikan tabel komparasi metode berdasarkan kompleksitas setup, konsumsi RAM, kebutuhan proxy, dan use case yang cocok.
  - **PENTING:** Tabel harus disimpan sebagai **Markdown card native** (`type: "markdown"`) di Ghost Lexical, BUKAN sebagai raw HTML card (`type: "html"`), agar editor Ghost menampilkan visual tabel yang rapi.

### 3. The OpenStick README Architecture (Tutorial & Checkpoints)

- **Diagram alur:** Gunakan karakter ASCII standar (`+`, `-`, `|`, `-->`, `==>`) yang nantinya akan digantikan oleh graphic artifact pada tahap visual review.
- **Daftar prasyarat tegas:** Cantumkan asumsi dan batasan arsitektur secara eksplisit (e.g., wajib proxy dinamis, dilarang hardcode ports/names).
- **Callout catatan & peringatan:**
  - `> **Catatan:**` untuk perilaku normal, increment nomor container, atau tips DB.
  - `> **Peringatan:**` untuk instruksi teknis berisiko atau prasyarat fatal.
- **Langkah bernomor dengan before/after:** Tampilkan perbandingan kode sebelum dan sesudah konfigurasi.
- **Checkpoint wajib:** Setiap tahap instalasi harus ada verifikasi:
  _"Cek apakah sudah berhasil: jalankan `...`. Jika muncul `...`, jangan lanjut!"_
- **Bukti visual keberhasilan:** Sediakan perintah pembuktian nyata (e.g., loop `curl` yang mengembalikan HTTP 200 terus-menerus selama rollout).
- **Deep-dive edge cases:** Bahas detail krusial yang sering dilewati tutorial umum (e.g., connection draining via `/tmp/drain`, backward-compatible database migration, graceful shutdown SIGTERM).
- **Production-ready script:** Sediakan script `deploy.sh` utuh dengan `set -euo pipefail`.

## House Rules and Constraints

- **No em dashes, no section signs:** Dilarang keras menggunakan Unicode em dashes (`\x{2014}`, `\x{2013}`) maupun section signs (`\x{00A7}`). Selalu gunakan tanda hubung biasa `-`. Jalankan pengecekan ini sebelum menyimpan:
  `grep -rnP '[\x{2013}\x{2014}\x{00A7}]' <file>`
- **Pronoun:** Wajib **"saya"** untuk persona penulis, "kamu" untuk pembaca, dan "kita" untuk langkah bersama. Dilarang menggunakan "aku".
- **Code snippets:** Wajib menyertakan label bahasa pada codeblock (`bash`, `yaml`, `text`, `javascript`, etc.).

## Standard Article Outline

1. **Pembuka Cerita Riil (3-5 paragraf + GIF):** Konteks project ITS, momen panik 502, dilema budget 2jt vs Kubernetes.
2. **Kenapa [Cara Lama] Bermasalah:** Mekanisme recreate, durasi cold start, timeline kegagalan.
3. **Berbagai Metode Alternatif:** Survey 4 opsi + tabel komparasi (Markdown card).
4. **Kenalan dengan [Solusi]:** Konsep 3 langkah, diagram alur, increment container.
5. **Persyaratan:** Prasyarat proxy, dilarang `container_name:` & `ports:`, healthcheck.
6. **Instalasi:** Perintah curl + checkpoint bantuan.
7. **Setup Langkah demi Langkah:**
   - 1. Setup proxy / network bersama
   - 2. Konfigurasi service (before vs after)
   - 3. Konfigurasi healthcheck
   - 4. Eksekusi rollout pertama + verifikasi loop curl 200
8. **Draining & Penanganan Request In-Flight:** Pre-stop hooks, trik `/tmp/drain`, graceful shutdown SIGTERM.
9. **Script Deploy Lengkap:** Script bash produksi + aturan migrasi DB backward-compatible.
10. **Catatan dan Batasan:** Daftar limitasi dan peringatan operasional.
11. **Penutup (+ GIF):** Refleksi, takeaways, dan referensi resmi.

## Ghost Admin API Workflow

1. **Autentikasi:** Buat short-lived HS256 JWT menggunakan `GHOST_ADMIN_KEY` (`id:secret`).
2. **Upload Aset GIF:** Selalu upload file media lokal ke `POST /ghost/api/admin/images/upload/` sebelum disematkan di artikel.
3. **Penyimpanan Tabel:** Masukkan tabel sebagai Lexical Markdown node:
   ```json
   {
     "type": "markdown",
     "version": 1,
     "markdown": "| Col 1 | Col 2 |\n| :--- | :--- |\n| Val 1 | Val 2 |"
   }
   ```
4. **Verifikasi:** Selalu fetch ulang draft via Admin API untuk memverifikasi headings (H2/H3), ketiadaan kata "aku", ketersediaan URL gambar CDN, dan kebersihan markup.
