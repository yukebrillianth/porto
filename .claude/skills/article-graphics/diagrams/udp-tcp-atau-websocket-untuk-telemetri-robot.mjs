/**
 * Diagrams for "UDP, TCP, atau WebSocket untuk Telemetri Robot".
 *
 * Pure data. The post is created after these render, so `post` is filled in
 * by hand once Ghost has an id for it.
 */

export const post = '6ad25eeadd80490001fee420';

export const diagrams = [
  {
    name: 'tcp-head-of-line',
    alt: 'Head-of-line blocking pada TCP: paket 3 hilang, paket 4 sampai 6 ditahan kernel',
    caption:
      'Paket 3 hilang, jadi paket 4 sampai 6 menunggu di kernel meski sudah tiba',
    match: ['robot kirim:', 'kernel penerima:'],
    spec: {
      title: 'Head-of-line blocking di TCP',
      columns: [
        {
          caption: 'terkirim',
          chips: [{ label: 'paket 1, 2', sub: 'sampai normal' }],
        },
        {
          caption: 'di jaringan',
          chips: [{ label: 'paket 3', sub: 'hilang', accent: true }],
        },
        {
          caption: 'di kernel',
          chips: [
            { label: 'paket 4, 5, 6', sub: 'sudah tiba, ditahan', dim: true },
          ],
        },
        {
          caption: 'kirim ulang',
          chips: [{ label: 'paket 3', sub: 'tiba terlambat' }],
        },
        {
          caption: 'di aplikasi',
          chips: [
            { label: '3, 4, 5, 6', sub: 'datang sekaligus', accent: true },
          ],
        },
      ],
      span: {
        from: 1,
        to: 3,
        label: 'aplikasi menunggu, state robot membeku',
      },
    },
  },
  {
    name: 'udp-gateway-websocket',
    alt: 'Gateway menerima state robot lewat UDP dan mengirim snapshot terbaru ke browser lewat WebSocket',
    caption:
      'Gateway menyimpan state terbaru per robot dan mendorong snapshot ke browser dengan laju tetap',
    match: ['udp :9000', 'ws  :8080'],
    spec: {
      title: 'Gateway UDP ke WebSocket',
      columns: [
        {
          caption: 'robot',
          chips: [
            { label: 'r1', sub: 'udp, 20 hz' },
            { label: 'r2', sub: 'udp, 20 hz' },
          ],
        },
        {
          caption: 'gateway',
          chips: [
            { label: 'state terbaru', sub: 'seq lama dibuang', accent: true },
          ],
        },
        {
          caption: 'browser',
          chips: [{ label: 'dashboard', sub: 'websocket, 10 hz' }],
        },
      ],
    },
  },
];
