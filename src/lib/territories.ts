// Minimal continent → country dataset for the territory picker.
// "Worldwide" is the top-level selection. India is highlighted separately.
export type Country = { code: string; name: string };
export type Continent = { name: string; countries: Country[] };

export const CONTINENTS: Continent[] = [
  {
    name: "Asia",
    countries: [
      { code: "IN", name: "India" },
      { code: "CN", name: "China" },
      { code: "JP", name: "Japan" },
      { code: "KR", name: "South Korea" },
      { code: "ID", name: "Indonesia" },
      { code: "PH", name: "Philippines" },
      { code: "TH", name: "Thailand" },
      { code: "VN", name: "Vietnam" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
      { code: "PK", name: "Pakistan" },
      { code: "BD", name: "Bangladesh" },
      { code: "LK", name: "Sri Lanka" },
      { code: "NP", name: "Nepal" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "IL", name: "Israel" },
      { code: "TR", name: "Turkey" },
      { code: "TW", name: "Taiwan" },
      { code: "HK", name: "Hong Kong" },
    ],
  },
  {
    name: "Europe",
    countries: [
      { code: "GB", name: "United Kingdom" }, { code: "DE", name: "Germany" },
      { code: "FR", name: "France" }, { code: "IT", name: "Italy" },
      { code: "ES", name: "Spain" }, { code: "PT", name: "Portugal" },
      { code: "NL", name: "Netherlands" }, { code: "BE", name: "Belgium" },
      { code: "SE", name: "Sweden" }, { code: "NO", name: "Norway" },
      { code: "DK", name: "Denmark" }, { code: "FI", name: "Finland" },
      { code: "IE", name: "Ireland" }, { code: "PL", name: "Poland" },
      { code: "CZ", name: "Czechia" }, { code: "AT", name: "Austria" },
      { code: "CH", name: "Switzerland" }, { code: "GR", name: "Greece" },
      { code: "RO", name: "Romania" }, { code: "HU", name: "Hungary" },
      { code: "RU", name: "Russia" }, { code: "UA", name: "Ukraine" },
    ],
  },
  {
    name: "North America",
    countries: [
      { code: "US", name: "United States" }, { code: "CA", name: "Canada" },
      { code: "MX", name: "Mexico" },
    ],
  },
  {
    name: "South America",
    countries: [
      { code: "BR", name: "Brazil" }, { code: "AR", name: "Argentina" },
      { code: "CL", name: "Chile" }, { code: "CO", name: "Colombia" },
      { code: "PE", name: "Peru" }, { code: "UY", name: "Uruguay" },
      { code: "VE", name: "Venezuela" }, { code: "EC", name: "Ecuador" },
    ],
  },
  {
    name: "Africa",
    countries: [
      { code: "ZA", name: "South Africa" }, { code: "NG", name: "Nigeria" },
      { code: "KE", name: "Kenya" }, { code: "EG", name: "Egypt" },
      { code: "MA", name: "Morocco" }, { code: "GH", name: "Ghana" },
      { code: "TZ", name: "Tanzania" }, { code: "ET", name: "Ethiopia" },
    ],
  },
  {
    name: "Oceania",
    countries: [
      { code: "AU", name: "Australia" }, { code: "NZ", name: "New Zealand" },
    ],
  },
];

export const ALL_COUNTRY_CODES: string[] = CONTINENTS.flatMap(c => c.countries.map(x => x.code));
