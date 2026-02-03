import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '../ui/button';

export default function LanguageSwitcher({ variant = 'default', className = '' }) {
    const { i18n } = useTranslation();

    const currentLang = i18n.language;
    const isArabic = currentLang === 'ar';

    const toggleLanguage = () => {
        const newLang = isArabic ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };

    if (variant === 'minimal') {
        return (
            <button
                onClick={toggleLanguage}
                className={`flex items-center gap-1.5 text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--brand-accent)] transition-colors ${className}`}
                aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
            >
                <Globe className="w-4 h-4" />
                <span>{isArabic ? 'EN' : 'عربي'}</span>
            </button>
        );
    }

    return (
        <Button
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className={`bg-transparent border-white/20 hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)] gap-1.5 ${className}`}
            aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <Globe className="w-4 h-4" />
            <span>{isArabic ? 'EN' : 'عربي'}</span>
        </Button>
    );
}
