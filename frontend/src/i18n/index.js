import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';

// Initialize i18next
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar }
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'ar'],

        // Language detection configuration
        detection: {
            // Order of language detection
            order: ['localStorage', 'navigator'],
            // Key to store in localStorage
            lookupLocalStorage: 'lang',
            // Cache user language
            caches: ['localStorage'],
        },

        interpolation: {
            escapeValue: false // React already handles XSS
        },

        // React specific options
        react: {
            useSuspense: false
        }
    });

// Function to update document direction and language
export const updateDocumentDirection = (lang) => {
    const isRTL = lang === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Store in localStorage
    localStorage.setItem('lang', lang);
};

// Initial setup - set direction based on current language
updateDocumentDirection(i18n.language || 'en');

// Listen for language changes
i18n.on('languageChanged', (lang) => {
    updateDocumentDirection(lang);
});

export default i18n;
