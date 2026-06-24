export type Dsp = { name: string; slug: string; group?: string };

export const DSPS_FULL: Dsp[] = [
  { name: "Tidal Music", slug: "tidal" },
  { name: "Apple Music, iTunes", slug: "apple" },
  { name: "Spotify", slug: "spotify" },
  { name: "Amazon Music", slug: "amazon" },
  { name: "Anghami", slug: "anghami" },
  { name: "ACR Cloud", slug: "acrcloud" },
  { name: "SoundCloud", slug: "soundcloud" },
  { name: "SoundCloud Fingerprint", slug: "soundcloud-fp" },
  { name: "Meta Audio Library", slug: "meta-audio" },
  { name: "Meta Fingerprint", slug: "meta-fp" },
  { name: "Pandora", slug: "pandora" },
  { name: "Boomplay", slug: "boomplay" },
  { name: "KKBOX", slug: "kkbox" },
  { name: "QQ Music, KuGou, Kuwo, WeSing", slug: "tencent" },
  { name: "JioSaavn", slug: "jiosaavn" },
  { name: "JOOX", slug: "joox" },
  { name: "iHeart Radio", slug: "iheart" },
  { name: "Audible Magic", slug: "audible-magic" },
  { name: "Taobao", slug: "taobao" },
  { name: "Youtube Content ID", slug: "yt-cid" },
  { name: "Youtube, Youtube Music", slug: "youtube" },
  { name: "Canva, ROXI, Soundtrack Your Brand, Turntable, Snap, Coda Music", slug: "creator-tools" },
  { name: "Peloton", slug: "peloton" },
  { name: "Kuaishou", slug: "kuaishou" },
  { name: "FLO", slug: "flo" },
  { name: "NetEase Cloud Music", slug: "netease" },
  { name: "Deezer", slug: "deezer" },
  { name: "Trebel Music", slug: "trebel" },
  { name: "Rythm", slug: "rythm" },
  { name: "MediaNet", slug: "medianet" },
  { name: "Yandex.Music", slug: "yandex" },
  { name: "VK Music, Odnoklassniki Music", slug: "vk-music" },
  { name: "Zvuk", slug: "zvuk" },
  { name: "All other DSPs", slug: "all-other" },
];

// Backwards-compatible export used elsewhere in the codebase
export const DSPS = DSPS_FULL.map(d => d.name);

export type DspStatus = "pending" | "sent" | "rejected";
