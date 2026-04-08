
export type Currency = 'EUR' | 'USD' | 'GBP';
export type TimeFormat = '24h' | '12h';

export const TRANSLATIONS = {
  fi: {
    // Welcome
    welcomeHeadline: 'Jokainen sekunti on valinta.',
    welcomeSubheadline: 'Näe riippuvuutesi hinta — tai vapautesi arvo.',
    setYourNumbers: 'Aseta numerosi',
    // Status
    statusTitle: 'Mikä on tilanteesi juuri nyt?',
    statusNowTitle: 'Lopetan juuri nyt',
    statusNowDesc: 'Aika alkaa tästä hetkestä',
    statusPastTitle: 'Olen jo lopettanut',
    statusPastDesc: 'Aseta tarkka lopetusaika',
    statusHookedTitle: 'Käytän vielä',
    statusHookedDesc: 'Suunnittelen lopettamista',
    next: 'Seuraava',
    done: 'Valmis',
    back: 'Takaisin',
    // Questions
    qDailyCost: 'Kuinka paljon rahaa kuluu nikotiiniin päivässä?',
    qAnnualIncrease: 'Kuinka monta prosenttia arvioit hinnan nousevan vuosittain?',
    qExpectedReturn: 'Jos sijoittaisit osakemarkkinoille, minkälaista keskimääräistä vuotuista tuottoa odottaisit sijoituksillesi?',
    investReminderTitle: 'Siirtomuistutuksen kynnys',
    investReminderDesc: 'Milloin haluat muistutuksen varojen siirrosta?',
    basicSettings: 'Perusasetukset',
    otherSettings: 'Muut asetukset',
    // Ticker
    tickerHeader: 'Addiction Ticker',
    freeFor: 'Olet ollut vapaana',
    hookedStatus: 'Olet ollut koukussa',
    days: 'Päivää',
    hours: 'Tuntia',
    mins: 'Min',
    secs: 'Sek',
    since: 'Aloitit',
    shareBtn: 'Jaa tulos',
    resetCounter: 'Katkaise vapaa putki',
    quitAddiction: 'Lopeta riippuvuus',
    year: 'Vuosi',
    hookedFor: 'Koukussa',
    hookedYearsSuffix: 'vuotta',
    savedNow: 'Säästetty',
    lostNow: 'Kulutettu',
    directCost: 'Kulut',
    valueInYear: 'Sijoitettuna {year}',
    lostInvestment: 'Menetetty tuotto',
    indirectLoss: 'Menetetty varallisuus',
    timeline: 'Aikajana',
    years: 'Vuotta',
    potentialInYears: 'Sijoitusvarallisuus',
    potentialYearsSuffix: 'vuodessa',
    
    // Dashboard Card Labels (Free / Hooked)
    dashSaved: 'Käteistä säästynyt tähän mennessä',
    dashLost: 'Käytetty nikotiiniin tähän mennessä',
    dashInvested: 'Jo säästetty kasvaa {years} vuodessa',
    dashLostInvested: 'Tuo raha olisi kasvanut {years} vuodessa',
    dashPureSavings: 'Tulet säästämään {years} vuodessa',
    dashPureCosts: 'Tulet kuluttamaan {years} vuodessa',
    dashTotalWealth: 'Salkun arvo {years} vuoden kuluttua',
    dashLostWealth: 'Menetät varallisuutta {years} vuodessa',
    // Settings
    settingsTitle: 'Asetukset',
    menuTitle: 'Valikko',
    preferences: 'Kieli & Alue',
    languageLabel: 'Kieli',
    currencyLabel: 'Valuutta',
    timeFormatLabel: 'Kellonaikamuoto',
    howItWorks: 'Miten tämä toimii?',
    aboutApp: 'Tietoa sovelluksesta',
    edit: 'Muokkaa',
    save: 'Tallenna muutokset',
    startTime: 'Aloitusaika',
    currentPeriodStart: 'Nykyisen jakson alku',
    editStartTimeHint: 'Voit muokata aikaa, jolloin lopetit.',
    costs: 'Kulut',
    investing: 'Sijoittaminen',
    dailyCostLabel: 'Päivittäinen kulu',
    annualIncreaseLabel: 'Hinnan nousu',
    annualIncreaseDesc: 'Arvioitu vuosittainen hinnannousu (inflaatio/verot).',
    expectedReturnLabel: 'Tuotto-odotus',
    expectedReturnDesc: 'Kuinka paljon arvioit sijoitustesi tuottavan keskimäärin osakemarkkinoilla vuodessa?',
    settingsStatus: 'Tila',
    resetCounterDesc: 'Nollaa kello ja aloita säästäminen alusta. Tämä on tietoinen päätös hyväksyä repsahdus.',
    quitAddictionDesc: 'Lopeta riippuvuus tästä hetkestä alkaen ja aloita taloudellisen vapauden rakentaminen.',
    // Modals
    confirmQuit: 'Vahvista päätös',
    confirmQuitDesc: 'Tästä hetkestä eteenpäin en enää rahoita riippuvuuttani. Olen valmis kohtaamaan vieroitusoireet.',
    confirmRelapse: 'Oletko varma?',
    confirmRelapseDesc: 'Myönnän heikkouteni. Nollaan kellon tietoisesti ja hyväksyn, että alan taas kerryttää taloudellista tappiota.',
    slideToConfirm: 'Liu\'uta vahvistaaksesi',
    shareTextFree: 'Säästetty: {B}. Kasvupotentiaali: {D} ({E}v). Laske oma potentiaalisi:',
    shareTextHooked: 'Kulut {A} vuodessa: {G}. Millainen on sinun loppulaskusi?',
    linkCopied: 'Linkki ja teksti kopioitu leikepöydälle!',
    selectLanguage: 'Valitse kieli / Select Language',
    selectCurrency: 'Valitse valuutta / Select Currency',
    selectTimeFormat: 'Valitse kello / Select Time Format',
    // Info Modals
    infoLogicTitle: 'Miten tämä toimii?',
    infoLogicGeneral: 'Tämä laskuri perustuu kylmään matematiikkaan ja jakaa riippuvuutesi hinnan kahteen tasoon: suoraan rahanmenoon ja menetettyyn korkoa korolle -ilmiöön. Ihmismieli ei luonnostaan hahmota, miten pienet päivittäiset kulut kertaantuvat vuosikymmenten aikana. Siksi jaamme luvut menneisyyteen ("mitä on jo tapahtunut") ja tulevaisuuteen ("mitä tulee tapahtumaan valitulla aikajanalla").',
    
    // Free State Logic
    infoLogicFreeDesc1: 'Tämä on reaaliajassa kasvava summa puhtaasti sitä rahaa, jonka olet ehtinyt säästää lopettamispäätöksesi jälkeen. Luku toimii pesämunana kaikille tuleville laskelmille.',
    infoLogicFreeDesc2: 'Tämä arvioi, kuinka paljon puhdasta rahaa tulet säästämään haluamallasi aikajanalla asettamasi päiväkulutuksen perusteella. Luku huomioi myös markkinoiden arvioidun vuosittaisen hintojen nousun (esim. inflaatio tai veronkorotukset), mutta siihen ei ole laskettu mukaan sijoitustuottoja.',
    infoLogicFreeDesc3: 'Tämä on pelkän "tähän mennessä säästetyn" rahan tuottoennuste. Se näyttää armottomasti sen arvon, johon jo kädessäsi oleva raha voisi kasvaa valitulla aikajanalla ja tuotto-odotuksella, vaikka et enää säästäisi senttiäkään lisää.',
    infoLogicFreeDesc4: 'Tämä on ultimaattinen potentiaalisi. Summa laskee yhteen joka päivä säästyvän kassavirran ja sen päälle kertyvän raskaan korkoa korolle -tuoton. Tämä luku on se varallisuus, jonka rakennat ohjaamalla rahavirran teollisuudelta itsellesi. Luvut on laskettu ennen veroja.',

    // Hooked State Logic
    infoLogicHookedDesc1: 'Raha on alkanut valua käsistäsi siitä hetkestä lähtien, kun avasit tämän laskurin. Tämä on se armoton summa, jonka olet juuri nyt polttanut tai käyttänyt tuotteisiin seurannan aikana.',
    infoLogicHookedDesc2: 'Tämä on ennuste riippuvuuden suorista, rahallisista kuluista valitsemallasi aikajanalla. Siihen on upotettu arvioimasi tuotteiden vuosittainen hintojen nousu (inflaatio/verot), jotta ymmärrät, ettei paheesi hinta pysy paikallaan.',
    infoLogicHookedDesc3: 'Rakennat negatiivista varallisuutta. Tämä arvo näyttää heti kärkeen, millaiseksi summaksi "tähän mennessä kulutettu" rahasi olisi kasvanut markkinoilla, jos se olisi sijoitettu asettamallasi tuotto-odotuksella. Se on ensimmäinen vihje vaihtoehtoiskustannuksesta.',
    infoLogicHookedDesc4: 'Tämä on riippuvuutesi todellinen, kokonaisvaltainen loppulasku. Se yhdistää sekä säännöllisesti tuhlaamasi pääoman että niiden tuoman korkoa korolle -ilmiön, jonka menetät kokonaan. Lopullinen summa edustaa rahamäärää, jolla vapaaehtoisesti rahoitat toimialaa oman salkkusi sijaan.',

    infoLogicP1Title: 'Tähän asti',
    infoLogicP2Title: 'Tulevaisuus',
    infoHookedTimerTitle: 'Miksi laskuri alkaa nollasta?',
    infoHookedTimerP1: 'Tämä aika on laskettu siitä hetkestä, kun avasit tämän näkymän ensimmäistä kertaa.',
    infoHookedTimerP2: 'Sovellus on tietoisesti rakennettu niin, ettei se näytä sinulle sitä summaa, jonka olet mahdollisesti jo menettänyt aikaisempien vuosien aikana. Todennäköisesti se on jo merkittävä.',
    infoHookedTimerP3: 'Mutta läikkynyttä maitoa ei kannata itkeä. Tärkeintä on pitää katse niissä asioissa, joihin voit vielä vaikuttaa — ja juuri niitä tämä sovellus näyttää sinulle.',
    infoFreeTimerTitle: 'Vapautesi kesto',
    infoFreeTimerP1: 'Tämä kello laskee jokaista sekuntia, jonka olet pysynyt erossa addiktiostasi.',
    infoFreeTimerP2: 'Jokainen sekunti kasvattaa säästöjäsi ja vahvistaa uutta taloudellista tulevaisuuttasi.',
    infoFreeTimerP3: 'Aika on nyt puolellasi.',
    infoAboutTitle: 'Tietoa sovelluksesta',
    infoAboutP1: ' syntyi asenteesta: riippuvuus on vapaaehtoinen elinikäinen varallisuusvero.',
    infoAboutP2: 'Ihmismieli on kykenemätön hahmottamaan pienten päivittäisten kulujen kumuloituvaa, vuosikymmenten yli kurottavaa vaihtoehtoiskustannusta. Tämän sovelluksen ainut tarkoitus on muuttaa näkymätön hinta säälimättömän näkyväksi ja konkreettiseksi dataksi.',
    infoAboutP3: 'Tavoitteemme on kääntää psykologinen peliasetelma ympäri. Korvaamme kemiallisen pikatyydytyksen sillä pitkäaikaisella euforialla, joka iskee, kun tajuat reaaliajassa säästöllä rakentamasi taloudellisen vapauden määrän.',
    // Input Info Modals
    modalDailyCostTitle: 'Päivittäinen kulu',
    modalDailyCostDesc: 'Laske tähän keskimääräinen päivittäinen rahankulutuksesi tuotteeseen. Jos et osta tuotteita joka päivä, arvioi viikkokulutus ja jaa se seitsemällä. Tämä on laskurin tärkein pohjaluku.',
    modalAnnualIncreaseTitle: 'Hinnan nousu',
    modalAnnualIncreaseDesc: 'Tuotteiden hinta ei pysy paikallaan. Inflaatio ja jatkuvat veronkorotukset nostavat hintaa pitkällä aikavälillä tyypillisesti noin 5 % vuodessa. Tällä luvulla herätät itsesi ymmärtämään kulutuksesi tulevaisuuden hinnan.',
    modalExpectedReturnTitle: 'Tuotto-odotus',
    modalExpectedReturnDesc: 'Jos sijoittaisit säästyneet rahat laajasti osakemarkkinoille, kuinka paljon arvioisit niiden tuottavan? Esimerkiksi pörssin historiallinen keskituotto on usein pyörinyt noin 7–10 % tasolla. Jos olet epävarma, 7 % on realistinen pitkän aikavälin arvio.',
    modalInvestReminderTitle: 'Siirtomuistutuksen kynnys',
    modalInvestReminderDesc: 'Sovellus erottelee viisaasti "kertyvän käteisen" ja "sijoitetun pääoman". Kun siirrät kertyneen käteissumman fyysisesti tai digitaalisesti oikeaan salkkuusi, odottava käteissaldo nollaantuu. Tämä kynnys määrittää, milloin sovellus muistuttaa sinua tekemään kyseisen siirron.',
    modalMotivatorTitle: 'Tsempin taso',
    modalMotivatorDesc: 'Tämä määrittää, kuinka aggressiivisesti valmentaja muistuttaa sinua taloudellisista realiteeteistasi. Intensiivinen asetus pitää lukujen kylmän totuuden mielessäsi säännöllisesti, kun taas pois päältä kytketty antaa sinun tarkistaa luvut vain näytöltä.',
    // Info Metric Descriptions
    infoSavedNowDesc: 'Puhdas käteissäästö. Tämä on rahasumma, jonka olisit kuluttanut nikotiinituotteisiin lopettamishetkestä tähän sekuntiin mennessä.',
    infoLostNowDesc: 'Rahaa, jonka olet käyttänyt nikotiiniin siitä hetkestä lähtien, kun aloitit tämän laskurin. Luku perustuu asettamaasi päivittäiseen kuluun ja päivittyy reaaliajassa.',
    infoTotalSavedDesc: 'Puhdas käteissäästö koko aikajanan ajalta. Tämä on kokonaissumma rahasta, jota et kuluta nikotiiniin — huomioiden arvioimasi vuotuisen hinnannousun. Luku ei sisällä sijoitustuottoja.',
    infoDirectCostDesc: 'Ennuste nikotiiniin kuluvasta kokonaisrahasta asettamallasi aikajanalla. Laskelma huomioi arvioimasi vuotuisen hinnannousun.',
    infoValueInYearDesc: 'Korkoa korolle -ennuste. Näyttää, mihin arvoon tähän mennessä kertynyt säästösi kasvaisi valitulla aikajanalla ja tuotto-odotuksella — ilman uusia lisäsijoituksia. Luku on ennen veroja.',
    infoLostInvestmentDesc: 'Osoittaa, mihin arvoon tähän asti nikotiiniin kulutettu raha olisi kasvanut valitulla aikajanalla ja tuotto-odotuksella, jos olisit sijoittanut sen markkinoille. Luku on ennen veroja.',
    infoIndirectLossDesc: 'Kokonaisvarallisuus, jonka menetät jatkamalla. Luku sisältää sekä suoran rahanmenon nikotiiniin että menetetyn sijoitustuoton, jonka olisit voinut ansaita sijoittamalla saman rahan markkinoille. Luku on ennen veroja.',
    infoPotentialDesc: 'Arvioitu sijoitussalkkusi loppuarvo aikajanan lopussa. Summa sisältää sekä kertyvät käteissäästöt että niille lasketun korkoa korolle -tuoton. Luku on ennen veroja.',
    resetAllData: 'Nollaa kaikki tiedot',
    resetAllDataDesc: 'Poistaa välittömästi kaiken paikallisen datan ja nollaa sovelluksen tehdasasetuksiin. Toiminto on lopullinen.',
    viewSecured: 'Saavutettu jo',
    viewLostAlready: 'Menetetty jo',
    viewPotential: 'Ennuste {year}',
    timeIsMoney: 'Aika on rahaa.',
    totalSaved: 'Puhdas säästö',
    pendingTransfer: 'Odottaa siirtoa',
    confirmInvestTitle: 'Vahvista sijoitussiirto',
    confirmInvestDesc: 'Oletko siirtänyt kertyneet säästöt ({amount}) salkkuun? Tämä nollaa odottavan laskurin.',
    markAsInvested: 'Merkkaa sijoitetuksi',
    investSuccess: 'Hienoa! Säästöt turvattu salkkuun. 🚀',
    privacyTitle: 'Tietosuoja & Analytiikka',
    privacyDesc: 'Addiction Ticker on suunniteltu absoluuttista yksityisyyttä silmällä pitäen. Sovelluksessa ei ole ulkoisia tietokantoja, pilvisynkronointia tai kolmannen osapuolen seurantakoodeja. Kaikki syöttämäsi tiedot tallentuvat vain tämän laitteen paikalliseen muistiin. Taloudellinen vapautesi on vain sinun asiasi.',
    // Notifications & Tsemppi
    motivatorTitle: 'Talousvalmentaja & Ilmoitukset',
    motivatorLevel: 'Tsempin taso',
    motivatorDesc: 'Kuinka aktiivisesti haluat valmentajan pitävän sinut tavoitteessa lukujen avulla?',
    motivatorLevel0: 'Pois päältä',
    motivatorLevel1: 'Vain virstanpylväät',
    motivatorLevel2: 'Tasapainoinen',
    motivatorLevel3: 'Intensiivinen',
    notifWelcomeTitle: 'Tervetuloa valmennukseen',
    notifWelcomeBody: 'Laskenta on alkanut. Pysy vahvana, aika on nyt rahaa.',
    notifTimeTitle: '{msg} ⏳',
    notifTimeBody1: 'Olet ollut vapaana {days} päivää.',
    notifSavedTitle: '💰 {amount} Rajapyykki!',
    notifSavedBody: 'Olet säästänyt {amount} puhdasta rahaa. Se on sinun, ei yhtiöiden.',
    notifInvestTitle: '📈 Katse tulevaisuuteen',
    notifInvestBody: 'Tähän mennessä säästämäsi raha kasvaa sijoitettuna {futureValue} arvoiseksi {years} vuodessa.',
    notifForecastTitle: '🚀 Kokonaispotentiaali',
    notifForecastBody: 'Tiesitkö? Nykytahtisi ja tuotto-odotuksesi vie sinut {totalValue} salkkuun {years} vuodessa.',
    // Disclaimer
    disclaimerTitle: 'Vastuuvapauslauseke',
    disclaimerP1: 'Addiction Ticker on puhtaasti matemaattinen visualisointityökalu. Sovelluksen esittämät luvut ovat hypoteettisia skenaarioita, jotka perustuvat yksinomaan käyttäjän itse syöttämiin parametreihin.',
    disclaimerP2: 'Sovellus ei anna sijoitusneuvontaa, eikä mikään sen esittämä data ole kehotus ostaa tai myydä arvopapereita. Historiallinen tuotto tai korkoa korolle -laskelmat eivät ole tae tulevasta. Käyttäjä on yksin vastuussa omista taloudellisista päätöksistään ja sijoituksiin sisältyvistä riskeistä.',
    disclaimerP3: 'Lisäksi sovellus on tarkoitettu vain motivaation tueksi, eikä se korvaa ammattimaista lääketieteellistä hoitoa riippuvuuksien hoidossa.'
  }
};

export function getCurrencySymbol(currency: Currency) {
  switch (currency) {
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'EUR':
    default: return '€';
  }
}

export function formatCurrency(value: number, currency: Currency, fractionDigits: number = 2) {
  return new Intl.NumberFormat('fi-FI', { style: 'currency', currency: currency, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(value);
}

export const t = TRANSLATIONS.fi;
export type TranslationStrings = typeof t;
