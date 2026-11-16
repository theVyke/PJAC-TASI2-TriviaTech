/**
 * Dicionário de tradução PT-BR para capitais, regiões, sub-regiões,
 * moedas, idiomas e blocos internacionais da REST Countries v5.
 */
const CAPITAL_TRANSLATIONS_PT = {
  "Addis Ababa": "Adis Abeba",
  "Algiers": "Argel",
  "Amman": "Amã",
  "Amsterdam": "Amsterdã",
  "Andorra la Vella": "Andorra-a-Velha",
  "Ankara": "Ancara",
  "Ashgabat": "Asgabate",
  "Asunción": "Assunção",
  "Asuncion": "Assunção",
  "Athens": "Atenas",
  "Baghdad": "Bagdá",
  "Baku": "Bacu",
  "Bangkok": "Bangkok",
  "Beijing": "Pequim",
  "Beirut": "Beirute",
  "Belgrade": "Belgrado",
  "Berlin": "Berlim",
  "Bern": "Berna",
  "Berne": "Berna",
  "Bogota": "Bogotá",
  "Brasilia": "Brasília",
  "Bratislava": "Bratislava",
  "Brazzaville": "Brazavile",
  "Brussels": "Bruxelas",
  "Bucharest": "Bucareste",
  "Budapest": "Budapeste",
  "Cairo": "Cairo",
  "Canberra": "Camberra",
  "Cape Town": "Cidade do Cabo",
  "Chișinău": "Quichinau",
  "City of San Marino": "San Marino",
  "Conakry": "Conacri",
  "Copenhagen": "Copenhague",
  "Damascus": "Damasco",
  "Dhaka": "Daca",
  "Dili": "Díli",
  "Djibouti": "Djibuti",
  "Doha": "Doha",
  "Dublin": "Dublin",
  "Dushanbe": "Duchambe",
  "Guatemala City": "Cidade da Guatemala",
  "Hanoi": "Hanói",
  "Havana": "Havana",
  "Helsinki": "Helsinque",
  "Islamabad": "Islamabade",
  "Jakarta": "Jacarta",
  "Jerusalem": "Jerusalém",
  "Kabul": "Cabul",
  "Kathmandu": "Catmandu",
  "Khartoum": "Cartum",
  "Kiev": "Kiev",
  "Kyiv": "Kiev",
  "Kinshasa": "Quinxassa",
  "Kuwait City": "Cidade do Kuwait",
  "Lisbon": "Lisboa",
  "Ljubljana": "Liubliana",
  "London": "Londres",
  "Luxembourg": "Luxemburgo",
  "Madrid": "Madri",
  "Managua": "Manágua",
  "Mexico City": "Cidade do México",
  "Mogadishu": "Mogadíscio",
  "Monaco": "Mônaco",
  "Monrovia": "Monróvia",
  "Montevideo": "Montevidéu",
  "Moscow": "Moscou",
  "Muscat": "Mascate",
  "N'Djamena": "Jamena",
  "Nairobi": "Nairóbi",
  "New Delhi": "Nova Déli",
  "Nicosia": "Nicósia",
  "Nouakchott": "Nuaquechote",
  "Panama City": "Cidade do Panamá",
  "Port Louis": "Porto Luís",
  "Port of Spain": "Porto de Espanha",
  "Port-au-Prince": "Porto Príncipe",
  "Prague": "Praga",
  "Pretoria": "Pretória",
  "Rabat": "Rabat",
  "Reykjavik": "Reykjavík",
  "Riyadh": "Riade",
  "Rome": "Roma",
  "Sana'a": "Saná",
  "Santo Domingo": "São Domingos",
  "Seoul": "Seul",
  "Singapore": "Singapura",
  "Skopje": "Escópia",
  "Sofia": "Sófia",
  "South Tarawa": "Taraua do Sul",
  "Stockholm": "Estocolmo",
  "Taipei": "Taipé",
  "Tallinn": "Talim",
  "Tashkent": "Tasquente",
  "Tehran": "Teerã",
  "Thimphu": "Timbu",
  "Tokyo": "Tóquio",
  "Tripoli": "Trípoli",
  "Tunis": "Túnis",
  "Ulaanbaatar": "Ulan Bator",
  "Ulan Bator": "Ulan Bator",
  "Valletta": "Valeta",
  "Vatican City": "Cidade do Vaticano",
  "Victoria": "Vitória",
  "Vienna": "Viena",
  "Vientiane": "Vienciana",
  "Vilnius": "Vílnius",
  "Warsaw": "Varsóvia",
  "Yaoundé": "Iaoundé",
  "Yerevan": "Ierevan",
  "Zagreb": "Zagrebe"
};

