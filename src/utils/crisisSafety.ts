export type CrisisRiskLevel = "none" | "moderate" | "high";

export type CountryCode = "CO" | "MX" | "ES" | "AR" | "CL" | "US";

export interface HelplineAction {
  label: string;
  numberDisplay: string;
  telHref: string;
  description: string;
  availability: string;
  whatsappHref?: string;
  whatsappLabel?: string;
  webChatUrl?: string;
  webChatLabel?: string;
}

export interface CrisisCountry {
  code: CountryCode;
  name: string;
  flag: string;
  helplines: HelplineAction[];
}

export interface CrisisDetectionResult {
  riskLevel: CrisisRiskLevel;
  matchedSignals: string[];
  recommendedCountryCode: CountryCode;
  helplines: CrisisCountry[];
}

export const CRISIS_COUNTRIES: CrisisCountry[] = [
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    helplines: [
      {
        label: "Línea 106 — El poder de ser escuchado",
        numberDisplay: "106",
        telHref: "tel:106",
        description:
          "Orientación e intervención psicosocial gratuita, confidencial y humana.",
        availability: "24/7 · Gratuita",
        whatsappHref: "https://wa.me/573007548933",
        whatsappLabel: "WhatsApp Línea 106 (300 754 8933)",
      },
      {
        label: "Emergencias Nacionales",
        numberDisplay: "123",
        telHref: "tel:123",
        description:
          "Atención inmediata ante riesgo vital o urgencias de salud mental.",
        availability: "24/7 · Urgencias",
      },
      {
        label: "Línea 192 — Opción 4 (Minsalud)",
        numberDisplay: "192 (Opción 4)",
        telHref: "tel:192",
        description:
          "Orientación en salud mental y apoyo emocional en todo el territorio.",
        availability: "24/7 · Nacional",
      },
    ],
  },
  {
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    helplines: [
      {
        label: "Línea de la Vida",
        numberDisplay: "800 911 2000",
        telHref: "tel:8009112000",
        description:
          "Atención psicológica especializada en crisis emocionales y prevención.",
        availability: "24/7 · Gratuita",
      },
      {
        label: "Emergencias México",
        numberDisplay: "911",
        telHref: "tel:911",
        description: "Respuesta de emergencia médica y policial inmediata.",
        availability: "24/7 · Urgencias",
      },
    ],
  },
  {
    code: "ES",
    name: "España",
    flag: "🇪🇸",
    helplines: [
      {
        label: "Línea 024 — Atención a la conducta suicida",
        numberDisplay: "024",
        telHref: "tel:024",
        description:
          "Servicio público, gratuito y confidencial de apoyo emocional y contención.",
        availability: "24/7 · Gratuita",
      },
      {
        label: "Teléfono de la Esperanza",
        numberDisplay: "717 003 717",
        telHref: "tel:717003717",
        description: "Atención en crisis por profesionales y voluntarios.",
        availability: "24/7 · Confidencial",
      },
      {
        label: "Emergencias Europa",
        numberDisplay: "112",
        telHref: "tel:112",
        description: "Atención médica urgente inmediata.",
        availability: "24/7 · Urgencias",
      },
    ],
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    helplines: [
      {
        label: "Asistencia al Suicida (CABA / GBA)",
        numberDisplay: "135",
        telHref: "tel:135",
        description:
          "Atención gratuita, confidencial y anónima para personas en crisis.",
        availability: "24/7 · Gratuita",
      },
      {
        label: "Línea Nacional de Asistencia",
        numberDisplay: "0800 345 1435",
        telHref: "tel:08003451435",
        description: "Cobertura en todo el país desde cualquier teléfono.",
        availability: "24/7 · Nacional",
      },
    ],
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    helplines: [
      {
        label: "Línea Prevención del Suicidio (*4141)",
        numberDisplay: "*4141",
        telHref: "tel:*4141",
        description:
          "Programa 'No estás solo, no estás sola' del Ministerio de Salud.",
        availability: "24/7 · Gratuita",
      },
      {
        label: "Salud Responde",
        numberDisplay: "600 360 7777",
        telHref: "tel:6003607777",
        description: "Orientación en salud física y mental por especialistas.",
        availability: "24/7 · Nacional",
      },
    ],
  },
  {
    code: "US",
    name: "EE. UU. / Canadá",
    flag: "🇺🇸",
    helplines: [
      {
        label: "988 Suicide & Crisis Lifeline (Español)",
        numberDisplay: "988",
        telHref: "tel:988",
        description:
          "Llama o envía SMS al 988 (presiona 2 para atención en español).",
        availability: "24/7 · Gratuita",
      },
      {
        label: "Emergencias",
        numberDisplay: "911",
        telHref: "tel:911",
        description: "Servicios médicos de emergencia inmediata.",
        availability: "24/7 · Urgencias",
      },
    ],
  },
];

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

export function detectCrisisSignals(text: string): CrisisDetectionResult {
  const normalized = normalizeSpanishText(text || "");

  if (!normalized || normalized.length < 4) {
    return {
      riskLevel: "none",
      matchedSignals: [],
      recommendedCountryCode: "CO",
      helplines: CRISIS_COUNTRIES,
    };
  }

  const highMatches: string[] = [];
  for (const pattern of HIGH_RISK_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      highMatches.push(match[0]);
    }
  }

  if (highMatches.length > 0) {
    return {
      riskLevel: "high",
      matchedSignals: highMatches,
      recommendedCountryCode: "CO",
      helplines: CRISIS_COUNTRIES,
    };
  }

  const moderateMatches: string[] = [];
  for (const pattern of MODERATE_RISK_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      moderateMatches.push(match[0]);
    }
  }

  if (moderateMatches.length > 0) {
    return {
      riskLevel: "moderate",
      matchedSignals: moderateMatches,
      recommendedCountryCode: "CO",
      helplines: CRISIS_COUNTRIES,
    };
  }

  return {
    riskLevel: "none",
    matchedSignals: [],
    recommendedCountryCode: "CO",
    helplines: CRISIS_COUNTRIES,
  };
}
