import { randomUUID } from 'node:crypto';

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  requestId: string;
  ts: string;
  data: T;
}

export function ok<T>(data: T, message = 'ok'): ApiEnvelope<T> {
  return {
    code: 0,
    message,
    requestId: randomUUID(),
    ts: new Date().toISOString(),
    data,
  };
}

