import axios from "axios";
import { translateCapitalPt } from "./ptTranslations.js";

const KEY_RESTCOUNTRIES = import.meta.env.VITE_API_KEY_RESTCOUNTRIES;
const CACHE_KEY = "triviatech_rc_v5_pool_v2";
const PAGE_LIMIT = 100;
const PAGE_OFFSETS = [0, 100, 200];
const MIN_VALID_POOL_SIZE = 10;

const RESPONSE_FIELDS = [
  "names",
  "codes",
  "capitals",
  "flag",
  "region",
  "subregion",
  "population",
  "area",
  "currencies",
  "languages",
  "borders",
  "landlocked",
  "memberships",
  "classification",
  "calling_codes",
  "timezones",
  "descriptions",
  "links"
].join(",");

const api = axios.create({
  baseURL: "https://api.restcountries.com/countries/v5",
  headers: KEY_RESTCOUNTRIES ? { Authorization: `Bearer ${KEY_RESTCOUNTRIES}` } : {},
  timeout: 10000
});

let memoryPool = null;
const usedInCurrentMatch = new Set();

function createFallbackCountry({
  code,
  alpha2,
  namePt,
  officialNamePt,
  capital,
  region,
  subregion,
  population,
  areaKm2,
  emoji,
  dominantColor,
  currency,
  language,
  borders = [],
  landlocked = false,
  memberships = {}
}) {
  return {
    code,
    alpha2,
    namePt,
    officialNamePt: officialNamePt || namePt,
    capital,
    region,
    subregion,
    population,
    areaKm2,
    flag: {
      svg: `https://flags.restcountries.com/v5/svg/${alpha2.toLowerCase()}.svg`,
      png: `https://flags.restcountries.com/v5/w640/${alpha2.toLowerCase()}.png`,
      emoji,
      dominantColor,
      description: ""
    },
    currencies: [currency],
    languages: [language],
    borders,
    landlocked,
    memberships: { un: true, ...memberships },
    callingCodes: [],
    timezones: [],
    isUnMember: true,
    isSovereign: true,
    shortDescription: "",
    mapsUrl: "",
    wikiUrl: ""
  };
}

