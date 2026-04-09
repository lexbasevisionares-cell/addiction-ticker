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
// VIESTIPANKKI: 🟢 VAPAA-TILA
// Järjestyksessä tunneille 08–22 (indeksi 0 = 08:00, 14 = 22:00)
// ─────────────────────────────────────────────────────────────────────────────
const FREE_HOURLY_MESSAGES: Array<{ title: string | ((v: MsgVars) => string); body: (vars: MsgVars) => string }> = [
  // 08:00 — Strateginen aamun avaus
  {
    title: 'Uusi päivä. Strategia jatkuu.',
    body: ({ dailyCostStr }) =>
      `Herätessäsi olet jo valinnut. Varallisuutesi kertyminen on alkanut tästä sekunnista. Tänään säästät jälleen ${dailyCostStr} pääomaa, joka jää sinulle — ei kenellekään muulle.`,
  },
  // 09:00 — Kertynyt pääoma
  {
    title: ({ amountStr }) => `Kertynyt pääoma: ${amountStr}`,
    body: ({ amountStr }) =>
      `Olet palauttanut itsellesi yhteensä ${amountStr} siitä päivästä lähtien, kun päätit lopettaa riippuvuuden rahoittamisen. Jokainen päivä lisää tähän summaan tasaisesti.`,
  },
  // 10:00 — Korkoa korolle
  {
    title: 'Rahasi tekee töitä.',
    body: ({ investedStr }) =>
      `Kertynyt pääomasi ei seiso paikallaan. Sijoitettuna se kasvaa korkoa korolle joka hetki. Sijoitusennusteesi 20 vuoden päähän on jo ${investedStr}.`,
  },
  // 11:00 — Vaihtoehtoiskustannus (mitä olisi tapahtunut)
  {
    title: 'Mitä olisi tapahtunut?',
    body: ({ amountStr }) =>
      `Jos et olisi lopettanut, olisit tähän mennessä kuluttanut ${amountStr} nikotiinituotteisiin. Sen sijaan tämä summa on nyt sinun hallussasi.`,
  },
  // 12:00 — Puolen päivän katsaus
  {
    title: 'Puoli päivää. Kaikki hallinnassa.',
    body: ({ dailyCostStr }) =>
      `Olet viettänyt tämän päivän tekemättä yhtään tarpeetonta kulutuspäätöstä. Päivän säästösi on jo ${dailyCostStr} lähempänä tavoitettasi. Toinen puolisko jäljellä.`,
  },
  // 13:00 — Pitkän aikavälin visio
  {
    title: '20 vuoden ennuste kasvaa.',
    body: ({ totalForecastStr }) =>
      `Tänään kertyvä pääoma ei ole vain käteistä. Se on osa pitkän aikavälin salkkuennustettasi: ${totalForecastStr} kahdessakymmenessä vuodessa. Strategiasi on toiminnassa.`,
  },
  // 14:00 — Päätöksen voima
  {
    title: 'Päätös tehtiin. Piste.',
    body: () =>
      `Et ole lopettanut "yrittämässä". Olet lopettanut. Joka tunti tämän päätöksen jälkeen on suoraa taloudellista evidenssiä siitä, minkä arvoinen valintasi oli.`,
  },
  // 15:00 — Kaupallinen perspektiivi
  {
    title: 'Teollisuus menetti sinut asiakkaana.',
    body: () =>
      `Nikotiiniteollisuuden liikevaihto laski juuri siksi, että yksi asiakas kieltäytyi maksamasta. Olet äänestänyt kukkarollasi sen puolesta, mihin varallisuutesi kuuluu.`,
  },
  // 16:00 — Iltapäivän tilanne
  {
    title: 'Päivä on lähes ohitse.',
    body: ({ dailyCostStr }) =>
      `Olet tänään rakentanut taloudellista vapauttasi ${dailyCostStr} verran lisää. Jokainen päivä on laatta samassa perustuksessa, jonka päälle varallisuutesi rakentuu.`,
  },
  // 17:00 — Pörssianalogi
  {
    title: 'Kaupankäynti päättyy. Voitto varmistunut.',
    body: () =>
      `Pörssissä tänään oli nousua tai laskua. Sinun päiväsi kannattavuus ei heilahdellut lainkaan. Olet tehnyt yhden varmoimmista taloudellisista päätöksistäsi.`,
  },
  // 18:00 — Kertymälaskelma
  {
    title: ({ amountStr }) => `Tähänastinen kertymä: ${amountStr}`,
    body: ({ amountStr }) =>
      `Tänään kertynyt pääoma on jo turvattu. Yhteenlaskettu kertymäsi ${amountStr} kasvaa hiljalleen sinun strategiasi suuntaan — ei teollisuuden.`,
  },
  // 19:00 — Sijoitusennuste
  {
    title: 'Sijoitusarvo kasvaa.',
    body: ({ investedStr }) =>
      `Kertynyt pääomasi kasvaa sijoitettuna ${investedStr} verran seuraavan kahdenkymmenen vuoden aikana. Tänään tehdyt päätökset näkyvät tulevaisuuden salkussasi.`,
  },
  // 20:00 — Voitto lähestyy
  {
    title: 'Päivä on käytännössä voitettu.',
    body: ({ amountStr }) =>
      `Iltasi on omasi. Olet suorittanut päivän ilman turhia kuluja, ja tämänpäiväinen osuutesi — osa kertymästä ${amountStr} — on lukittu. Uneen mennessä luku kasvaa jälleen.`,
  },
  // 21:00 — Iltaraportti
  {
    title: ({ dailyCostStr }) => `Päivän tuotto: ${dailyCostStr}`,
    body: ({ dailyCostStr }) =>
      `Tänään olet säästänyt täsmälleen sen, mitä olisit muuten kuluttanut: ${dailyCostStr}. Pieneltäkin tuntuva summa on osa jatkuvaa, kumuloituvaa rakennelmaa. Strategia toimi tänäänkin.`,
  },
  // 22:00 — Päivän sulkeutuminen
  {
    title: 'Päivä sulkeutuu. Tase positiivinen.',
    body: ({ amountStr }) =>
      `Tänään ei tullut yhtään tarpeetonta kulutuspäätöstä. Pöytäkirjaan merkitään: ${amountStr} kertynyttä pääomaa, jota ei voi ottaa pois. Huomenna jatkuu siitä, mihin tänään jäit.`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VIESTIPANKKI: 🔴 RIIPPUVAINEN-TILA
// Järjestyksessä tunneille 08–22
// ─────────────────────────────────────────────────────────────────────────────
const HOOKED_HOURLY_MESSAGES: Array<{ title: string | ((v: MsgVars) => string); body: (vars: MsgVars) => string }> = [
  // 08:00
  {
    title: 'Automaattinen maksu käynnistyi.',
    body: ({ dailyCostStr }) =>
      `Päivä on alkanut. Riippuvuuden päivittäinen kuluerä on käynnistynyt automaattisesti. Tänään siirrät taas ${dailyCostStr} varallisuuttasi muiden hallintaan — ellei päätös muutu.`,
  },
  // 09:00
  {
    title: ({ amountStr }) => `Kuluja tähän mennessä: ${amountStr}`,
    body: ({ amountStr }) =>
      `Seuranta on alkanut siitä hetkestä, kun avasit sovelluksen. Olet tähän mennessä siirtänyt ${amountStr} varallisuuttasi riippuvuuden ylläpitoon. Laskuri jatkaa.`,
  },
  // 10:00
  {
    title: 'Varallisuuden vuoto jatkuu.',
    body: ({ hourlyCostStr }) =>
      `Jokainen tunti maksaa sinulle noin ${hourlyCostStr}. Tämä summa ei katoa tyhjyyteen — se siirtyy suoraan jonkin toisen taseen hyväksi. Vuoto on tasainen ja pysäyttämätön.`,
  },
  // 11:00
  {
    title: ({ amountStr }) => `Kumuloituva tappio: ${amountStr}`,
    body: ({ amountStr }) =>
      `Seurannan alusta lähtien olet menettänyt ${amountStr} varallisuutta. Yksittäinen menoperä ei tunnu suurelta, mutta kumulatiivinen summa kertoo tarinan selkeämmin kuin yksikään yksittäinen hetki.`,
  },
  // 12:00
  {
    title: 'Puolen päivän tappiolaskelma.',
    body: ({ amountStr, investedStr }) =>
      `Päivä on puolivälissä. Olet maksanut ${amountStr} riippuvuuden ylläpidosta. Tämä summa olisi sijoitettuna kasvanut ${investedStr} verran kahdessakymmenessä vuodessa.`,
  },
  // 13:00
  {
    title: 'Menetetty sijoitusmahdollisuus.',
    body: ({ amountStr, investedStr }) =>
      `Kertynyt kulusi ${amountStr} olisi sijoitettuna kasvanut ${investedStr} verran kahdessakymmenessä vuodessa. Riippuvuus ei vain kuluta rahaa — se syö tulevaisuuden varallisuutta.`,
  },
  // 14:00
  {
    title: 'Tänään maksaa huomenna enemmän.',
    body: ({ dailyCostStr }) =>
      `Tuotteiden hinta nousee inflaation myötä vuosittain. Tänään maksamasi ${dailyCostStr} on vasta alkua. Kymmenen vuoden kuluttua maksat todennäköisesti merkittävästi enemmän samasta tavarasta.`,
  },
  // 15:00
  {
    title: 'Maksu suoritettu. Taas.',
    body: () =>
      `Riippuvuus on ainoa tilaus, jota et ole itse tilannut, mutta jonka laskun maksat silti säännöllisesti. Se ei laske hintaansa. Se ei tarjoa lojaliteettietuja. Se vain maksaa.`,
  },
  // 16:00
  {
    title: 'Korkoa korolle — väärään suuntaan.',
    body: ({ yearlyCostStr }) =>
      `Korkoa korolle -ilmiö toimii myös toisin päin: joka vuosi ostat enemmän ja kalliimmalla. Vuosikymmenen päästä vuosikulusi on kasvanut merkittävästi pelkän hintatason nousun takia. Tämän vuoden hinta on jo ${yearlyCostStr}.`,
  },
  // 17:00
  {
    title: 'Pörssi sulkeutui. Sinun laskusi kasvaa.',
    body: () =>
      `Tänään osakemarkkinoilla vaihtui omistajuus miljardien arvosta. Sinäkin osallistuit rahansiirtoon — mutta vastakkaiseen suuntaan, ilman vastinetta tai tuottoa itsellesi.`,
  },
  // 18:00
  {
    title: 'Ilta alkaa. Laskuri jatkuu.',
    body: ({ amountStr, yearlyCostStr }) =>
      `Olet kuluttanut tänään jo ${amountStr}. Illan aikana summa kasvaa jälleen. Vuosi tällä tahdilla tarkoittaa ${yearlyCostStr} kokonaismenoa — ennen tulevia hinnankorotuksia.`,
  },
  // 19:00
  {
    title: 'Vaihtoehtoiskustannus: näkymätön hinta.',
    body: ({ investedStr }) =>
      `Et tunne sitä, mitä et koskaan saanut. Mutta laskuri tietää: jokainen käytetty euro edustaa menetettyä sijoituspotentiaalia. Sijoitettuna kertynyt kulusi olisi jo kasvanut ${investedStr} arvoiseksi.`,
  },
  // 20:00
  {
    title: 'Päivä lähestyy loppuaan. Lasku kasvaa.',
    body: ({ amountStr, yearlyCostStr }) =>
      `Tänään olet maksanut ${amountStr} riippuvuudellesi. Kuukauden kuluttua tämä summa on kerrantunut kolmikymmenkertaiseksi. Vuodessa se on ${yearlyCostStr}.`,
  },
  // 21:00
  {
    title: ({ amountStr }) => `Päivän loppuraportti: ${amountStr}`,
    body: ({ amountStr }) =>
      `Tänään on siirretty ${amountStr} varallisuuttasi riippuvuuden ylläpitoon. Tämä summa ei palaa. Se ei tuota sinulle mitään. Se on varallisuutesi hidasta mutta varmaa korroosiota.`,
  },
  // 22:00
  {
    title: 'Päivä päättyi. Tase miinuksella.',
    body: ({ amountStr, yearlyCostStr }) =>
      `Tänäänkin kertyi ${amountStr} kuluja. Vuodessa tämä tarkoittaa ${yearlyCostStr}. Huomennakin on mahdollisuus valita toisin — laskuri on silti silloinkin läsnä.`,
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
  const invested = calculateSecuredFutureValue(accumulated, 20, settings.expectedReturn);
  const totalForecast = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, 20, settings.expectedReturn);
  const yearlyCost = settings.dailyCost * 365.25;

  return {
    amountStr: formatCurrency(Math.abs(accumulated), 'EUR'),
    dailyCostStr: formatCurrency(settings.dailyCost, 'EUR'),
    hourlyCostStr: formatCurrency(settings.dailyCost / 24, 'EUR'),
    yearlyCostStr: formatCurrency(yearlyCost, 'EUR'),
    investedStr: formatCurrency(Math.abs(invested), 'EUR'),
    totalForecastStr: formatCurrency(Math.abs(totalForecast), 'EUR'),
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
      const targetDate = new Date(appState.startTime + milestone.days * 24 * 60 * 60 * 1000);
      targetDate.setHours(10, 0, 0, 0);
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
      targetDate.setHours(10, 0, 0, 0);
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
