export type DspCategory =
  | "streaming"
  | "downloads"
  | "audio_library"
  | "rights"
  | "ugc"
  | "publishing";

export type Dsp = {
  name: string;
  slug: string;
  logo?: string;
  group?: string;
  categories: DspCategory[];
};

const LOGO = (slug: string) => `https://soundxpand.com/assets/images/platforms/${slug}.svg`;

export const DSPS_FULL: Dsp[] = [
  { name: "Spotify", slug: "spotify", logo: LOGO("spotify"), categories: ["streaming"] },
  { name: "Apple Music, iTunes", slug: "apple", logo: LOGO("apple"), categories: ["streaming", "downloads"] },
  { name: "Tidal Music", slug: "tidal", logo: LOGO("tidal"), categories: ["streaming"] },
  { name: "Amazon Music", slug: "amazon", logo: LOGO("amazon"), categories: ["streaming", "downloads"] },
  { name: "Deezer", slug: "deezer", logo: LOGO("deezer"), categories: ["streaming"] },
  { name: "Youtube, Youtube Music", slug: "youtube", logo: LOGO("youtube"), categories: ["streaming", "ugc"] },
  { name: "Youtube Content ID", slug: "yt-cid", logo: LOGO("youtube"), categories: ["rights", "ugc"] },
  { name: "SoundCloud", slug: "soundcloud", logo: LOGO("soundcloud"), categories: ["streaming", "ugc"] },
  { name: "SoundCloud Fingerprint", slug: "soundcloud-fp", logo: LOGO("soundcloud"), categories: ["rights", "ugc"] },
  { name: "Pandora", slug: "pandora", logo: LOGO("pandora"), categories: ["streaming"] },
  { name: "Anghami", slug: "anghami", logo: LOGO("anghami"), categories: ["streaming"] },
  { name: "Boomplay", slug: "boomplay", logo: LOGO("boomplay"), categories: ["streaming"] },
  { name: "KKBOX", slug: "kkbox", logo: LOGO("kkbox"), categories: ["streaming"] },
  { name: "QQ Music, KuGou, Kuwo, WeSing", slug: "tencent", logo: LOGO("tencent"), categories: ["streaming"] },
  { name: "JioSaavn", slug: "jiosaavn", logo: LOGO("jiosaavn"), categories: ["streaming"] },
  { name: "JOOX", slug: "joox", logo: LOGO("joox"), categories: ["streaming"] },
  { name: "iHeart Radio", slug: "iheart", logo: LOGO("iheart"), categories: ["streaming"] },
  { name: "NetEase Cloud Music", slug: "netease", logo: LOGO("netease"), categories: ["streaming"] },
  { name: "FLO", slug: "flo", logo: LOGO("flo"), categories: ["streaming"] },
  { name: "Yandex.Music", slug: "yandex", logo: LOGO("yandex"), categories: ["streaming"] },
  { name: "VK Music, Odnoklassniki Music", slug: "vk-music", logo: LOGO("vk"), categories: ["streaming", "ugc"] },
  { name: "Zvuk", slug: "zvuk", logo: LOGO("zvuk"), categories: ["streaming"] },
  { name: "Trebel Music", slug: "trebel", logo: LOGO("trebel"), categories: ["streaming"] },
  { name: "MediaNet", slug: "medianet", logo: LOGO("medianet"), categories: ["streaming"] },
  { name: "Rythm", slug: "rythm", logo: LOGO("rythm"), categories: ["streaming"] },
  { name: "Peloton", slug: "peloton", logo: LOGO("peloton"), categories: ["audio_library"] },
  { name: "Meta Audio Library", slug: "meta-audio", logo: LOGO("meta"), categories: ["audio_library", "ugc"] },
  { name: "Meta Fingerprint", slug: "meta-fp", logo: LOGO("meta"), categories: ["rights", "ugc"] },
  { name: "Canva, ROXI, Soundtrack Your Brand, Turntable, Snap, Coda Music", slug: "creator-tools", logo: LOGO("canva"), categories: ["audio_library", "ugc"] },
  { name: "Kuaishou", slug: "kuaishou", logo: LOGO("kuaishou"), categories: ["ugc"] },
  { name: "Taobao", slug: "taobao", logo: LOGO("taobao"), categories: ["downloads"] },
  { name: "ACR Cloud", slug: "acrcloud", logo: LOGO("acrcloud"), categories: ["rights"] },
  { name: "Audible Magic", slug: "audible-magic", logo: LOGO("audible-magic"), categories: ["rights"] },
  { name: "All other DSPs", slug: "all-other", categories: ["streaming"] },
];

export const DSPS = DSPS_FULL.map((d) => d.name);

export const DSP_CATEGORIES: { id: DspCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "streaming", label: "Streaming" },
  { id: "downloads", label: "Downloads" },
  { id: "audio_library", label: "Audio library" },
  { id: "rights", label: "Rights & Fingerprint" },
  { id: "ugc", label: "UGC & Social" },
  { id: "publishing", label: "Publishing" },
];

export const RIGHTS_SOCIETIES: { id: string; name: string; territory: string; description: string }[] = [
  { id: "ppl_india", name: "PPL India", territory: "India", description: "Public performance royalties across radio, TV and venues in India." },
  { id: "mlc", name: "MLC", territory: "United States", description: "Mechanical Licensing Collective — U.S. mechanicals from streaming and downloads." },
  { id: "gvl", name: "GVL", territory: "Germany", description: "Neighbouring rights society for performers and producers in Germany." },
  { id: "ascap", name: "ASCAP", territory: "United States", description: "Performing rights society for songwriters, composers and publishers." },
  { id: "sentric", name: "Sentric", territory: "Global", description: "Global publishing administration for songwriters and composers." },
  { id: "alltracks", name: "All Tracks", territory: "Global", description: "Neighbouring rights collection across major territories." },
  { id: "sena", name: "Sena", territory: "Netherlands", description: "Dutch neighbouring rights society for performers and producers." },
];

export type DspStatus = "pending" | "sent" | "rejected";