// Banco de reserva resiliente (fallback) no contrato NormalizedCountry
const FALLBACK_COUNTRIES = [
  createFallbackCountry({
    code: "BRA", alpha2: "BR", namePt: "Brasil", officialNamePt: "República Federativa do Brasil",
    capital: "Brasília", region: "Americas", subregion: "South America", population: 214211951, areaKm2: 8515767,
    emoji: "🇧🇷", dominantColor: "#009544",
    currency: { code: "BRL", name: "Real brasileiro", symbol: "R$" },
    language: { code: "pt", name: "Portuguese", nativeName: "português" },
    borders: ["ARG", "BOL", "COL", "GUF", "GUY", "PRY", "PER", "SUR", "URY", "VEN"],
    memberships: { brics: true, g20: true }
  }),
  createFallbackCountry({
    code: "FRA", alpha2: "FR", namePt: "França", officialNamePt: "República Francesa",
    capital: "Paris", region: "Europe", subregion: "Western Europe", population: 67970000, areaKm2: 551695,
    emoji: "🇫🇷", dominantColor: "#0055a4",
    currency: { code: "EUR", name: "Euro", symbol: "€" },
    language: { code: "fr", name: "French", nativeName: "français" },
    borders: ["AND", "BEL", "DEU", "ITA", "LUX", "MCO", "ESP", "CHE"],
    memberships: { eu: true, eurozone: true, g7: true, g20: true, nato: true, schengen: true }
  }),
  createFallbackCountry({
    code: "JPN", alpha2: "JP", namePt: "Japão", officialNamePt: "Japão",
    capital: "Tóquio", region: "Asia", subregion: "Eastern Asia", population: 125124989, areaKm2: 377930,
    emoji: "🇯🇵", dominantColor: "#ffffff",
    currency: { code: "JPY", name: "Japanese yen", symbol: "¥" },
    language: { code: "ja", name: "Japanese", nativeName: "日本語" },
    memberships: { g7: true, g20: true, oecd: true }
  }),
  createFallbackCountry({
    code: "CAN", alpha2: "CA", namePt: "Canadá", officialNamePt: "Canadá",
    capital: "Ottawa", region: "Americas", subregion: "North America", population: 38929902, areaKm2: 9984670,
    emoji: "🇨🇦", dominantColor: "#ff0000",
    currency: { code: "CAD", name: "Canadian dollar", symbol: "$" },
    language: { code: "en", name: "English", nativeName: "English" },
    borders: ["USA"],
    memberships: { g7: true, g20: true, nato: true, oecd: true }
  }),
  createFallbackCountry({
    code: "DEU", alpha2: "DE", namePt: "Alemanha", officialNamePt: "República Federal da Alemanha",
    capital: "Berlim", region: "Europe", subregion: "Western Europe", population: 83797985, areaKm2: 357114,
    emoji: "🇩🇪", dominantColor: "#000000",
    currency: { code: "EUR", name: "Euro", symbol: "€" },
    language: { code: "de", name: "German", nativeName: "Deutsch" },
    borders: ["AUT", "BEL", "CZE", "DNK", "FRA", "LUX", "NLD", "POL", "CHE"],
    memberships: { eu: true, eurozone: true, g7: true, g20: true, nato: true, schengen: true }
  }),
  createFallbackCountry({
    code: "AUS", alpha2: "AU", namePt: "Austrália", officialNamePt: "Comunidade da Austrália",
    capital: "Camberra", region: "Oceania", subregion: "Australia and New Zealand", population: 26005540, areaKm2: 7692024,
    emoji: "🇦🇺", dominantColor: "#00008b",
    currency: { code: "AUD", name: "Australian dollar", symbol: "$" },
    language: { code: "en", name: "English", nativeName: "English" },
    memberships: { g20: true, oecd: true, commonwealth: true }
  }),
  createFallbackCountry({
    code: "ARG", alpha2: "AR", namePt: "Argentina", officialNamePt: "República Argentina",
    capital: "Buenos Aires", region: "Americas", subregion: "South America", population: 46234830, areaKm2: 2780400,
    emoji: "🇦🇷", dominantColor: "#74acdf",
    currency: { code: "ARS", name: "Argentine peso", symbol: "$" },
    language: { code: "es", name: "Spanish", nativeName: "español" },
    borders: ["BOL", "BRA", "CHL", "PRY", "URY"],
    memberships: { g20: true }
  }),
  createFallbackCountry({
    code: "ITA", alpha2: "IT", namePt: "Itália", officialNamePt: "República Italiana",
    capital: "Roma", region: "Europe", subregion: "Southern Europe", population: 58940425, areaKm2: 301336,
    emoji: "🇮🇹", dominantColor: "#009246",
    currency: { code: "EUR", name: "Euro", symbol: "€" },
    language: { code: "it", name: "Italian", nativeName: "italiano" },
    borders: ["AUT", "FRA", "SMR", "SVN", "CHE", "VAT"],
    memberships: { eu: true, eurozone: true, g7: true, g20: true, nato: true, schengen: true }
  }),
  createFallbackCountry({
    code: "PRT", alpha2: "PT", namePt: "Portugal", officialNamePt: "República Portuguesa",
    capital: "Lisboa", region: "Europe", subregion: "Southern Europe", population: 10409704, areaKm2: 92090,
    emoji: "🇵🇹", dominantColor: "#ff0000",
    currency: { code: "EUR", name: "Euro", symbol: "€" },
    language: { code: "pt", name: "Portuguese", nativeName: "português" },
    borders: ["ESP"],
    memberships: { eu: true, eurozone: true, nato: true, schengen: true }
  }),
  createFallbackCountry({
    code: "GBR", alpha2: "GB", namePt: "Reino Unido", officialNamePt: "Reino Unido da Grã-Bretanha e Irlanda do Norte",
    capital: "Londres", region: "Europe", subregion: "Northern Europe", population: 66971395, areaKm2: 242900,
    emoji: "🇬🇧", dominantColor: "#012169",
    currency: { code: "GBP", name: "British pound", symbol: "£" },
    language: { code: "en", name: "English", nativeName: "English" },
    borders: ["IRL"],
    memberships: { g7: true, g20: true, nato: true, commonwealth: true }
  }),
  createFallbackCountry({
    code: "ESP", alpha2: "ES", namePt: "Espanha", officialNamePt: "Reino da Espanha",
    capital: "Madri", region: "Europe", subregion: "Southern Europe", population: 47778340, areaKm2: 505992,
    emoji: "🇪🇸", dominantColor: "#aa151b",
    currency: { code: "EUR", name: "Euro", symbol: "€" },
    language: { code: "es", name: "Spanish", nativeName: "español" },
    borders: ["AND", "FRA", "GIB", "PRT", "MAR"],
    memberships: { eu: true, eurozone: true, nato: true, schengen: true }
  }),
  createFallbackCountry({
    code: "EGY", alpha2: "EG", namePt: "Egito", officialNamePt: "República Árabe do Egito",
    capital: "Cairo", region: "Africa", subregion: "Northern Africa", population: 110990103, areaKm2: 1002450,
    emoji: "🇪🇬", dominantColor: "#ce1126",
    currency: { code: "EGP", name: "Egyptian pound", symbol: "£" },
    language: { code: "ar", name: "Arabic", nativeName: "العربية" },
    borders: ["ISR", "LBY", "PSE", "SDN"],
    memberships: { african_union: true, arab_league: true, brics: true }
  }),
  createFallbackCountry({
    code: "MEX", alpha2: "MX", namePt: "México", officialNamePt: "Estados Unidos Mexicanos",
    capital: "Cidade do México", region: "Americas", subregion: "North America", population: 127504125, areaKm2: 1964375,
    emoji: "🇲🇽", dominantColor: "#006847",
    currency: { code: "MXN", name: "Mexican peso", symbol: "$" },
    language: { code: "es", name: "Spanish", nativeName: "español" },
    borders: ["BLZ", "GTM", "USA"],
    memberships: { g20: true, oecd: true }
  }),
  createFallbackCountry({
    code: "KOR", alpha2: "KR", namePt: "Coreia do Sul", officialNamePt: "República da Coreia",
    capital: "Seul", region: "Asia", subregion: "Eastern Asia", population: 51628117, areaKm2: 100210,
    emoji: "🇰🇷", dominantColor: "#ffffff",
    currency: { code: "KRW", name: "South Korean won", symbol: "₩" },
    language: { code: "ko", name: "Korean", nativeName: "한국어" },
    borders: ["PRK"],
    memberships: { g20: true, oecd: true }
  }),
  createFallbackCountry({
    code: "NOR", alpha2: "NO", namePt: "Noruega", officialNamePt: "Reino da Noruega",
    capital: "Oslo", region: "Europe", subregion: "Northern Europe", population: 5457127, areaKm2: 323802,
    emoji: "🇳🇴", dominantColor: "#ba0c2f",
    currency: { code: "NOK", name: "Norwegian krone", symbol: "kr" },
    language: { code: "no", name: "Norwegian", nativeName: "norsk" },
    borders: ["FIN", "SWE", "RUS"],
    memberships: { nato: true, oecd: true, schengen: true }
  }),
  createFallbackCountry({
    code: "CHE", alpha2: "CH", namePt: "Suíça", officialNamePt: "Confederação Suíça",
    capital: "Berna", region: "Europe", subregion: "Western Europe", population: 8775760, areaKm2: 41284,
    emoji: "🇨🇭", dominantColor: "#da291c",
    currency: { code: "CHF", name: "Swiss franc", symbol: "Fr." },
    language: { code: "de", name: "German", nativeName: "Deutsch" },
    borders: ["AUT", "FRA", "ITA", "LIE", "DEU"],
    landlocked: true,
    memberships: { oecd: true, schengen: true }
  }),
  createFallbackCountry({
    code: "GRC", alpha2: "GR", namePt: "Grécia", officialNamePt: "República Helênica",
    capital: "Atenas", region: "Europe", subregion: "Southern Europe", population: 10426919, areaKm2: 131990,
    emoji: "🇬🇷", dominantColor: "#0d5eaf",
    currency: { code: "EUR", name: "Euro", symbol: "€" },
    language: { code: "el", name: "Greek", nativeName: "Ελληνικά" },
    borders: ["ALB", "BGR", "TUR", "MKD"],
    memberships: { eu: true, eurozone: true, nato: true, schengen: true }
  }),
  createFallbackCountry({
    code: "CHL", alpha2: "CL", namePt: "Chile", officialNamePt: "República do Chile",
    capital: "Santiago", region: "Americas", subregion: "South America", population: 19603733, areaKm2: 756102,
    emoji: "🇨🇱", dominantColor: "#0039a6",
    currency: { code: "CLP", name: "Chilean peso", symbol: "$" },
    language: { code: "es", name: "Spanish", nativeName: "español" },
    borders: ["ARG", "BOL", "PER"],
    memberships: { oecd: true }
  }),
  createFallbackCountry({
    code: "COL", alpha2: "CO", namePt: "Colômbia", officialNamePt: "República da Colômbia",
    capital: "Bogotá", region: "Americas", subregion: "South America", population: 51874024, areaKm2: 1141748,
    emoji: "🇨🇴", dominantColor: "#fcd116",
    currency: { code: "COP", name: "Colombian peso", symbol: "$" },
    language: { code: "es", name: "Spanish", nativeName: "español" },
    borders: ["BRA", "ECU", "PAN", "PER", "VEN"],
    memberships: { oecd: true }
  }),
  createFallbackCountry({
    code: "NLD", alpha2: "NL", namePt: "Holanda", officialNamePt: "Reino dos Países Baixos",
    capital: "Amsterdã", region: "Europe", subregion: "Western Europe", population: 17700982, areaKm2: 41850,
    emoji: "🇳🇱", dominantColor: "#ae1c28",
    currency: { code: "EUR", name: "Euro", symbol: "€" },
    language: { code: "nl", name: "Dutch", nativeName: "Nederlands" },
    borders: ["BEL", "DEU"],
    memberships: { eu: true, eurozone: true, nato: true, schengen: true }
  })
];

