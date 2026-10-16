/**
 * Diagrams for the English version of "UDP, TCP, or WebSocket for Robot
 * Telemetry?". Pure data, mirrors the Indonesian spec one to one.
 */

export const post = '6ad262dddd80490001fee432';

export const diagrams = [
  {
    name: 'tcp-head-of-line-en',
    alt: 'Head-of-line blocking in TCP: packet 3 is lost, so packets 4 to 6 are held in the kernel',
    caption:
      'Packet 3 is lost, so packets 4 to 6 wait in the kernel even though they already arrived',
    match: ['sent:', 'kernel:'],
    spec: {
      title: 'Head-of-line blocking in TCP',
      columns: [
        {
          caption: 'sent',
          chips: [{ label: 'packets 1, 2', sub: 'arrive normally' }],
        },
        {
          caption: 'on the network',
          chips: [{ label: 'packet 3', sub: 'lost', accent: true }],
        },
        {
          caption: 'in the kernel',
          chips: [
            { label: 'packets 4, 5, 6', sub: 'arrived, held back', dim: true },
          ],
        },
        {
          caption: 'retransmit',
          chips: [{ label: 'packet 3', sub: 'arrives late' }],
        },
        {
          caption: 'in the app',
          chips: [{ label: '3, 4, 5, 6', sub: 'all at once', accent: true }],
        },
      ],
      span: {
        from: 1,
        to: 3,
        label: 'the app waits, robot state freezes',
      },
    },
  },
  {
    name: 'udp-gateway-websocket-en',
    alt: 'A gateway receives robot state over UDP and pushes the latest snapshot to the browser over WebSocket',
    caption:
      'The gateway keeps the latest state per robot and pushes a snapshot to the browser at a fixed rate',
    match: ['udp :9000', 'ws  :8080'],
    spec: {
      title: 'UDP to WebSocket gateway',
      columns: [
        {
          caption: 'robots',
          chips: [
            { label: 'r1', sub: 'udp, 20 hz' },
            { label: 'r2', sub: 'udp, 20 hz' },
          ],
        },
        {
          caption: 'gateway',
          chips: [
            { label: 'latest state', sub: 'old seq dropped', accent: true },
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
