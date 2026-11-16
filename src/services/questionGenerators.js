import { MEMBERSHIP_LABELS_PT } from "./ptTranslations.js";

let lastCategoryUsed = null;

/**
 * Embaralha uma cópia do array usando Fisher-Yates.
 */
export function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getSourceApiLabel(isFallback) {
  return isFallback ? "RestCountries (Fallback Local)" : "RestCountries V5";
}

function buildQuestionBase(targetCountry, { type, category, categoryIcon, isFallback, question, options, correctAnswer, media = null }) {
  return {
    id: `rc-${type}-${targetCountry.code}-${Date.now()}`,
    type,
    countryCode: targetCountry.code,
    category,
    categoryIcon,
    sourceApi: getSourceApiLabel(isFallback),
    question,
    options: shuffleArray(options),
    correctAnswer,
    media,
    countryMeta: targetCountry
  };
}

/**
 * Seleciona até `count` valores distintos extraídos de outros países do pool,
 * priorizando países da mesma região.
 */
function pickDistinctValues(targetCountry, pool, extractValue, excludeValues = [], count = 3) {
  const seen = new Set(excludeValues.filter(Boolean));
  const sameRegion = pool.filter(c => c.code !== targetCountry.code && c.region === targetCountry.region);
  const otherRegions = pool.filter(c => c.code !== targetCountry.code && c.region !== targetCountry.region);

  const picked = [];
  for (const candidate of [...shuffleArray(sameRegion), ...shuffleArray(otherRegions)]) {
    if (picked.length >= count) break;
    const value = extractValue(candidate);
    if (value && !seen.has(value)) {
      seen.add(value);
      picked.push(value);
    }
  }
  return picked;
}

/**
 * 1. Capitais Mundiais
 */
function buildCapitalQuestion(targetCountry, pool, isFallback) {
  if (!targetCountry.capital) return null;
  const distractors = pickDistinctValues(
    targetCountry,
    pool,
    c => c.capital,
    [targetCountry.capital],
    3
  );
  if (distractors.length < 3) return null;

  return buildQuestionBase(targetCountry, {
    type: "capital",
    category: "Capitais Mundiais",
    categoryIcon: "bi-bank2",
    isFallback,
    question: `Qual é a capital de ${targetCountry.namePt}?`,
    options: [targetCountry.capital, ...distractors],
    correctAnswer: targetCountry.capital
  });
}

/**
 * 2. Desafio Visual de Bandeiras
 */
function buildFlagQuestion(targetCountry, pool, isFallback) {
  const flagUrl = targetCountry.flag?.svg || targetCountry.flag?.png;
  if (!flagUrl) return null;

  const distractors = pickDistinctValues(
    targetCountry,
    pool,
    c => c.namePt,
    [targetCountry.namePt],
    3
  );
  if (distractors.length < 3) return null;

  return buildQuestionBase(targetCountry, {
    type: "flag",
    category: "Bandeiras do Mundo",
    categoryIcon: "bi-flag-fill",
    isFallback,
    question: "A qual país pertence esta bandeira nacional?",
    options: [targetCountry.namePt, ...distractors],
    correctAnswer: targetCountry.namePt,
    media: {
      type: "flag",
      url: flagUrl,
      emoji: targetCountry.flag?.emoji || "🏳️",
      alt: "Bandeira nacional misteriosa"
    }
  });
}

/**
 * 3. Comparação de População ou Área Territorial
 */
function buildComparisonQuestion(targetCountry, pool, isFallback) {
  const usePopulation = Math.random() < 0.5;
  const metricKey = usePopulation ? "population" : "areaKm2";
  const targetValue = targetCountry[metricKey];
  if (!targetValue || targetValue <= 0) return null;

  const candidates = shuffleArray(pool.filter(c => c.code !== targetCountry.code && c[metricKey] > 0));
  const selected = [targetCountry];

  for (const candidate of candidates) {
    if (selected.length >= 4) break;
    const isFarEnough = selected.every(chosen => {
      const maxVal = Math.max(chosen[metricKey], candidate[metricKey]);
      return Math.abs(chosen[metricKey] - candidate[metricKey]) / maxVal >= 0.2;
    });
    if (isFarEnough) {
      selected.push(candidate);
    }
  }

  if (selected.length < 4) return null;

  const winner = selected.reduce((best, curr) => (curr[metricKey] > best[metricKey] ? curr : best), selected[0]);

  return buildQuestionBase(targetCountry, {
    type: "comparison",
    category: usePopulation ? "Demografia Global" : "Extensão Territorial",
    categoryIcon: "bi-bar-chart-fill",
    isFallback,
    question: usePopulation
      ? "Qual destes países possui a MAIOR população?"
      : "Qual destes países possui a MAIOR extensão territorial (área)?",
    options: selected.map(c => c.namePt),
    correctAnswer: winner.namePt
  });
}

/**
 * 4. Economia & Moedas
 */
function buildCurrencyQuestion(targetCountry, pool, isFallback) {
  const mainCurrency = targetCountry.currencies?.[0];
  if (!mainCurrency?.namePt || !mainCurrency?.code) return null;

  const formatCurrency = c => `${c.namePt} (${c.code})`;
  const correctLabel = formatCurrency(mainCurrency);

  const distractors = pickDistinctValues(
    targetCountry,
    pool,
    c => (c.currencies?.[0]?.code && c.currencies?.[0]?.namePt ? formatCurrency(c.currencies[0]) : null),
    [correctLabel],
    3
  );
  if (distractors.length < 3) return null;

  return buildQuestionBase(targetCountry, {
    type: "currency",
    category: "Economia & Moedas",
    categoryIcon: "bi-cash-coin",
    isFallback,
    question: `Qual é a moeda oficial utilizada em ${targetCountry.namePt}?`,
    options: [correctLabel, ...distractors],
    correctAnswer: correctLabel
  });
}