/**
 * Embaralha uma cópia do array usando Fisher-Yates.
 */
function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Converte um registro bruto da REST Countries v5 para o contrato NormalizedCountry.
 */
export function normalizeCountry(raw) {
  const namePt =
    raw?.names?.translations?.por?.common ||
    raw?.names?.common ||
    "País Desconhecido";

  const officialNamePt =
    raw?.names?.translations?.por?.official ||
    raw?.names?.official ||
    namePt;

  const primaryCapitalObj =
    raw?.capitals?.find(c => c?.attributes?.primary && c?.name) ||
    raw?.capitals?.find(c => c?.name);

  const capital = primaryCapitalObj?.name ? translateCapitalPt(primaryCapitalObj.name) : null;

  return {
    code: raw?.codes?.alpha_3 || raw?.codes?.alpha_2 || `rc-${namePt}`,
    alpha2: raw?.codes?.alpha_2 || "",
    namePt,
    officialNamePt,
    capital,
    region: raw?.region || "Global",
    subregion: raw?.subregion || "Global",
    population: Number(raw?.population) || 0,
    areaKm2: Number(raw?.area?.kilometers) || 0,
    flag: {
      svg: raw?.flag?.url_svg || "",
      png: raw?.flag?.url_png || "",
      emoji: raw?.flag?.emoji || "🏳️",
      dominantColor: raw?.flag?.colors?.dominant || "#0d6efd",
      description: raw?.flag?.description || ""
    },
    currencies: Array.isArray(raw?.currencies)
      ? raw.currencies
          .filter(c => c?.name)
          .map(c => ({ code: c.code || "", name: c.name, symbol: c.symbol || "" }))
      : [],
    languages: Array.isArray(raw?.languages)
      ? raw.languages
          .filter(l => l?.name)
          .map(l => ({
            code: l.iso639_1 || l.iso639_3 || "",
            name: l.name,
            nativeName: l.native_name || l.name
          }))
      : [],
    borders: Array.isArray(raw?.borders) ? raw.borders : [],
    landlocked: Boolean(raw?.landlocked),
    memberships: raw?.memberships || {},
    callingCodes: Array.isArray(raw?.calling_codes) ? raw.calling_codes : [],
    timezones: Array.isArray(raw?.timezones) ? raw.timezones : [],
    isUnMember: Boolean(raw?.classification?.un_member),
    isSovereign: Boolean(raw?.classification?.sovereign),
    shortDescription: raw?.descriptions?.short || "",
    mapsUrl: raw?.links?.google_maps || raw?.links?.open_street_maps || "",
    wikiUrl: raw?.links?.wikipedia || ""
  };
}

