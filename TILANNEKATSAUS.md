# 📈 Addiction Ticker — Tilannekatsaus

> **Tekoäly: Lue tämä tiedosto AINA jokaisen uuden keskustelun aluksi.**
> Näin konteksti säilyy katkeamattomana. Päivitä tämä aina kun virstanpylväs saavutetaan tai suunnitelma muuttuu.

---

## ⚠️ Tärkeää kontekstia tekoälylle

- **Käyttäjä on koodausnoviisi** — tekoäly tekee KAIKKI tekniset muutokset (koodaus, git, build, deploy). Käyttäjä testaa puhelimessa ja antaa palautetta.
- **Kommunikointikieli on SUOMI.** Vastaa aina suomeksi.
- **Projektin kansio:** `C:\Users\Touko Aunio\.gemini\antigravity\scratch\addiction_ticker`

---

## 🎯 Projekti lyhyesti

**Addiction Ticker** on iOS-natiiviapplikaatio (Capacitor + React/Vite), joka visualisoi reaaliajassa riippuvuuden taloudellisen hinnan ja vapautumisen tuoman säästö-/sijoituspotentiaalin. Sovellus on premium-luokan, minimalistinen "Swiss style" -työkalu, täysin suomenkielinen ja 100 % offline.

- **Bundle ID:** `com.lexbase.addictionticker`
- **Tekniikka:** Vite + React + TypeScript + TailwindCSS v4 + Capacitor 8 (SPM, ei CocoaPods)
- **Xcode-projekti:** `ios/App/App.xcodeproj` (ei xcworkspace, koska SPM)
- **Julkaisuputki:** GitHub Actions (`ios-build.yml`) → macOS-runner → xcodebuild → altool → App Store Connect
- **GitHub-repo:** `lexbasevisionares-cell/addiction-ticker` (Public)
- **Netlify (visuaalinen testaus):** `https://addictionticker.netlify.app/` — raahaa `dist/`-kansio Netlifyyn
- **📱 TestFlight-ohje:** Koko asennusprosessi dokumentoitu tiedostossa [`TESTFLIGHT_OHJE.md`](./TESTFLIGHT_OHJE.md)

### 🔄 Deployaus-työnkulku
1. Tekoäly tekee muutokset koodiin
2. `npm run build` → luo `dist/`-kansion
3. **Nopea testaus:** Raahaa `dist/` Netlifyyn → käyttäjä testaa selaimessa puhelimella
4. **iPhone-testaus:** `git add -A && git commit && git push` → GitHub Actions buildaa automaattisesti → ~10 min → uusi versio TestFlightissa
5. Käyttäjä avaa TestFlight-app iPhonessa → päivittää → testaa

---

## 🏆 VIRSTANPYLVÄS: Sovellus asennettu iPhoneen! (6.4.2026)

**Addiction Ticker on onnistuneesti asennettu käyttäjän iPhoneen TestFlightin kautta!**

- ✅ Ensimmäinen onnistunut build: #16 (6.4.2026)
- ✅ Viimeisin onnistunut build: commit `c4aec65` (7.4.2026) — layout-korjaus + infotekstikorjaukset
- ✅ Sovellus ladattu App Store Connectiin (Version 1.0)
- ✅ Encryption compliance automatisoitu (`ITSAppUsesNonExemptEncryption = false` lisätty Info.plistiin)
- ✅ Testaajaryhmä "Testaajat" luotu, käyttäjä kutsuttu
- ✅ Sovellus asennettu ja testattu TestFlightin kautta iPhonessa

---

## 📋 Viimeisimmät muutokset (7.4.2026)

