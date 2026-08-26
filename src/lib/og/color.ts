function channels(color: string): [number, number, number] {
  const rgb = color.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(",").map((part) => Number(part.trim()));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  }
  const value = color.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const int = Number.parseInt(full.slice(0, 6), 16);
  if (!Number.isFinite(int)) return [0, 0, 0];
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function hex(r: number, g: number, b: number): string {
  const pair = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${pair(r)}${pair(g)}${pair(b)}`;
}

export function alpha(color: string, a: number): string {
  const [r, g, b] = channels(color);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = channels(a);
  const [br, bg, bb] = channels(b);
  const at = Math.min(1, Math.max(0, t));
  const step = (x: number, y: number) => x + (y - x) * at;
  return hex(step(ar, br), step(ag, bg), step(ab, bb));
}
