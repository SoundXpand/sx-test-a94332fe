export const DSPS = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "Amazon Music",
  "Deezer",
  "Tidal",
  "JioSaavn",
  "Gaana",
  "Wynk",
  "Pandora",
  "Anghami",
  "Boomplay",
  "SoundCloud",
  "Audiomack",
  "Napster",
] as const;

export type DspStatus = "pending" | "sent" | "rejected";
