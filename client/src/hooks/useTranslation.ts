import { useMemo } from "react";
import frTranslations from "@/locales/fr.json";

type LanguageCode = "fr";

const translations: Record<LanguageCode, typeof frTranslations> = {
  fr: frTranslations,
};

/**
 * Hook to get translations for the current language
 * Currently defaults to French, can be extended to support multiple languages
 */
export function useTranslation(lang: LanguageCode = "fr") {
  return useMemo(() => {
    return translations[lang] || frTranslations;
  }, [lang]);
}

/**
 * Get nested translation value using dot notation
 * Example: t("home.title") -> "Bienvenue sur Gastronogeek Chatbot"
 */
export function getTranslation(
  translations: any,
  key: string,
  defaultValue: string = key
): string {
  const keys = key.split(".");
  let value = translations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return defaultValue;
    }
  }

  return value as string;
}

/**
 * Hook to get a specific translation value
 */
export function useT(key: string, lang: LanguageCode = "fr") {
  const t = useTranslation(lang);
  return useMemo(() => getTranslation(t, key, key), [t, key]);
}
