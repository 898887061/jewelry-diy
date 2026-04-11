export function formatCny(value: number): string {
  return `¥ ${value.toFixed(1)}`;
}

export function formatCnyCompact(value: number): string {
  return `¥${value.toFixed(1)}`;
}
