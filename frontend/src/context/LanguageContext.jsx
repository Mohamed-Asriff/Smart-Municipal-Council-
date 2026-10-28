import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  
  const t = (key) => {
    // Basic nested key resolver (e.g. 'nav.services')
    return key.split('.').reduce((obj, k) => (obj || {})[k], translations[lang]) || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dict: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);