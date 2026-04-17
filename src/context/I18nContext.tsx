import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Currency, formatCurrency, formatCurrencyHtml, getTranslations, TranslationStrings } from '../utils/i18n';

interface I18nContextType {
  language: Language;
  currency: Currency;
  t: TranslationStrings;
  formatCurrencyString: (value: number, fractionDigits?: number) => string;
  formatCurrencyHtml: (value: number, fractionDigits?: number) => string;
  setLanguage: (lang: Language) => void;
  setCurrency: (cur: Currency) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, initialLanguage, initialCurrency }: { 
  children: React.ReactNode, 
  initialLanguage: Language, 
  initialCurrency: Currency
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);

  useEffect(() => {
    setLanguageState(initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    setCurrencyState(initialCurrency);
  }, [initialCurrency]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const formatCurrencyString = (value: number, fractionDigits: number = 2) => {
    return formatCurrency(value, currency, language, fractionDigits);
  };

  const formatCurrencyHtmlFn = (value: number, fractionDigits: number = 2) => {
    return formatCurrencyHtml(value, currency, language, fractionDigits);
  };

  const t = getTranslations(language);

  return (
    <I18nContext.Provider value={{ language, currency, t, setLanguage: setLanguageState, setCurrency: setCurrencyState, formatCurrencyString, formatCurrencyHtml: formatCurrencyHtmlFn }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
