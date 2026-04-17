# TILANNEKATSAUS - 17.4.2026 (Valuuttalaajennus ja Pystysuunnan lukitus)

## 🚀 Status: Addiction Ticker v1.3.0 - VALMIS JA PUSHATTU

Tänään olemme toteuttaneet erittäin onnistuneen kokonaisuuden, joka valmistelee Addiction Tickerin laajempaan kansainväliseen levitykseen ja ratkoo tärkeän UI-bugin.

### ✅ Tehdyt toimenpiteet ja uudet ominaisuudet:

1. **Uusien valuuttojen implementointi (Kohdennetut markkinat)**
   - Lisättiin uudet tulovirtoja avaavat lokaalit `i18n.ts`-konfiguraatioon:
     - 🇨🇦 CAD (Kanadan dollari)
     - 🇦🇺 AUD (Australian dollari)
     - 🇳🇿 NZD (Uuden-Seelannin dollari)
     - 🇨🇭 CHF (Sveitsin frangi)
     - 🇲🇽 MXN (Meksikon peso)
   - Konfiguroitu `CURRENCY_LOCALE_MAP` tukemaan absoluuttisen täydellistä esitystapaa kullekin (`es-MX`, `en-CA`, `de-CH` jne.).

2. **Natiivitason pystysuunnan lukitus (iOS App)**
   - Muokattiin Applen natiivitiedostoa `ios/App/App/Info.plist`.
   - Vaakasuuntien tuet (`LandscapeLeft`, `LandscapeRight`) poistettiin kokonaan, joka poistaa mahdollisuuden kääntää iOS-совellusta vahingossa vinoon (orientation lock).

3. **Weppisovelluksen pystysuunnan pakotus (PWA/Web)**
   - Luotiin tyylikäs Glassmorphism-peittokuva `PortraitLock.tsx`.
   - Kohdennettiin CSS-älyllä (`max-height: 500px` & `landscape`) estämään lukituksella tablettien ja tietokoneiden virheelliset estot. Vain vaakatasossa selattavat matkapuhelimet näkevät "Please rotate your device" -animoidun lukituksen.

4. **Kansio- ja lukituskorjaukset (GitHub Build Fix)**
   - Versionumero nostettiin 1.3.0:aan.
   - Puskettiin `package-lock.json` takaisin synkkaan komennolla `npm i`, mikä korjasi GitHub Actionsin `npm ci` -komennon kaatumisen.
   - Build-putki (TestFlight Upload) rullaa vihreänä.

### 📋 Miten jatketaan?
- Versio 1.3.0 odottaa App Store Connectin valmistumista ja nousee pian TestFlightiin.
- Jälleen uusi etappi ja valmiimpi ohjelmisto!

---
*Projekti: Addiction Ticker | Sijainti: src/components/OnboardingWelcome.tsx*