### 🔧 Kriittinen layout-bugikorjaus (commit c4aec65)
- **Ongelma:** Onboarding-näkymän navigaatinapit ("Seuraava") eivät näkyneet Capacitorin WKWebView:ssä iPhonessa. Selaimessa kaikki toimi.
- **Juurisyy:** `Onboarding.tsx` ja `OnboardingWelcome.tsx` käyttivät `h-[100dvh]`, joka kilpaili `App.tsx`:n `h-[100dvh] overflow-hidden` -kontainerin kanssa. Capacitorin WKWebView käsittelee viewport-yksiköitä eri tavalla kuin Safari.
- **Korjaus:** Molemmat komponentit muutettu käyttämään `h-full` → perivät korkeuden parentilta. `OnboardingWelcome.tsx`:stä poistettu myös `fixed inset-0`, korvattu `relative`-positioinnilla.
- **Tiedostot:** `Onboarding.tsx`, `OnboardingWelcome.tsx`
- **⚠️ OPPI:** Capacitor-sovelluksessa komponenttien tulee käyttää `h-full` eikä `h-[100dvh]` kun ne ovat `App.tsx`:n sisällä. `App.tsx` on ainoa paikka, jossa `h-[100dvh]` pitäisi olla.

### 📝 Infotäppätekstien auditointi (commit c4aec65)
- **8 metriikkaselitystä** (`i18n.ts`) kirjoitettu uudelleen 100% matemaattisesti täsmällisiksi
- **Kriittinen korjaus:** "Piilokulu" → "Menetetty varallisuus" — vanha teksti väitti ettei sisällä suoria kuluja, mutta näytetty luku (`totalForecast`) sisälsi ne
- **2 "Miten tämä toimii?" -modaalitekstiä** (koukussa-tila) korjattu
- **Tiedostot:** `src/utils/i18n.ts`

### UI-hionta (commit 4ae2333, aiemmin samana päivänä)
- **Onboarding-layout:** Siirrytty `absolute`-positioinnista yhtenäiseen `flex-col` -rakenteeseen (Top/Middle/Bottom -osiot)
- **OnboardingWelcome:** Decision-vaiheen optimointi, `justify-evenly` tilankäyttöön
- **SideDrawer:** Safe area -padding lisätty, otsikko "ASETUKSET" → "VALIKKO"

### Symmetrinen UI (commit 120167e, aiemmin samana päivänä)
- **Koukussa-tila** sai reaaliaikaiset luvut ja toggle-dashboardin (samanlainen kuin vapaa-tila)
- **Koukussa-laskuri** alkaa nollasta, empaattinen selitys miksi

---

## 🏁 Valmiit ominaisuudet & Tehdyt päätökset

### Kieli & Lokalisointi
- Sovellus on **täysin suomenkielinen**. Kaikki i18n-vaihtologiikka, kielenvaihto-UI ja käyttäjän muokattavat alueasetukset (valuutta, kellonaika) on poistettu.
- Käännökset ovat staattisesti `src/utils/i18n.ts`:ssä, `export const t = TRANSLATIONS.fi`.

### Design & UI
- Minimalistinen, premium "Swiss style" (tumma teema `#050505`).
- Dashboardin **Master Header -toggle** selkeytetty erottamaan näkymän valinta ("Saavutettu jo" vs "Ennuste") datasta.
- Asetusvalikko yksinkertaistettu, ylimääräiset kuvaukset karsittu.
- **Motivaatiotason valinta** (`WheelPicker`) fiksattu sallimaan vain kokonaisluvut 0–3 selkeillä teksti-labeleilla.
- **Onboarding-flow** (Welcome → WheelPicker-kysymykset → Status → Päivämäärävalinta) on viimeistelty.
- **iPhone safe area (notch / Dynamic Island):** CSS `env(safe-area-inset-*)` lisätty — sisältö ei mene kameran alle.
- **Onboarding-layout:** Unified flex column (3 osiot: Top/Middle/Bottom), kaikki näkyy kaikilla laitteilla.
- **Dashboard-layout:** Skrollaus estetty, kaikki sisältö mahtuu yhdelle näytölle (`h-[100dvh] overflow-hidden` App.tsx:ssä).
- **ForecastSlider:** Lisätty reunapaddingt, slider-pallo ei enää leikkaudu oikeasta reunasta.
- **Infotäppätekstit:** Kaikki 8 metriikkaselitystä auditoitu ja hiotu täsmällisiksi (7.4.2026).

