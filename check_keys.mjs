import fs from 'fs';

const src = fs.readFileSync('src/utils/i18n.ts', 'utf8');

// Extract each language block more carefully using balanced brace matching
const languages = ['fi', 'en', 'es', 'de', 'fr', 'it', 'pt'];
const allKeys = {};

for (const lang of languages) {
  const startPattern = new RegExp(`\\n  ${lang}: \\{`);
  const startMatch = startPattern.exec(src);
  if (!startMatch) {
    console.log(`ERROR: Could not find language block for '${lang}'`);
    continue;
  }
  
  // Find the matching closing brace by counting braces
  let braceCount = 1;
  let i = startMatch.index + startMatch[0].length;
  while (i < src.length && braceCount > 0) {
    if (src[i] === '{') braceCount++;
    if (src[i] === '}') braceCount--;
    i++;
  }
  
  const block = src.slice(startMatch.index + startMatch[0].length, i - 1);
  
  // Extract keys (only lines that have key: value pattern, not comments)
  const keys = [];
  const keyRegex = /^\s+(\w+)\s*:/gm;
  let m;
  while ((m = keyRegex.exec(block)) !== null) {
    keys.push(m[1]);
  }
  allKeys[lang] = keys;
}

console.log("=== KEY COUNT PER LANGUAGE ===");
for (const lang of languages) {
  console.log(`  ${lang}: ${allKeys[lang]?.length || 0} keys`);
}

// Use fi as the reference
const fiSet = new Set(allKeys.fi);

console.log("\n=== COMPARISON VS FINNISH (reference) ===");
for (const lang of languages) {
  if (lang === 'fi') continue;
  const langSet = new Set(allKeys[lang]);
  const missing = [...fiSet].filter(k => !langSet.has(k));
  const extra = [...langSet].filter(k => !fiSet.has(k));
  
  if (missing.length === 0 && extra.length === 0) {
    console.log(`  ${lang}: PERFECT MATCH ✅`);
  } else {
    if (missing.length > 0) console.log(`  ${lang}: MISSING keys: ${missing.join(', ')} ❌`);
    if (extra.length > 0)   console.log(`  ${lang}: EXTRA keys: ${extra.join(', ')} ⚠️`);
  }
}

// Also verify the other files
console.log("\n=== UI FILE CHECKS ===");

const settingsSrc = fs.readFileSync('src/components/Settings.tsx', 'utf8');
const onboardingSrc = fs.readFileSync('src/components/Onboarding.tsx', 'utf8');
const appSrc = fs.readFileSync('src/App.tsx', 'utf8');

for (const lang of languages) {
  const optionInSettings = settingsSrc.includes(`value="${lang}"`);
  const optionInOnboarding = onboardingSrc.includes(`value="${lang}"`);
  const detectedInApp = appSrc.includes(`'${lang}'`) || appSrc.includes(`"${lang}"`);
  
  console.log(`  ${lang}: Settings=${optionInSettings ? '✅' : '❌'}  Onboarding=${optionInOnboarding ? '✅' : '❌'}  App.tsx=${detectedInApp ? '✅' : '❌'}`);
}

// Check formatCurrency handles each lang
console.log("\n=== formatCurrency LOCALE HANDLING ===");
const formatSrc = src.match(/export function formatCurrency[\s\S]*?\n\}/)?.[0] || '';
for (const lang of languages) {
  const handled = formatSrc.includes(`'${lang}'`) || lang === 'en'; // en is the default fallback
  console.log(`  ${lang}: ${handled ? '✅ handled' : '❌ NOT handled'}`);
}
