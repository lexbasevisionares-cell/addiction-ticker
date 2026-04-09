import { LocalNotifications } from '@capacitor/local-notifications';
import { UserSettings } from '../components/Onboarding';
import { AppState } from '../components/Ticker';
import { calculateAccumulated, calculateSecuredFutureValue, calculateTotalForecast } from './finance';
import { formatCurrency } from './i18n';

export async function requestNotificationPermission() {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  } catch (e) {
    console.error('Notification permission check failed', e);
  }
}

export async function clearAllNotifications() {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch (e) {
    console.error('Failed to clear notifications', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
const FREE_HOURLY_MESSAGES: Array<{ title: string | ((v: MsgVars) => string); body: (vars: MsgVars) => string }> = [
  // 08:00
  {
    title: 'Uusi päivä. Strategia jatkuu.',
    body: ({ dailyCostStr }) =>
      `Tänäänkin olet valinnut taloudellisen vapautesi. Päivittäinen ${dailyCostStr} säästötahtisi kerryttää varallisuuttasi jatkuvasti jokaisella ohikiitävällä sekunnilla.`,
  },
  // 09:00
  {
    title: ({ amountStr }) => `Kertymä tähän mennessä: ${amountStr}`,
    body: ({ amountStr }) =>
      `Olet palauttanut itsellesi yhteensä ${amountStr} siitä päivästä lähtien, kun teit päätöksen. Jokainen tyhjäkäyntitunti kasvattaa tätä lukua automaattisesti.`,
  },
  // 10:00
  {
    title: 'Rahasi tekee töitä.',
    body: ({ investedStr, benchmarkYearsStr }) =>
      `Kertynyt käteissäästösi ei seiso paikallaan markkinoilla. Nykyinen säästösummasi kasvaisi sijoitettuna jo ${investedStr} arvoon seuraavan ${benchmarkYearsStr} vuoden aikana.`,
  },
  // 11:00
  {
    title: 'Näkymätön tuotto.',
    body: ({ amountStr }) =>
      `Jos et olisi lopettanut, olisit tähän mennessä siirtänyt ${amountStr} teollisuuden taskuun. Nyt se summa on turvassa sinun taseessasi.`,
  },
  // 12:00
  {
    title: 'Puoli päivää. Kaikki hallinnassa.',
    body: ({ amountStr }) =>
      `Aamupäivä on ohi ja kokonaiskertymäsi on saavuttanut ${amountStr}. Pidä strategiasi käynnissä iltaan asti.`,
  },
  // 13:00
  {
    title: ({ benchmarkYearsStr }) => `${benchmarkYearsStr} vuoden potentiaali hahmottuu.`,
    body: ({ totalForecastStr, benchmarkYearsStr }) =>
      `Jos jatkat tällä säästötahdilla seuraavat ${benchmarkYearsStr} vuotta, yhdistetty pääomasi ja sijoitustuottosi nostavat salkkusi ennusteen arvoon ${totalForecastStr}.`,
  },
  // 14:00
  {
    title: 'Matematiikka ei valehtele.',
    body: ({ amountStr }) =>
      `Tunteet vaihtelevat, mutta kertyvä summa (${amountStr}) on matemaattinen fakta. Taloudellinen todistusaineisto on puolellasi.`,
  },
  // 15:00
  {
    title: 'Teollisuus menetti asiakkaan.',
    body: () =>
      `Tänäänkin toimit kukkaronnyöreilläsi. Et suostu enää maksamaan laittomia 'veroja' riippuvuudesta, ja se näkyy tililläsi.`,
  },
  // 16:00
  {
    title: 'Iltapäivän katsaus.',
    body: ({ amountStr }) =>
      `Varallisuutesi kertymä näyttää tällä sekunnilla lukemaa ${amountStr}. Suunta on vain ylöspäin.`,
  },
  // 17:00
  {
    title: 'Vankka perustus.',
    body: ({ dailyCostStr }) =>
      `Päivittäin säästetty ${dailyCostStr} ei tunnu ehkä lompakossa heti isolta summalta, mutta asettamalla sen osaksi sijoitussuunnitelmaa luot vankkaa perustaa.`,
  },
  // 18:00
  {
    title: ({ amountStr }) => `Tämänhetkinen kertymä: ${amountStr}`,
    body: ({ amountStr }) =>
      `Tähän mennessä pelastamasi ${amountStr} on pysyvästi irrotettu vanhasta kulutustottumuksesta. Olet palauttanut kontrollin pääomastasi.`,
  },
  // 19:00
  {
    title: 'Potentiaalin skaalautuminen.',
    body: ({ investedStr, benchmarkYearsStr }) =>
      `Tähänastinen säästösi kasvaisi korkoa korolle sijoitettuna ${investedStr} summaiseksi ${benchmarkYearsStr} vuodessa. Oikeat päätökset kertaantuvat ajassa.`,
  },
  // 20:00
  {
    title: 'Ilta on sinun.',
    body: ({ amountStr }) =>
      `Yksi täysi päivä kohta taas takana ilman tarpeetonta ostotapahtumaa. Kertymä ${amountStr} kertoo sinulle, että strategia pitää.`,
  },
  // 21:00
  {
    title: 'Tuottotahdin vahvistus.',
    body: ({ dailyCostStr }) =>
      `Säästötahtisi ${dailyCostStr} per päivä tarkoittaa rutiinin kääntämistä eduksesi. Et vain "ole ilman", olet rakentamassa uutta.`,
  },
  // 22:00
  {
    title: 'Päivä pakettiin.',
    body: ({ amountStr }) =>
      `Yö saapuu. Saldo vahvistuu. Pöytäkirjaan merkitään: ${amountStr} kokonaiskertymää. Tästä on erinomainen jatkaa aamulla.`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
const HOOKED_HOURLY_MESSAGES: Array<{ title: string | ((v: MsgVars) => string); body: (vars: MsgVars) => string }> = [
  // 08:00
  {
    title: 'Vuoto on aktiivinen.',
    body: ({ hourlyCostStr }) =>
      `Päivä alkaa ja mittari käy. Olet asettanut kurssin, joka siirtää keskimäärin ${hourlyCostStr} tunnissa varallisuuttasi muiden hallintaan.`,
  },
  // 09:00
  {
    title: ({ amountStr }) => `Lasku tähän mennessä: ${amountStr}`,
    body: ({ amountStr }) =>
      `Kokonaiskulutuksesi seurannan alusta on nyt ${amountStr}. Summa kumuloituu reaaliajassa, sekunti sekunnilta.`,
  },
  // 10:00
  {
    title: 'Tasainen taloudellinen rasite.',
    body: ({ dailyCostStr }) =>
      `Riippuvuus maksaa sinulle noin ${dailyCostStr} päivässä. Tämä summa ei katoa tyhjyyteen — se siirtyy suoraan teollisuuden taseen hyväksi.`,
  },
  // 11:00
  {
    title: 'Vaihtoehtoinen polku.',
    body: ({ amountStr }) =>
      `Olet menettänyt ${amountStr} aloitushetkestä mitattuna. Et menetä vain tätä rahaa, vaan sen kyvyn tuottaa sinulle mitään tulevaisuudessa.`,
  },
  // 12:00
  {
    title: 'Päivän puoliväli.',
    body: ({ amountStr, investedStr, benchmarkYearsStr }) =>
      `Laskurissa on jo ${amountStr} suoria kuluja. Tämä summa markkinoilla voisi kasvaa ${investedStr} arvoiseksi seuraavan ${benchmarkYearsStr} vuoden aikana.`,
  },
  // 13:00
  {
    title: 'Menetetty kasvupotentiaali.',
    body: ({ amountStr, investedStr, benchmarkYearsStr }) =>
      `Seuraat tilaa sivusta. Tähän asti kuluttamasi ${amountStr} olisi osakemarkkinoilla tuonut sinulle sijoitussalkkuun ${investedStr} arvon ${benchmarkYearsStr} vuodessa.`,
  },
  // 14:00
  {
    title: 'Inflaation rangaistus.',
    body: ({ dailyCostStr }) =>
      `Hinnat nousevat vuosittain. Tämänpäiväinen kulutustahtisi (${dailyCostStr} / päivä) tulee kalliimmaksi vuoden edetessä.`,
  },
  // 15:00
  {
    title: 'Kustannus ilman tuottoa.',
    body: () =>
      `Riippuvuus on tilaus, jonka laskun maksat säännöllisesti saamatta tilalle minkäänlaista säilyvää arvoa varallisuuteesi.`,
  },
  // 16:00
  {
    title: 'Vuosittainen suonenisku.',
    body: ({ yearlyCostStr }) =>
      `Nykyisellä kulutustottumuksellasi rahoitat riippuvuuttasi peräti ${yearlyCostStr} edestä vuosittain. Entä inflaatio siihen päälle?`,
  },
  // 17:00
  {
    title: 'Tappion kumuloituminen.',
    body: () =>
      `Kaupankäynti pörssissä saattaa heilahtaa suuntaan tai toiseen, mutta sinun taloudellinen valintasi kerryttää vain puhdasta tappiota ilman sijoitusriskiä.`,
  },
  // 18:00
  {
    title: 'Mittari ei pysähdy.',
    body: ({ amountStr }) =>
      `Kokonaiskulut seurannan laukaisemisesta ovat nyt ${amountStr}. Summa kertaantuu tasaisesti kellon ympäri.`,
  },
  // 19:00
  {
    title: 'Näkymätön vaihtoehtoiskustannus.',
    body: ({ investedStr, benchmarkYearsStr }) =>
      `Taloudellinen tilanteesi ei vain vuoda käteistä. Menetät jatkuvasti sen korkoa korolle -tuoton, mikä olisi tuonut salkkuusi peräti ${investedStr} seuraavan ${benchmarkYearsStr} vuoden aikana.`,
  },
  // 20:00
  {
    title: 'Pitkäjänteinen tappio.',
    body: ({ totalForecastStr, benchmarkYearsStr }) =>
      `Tällä tahdilla kokonaiskustannukset ja menetetty tuotto tarkoittavat ${totalForecastStr} vaihtoehtoiskustannusta tulevan ${benchmarkYearsStr} vuoden jaksolla.`,
  },
  // 21:00
  {
    title: ({ amountStr }) => `Kulutus seurannan ajalta: ${amountStr}`,
    body: ({ amountStr }) =>
      `Olet siirtänyt lukeman ${amountStr} verran arvoa pois itseltäsi. Se summa on korroosiota henkilökohtaisessa taseessasi.`,
  },
  // 22:00
  {
    title: 'Päivä vahvistettu.',
    body: ({ yearlyCostStr }) =>
      `Vuorokausi lähestyy loppuaan ja suunta pysyi samana. Nykyinen tahtisi vastaa ${yearlyCostStr} rasitetta vuodessa. Valinta on sinun.`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tyyppi viestimuuttujille
// ─────────────────────────────────────────────────────────────────────────────
interface MsgVars {
  amountStr: string;
  dailyCostStr: string;
  hourlyCostStr: string;
  yearlyCostStr: string;
  investedStr: string;
  totalForecastStr: string;
  benchmarkYearsStr: string;
}

function resolveTitle(msg: { title: string | ((v: MsgVars) => string) }, vars: MsgVars): string {
  return typeof msg.title === 'function' ? msg.title(vars) : msg.title;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lasketaan muuttujat ilmoitushetkellä
// ─────────────────────────────────────────────────────────────────────────────
function buildVars(settings: UserSettings, appState: AppState, targetDate: Date): MsgVars {
  const daysElapsed = (targetDate.getTime() - appState.startTime) / (1000 * 60 * 60 * 24);
  const positiveDays = Math.max(0, daysElapsed);

  const accumulated = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, positiveDays);
  
  const benchmarkYears = 10; // Vakioitu aikajänne referenssiksi ilmoituksiin
  const invested = calculateSecuredFutureValue(accumulated, benchmarkYears, settings.expectedReturn);
  const totalForecast = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, benchmarkYears, settings.expectedReturn);
  const yearlyCost = settings.dailyCost * 365.25;

  return {
    amountStr: formatCurrency(Math.abs(accumulated), 'EUR'),
    dailyCostStr: formatCurrency(settings.dailyCost, 'EUR'),
    hourlyCostStr: formatCurrency(settings.dailyCost / 24, 'EUR'),
    yearlyCostStr: formatCurrency(yearlyCost, 'EUR'),
    investedStr: formatCurrency(Math.abs(invested), 'EUR'),
    totalForecastStr: formatCurrency(Math.abs(totalForecast), 'EUR'),
    benchmarkYearsStr: benchmarkYears.toString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PÄÄAJOITUSLOGIIKKA
// ─────────────────────────────────────────────────────────────────────────────
export async function scheduleMotivationPlan(settings: UserSettings, appState: AppState) {
  await clearAllNotifications();

  if (settings.notificationLevel === 0) return;

  const isFree = appState.status !== 'riippuvainen';
  const now = Date.now();
  const notifications: any[] = [];
  let idCounter = 1;

  // ── Tervetuloa-ilmoitus (10 sek käynnistymisestä) ─────────────────────────
  const isNewUser = now - appState.startTime < 60000;
  if (isNewUser) {
    notifications.push({
      id: idCounter++,
      title: isFree ? 'Vastaisku alkaa.' : 'Seuranta aktivoitu.',
      body: isFree
        ? 'Lopetit riippuvuuden rahoittamisen. Strategia on nyt aktiivinen. Tästä hetkestä lähtien jokainen sekunti kasvattaa sinun varallisuuttasi — ei jonkun muun.'
        : 'Tästä hetkestä lähtien näet euroina sen, mitä riippuvuutesi maksaa. Luvut eivät katso sivulle. Ne raportoivat totuuden sellaisena kuin se on.',
      schedule: { at: new Date(now + 10000) },
    });
  }

  // ── VIRSTANPYLVÄÄT (kaikille tasoille 1-3) ─────────────────────────────────
  if (isFree) {
    const freeMilestones = [
      { days: 1,   title: 'Ensimmäinen vuorokausi takana.',     body: (v: MsgVars) => `Ensimmäinen vuorokausi on usein vaikein. Se on nyt takana. Olet palauttanut itsellesi ${v.amountStr} käteistä ja aloittanut matkan, jonka päämääränä on taloudellinen vapaus.` },
      { days: 3,   title: 'Kolme päivää. Sitkeys näkyy luvuissa.', body: (v: MsgVars) => `Kolme vuorokautta johdonmukaista toimintaa. Olet jo palauttanut ${v.amountStr} pääomaa. Tapa alkaa muodostua — ja samalla alkaa kasvaa myös varallisuus.` },
      { days: 7,   title: 'Viikko selvitetty. Talous kiittää.',  body: (v: MsgVars) => `Seitsemän päivää. Strategia on osoittautunut kestäväksi. Olet turvannut ${v.amountStr} pääomaa, joka kasvaa sijoitettuna ${v.investedStr} verran kahdessakymmenessä vuodessa.` },
      { days: 14,  title: 'Kaksi viikkoa. Varallisuus kertyy.',  body: (v: MsgVars) => `Kaksi peräkkäistä viikkoa täysin suunnitelman mukaan. Kertynyt pääomasi on nyt ${v.amountStr}. Tämä on jo merkittävä pesämuna tulevan kasvun pohjarahastoksi.` },
      { days: 30,  title: 'Kuukausi. Merkittävä käännekohta.',   body: (v: MsgVars) => `Kolmekymmentä päivää ilman turhia kuluja. Olet kerännyt ${v.amountStr} pääomaa. Tähän summaan ei enää kosketa — se on sinun, nyt ja tulevaisuudessa. Ennuste alkaa hahmottua.` },
      { days: 60,  title: 'Kaksi kuukautta. Momentum kasvaa.',   body: (v: MsgVars) => `Kuusikymmentä päivää. Olet nyt turvannut ${v.amountStr}. Korkoa korolle -ilmiö alkaa tehdä töitään: jokainen uusi päivä tuottaa edellisiä enemmän.` },
      { days: 90,  title: 'Neljännesvuosi. Varallisuus rakentuu.', body: (v: MsgVars) => `Kolme kuukautta kurinalaisuutta. Olet kerännyt ${v.amountStr} puhdasta pääomaa. Pitkässä aikajänteessä tämä on se hetki, jolloin ura kääntyi ratkaisevasti.` },
      { days: 180, title: 'Puoli vuotta. Kasvu on käynnissä.',   body: (v: MsgVars) => `Puoli vuotta siitä päätöksestä. Kertynyt pääomasi on nyt ${v.amountStr}. Sijoitettuna se kasvaa ${v.investedStr} verran seuraavan kahdenkymmenen vuoden aikana. Et ole enää vain aloittamassa — olet jo matkalla.` },
      { days: 365, title: 'Vuosi vapaana. Satoa korjataan.',     body: (v: MsgVars) => `Täsmälleen vuosi siitä hetkestä. Olet säästänyt ${v.amountStr} puhdasta pääomaa ja rakentanut ${v.investedStr} sijoituspotentiaalia. Tätä kutsutaan taloudellisen vapauden perustukseksi.` },
    ];

    for (const milestone of freeMilestones) {
      // Ilmoitus tulee tasaisesti merkkihetkenä! (EI pakotettu kello 10:00 vääristämään lukua)
      const targetDate = new Date(appState.startTime + milestone.days * 24 * 60 * 60 * 1000);
      if (targetDate.getTime() > now) {
        const vars = buildVars(settings, appState, targetDate);
        notifications.push({
          id: idCounter++,
          title: milestone.title,
          body: milestone.body(vars),
          schedule: { at: targetDate },
        });
      }
    }
  } else {
    // Riippuvainen-tilan virstanpylväät
    const hookedMilestones = [
      { days: 7,   title: 'Viikon katsaus. Lasku on tullut.',    body: (v: MsgVars) => `Viikko seurannan alla. Olet tällä viikolla siirtänyt ${v.amountStr} varallisuuttasi riippuvuuden ylläpitoon. Vuositasolla tämä tarkoittaa ${v.yearlyCostStr}.` },
      { days: 14,  title: 'Kaksi viikkoa. Laskenta jatkuu.',     body: (v: MsgVars) => `Kaksi viikkoa dataa. Olet maksanut ${v.amountStr} riippuvuuden ylläpidosta. Tämä summa olisi sijoitettuna kasvanut ${v.investedStr} verran seuraavassa kahdessakymmenessä vuodessa.` },
      { days: 30,  title: 'Kuukausi kulunut. Kuukausilaskelma.', body: (v: MsgVars) => `Ensimmäinen kuukausi seurannan alla on päättynyt. Olet siirtänyt ${v.amountStr} varallisuuttasi muiden hallintaan. Vuodessa tämä kasvaa luvuksi ${v.yearlyCostStr}.` },
      { days: 90,  title: 'Neljännesvuosi. Aika laskea.',        body: (v: MsgVars) => `Kolme kuukautta seurantaa. Olet kuluttanut ${v.amountStr} riippuvuuden ylläpitoon. Sijoitettuna tämä sama summa olisi tuottanut ${v.investedStr} seuraavan kahdenkymmenen vuoden aikana.` },
      { days: 180, title: 'Puoli vuotta. Kokonaisuus hahmottuu.', body: (v: MsgVars) => `Puoli vuotta seurantaa. Olet menettänyt ${v.amountStr} varallisuuttasi. Vuoden päättymiseen on vielä puoli vuotta. Loppusumma on laskettavissa jo nyt.` },
      { days: 365, title: 'Vuosi seurantaa. Loppulasku.',         body: (v: MsgVars) => `Täysi vuosi seurannan alla. Olet siirtänyt ${v.amountStr} varallisuuttasi muiden hallintaan. Sijoitettuna tämä sama summa olisi tuottanut ${v.investedStr} seuraavassa kahdessakymmenessä vuodessa. Tämä on riippuvuutesi todellinen vuosihinta.` },
    ];

    for (const milestone of hookedMilestones) {
      const targetDate = new Date(appState.startTime + milestone.days * 24 * 60 * 60 * 1000);
      if (targetDate.getTime() > now) {
        const vars = buildVars(settings, appState, targetDate);
        notifications.push({
          id: idCounter++,
          title: milestone.title,
          body: milestone.body(vars),
          schedule: { at: targetDate },
        });
      }
    }
  }

  // ── SÄÄNNÖLLISET ILMOITUKSET (tasapainoinen ja intensiivinen) ──────────────
  if (settings.notificationLevel >= 2) {
    const isIntensive = settings.notificationLevel === 3;

    // Ajoitetaan seuraavat 4 päivää (iOS 64 ilmoituksen rajoite)
    const daysToSchedule = 4;

    for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
      const baseDate = new Date(now + dayOffset * 24 * 60 * 60 * 1000);
      const hoursToSchedule = isIntensive
        ? [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] // 15 tuntia
        : [9, 21]; // Tasapainoinen: aamu + ilta

      for (const hour of hoursToSchedule) {
        const targetDate = new Date(baseDate);
        targetDate.setHours(hour, 0, 0, 0);

        // Ei menneisyydessä olevia ilmoituksia
        if (targetDate.getTime() <= now + 60000) continue;

        // Indeksi viestipankkiin (tunti 08=0, 09=1, ... 22=14)
        const msgIndex = hour - 8;
        const msgs = isFree ? FREE_HOURLY_MESSAGES : HOOKED_HOURLY_MESSAGES;
        const msg = msgs[msgIndex];
        if (!msg) continue;

        const vars = buildVars(settings, appState, targetDate);
        notifications.push({
          id: idCounter++,
          title: resolveTitle(msg, vars),
          body: msg.body(vars),
          schedule: { at: targetDate },
        });

        // iOS 64 raja
        if (notifications.length >= 62) break;
      }
      if (notifications.length >= 62) break;
    }
  }

  // ── Lähetä kaikki ─────────────────────────────────────────────────────────
  if (notifications.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications });
    } catch (e) {
      console.error('Error scheduling notifications', e);
    }
  }
}
