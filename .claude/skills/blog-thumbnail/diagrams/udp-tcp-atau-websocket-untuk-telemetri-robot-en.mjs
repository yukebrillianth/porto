/**
 * English cover for "UDP, TCP, or WebSocket for Robot Telemetry?".
 *
 * Same drawing as the Indonesian cover, only the words change, so the
 * geometry lives in one place.
 */

import { build } from './udp-tcp-atau-websocket-untuk-telemetri-robot.mjs';

const LABELS_EN = {
  tcpCost: 'all late',
  waiting: 'waiting',
  udpCost: 'stays fresh',
};

export default function diagram(_data, theme, p) {
  return build(LABELS_EN, theme, p);
}