function readPoolFromSession() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length >= MIN_VALID_POOL_SIZE ? parsed : null;
  } catch {
    return null;
  }
}

function writePoolToSession(pool) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(pool));
  } catch (error) {
    console.warn("Não foi possível persistir cache no sessionStorage:", error.message);
  }
}

async function fetchAllPagesFromApi() {
  const requests = PAGE_OFFSETS.map(offset =>
    api.get("", {
      params: {
        limit: PAGE_LIMIT,
        offset,
        response_fields: RESPONSE_FIELDS
      }
    })
  );

  const results = await Promise.allSettled(requests);
  const rawObjects = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value?.data?.data?.objects || []);

  const dedupedByCode = new Map();
  for (const raw of rawObjects) {
    const country = normalizeCountry(raw);
    if (country.namePt && country.capital && (country.isSovereign || country.isUnMember)) {
      dedupedByCode.set(country.code, country);
    }
  }

  const normalizedPool = Array.from(dedupedByCode.values());
  if (normalizedPool.length < MIN_VALID_POOL_SIZE) {
    throw new Error("Quantidade insuficiente de países válidos retornados pela API.");
  }

  return normalizedPool;
}

/**
 * Obtém o pool de países usando memória -> sessionStorage -> API -> fallback local.
 */
async function getCountriesPool() {
  if (Array.isArray(memoryPool) && memoryPool.length >= MIN_VALID_POOL_SIZE) {
    return { countries: memoryPool, isFallback: false };
  }

  const cachedPool = readPoolFromSession();
  if (cachedPool) {
    memoryPool = cachedPool;
    return { countries: memoryPool, isFallback: false };
  }

  if (!KEY_RESTCOUNTRIES || KEY_RESTCOUNTRIES.includes("SUACHAVEAQUI")) {
    return { countries: FALLBACK_COUNTRIES, isFallback: true };
  }

  try {
    memoryPool = await fetchAllPagesFromApi();
    writePoolToSession(memoryPool);
    return { countries: memoryPool, isFallback: false };
  } catch (error) {
    console.warn("Falha na chamada RestCountries API, alternando para fallback offline:", error.message);
    return { countries: FALLBACK_COUNTRIES, isFallback: true };
  }
}

