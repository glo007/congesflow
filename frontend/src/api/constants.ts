// Types d'absence injectes par le seed backend (CP=1, RTT=2).
export const TYPES_ABSENCE: Record<number, string> = {
  1: "Congés payés",
  2: "RTT",
};

export function libelleType(id: number): string {
  return TYPES_ABSENCE[id] ?? `Type ${id}`;
}
