export type CrisisRiskLevel = "none" | "moderate" | "high";

export interface DeterministicCrisisResult {
  riskLevel: CrisisRiskLevel;
  matchedSignals: string[];
}

function normalizeSpanishText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const HIGH_RISK_PATTERNS: RegExp[] = [
  /\bsuicid(arme|arse|io|a)\b/,
  /\bquitar(me)? la vida\b/,
  /\bacabar con (mi vida|todo)\b/,
  /\bterminar con (mi vida|todo)\b/,
  /\bmatar(me)?\b/,
  /\b(ya )?no quiero (seguir )?viv(ir|iendo)\b/,
  /\bno vale la pena vivir\b/,
  /\bautolesion(arme|es|ar)?\b/,
  /\bhacer(me)? dano\b/,
  /\blastimar(me)?\b/,
  /\bcortar(me)? (las venas|los brazos|la piel)?\b/,
  /\btirar(me)? (de|del|por)\b/,
  /\bahorcar(me)?\b/,
  /\bsobredosis\b/,
  /\bpastillas para (morir|no despertar)\b/,
  /\bcarta de despedida\b/,
  /\bdespedirme para siempre\b/,
  /\bme quiero morir\b/,
  /\bquiero morir(me)?\b/,
];

const MODERATE_RISK_PATTERNS: RegExp[] = [
  /\bno puedo mas\b/,
  /\bya no aguanto( mas)?\b/,
  /\bquiero desaparecer\b/,
  /\bojala no despertara\b/,
  /\b(estaria|estarian) mejor sin mi\b/,
  /\bnadie me (extrana|extranaria|necesita|quiere)\b/,
  /\bsoy una carga\b/,
  /\bno le veo sentido a (nada|la vida|seguir)\b/,
  /\bodio mi vida\b/,
  /\bdeseo no existir\b/,
  /\bno tengo salida\b/,
  /\bestoy al limite\b/,
];

export function detectDeterministicCrisisSignals(
  text: string
): DeterministicCrisisResult {
  const normalized = normalizeSpanishText(text || "");

  if (!normalized || normalized.length < 4) {
    return { riskLevel: "none", matchedSignals: [] };
  }

  const highMatches: string[] = [];
  for (const pattern of HIGH_RISK_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      highMatches.push(match[0]);
    }
  }

  if (highMatches.length > 0) {
    return { riskLevel: "high", matchedSignals: highMatches };
  }

  const moderateMatches: string[] = [];
  for (const pattern of MODERATE_RISK_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      moderateMatches.push(match[0]);
    }
  }

  if (moderateMatches.length > 0) {
    return { riskLevel: "moderate", matchedSignals: moderateMatches };
  }

  return { riskLevel: "none", matchedSignals: [] };
}
