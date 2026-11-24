export interface DailyReflection {
  id: string;
  phrase: string;
  author?: string;
  theme?: string;
  reflectionPrompt?: string;
  suggestedRoute?: string;
  suggestedLabel?: string;
  source?: "ai" | "fallback";
  cached?: boolean;
}