### Matematiikka & Logiikka
- **50ms päivityssykli** talouslukuihin → "elävä" dashboard-tunne.
- **"Secured Future Value"** korkoa korolle -kaava korjattu huomioimaan kasvu lopettamispäivästä lähtien.
- Varmistetun ("Saavutettu") ja potentiaalisen ("Ennuste") käyrien renderöinti eriytetty matemaattisesti.

### iOS-julkaisuputki — ✅ TOIMII
- GitHub Actions (`ios-build.yml`) kääntää ja lähettää sovelluksen automaattisesti jokaisella `git push`:lla.
- Build-numero kasvaa automaattisesti (`github.run_number`).
- Kaikki 10 GitHub Secretiä on asetettu ja toimivat.
- Encryption compliance automatisoitu Info.plistissä (`ITSAppUsesNonExemptEncryption = false`) — ei vaadi manuaalista hyväksyntää App Store Connectissa.
- Sertifikaatti: Apple Distribution (voimassa 5.4.2027 asti)
- Provisioning Profile: AddictionTicker_AppStoreProfile (voimassa 2.4.2027 asti)
- API-avain: GitHubActions (Key ID: 4U3VFJSD6H)

### Komponenttirakenne
| Komponentti | Kuvaus |
|---|---|
| `App.tsx` | Pää-reititin, tilan hallinta, `h-[100dvh] overflow-hidden` root |
| `Ticker.tsx` | Dashboard: ajastin, säästö, sijoitusennusteet |
| `FinancialChart.tsx` | Recharts-kaavio (Secured/Potential) |
| `Settings.tsx` | Asetukset, aloitusajan muokkaus, reset |
| `Onboarding.tsx` | Asennusvelho (WheelPicker-kysymykset), `h-full` flex layout |
| `OnboardingWelcome.tsx` | Tervetuloruutu, narratiivi + decision, `h-full` flex layout |
| `OnboardingStatusScreen.tsx` | "Mikä on tilanteesi?" -valinta |
| `WheelPicker.tsx` | Mukautettu numeerinen/teksti-pyöritin |
| `CircularSlider.tsx` | Ennusteen aikajanasäädin |
| `SideDrawer.tsx` | Asetukset-sivupaneeli (safe area -tuettu) |
| `InfoModal.tsx` | "Miten tämä toimii?" -info |
| `SlideToConfirm.tsx` | Liu'uta-vahvistus kriittisiin toimiin |
| `InvestConfirmBanner.tsx` | Sijoitussiirron vahvistus |
| `ConfirmActionModal.tsx` | Yleinen vahvistusmodaali |
| `TimerDisplay.tsx` | Päivä/tunti/min/sek -ajastin |
| `ForecastSlider.tsx` | Ennusteen vuosi-slider |

---

## 🚧 Seuraava päätavoite: App Store -julkaisu

Sovellus on nyt TestFlightissa ja UI on hiottu. Seuraavat askeleet kohti julkista App Store -julkaisua:

### 📋 Puuttuvat App Store -vaatimukset

| Vaatimus | Status | Huomio |
|---|---|---|
| Kuvakaappaukset (6.7" + 5.5" iPhone) | ❌ Ei tehty | Otetaan iPhonesta TestFlight-version kautta |
| Tietosuojakäytäntö-URL (Privacy Policy) | ❌ Puuttuu | Luodaan esim. privacy.html Netlifyyn |
| Ikäluokitus (Age Rating) | ❌ Ei täytetty | Täytetään App Store Connectissa |
| Arvioijan yhteystiedot (App Review Info) | ❌ Ei täytetty | Nimi, puhelin, sähköposti |
| App Review -muistiinpanot | ❌ Ei kirjoitettu | Selitetään natiivit ominaisuudet & offline |
| App Store -kuvaus ja avainsanat | ❌ Ei kirjoitettu | Tekoäly voi auttaa |

