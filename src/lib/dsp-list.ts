export type Dsp = { name: string; slug: string; logo?: string; group?: string };

const LOGO = (slug: string) => `https://soundxpand.com/assets/images/platforms/${slug}.svg`;

export const DSPS_FULL: Dsp[] = [
  { name: "Tidal Music", slug: "tidal", logo: LOGO("tidal") },
  { name: "Apple Music, iTunes", slug: "apple", logo: LOGO("apple") },
  { name: "Spotify", slug: "spotify", logo: LOGO("spotify") },
  { name: "Amazon Music", slug: "amazon", logo: LOGO("amazon") },
  { name: "Anghami", slug: "anghami", logo: LOGO("anghami") },
  { name: "ACR Cloud", slug: "acrcloud", logo: LOGO("acrcloud") },
  { name: "SoundCloud", slug: "soundcloud", logo: LOGO("soundcloud") },
  { name: "SoundCloud Fingerprint", slug: "soundcloud-fp", logo: LOGO("soundcloud") },
  { name: "Meta Audio Library", slug: "meta-audio", logo: LOGO("meta") },
  { name: "Meta Fingerprint", slug: "meta-fp", logo: LOGO("meta") },
  { name: "Pandora", slug: "pandora", logo: LOGO("pandora") },
  { name: "Boomplay", slug: "boomplay", logo: LOGO("boomplay") },
  { name: "KKBOX", slug: "kkbox", logo: LOGO("kkbox") },
  { name: "QQ Music, KuGou, Kuwo, WeSing", slug: "tencent", logo: LOGO("tencent") },
  { name: "JioSaavn", slug: "jiosaavn", logo: LOGO("jiosaavn") },
  { name: "JOOX", slug: "joox", logo: LOGO("joox") },
  { name: "iHeart Radio", slug: "iheart", logo: LOGO("iheart") },
  { name: "Audible Magic", slug: "audible-magic", logo: LOGO("audible-magic") },
  { name: "Taobao", slug: "taobao", logo: LOGO("taobao") },
  { name: "Youtube Content ID", slug: "yt-cid", logo: LOGO("youtube") },
  { name: "Youtube, Youtube Music", slug: "youtube", logo: LOGO("youtube") },
  { name: "Canva, ROXI, Soundtrack Your Brand, Turntable, Snap, Coda Music", slug: "creator-tools", logo: LOGO("canva") },
  { name: "Peloton", slug: "peloton", logo: LOGO("peloton") },
  { name: "Kuaishou", slug: "kuaishou", logo: LOGO("kuaishou") },
  { name: "FLO", slug: "flo", logo: LOGO("flo") },
  { name: "NetEase Cloud Music", slug: "netease", logo: LOGO("netease") },
  { name: "Deezer", slug: "deezer", logo: LOGO("deezer") },
  { name: "Trebel Music", slug: "trebel", logo: LOGO("trebel") },
  { name: "Rythm", slug: "rythm", logo: LOGO("rythm") },
  { name: "MediaNet", slug: "medianet", logo: LOGO("medianet") },
  { name: "Yandex.Music", slug: "yandex", logo: LOGO("yandex") },
  { name: "VK Music, Odnoklassniki Music", slug: "vk-music", logo: LOGO("vk") },
  { name: "Zvuk", slug: "zvuk", logo: LOGO("zvuk") },
  { name: "All other DSPs", slug: "all-other" },
];

export const DSPS = DSPS_FULL.map(d => d.name);

export type DspStatus = "pending" | "sent" | "rejected";
