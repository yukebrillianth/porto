/**
 * Diagrams for "Zero-Downtime Deployment Dengan Docker Rollout".
 *
 * Pure data: each entry names the file it renders to, the codeblock it stands
 * in for, and the caption Ghost shows under it. The accent colour marks the
 * one thing the reader should take away - the downtime window, the new
 * container, the drain pause - and nothing else competes with it.
 */

export const post = '6ab0dc1aa977470001fdb2b1';

export const diagrams = [
  {
    name: 'downtime-timeline',
    alt: 'Anatomi Downtime docker compose up -d',
    caption:
      'Anatomi downtime pada perintah docker compose up -d (t1 sampai t4 memicu 502)',
    /* Replaces the ASCII timeline codeblock in the post. */
    match: ['docker compose up -d web', 'DOWNTIME'],
    spec: {
      title: 'Kenapa docker compose up -d bikin downtime',
      columns: [
        { chips: [{ label: 'up -d', sub: 'perintah jalan' }] },
        { chips: [{ label: 'stop', sub: 'port tertutup', accent: true }] },
        {
          chips: [
            { label: 'rm + create', sub: 'tidak ada container', accent: true },
          ],
        },
        { chips: [{ label: 'start', sub: 'cold boot', accent: true }] },
        { chips: [{ label: 'healthy', sub: 'melayani lagi' }] },
      ],
      span: {
        from: 1,
        to: 3,
        label: 'downtime 5-20 detik, request masuk kena 502',
      },
    },
  },
  {
    name: 'rollout-transition',
    alt: 'Transisi 3 Tahap docker-rollout',
    caption: 'Transisi 3 tahap zero-downtime deployment pada docker-rollout',
    match: ['Sebelum', 'Saat rollout'],
    spec: {
      title: 'Tiga tahap transisi docker-rollout',
      columns: [
        {
          caption: 'sebelum',
          chips: [{ label: 'web-1', sub: 'versi lama' }],
        },
        {
          caption: 'saat rollout',
          chips: [
            { label: 'web-1', sub: 'masih melayani', dim: true },
            { label: 'web-2', sub: 'sudah healthy', accent: true },
          ],
        },
        {
          caption: 'sesudah',
          chips: [{ label: 'web-2', sub: 'versi baru', accent: true }],
        },
      ],
    },
  },
  {
    name: 'draining-flow',
    alt: 'Alur Connection Draining docker-rollout',
    caption:
      'Alur kerja connection draining menggunakan penanda /tmp/drain dan pre-stop hook',
    match: ['pre-stop hook', '/tmp/drain'],
    spec: {
      title: 'Connection draining lewat pre-stop hook',
      columns: [
        { chips: [{ label: 'touch drain', sub: 'pre-stop hook' }] },
        { chips: [{ label: 'unhealthy', sub: 'healthcheck gagal' }] },
        { chips: [{ label: 'dicoret', sub: 'proxy berhenti kirim' }] },
        {
          chips: [
            { label: 'sleep 10', sub: 'upload diselesaikan', accent: true },
          ],
        },
      ],
      note: 'container lama baru dimatikan setelah request yang lagi jalan selesai',
    },
  },
];
