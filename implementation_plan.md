# Addiction Ticker: Global Expansion (v1.1)

Tämä on analyyttinen suunnitelma Addiction Ticker -sovelluksen kansainvälistämisestä. Suunnitelma jakautuu kahteen osaan: App Store Connectin hallinnollisuuksiin (miten asiat hoidetaan Applen päässä) ja itse koodin arkkitehtuuriin.

## 1. App Store Connect & Uudet Kuvat (Miten prosessi etenee?)

Sinun **ei tarvitse** julkaista täysin uutta sovellusta. Applen App Store tukee lokalisointia suoraan olemassa olevassa sovelluksessa (sama Bundle ID `com.lexbase.addictionticker`).

Tässä on marssijärjestys:
1.  **Tekninen toteutus:** Koodaamme yhdessä englannin kielen ja valuuttavalinnat (`v1.1`).
2.  **TestFlight:** Pusken päivityksen automaation kautta TestFlightiin.
3.  **Kuvakaappauksien ottaminen:**
    *   Avaat sovelluksen omalla iPhonellasi.
    *   Vaihdat sovelluksen asetuksista kieleksi "English" ja valuutaksi (esim. "$ USD").
    *   Otat täsmälleen samat näytönkaappaukset kuin teit suomenkieliselle versiolle (esim. Onboarding, Dashboard, Settings).
4.  **App Store Connect:**
    *   Lisäät sovelluksesi metadata-osioon uuden lokaation: **English (US)** tai **English (UK)** (yleensä US on hyvä globaali standardi).
    *   Tämä avaa sinulle uuden "välilehden", joka on täysin tyhjä.
    *   Lataat uudet englanninkieliset kuvakaappaukset vain tälle englannin välilehdelle.
    *   Kirjoitat (tai annan tekoälyn kirjoittaa) tarvittavat englanninkieliset myyntitekstit, otsikot ja hakusanat (keywords).
5.  **Julkaisu:** Lähetät päivityksen Applen tarkastukseen. 

Kun amerikkalainen avaa App Storen, Apple huomaa hänen puhelimensa asetuksista "English" ja näyttää hänelle englanninkieliset kuvat ja tekstit. Kun suomalainen avaa Storen, hänelle näytetään suomenkieliset.

## 2. Koodin Arkkitehtuurisuunnitelma (Refaktorointi)

Projektin arkkitehtuurilinjausten mukaisesti vältämme raskaiden kolmannen osapuolen i18n-kirjastojen (kuten `react-i18next`) asentamista. Rakennamme minimalistisen ratkaisun integroitumalla nykyiseen `UserSettings`-tilaan. 

> [!WARNING]
> **Kriittiset puutteet alkuperäisessä ajattelussa (Korjattu suunnitelmaan):**
> 1. **`App.tsx` tuhoaa kieliasetuksen:** Aiemmin rakensimme `App.tsx`:ään siivouslogiikan, joka tuhoaa `language`-avaimen `localStorage`:sta pakottaakseen sovelluksen suomeksi. Tämä logiikka on kumottava.
> 2. **`notifications.ts` ja tausta-ajot:** Lähdekoodissa `notifications.ts` sisältää kymmeniä kovakoodattuja suomenkielisiä lauseita (`FREE_HOURLY_MESSAGES` jne.). Koska notifikaatiot ajetaan pääosin Reactin ulkopuolella (osana Capacitor-backgrudia), React Hook (`useI18n`) ei toimi täällä. Meidän on siirrettävä notifikaatioiden tekstit `i18n.ts`-käännöskirjastoon ja vietävä aktiivinen kieli parametrina funktioille.
> 3. **Piilotettu kovakoodaus (Settings.tsx & WheelPicker.tsx):** Eilen löytyi massiivinen miina: `Settings.tsx` luo omia `new Intl.NumberFormat('fi-FI')` -olioita ja ohittaa täysin meidän keskitetyn `formatCurrency`-funktion. Lisäksi `WheelPicker.tsx` (rulla-elementti) saa kovakoodatun `locale="fi-FI"` propin, mikä tarkoittaa että englanninkielinen rulla näyttäisi pisteen sijasta edelleen pilkkua! Näiden on pakko lukea globaalia tilaa.

> [!CAUTION]
> **Kolmannen tiukan katselmoinnin (Deep Dive) löydökset (Lisätty suunnitelmaan):**
> * **Saavutettavuus (VoiceOver luku):** `index.html` on tällä hetkellä kovakoodattu tilaan `<html lang="en">` (Viten oletus). Jos jätämme sen näin, iPhonen VoiceOver yrittää ääntää suomea englannin säännöillä. Meidän on rakennettava `I18nContext` päivittämään `document.documentElement.lang` dynaamisesti aina kun kieli vaihtuu.
> * **Kellonajan muoto (12h vs 24h):** App.tsx asettaa kellon oletukseksi aina `24h`. Kun siirrymme Yhdysvaltain markkinoille, oletuksen kielelle 'en' tulee olla `12h` (AM/PM). Muuten Onboarding tuottaa ärsytystä.
> * **App Store Connect Primary Language:** Kun julkaisemme 'English (US)', meidän on todennäköisesti muutettava App Store Connectista sovelluksen *Primary Language* suomesta englantiin. Muussa tapauksessa, jos esimerkiksi saksalainen lataa sovelluksen, Apple tiputtaa hänet "Primary"-kieleen, joka on tällä hetkellä Suomi! Yhdysvaltain englanti täytyy asettaa kansalliseksi The Fallbackiksi.

