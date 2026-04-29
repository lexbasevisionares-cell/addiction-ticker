import fs from 'fs';
import path from 'path';

const src = fs.readFileSync('src/utils/i18n.ts', 'utf8');

// ── PHASE 1: Extract all keys per language ──
const lines = src.split('\n');
let currentLang = null;
const keys = {};
const values = {};

for (let line of lines) {
  const langMatch = line.match(/^  ([a-z]{2}): \{/);
  if (langMatch) {
    currentLang = langMatch[1];
    keys[currentLang] = [];
    values[currentLang] = {};
    continue;
  }
  if (currentLang) {
    if (line.match(/^  \},/)) { currentLang = null; continue; }
    const keyMatch = line.match(/^    ([a-zA-Z0-9_]+):\s*['"`](.*)['"`],?\s*$/);
    if (keyMatch) {
      keys[currentLang].push(keyMatch[1]);
      values[currentLang][keyMatch[1]] = keyMatch[2];
    }
  }
}

const langs = ['fi', 'en', 'es', 'fr', 'de', 'it', 'pt'];
const fiKeys = keys['fi'];
let hasErrors = false;

console.log('═══════════════════════════════════════════');
console.log('  PHASE 1: KEY COUNT & CROSS-CHECK');
console.log('═══════════════════════════════════════════');
console.log(`Reference (FI) has ${fiKeys.length} keys.\n`);

for (const l of langs) {
  if (l === 'fi') continue;
  const missing = fiKeys.filter(k => !keys[l].includes(k));
  const extra = keys[l].filter(k => !fiKeys.includes(k));
  if (missing.length === 0 && extra.length === 0) {
    console.log(`  ${l.toUpperCase()} (${keys[l].length} keys): PERFECT MATCH ✅`);
  } else {
    hasErrors = true;
    if (missing.length) console.log(`  ${l.toUpperCase()}: ❌ MISSING: ${missing.join(', ')}`);
    if (extra.length) console.log(`  ${l.toUpperCase()}: ⚠️  EXTRA: ${extra.join(', ')}`);
  }
}

// ── PHASE 2: Check for empty translations ──
console.log('\n═══════════════════════════════════════════');
console.log('  PHASE 2: EMPTY/BLANK TRANSLATIONS');
console.log('═══════════════════════════════════════════\n');

let emptyCount = 0;
for (const l of langs) {
  for (const k of keys[l]) {
    if (!values[l][k] || values[l][k].trim() === '') {
      console.log(`  ❌ ${l}.${k} is EMPTY`);
      emptyCount++;
      hasErrors = true;
    }
  }
}
if (emptyCount === 0) console.log('  All translations have content ✅');

// ── PHASE 3: Check {placeholder} consistency ──
console.log('\n═══════════════════════════════════════════');
console.log('  PHASE 3: PLACEHOLDER CONSISTENCY');
console.log('═══════════════════════════════════════════\n');

let placeholderIssues = 0;
for (const k of fiKeys) {
  const fiPlaceholders = (values['fi'][k] || '').match(/\{[a-zA-Z0-9_]+\}/g) || [];
  if (fiPlaceholders.length === 0) continue;
  
  for (const l of langs) {
    if (l === 'fi') continue;
    const langPlaceholders = (values[l][k] || '').match(/\{[a-zA-Z0-9_]+\}/g) || [];
    const fiSet = new Set(fiPlaceholders);
    const langSet = new Set(langPlaceholders);
    
    const missing = [...fiSet].filter(p => !langSet.has(p));
    const extra = [...langSet].filter(p => !fiSet.has(p));
    
    if (missing.length > 0 || extra.length > 0) {
      hasErrors = true;
      placeholderIssues++;
      if (missing.length) console.log(`  ❌ ${l}.${k}: MISSING placeholders: ${missing.join(', ')} (FI has: ${fiPlaceholders.join(', ')})`);
      if (extra.length) console.log(`  ⚠️  ${l}.${k}: EXTRA placeholders: ${extra.join(', ')}`);
    }
  }
}
if (placeholderIssues === 0) console.log('  All placeholders consistent across languages ✅');

// ── PHASE 4: Scan ALL .tsx/.ts files for hardcoded Finnish strings ──
console.log('\n═══════════════════════════════════════════');
console.log('  PHASE 4: HARDCODED STRINGS IN UI');
console.log('═══════════════════════════════════════════\n');

function getAllFiles(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      if (!fp.includes('node_modules')) getAllFiles(fp, list);
    } else if (fp.endsWith('.tsx') || (fp.endsWith('.ts') && !fp.includes('i18n.ts'))) {
      list.push(fp);
    }
  }
  return list;
}

