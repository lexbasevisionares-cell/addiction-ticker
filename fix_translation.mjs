import fs from 'fs';

const translations = {
  fi: "Näytä parametrit",
  en: "Show parameters",
  es: "Mostrar parámetros",
  de: "Parameter anzeigen",
  fr: "Afficher les paramètres",
  it: "Mostra parametri",
  pt: "Mostrar parâmetros"
};

let i18nSrc = fs.readFileSync('src/utils/i18n.ts', 'utf8');

for (const [lang, text] of Object.entries(translations)) {
  const regex = new RegExp(`(  ${lang}: \\{[\\s\\S]*?shareCardDownloadBtn:[^\\n]+,)`, 'm');
  i18nSrc = i18nSrc.replace(regex, `$1\n    shareCardShowMath: '${text}',`);
}

fs.writeFileSync('src/utils/i18n.ts', i18nSrc);
console.log("Added shareCardShowMath to i18n.ts");

let modalSrc = fs.readFileSync('src/components/ShareCardModal.tsx', 'utf8');
modalSrc = modalSrc.replace('Näytä parametrit', '{T.shareCardShowMath || \'Näytä parametrit\'}');
fs.writeFileSync('src/components/ShareCardModal.tsx', modalSrc);
console.log("Updated ShareCardModal.tsx");