> [!CAUTION]
> **Neljännen ja Viidennen katselmoinnin pommit - Laaja 'EUR' ja Suomen kielen kovakoodaus! (Lisätty suunnitelmaan):**
> Kiitos äärimmäisestä painostuksesta, löysin juuri pahimman ongelman kaikista. Jos olisimme seuranneet aiempia ohjeita, sovelluksen tärkein hetki – eli ensiluokkainen Onboarding-animaatio (`OnboardingWelcome.tsx`) – olisi jäänyt 100% suomenkieliseksi ja näyttänyt poikkeuksetta euroja! Kaikki lauseet kuten *"Mitä nikotiiniriippuvuutesi todella maksaa?"* ja *"50 vuotta: 146 000 €."* on tuolla tiedostossa tällä hetkellä staattisena tekstinä! Lisäksi `Settings.tsx`, `Onboarding.tsx` ja `notifications.ts` sisältävät tällä hetkellä kutsuja tyyliin `getCurrencySymbol('EUR')` ja `locale="fi-FI"`. Kaikki tämä on välittömästi eristettävä ja siirrettävä Contextin ohjattavaksi. Tämä paljasti globaalin hardkoodaus-ongelman, jonka purkamisesta tehtiin nyt prioriteetti 1.

### Ehdotetut muutokset (Tiedostot)

#### [MODIFY] `src/utils/i18n.ts`
- Siirretään staattinen `export const t` dynaamiseksi funktioksi `export function getTranslations(lang: Language)`.
- Päivitetään `formatCurrency` vastaanottamaan kieli (lang), jotta voimme käyttää validia Intl.NumberFormat -aluetta (esim. `lang === 'en' ? 'en-US' : 'fi-FI'`).
- Muutetaan `Currency` symbolin sijoittelu järkeväksi: Englannissa valuutta tulee numeron eteen (`$100.00`), suomessa taakse (`100,00 €`).
- Siirretään `notifications.ts`:n kovakoodatut viestit tänne käännösavaimiin.

#### [MODIFY] `src/App.tsx`, `src/components/Onboarding.tsx` & `src/components/OnboardingWelcome.tsx`
- **Poistetaan** `App.tsx`:stä rivit, jotka pakottavat poistamaan `parsedSettings.language`-avaimen lokerosta.
- Muutetaan alustuslogiikka niin, että jos laitteen kieli on englanti, oletuskellonaika asettuu kokoon `12h`.
- Lisätään Onboarding-vaiheeseen kielen ja valuutan valinta, oletuksena laitteen selaimen kieli.
- **Puretaan kovakoodatut lokaalit:** `Onboarding.tsx` sisältää viittaukset `getCurrencySymbol('EUR')` ja `locale="fi-FI"`. Nämä muutetaan dynaamisiksi.
- **Päivitetään OnboardingWelcome.tsx:** Siirretään staattinen `PHASES`-taulukko funktio- tai memo-pohjaiseksi koodiksi, joka hakee lauseet `t`-objektista ja rakentaa stringit dynaamisesti valitun valuutan symbolilla. Päivitetään myös `redValue.toLocaleString('fi-FI')` dynaamiseen Intl-kutsuun.

#### [NEW] `src/context/I18nContext.tsx`
- Luodaan React Context, jotta voimme hakea komponentti-puun sisällä kielen kätevästi `const { t, currency, language } = useI18n()` hookilla. Tämä vähentää prop-drillausta dramaattisesti.
- **Rakenne:** Context -providerin sisällä sidotaan `useEffect` päivittämään `document.documentElement.lang = language`, jolloin HTML dom seuraa mukana ja saavutettavuus-API toimii.


#### [MODIFY] `src/utils/notifications.ts`
- Muutetaan `scheduleMotivationPlan` hakemaan oikeat tekstit `getTranslations(settings.language)` -funktion avulla. Tämä on ainut tapa lokalisoida taustalla pyörivät prosessit.

#### [MODIFY] `src/components/Settings.tsx` & `WheelPicker.tsx`
- Palautetaan asetusvalikkoon Kielivalinta ja Valuuttavalinta, jotta myöhemmät muutokset ovat mahdollisia.
- **Puretaan kovakoodatut valuutat & lokaalit:** Vaihdetaan `Settings.tsx`:n kovakoodatut `new Intl.NumberFormat('fi-FI')` ja erillinen myrkky: `getCurrencySymbol('EUR')` käyttämään keskitettyä kontekstia.
- **Päivitetään** `WheelPicker.tsx` vastaanottamaan oikea locale dynaamisesti (pilkku Suomeksi, piste Englanniksi).

## User Review Required

> [!WARNING]
> Käännökset pitää tuottaa ohjelmallisesti. Haluan käydä läpi kaksi käännöstaktiikkaa:
> 1. Käännän kaikki nykyiset 75 tekstiavainta (ml. tarkat talousasiantuntija-vibat) **suoraan ensimmäisellä yrityksellä** parhaaseen mahdolliseen natiivitason Business Englantiin.
> 2. Vai haluatko tuottaa tiettyihin avainteksteihin omat käännökset?
> 
> *Ehdotan, että minä teen laadukkaan ensivedoksen ja saat myöhemmin säätää niitä, jos haluat.*

> [!IMPORTANT]
> Oletko valmis siihen, että korvaan satoja yksittäisiä rivejä useissa komponenteissa siirtyäksemme staattisesta `i18n`:stä joustavaan React Contextiin? Se on hieman iso refaktorointi, mutta välttämätön, jos haluamme pitää sovelluksen kevyenä ilman ylimääräisiä riippuvuuksia!

---
## Hyväksyntä
Voimme aloittaa välittömästi, kun olet hyväksynyt tämän suunnitelman! Kirjoita vain "Hyväksytty".