// Finnish/UI keywords that should never be hardcoded
const suspicious = [
  'Näytä', 'Piilota', 'Esikatselu', 'Tallenna', 'Jaa tulos',
  'Vahvista', 'Peruuta', 'Muokkaa', 'Lopeta', 'Aloita',
  'Seuraava', 'Takaisin', 'Valmis', 'Aseta', 'Kieli',
  'Säästö', 'Kulut', 'Sijoitu', 'päivässä', 'vuodessa',
  'Asetukset', 'Valikko'
];

const files = getAllFiles('src');
let hardcodedCount = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const fileLines = content.split('\n');
  
  for (let i = 0; i < fileLines.length; i++) {
    const line = fileLines[i];
    // Skip comments and imports
    if (line.trim().startsWith('//') || line.trim().startsWith('import ') || line.trim().startsWith('*')) continue;
    
    for (const word of suspicious) {
      // Match hardcoded Finnish in JSX text or string literals
      if (line.includes(word) && !line.includes('||') && !line.includes('fallback')) {
        // Check if it's inside a string/JSX that is NOT a fallback
        const inString = line.match(new RegExp(`['"\`>].*${word}.*['"\`<]`));
        if (inString) {
          console.log(`  ⚠️  ${path.basename(file)}:${i+1}: "${word}" found: ${line.trim().substring(0, 100)}`);
          hardcodedCount++;
          break; // One warning per line is enough
        }
      }
    }
  }
}

if (hardcodedCount === 0) {
  console.log('  No suspicious hardcoded Finnish strings found ✅');
} else {
  console.log(`\n  Found ${hardcodedCount} potential hardcoded strings (review above)`);
}

// ── PHASE 5: Check that ALL t('key') calls have matching keys ──
console.log('\n═══════════════════════════════════════════');
console.log('  PHASE 5: UI → i18n KEY REFERENCES');
console.log('═══════════════════════════════════════════\n');

const fiSet = new Set(fiKeys);
let missingRefs = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Match T.keyName patterns (the way this codebase accesses translations)
  const regex = /T\.([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    if (!fiSet.has(key)) {
      console.log(`  ❌ ${path.basename(file)}: T.${key} — key NOT found in i18n.ts`);
      missingRefs++;
      hasErrors = true;
    }
  }
  // Also match t.keyName patterns
  const regex2 = /\bt\.([a-zA-Z][a-zA-Z0-9_]+)/g;
  while ((match = regex2.exec(content)) !== null) {
    const key = match[1];
    // Skip known non-translation properties
    if (['replace', 'split', 'includes', 'match', 'length', 'toString', 'trim'].includes(key)) continue;
    if (!fiSet.has(key)) {
      console.log(`  ❌ ${path.basename(file)}: t.${key} — key NOT found in i18n.ts`);
      missingRefs++;
      hasErrors = true;
    }
  }
}

if (missingRefs === 0) console.log('  All UI translation references resolve correctly ✅');

// ── SUMMARY ──
console.log('\n═══════════════════════════════════════════');
if (hasErrors) {
  console.log('  ❌ ISSUES FOUND — SEE ABOVE');
} else {
  console.log('  ✅ ALL CHECKS PASSED — TRANSLATIONS ARE 100% COMPLETE');
}
console.log('═══════════════════════════════════════════\n');
