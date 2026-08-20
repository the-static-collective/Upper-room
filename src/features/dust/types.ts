import type { ScriptureRef } from '../scripture/types';

export type AttentionObservationKind =
  | 'glance'
  | 'linger'
  | 'return'
  | 'wander-return'
  | 'explicit-selection';

export type LocalAttentionObservation = {
  anchor: ScriptureRef;
  kind: AttentionObservationKind;
  observedAtMs: number;
  cueSource: 'none' | 'weather';
};

export type AttentionConcentration = 'trace' | 'present' | 'dense';

export type AttentionWeatherSample = {
  anchor: ScriptureRef;
  concentration: AttentionConcentration;
  expiresAtMs: number;
  authority: 'none';
};

export type AttentionWeatherConfig = {
  freshWindowMs: number;
  ttlMs: number;
  traceThreshold: number;
  presentThreshold: number;
  denseThreshold: number;
};