export const REGION_TRANSLATIONS_PT = {
  Africa: "África",
  Americas: "Américas",
  Asia: "Ásia",
  Europe: "Europa",
  Oceania: "Oceania",
  Antarctic: "Antártida"
};

export const SUBREGION_TRANSLATIONS_PT = {
  "Australia and New Zealand": "Austrália e Nova Zelândia",
  "Caribbean": "Caribe",
  "Central America": "América Central",
  "Central Asia": "Ásia Central",
  "Central Europe": "Europa Central",
  "Eastern Africa": "África Oriental",
  "Eastern Asia": "Leste Asiático",
  "Eastern Europe": "Leste Europeu",
  "Melanesia": "Melanésia",
  "Micronesia": "Micronésia",
  "Middle Africa": "África Central",
  "North America": "América do Norte",
  "Northern Africa": "Norte da África",
  "Northern Europe": "Europa Setentrional",
  "Polynesia": "Polinésia",
  "South America": "América do Sul",
  "South-Eastern Asia": "Sudeste Asiático",
  "Southeast Europe": "Sudeste Europeu",
  "Southern Africa": "África Austral",
  "Southern Asia": "Sul da Ásia",
  "Southern Europe": "Sul da Europa",
  "Western Africa": "África Ocidental",
  "Western Asia": "Oriente Médio / Ásia Ocidental",
  "Western Europe": "Europa Ocidental"
};

export const MEMBERSHIP_LABELS_PT = {
  brics: "BRICS",
  eu: "União Europeia (UE)",
  eurozone: "Zona do Euro",
  g7: "Grupo dos Sete (G7)",
  g20: "G20",
  nato: "OTAN (Aliança Atlântica)",
  schengen: "Espaço Schengen",
  oecd: "OCDE",
  commonwealth: "Commonwealth",
  african_union: "União Africana",
  arab_league: "Liga Árabe",
  asean: "ASEAN",
  opec: "OPEP"
};

const currencyDisplayNames = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["pt-BR"], { type: "currency" })
  : null;

const languageDisplayNames = typeof Intl !== "undefined" && Intl.DisplayNames
  ? new Intl.DisplayNames(["pt-BR"], { type: "language" })
  : null;

function capitalizeFirst(text) {
  if (!text || typeof text !== "string") return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Traduz o nome de uma capital para português do Brasil quando há equivalência conhecida.
 */
export function translateCapitalPt(capitalName) {
  if (!capitalName || typeof capitalName !== "string") return capitalName;
  const trimmed = capitalName.trim();
  return CAPITAL_TRANSLATIONS_PT[trimmed] || trimmed;
}

/**
 * Traduz uma região continental para PT-BR.
 */
export function translateRegionPt(region) {
  if (!region) return "Global";
  return REGION_TRANSLATIONS_PT[region] || region;
}

/**
 * Traduz uma sub-região geográfica para PT-BR.
 */
export function translateSubregionPt(subregion) {
  if (!subregion) return "Global";
  return SUBREGION_TRANSLATIONS_PT[subregion] || subregion;
}

/**
 * Traduz uma moeda usando Intl.DisplayNames('pt-BR') a partir do código ISO 4217.
 */
export function translateCurrencyPt(code, fallbackName) {
  if (currencyDisplayNames && code) {
    try {
      const translated = currencyDisplayNames.of(code.toUpperCase());
      if (translated && translated.toUpperCase() !== code.toUpperCase()) {
        return capitalizeFirst(translated);
      }
    } catch {
      // Ignora códigos inválidos para Intl.DisplayNames
    }
  }
  return fallbackName || code || "Moeda desconhecida";
}

/**
 * Traduz um idioma usando Intl.DisplayNames('pt-BR') a partir do código ISO 639.
 */
export function translateLanguagePt(code, fallbackName) {
  if (languageDisplayNames && code) {
    try {
      const translated = languageDisplayNames.of(code);
      if (translated && translated.toLowerCase() !== code.toLowerCase()) {
        return capitalizeFirst(translated);
      }
    } catch {
      // Ignora códigos inválidos para Intl.DisplayNames
    }
  }
  return fallbackName || code || "Idioma desconhecido";
}
