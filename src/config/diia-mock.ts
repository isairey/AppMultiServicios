/**
 * Mock Diia: explicit `USE_DIIA_MOCK=false` disables; `true` enables.
 * If unset: enabled only when NODE_ENV is not `production`.
 */
export function isDiiaMockMode(): boolean {
  const v = process.env.USE_DIIA_MOCK;
  if (v === 'false') return false;
  if (v === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}