/**
 * Seleciona até 3 capitais incorretas priorizando países da mesma região.
 */
function pickCapitalDistractors(targetCountry, pool) {
  const sameRegion = pool.filter(
    c => c.region === targetCountry.region && c.capital && c.capital !== targetCountry.capital
  );
  const otherRegions = pool.filter(
    c => c.region !== targetCountry.region && c.capital && c.capital !== targetCountry.capital
  );

  const distractors = [];
  const seenCapitals = new Set([targetCountry.capital]);

  for (const candidate of [...shuffleArray(sameRegion), ...shuffleArray(otherRegions)]) {
    if (distractors.length >= 3) break;
    if (!seenCapitals.has(candidate.capital)) {
      seenCapitals.add(candidate.capital);
      distractors.push(candidate.capital);
    }
  }

  return distractors;
}

/**
 * Constrói uma pergunta padrão de capital a partir de um país elegível.
 */
function buildCapitalQuestion(targetCountry, pool, isFallback) {
  const distractors = pickCapitalDistractors(targetCountry, pool);
  const options = shuffleArray([targetCountry.capital, ...distractors]);

  return {
    id: `rc-${targetCountry.code}-${Date.now()}`,
    countryCode: targetCountry.code,
    category: isFallback ? "Geografia & Nações (Modo Offline)" : "Geografia & Capitais Mundiais",
    sourceApi: isFallback ? "RestCountries (Fallback Local)" : "RestCountries V5",
    question: `Qual é a capital de ${targetCountry.namePt}?`,
    options,
    correctAnswer: targetCountry.capital,
    countryMeta: targetCountry
  };
}

export const restCountriesService = {
  resetMatchHistory() {
    usedInCurrentMatch.clear();
  },

  async getCountries() {
    const { countries } = await getCountriesPool();
    return countries;
  },

  async getQuestion(options = {}) {
    const { countries, isFallback } = await getCountriesPool();
    const excludeSet = new Set([...usedInCurrentMatch, ...(options.excludeCodes || [])]);

    let eligible = countries.filter(c => c.capital && !excludeSet.has(c.code));
    if (eligible.length === 0) {
      usedInCurrentMatch.clear();
      eligible = countries.filter(c => Boolean(c.capital));
    }

    const targetCountry = eligible[Math.floor(Math.random() * eligible.length)];
    usedInCurrentMatch.add(targetCountry.code);

    return buildCapitalQuestion(targetCountry, countries, isFallback);
  }
};
