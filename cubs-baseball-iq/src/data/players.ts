/**
 * ROSTER
 * To add a player: add a line here, then put them in a lineup (Coach Mode or lineups.ts).
 * Only first names are shown on the field.
 */
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  /** Other names the lineup sheet might use (e.g. "Leo"). */
  nicknames?: string[];
}

const p = (firstName: string, lastName: string, nicknames?: string[]): Player => ({
  id: `${firstName}-${lastName}`.toLowerCase(),
  firstName,
  lastName,
  nicknames,
});

export const PLAYERS: Player[] = [
  p('Braxton', 'Baker'),
  p('Leif', 'Beardslee'),
  p('Joshua', 'Berlin'),
  p('Everett', 'Brazell'),
  p('Nico', 'Canderan'),
  p('Jackson', 'Dennis'),
  p('Luke', 'Edwards'),
  p('Sebastian', 'Gentry'),
  p('Leonardo', 'Hall', ['Leo']),
  p('Lucas', 'Kaszanits'),
  p('Kameron', 'Kirkland', ['Kam']),
  p('Dawson', 'Lauer'),
];

export const fullName = (pl: Player) => `${pl.firstName} ${pl.lastName}`;
export const playerById = (id: string) => PLAYERS.find((pl) => pl.id === id);

/** Find a player from whatever name is on the lineup sheet: "Leo", "Leonardo", "Leonardo Hall"… */
export function findPlayer(name: string): Player | undefined {
  const n = name.trim().toLowerCase();
  if (!n) return undefined;
  const exact = PLAYERS.find(
    (pl) =>
      pl.firstName.toLowerCase() === n ||
      fullName(pl).toLowerCase() === n ||
      pl.nicknames?.some((k) => k.toLowerCase() === n),
  );
  if (exact) return exact;
  const prefix = PLAYERS.filter((pl) => pl.firstName.toLowerCase().startsWith(n));
  return prefix.length === 1 ? prefix[0] : undefined;
}
