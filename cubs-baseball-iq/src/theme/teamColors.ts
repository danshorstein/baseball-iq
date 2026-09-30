export interface TeamColors { primary: string; accent: string }
export interface TeamPalette extends TeamColors { id: string; name: string }

/** Familiar color combinations, not official team branding or league profiles. */
export const TEAM_PALETTES: TeamPalette[] = [
  { id: 'sharks', name: 'Sharks · charcoal & light blue', primary: '#222222', accent: '#7fa8c7' },
  { id: 'cubs', name: 'Cubs · royal blue & red', primary: '#0e3386', accent: '#cc3433' },
  { id: 'yankees', name: 'Yankees · navy & silver', primary: '#132448', accent: '#c4ced4' },
  { id: 'red-sox', name: 'Red Sox · red & navy', primary: '#bd3039', accent: '#0c2340' },
  { id: 'dodgers', name: 'Dodgers · blue & white', primary: '#005a9c', accent: '#ffffff' },
  { id: 'cardinals', name: 'Cardinals · red & gold', primary: '#c41e3a', accent: '#fedb00' },
  { id: 'braves', name: 'Braves · navy & red', primary: '#13274f', accent: '#ce1141' },
  { id: 'mets', name: 'Mets · blue & orange', primary: '#002d72', accent: '#ff5910' },
  { id: 'giants', name: 'Giants · black & orange', primary: '#27251f', accent: '#fd5a1e' },
  { id: 'athletics', name: 'Athletics · green & gold', primary: '#003831', accent: '#efb21e' },
  { id: 'royals', name: 'Royals · blue & gold', primary: '#004687', accent: '#bd9b60' },
  { id: 'pirates', name: 'Pirates · black & gold', primary: '#27251f', accent: '#fdb827' },
  { id: 'orioles', name: 'Orioles · orange & black', primary: '#df4601', accent: '#27251f' },
  { id: 'tigers', name: 'Tigers · navy & orange', primary: '#0c2340', accent: '#fa4616' },
  { id: 'marlins', name: 'Marlins · teal & black', primary: '#007f8b', accent: '#27251f' },
  { id: 'purple-gold', name: 'Purple & gold', primary: '#512d6d', accent: '#ffc72c' },
];

export const DEFAULT_TEAM_COLORS: TeamColors = {
  primary: TEAM_PALETTES[0].primary, accent: TEAM_PALETTES[0].accent,
};
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
export function validateTeamColors(value: unknown): TeamColors {
  const v = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const color = (key: keyof TeamColors) => {
    const candidate = v[key];
    return typeof candidate === 'string' && HEX_COLOR.test(candidate) ? candidate.toLowerCase() : DEFAULT_TEAM_COLORS[key];
  };
  return { primary: color('primary'), accent: color('accent') };
}

function channels(hex: string): number[] {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}
function luminance(hex: string): number {
  return channels(hex).map((n) => {
    const c = n / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
function foreground(background: string): string {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#000000') ? '#ffffff' : '#000000';
}
function mix(color: string, target: number, amount: number): string {
  return '#' + channels(color).map((n) => Math.round(n + (target - n) * amount).toString(16).padStart(2, '0')).join('');
}
/** Preserve chosen backgrounds; darken only text colors on light surfaces. */
function readableInk(color: string, surfaces: string[] = ['#f6f4ee']): string {
  let ink = color;
  while (surfaces.some((surface) => contrastRatio(ink, surface) < 4.5)) ink = mix(ink, 0, 0.1);
  return ink;
}
export function themeVariables(input: TeamColors): Record<string, string> {
  const { primary, accent } = validateTeamColors(input);
  const soft = mix(primary, 255, 0.93);
  return {
    '--primary': primary, '--primary-ink': readableInk(primary, ['#f6f4ee', soft]),
    '--primary-contrast': foreground(primary), '--primary-hover': mix(primary, 0, 0.12),
    '--primary-hover-contrast': foreground(mix(primary, 0, 0.12)), '--primary-soft': soft,
    '--accent': accent, '--accent-ink': readableInk(accent), '--accent-contrast': foreground(accent),
    '--accent-shadow': mix(accent, 0, 0.2),
  };
}
