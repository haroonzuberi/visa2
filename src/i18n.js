"use client";
import i18n from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en/common.json';
import heTranslations from './locales/he/common.json';

i18n.use(I18nextBrowserLanguageDetector).use(initReactI18next).init({
  debug: false,
  fallbackLng: "en",
  returnObjects: true,
  resources: {
    en: enTranslations,
    he: heTranslations,
  },
});

export default i18n;