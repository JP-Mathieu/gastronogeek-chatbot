import { describe, it, expect } from "vitest";
import { getTranslation } from "./useTranslation";
import frTranslations from "@/locales/fr.json";

describe("Translation System", () => {
  it("should load French translations", () => {
    expect(frTranslations).toBeDefined();
    expect(typeof frTranslations).toBe("object");
  });

  it("should have common translations", () => {
    expect(frTranslations.common).toBeDefined();
    expect(frTranslations.common.logout).toBe("Déconnexion");
    expect(frTranslations.common.loading).toBe("Chargement...");
  });

  it("should have home translations", () => {
    expect(frTranslations.home).toBeDefined();
    expect(frTranslations.home.title).toBe(
      "Bienvenue sur Gastronogeek Chatbot"
    );
    expect(frTranslations.home.startChatting).toBe("Commencer à Discuter");
  });

  it("should have chatbot translations", () => {
    expect(frTranslations.chatbot).toBeDefined();
    expect(frTranslations.chatbot.title).toBe("Chatbot Gastronogeek");
    expect(frTranslations.chatbot.placeholder).toBe(
      "Posez-moi une question sur la cuisine..."
    );
  });

  it("should have admin translations", () => {
    expect(frTranslations.admin).toBeDefined();
    expect(frTranslations.admin.title).toBe("Panneau d'Administration");
    expect(frTranslations.admin.syncVideos).toBe(
      "Synchroniser les Vidéos depuis YouTube"
    );
  });

  it("should get nested translation values using dot notation", () => {
    const value = getTranslation(frTranslations, "home.title");
    expect(value).toBe("Bienvenue sur Gastronogeek Chatbot");
  });

  it("should return default value for missing keys", () => {
    const value = getTranslation(frTranslations, "nonexistent.key", "Default");
    expect(value).toBe("Default");
  });

  it("should get deeply nested translation values", () => {
    const value = getTranslation(
      frTranslations,
      "home.features.expertRecipes"
    );
    expect(value).toBe("Recettes d'Expert");
  });

  it("should have message translations", () => {
    expect(frTranslations.messages).toBeDefined();
    expect(frTranslations.messages.syncSuccess).toBe(
      "Vidéos synchronisées avec succès !"
    );
  });
});