/**
 * 5. Fronteiras Terrestres ou Sub-região Geográfica
 */
function buildGeographyQuestion(targetCountry, pool, isFallback) {
  const poolByCode = new Map(pool.map(c => [c.code, c]));
  const neighbors = (targetCountry.borders || [])
    .map(code => poolByCode.get(code))
    .filter(Boolean);

  if (neighbors.length > 0) {
    const chosenNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    const borderSet = new Set([...(targetCountry.borders || []), targetCountry.code]);

    const distractors = pickDistinctValues(
      targetCountry,
      pool.filter(c => !borderSet.has(c.code)),
      c => c.namePt,
      [chosenNeighbor.namePt],
      3
    );

    if (distractors.length === 3) {
      return buildQuestionBase(targetCountry, {
        type: "geography",
        category: "Fronteiras & Geografia",
        categoryIcon: "bi-map-fill",
        isFallback,
        question: `Qual destes países faz fronteira terrestre com ${targetCountry.namePt}?`,
        options: [chosenNeighbor.namePt, ...distractors],
        correctAnswer: chosenNeighbor.namePt
      });
    }
  }

  if (!targetCountry.subregionPt || targetCountry.subregionPt === "Global") return null;

  const subregionDistractors = pickDistinctValues(
    targetCountry,
    pool,
    c => (c.subregionPt && c.subregionPt !== "Global" ? c.subregionPt : null),
    [targetCountry.subregionPt],
    3
  );
  if (subregionDistractors.length < 3) return null;

  return buildQuestionBase(targetCountry, {
    type: "geography",
    category: "Regiões do Planeta",
    categoryIcon: "bi-map-fill",
    isFallback,
    question: `Em qual sub-região geográfica fica localizado o país ${targetCountry.namePt}?`,
    options: [targetCountry.subregionPt, ...subregionDistractors],
    correctAnswer: targetCountry.subregionPt
  });
}

/**
 * 6. Geopolítica & Blocos Internacionais
 */
function buildMembershipQuestion(targetCountry, pool, isFallback) {
  const validBlocs = Object.keys(MEMBERSHIP_LABELS_PT).filter(key => {
    if (targetCountry.memberships?.[key] !== true) return false;
    const nonMembersCount = pool.filter(c => c.code !== targetCountry.code && c.memberships?.[key] === false).length;
    return nonMembersCount >= 3;
  });

  if (validBlocs.length === 0) return null;

  const blocKey = validBlocs[Math.floor(Math.random() * validBlocs.length)];
  const blocLabel = MEMBERSHIP_LABELS_PT[blocKey];

  const nonMembers = pool.filter(c => c.code !== targetCountry.code && c.memberships?.[blocKey] === false);
  const distractors = pickDistinctValues(
    targetCountry,
    nonMembers,
    c => c.namePt,
    [targetCountry.namePt],
    3
  );
  if (distractors.length < 3) return null;

  return buildQuestionBase(targetCountry, {
    type: "membership",
    category: "Geopolítica & Blocos",
    categoryIcon: "bi-globe-americas",
    isFallback,
    question: `Qual destes países é membro ativo do bloco/organização ${blocLabel}?`,
    options: [targetCountry.namePt, ...distractors],
    correctAnswer: targetCountry.namePt
  });
}

/**
 * 7. Idiomas Oficiais
 */
function buildLanguageQuestion(targetCountry, pool, isFallback) {
  const mainLanguage = targetCountry.languages?.[0];
  if (!mainLanguage?.namePt) return null;

  const countryLanguageNames = targetCountry.languages.map(l => l.namePt).filter(Boolean);
  const distractors = pickDistinctValues(
    targetCountry,
    pool,
    c => c.languages?.[0]?.namePt,
    countryLanguageNames,
    3
  );
  if (distractors.length < 3) return null;

  return buildQuestionBase(targetCountry, {
    type: "language",
    category: "Idiomas & Cultura",
    categoryIcon: "bi-translate",
    isFallback,
    question: `Qual destes idiomas é oficial ou falado em ${targetCountry.namePt}?`,
    options: [mainLanguage.namePt, ...distractors],
    correctAnswer: mainLanguage.namePt
  });
}

const GENERATORS = {
  capital: buildCapitalQuestion,
  flag: buildFlagQuestion,
  comparison: buildComparisonQuestion,
  currency: buildCurrencyQuestion,
  geography: buildGeographyQuestion,
  membership: buildMembershipQuestion,
  language: buildLanguageQuestion
};

export function resetCategoryHistory() {
  lastCategoryUsed = null;
}

/**
 * Seleciona e constrói uma pergunta polimórfica evitando repetir a mesma categoria em sequência.
 */
export function generateDynamicQuestion(targetCountry, pool, isFallback, options = {}) {
  const allowedCategories = Array.isArray(options.allowedCategories) && options.allowedCategories.length > 0
    ? options.allowedCategories.filter(cat => Boolean(GENERATORS[cat]))
    : Object.keys(GENERATORS);

  const nonConsecutive = allowedCategories.filter(cat => cat !== lastCategoryUsed);
  const candidateOrder = [
    ...shuffleArray(nonConsecutive),
    ...(lastCategoryUsed && allowedCategories.includes(lastCategoryUsed) ? [lastCategoryUsed] : [])
  ];

  for (const categoryKey of candidateOrder) {
    const question = GENERATORS[categoryKey](targetCountry, pool, isFallback);
    if (question) {
      lastCategoryUsed = categoryKey;
      return question;
    }
  }

  return buildCapitalQuestion(targetCountry, pool, isFallback);
}
