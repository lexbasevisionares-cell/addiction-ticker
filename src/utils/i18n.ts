
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
    resetCounter: 'Nollaa laskuri',
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
    shareTextFree: 'Lopettaminen ei ole vain terveyspäätös, se on taloudellinen strategia. Olen ohjannut kassavirtani teollisuudelta omaan salkkuuni {A} päivän ajan. Tulos: {B} puhdasta pääomaa. Aika ja korko hoitavat loput — {E} vuodessa tämä päätös kasvaa {F} arvoiseksi saavutukseksi. Rahoita vapauttasi, älä riippuvuuttasi. Laske oma potentiaalisi: Addiction Ticker.',
    shareTextHooked: 'Analyysi taloudellisista tappioista. Seuraavan {A} vuoden aikana riippuvuuteni ei maksa minulle vain tuotteen hintaa. Vaihtoehtoiskustannuksina ja menetettyinä sijoitustuottoina siirrän teollisuudelle yhteensä {B} — omaa varallisuuttani, joka kuuluisi minulle. Riippuvuus on vapaaehtoista verotusta. Kumpaa sinä rahoitat? Laske armoton totuus: Addiction Ticker.',
    linkCopied: 'Linkki ja teksti kopioitu leikepöydälle!',
    selectLanguage: 'Valitse kieli / Select Language',
    selectCurrency: 'Valitse valuutta / Select Currency',
    selectTimeFormat: 'Valitse kello / Select Time Format',
    // Info Modals
    infoLogicTitle: 'Miten tämä toimii?',
    infoLogicGeneral: 'Tämä laskuri perustuu kylmään matematiikkaan ja asettaa luvut neljälle portaalle, yhdistämällä suoran säästämisen ja korkoa korolle -ilmiön.',
    infoLogicP1Title: 'Tähän asti',
    infoLogicP2Title: 'Tulevaisuus',
    infoLogicHookedP1: 'Tämä näkymä on armoton peili. Se paljastaa riippuvuutesi todellisen hinnan näyttämällä sekä suorat rahareiät että massiivisen vaihtoehtoiskustannuksen samanaikaisesti.',
    infoHookedTimerTitle: 'Miksi laskuri alkaa nollasta?',
    infoHookedTimerP1: 'Tämä aika on laskettu siitä hetkestä, kun avasit tämän näkymän ensimmäistä kertaa.',
    infoHookedTimerP2: 'Sovellus on tietoisesti rakennettu niin, ettei se näytä sinulle sitä summaa, jonka olet mahdollisesti jo menettänyt aikaisempien vuosien aikana. Todennäköisesti se on jo merkittävä.',
    infoHookedTimerP3: 'Mutta läikkynyttä maitoa ei kannata itkeä. Tärkeintä on pitää katse niissä asioissa, joihin voit vielä vaikuttaa — ja juuri niitä tämä sovellus näyttää sinulle.',
    infoAboutTitle: 'Tietoa sovelluksesta',
    infoAboutP1: ' syntyi asenteesta: riippuvuus on vapaaehtoinen elinikäinen varallisuusvero.',
    infoAboutP2: 'Ihmismieli on kykenemätön hahmottamaan pienten päivittäisten kulujen kumuloituvaa, vuosikymmenten yli kurottavaa vaihtoehtoiskustannusta. Tämän sovelluksen ainut tarkoitus on muuttaa näkymätön hinta säälimättömän näkyväksi ja konkreettiseksi dataksi.',
    infoAboutP3: 'Tavoitteemme on kääntää psykologinen peliasetelma ympäri. Korvaamme kemiallisen pikatyydytyksen sillä pitkäaikaisella euforialla, joka iskee, kun tajuat reaaliajassa säästöllä rakentamasi taloudellisen vapauden määrän.',
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