### ⚠️ Applen Guideline 4.2 -hylkäysriski (20–30 %)
Apple voi hylätä Capacitor-pohjaisen sovelluksen "uudelleenpaketoituna verkkosivuna". Eduksemme puhuvat: natiivit ilmoitukset, 100 % offline, monimutkainen korkoa korolle -logiikka, sujuvat animaatiot, paikallinen tallennus. Riskiä vastaan: ei kameraa/GPS:ää, teknisesti WKWebView. Valmistaudumme vastaamaan Applen arvioon selittämällä natiivit ominaisuudet.

### ⚠️ SDK-varoitus (ei-kriittinen)
Apple ilmoitti, että 28.4.2026 jälkeen vaaditaan iOS 26 SDK (Xcode 26). Nykyinen build käyttää iOS 18.5 SDK:ta. Tämä on korjattava ennen tuota päivämäärää, mutta ei estä nykyistä TestFlight-testausta eikä App Store -julkaisua ennen tuota päivää.

---

## 👣 Seuraavat askeleet (järjestyksessä)

1. **~~Hioa sovelluksen UI:ta ja toiminnallisuutta~~** — ✅ Tehty (7.4.2026)
2. **~~Infotäppätekstien auditointi~~** — ✅ Tehty (7.4.2026)
3. **Ota App Store -kuvakaappaukset iPhonesta** kun UI on valmis. *(käyttäjä tekee)*
4. **Luo tietosuojakäytäntösivu** (privacy.html). *(tekoäly voi tehdä)*
5. **Kirjoita App Store -metatekstit** (kuvaus, avainsanat, review-muistiinpanot). *(tekoäly voi tehdä)*
6. **Täytä App Store Connectin metatiedot** (ikäluokitus, arvioijan tiedot, kuvat). *(käyttäjä tekee, tekoäly opastaa)*
7. **Lähetä sovellus Applen arvioitavaksi** (Submit for Review). *(käyttäjä tekee)*

---

## 🏛️ Arkkitehtuuripäätökset (ei muuteta ilman keskustelua)

- **Ei pilveä/palvelinta:** Kaikki tieto localStorage:ssa, 100 % offline.
- **Ei i18n-frameworkia:** Staattiset suomenkieliset käännökset `i18n.ts`:ssä.
- **Capacitor 8 + SPM:** Ei CocoaPods-riippuvuutta, ei `pod install` -vaihetta.
- **GitHub Actions ilman Macia:** Koko iOS-build tapahtuu `macos-latest` runnerilla.
- **Hinta:** Premium-hinnoittelu (sovittu aiemmin).
- **Valuutta:** EUR (ei vaihdettavissa).
- **Viewport-käyttö:** `h-[100dvh]` VAIN `App.tsx`:ssä, kaikki muut komponentit käyttävät `h-full`.

---

## 🔑 Tärkeät tunnisteet ja avaimet (muistiin)

| Tieto | Arvo |
|---|---|
| Bundle ID | `com.lexbase.addictionticker` |
| Team ID | `P2DXDN482G` |
| App Store Connect App ID | `6761534960` |
| API Key ID | `4U3VFJSD6H` |
| API Key Issuer ID | `36256fe9-6402-4abf-9590-ab2971fc09aa` |
| Provisioning Profile nimi | `AddictionTicker_AppStoreProfile` |
| Sertifikaatin voimassaolo | 5.4.2027 asti |
| Profiilin voimassaolo | 2.4.2027 asti |
| TestFlight-buildin vanheneminen | 5.7.2026 (90 päivää) |

---

*Viimeksi päivitetty: 7. huhtikuuta 2026, klo 12:41*
