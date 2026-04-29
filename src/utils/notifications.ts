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

interface MsgVars {
  amountStr: string;
  dailyCostStr: string;
  hourlyCostStr: string;
  yearlyCostStr: string;
  investedStr: string;
  totalForecastStr: string;
  benchmarkYearsStr: string;
}

type MsgDefinition = { title: string | ((v: MsgVars) => string); body: (vars: MsgVars) => string };

const FREE_HOURLY_MESSAGES: Record<string, MsgDefinition[]> = {
  fi: [
    { title: 'Uusi päivä. Strategia jatkuu.', body: ({ dailyCostStr }) => `Tänäänkin olet valinnut taloudellisen vapautesi. Päivittäinen ${dailyCostStr} säästötahtisi kerryttää varallisuuttasi jatkuvasti.` },
    { title: ({ amountStr }) => `Kertymä tähän mennessä: ${amountStr}`, body: ({ amountStr }) => `Olet palauttanut itsellesi yhteensä ${amountStr} siitä päivästä lähtien, kun teit päätöksen.` },
    { title: 'Rahasi tekee töitä.', body: ({ investedStr, benchmarkYearsStr }) => `Kertynyt käteissäästösi ei seiso paikallaan markkinoilla. Nykyinen säästösummasi kasvaisi sijoitettuna jo ${investedStr} arvoon seuraavan ${benchmarkYearsStr} vuoden aikana.` },
    { title: 'Näkymätön tuotto.', body: ({ amountStr }) => `Jos et olisi lopettanut, olisit tähän mennessä siirtänyt ${amountStr} teollisuuden taskuun. Nyt se summa on turvassa sinun taseessasi.` },
    { title: 'Puoli päivää. Kaikki hallinnassa.', body: ({ amountStr }) => `Aamupäivä on ohi ja kokonaiskertymäsi on saavuttanut ${amountStr}. Pidä strategiasi käynnissä iltaan asti.` },
    { title: ({ benchmarkYearsStr }) => `${benchmarkYearsStr} vuoden potentiaali hahmottuu.`, body: ({ totalForecastStr, benchmarkYearsStr }) => `Jos jatkat tällä säästötahdilla seuraavat ${benchmarkYearsStr} vuotta, yhdistetty pääomasi ja sijoitustuottosi nostavat salkkusi ennusteen arvoon ${totalForecastStr}.` },
    { title: 'Matematiikka ei valehtele.', body: ({ amountStr }) => `Tunteet vaihtelevat, mutta kertyvä summa (${amountStr}) on matemaattinen fakta. Taloudellinen todistusaineisto on puolellasi.` },
    { title: 'Teollisuus menetti asiakkaan.', body: () => `Tänäänkin toimit kukkaronnyöreilläsi. Et suostu enää maksamaan laittomia 'veroja' riippuvuudesta, ja se näkyy tililläsi.` },
    { title: 'Iltapäivän katsaus.', body: ({ amountStr }) => `Varallisuutesi kertymä näyttää tällä sekunnilla lukemaa ${amountStr}. Suunta on vain ylöspäin.` },
    { title: 'Vankka perustus.', body: ({ dailyCostStr }) => `Päivittäin säästetty ${dailyCostStr} ei tunnu ehkä lompakossa heti isolta summalta, mutta asettamalla sen osaksi sijoitussuunnitelmaa luot vankkaa perustaa.` },
    { title: ({ amountStr }) => `Tämänhetkinen kertymä: ${amountStr}`, body: ({ amountStr }) => `Tähän mennessä pelastamasi ${amountStr} on pysyvästi irrotettu vanhasta kulutustottumuksesta. Olet palauttanut kontrollin pääomastasi.` },
    { title: 'Potentiaalin skaalautuminen.', body: ({ investedStr, benchmarkYearsStr }) => `Tähänastinen säästösi kasvaisi korkoa korolle sijoitettuna ${investedStr} summaiseksi ${benchmarkYearsStr} vuodessa. Oikeat päätökset kertaantuvat ajassa.` },
    { title: 'Ilta on sinun.', body: ({ amountStr }) => `Yksi täysi päivä kohta taas takana ilman tarpeetonta ostotapahtumaa. Kertymä ${amountStr} kertoo sinulle, että strategia pitää.` },
    { title: 'Tuottotahdin vahvistus.', body: ({ dailyCostStr }) => `Säästötahtisi ${dailyCostStr} per päivä tarkoittaa rutiinin kääntämistä eduksesi. Et vain "ole ilman", olet rakentamassa uutta.` },
    { title: 'Päivä pakettiin.', body: ({ amountStr }) => `Yö saapuu. Saldo vahvistuu. Pöytäkirjaan merkitään: ${amountStr} kokonaiskertymää. Tästä on erinomainen jatkaa aamulla.` },
  ],
  en: [
    { title: 'New day. Strategy continues.', body: ({ dailyCostStr }) => `Today you have chosen your financial freedom again. Your daily saving of ${dailyCostStr} continuously builds your wealth.` },
    { title: ({ amountStr }) => `Accumulated so far: ${amountStr}`, body: ({ amountStr }) => `You have redirected a total of ${amountStr} to yourself since the day you made the decision.` },
    { title: 'Your money is working.', body: ({ investedStr, benchmarkYearsStr }) => `Your saved cash is not standing still on the market. In ${benchmarkYearsStr} years your current savings could grow to ${investedStr}.` },
    { title: 'Invisible return.', body: ({ amountStr }) => `If you hadn't quit, you would have transferred ${amountStr} to the industry by now. Now that sum is safe in your balance sheet.` },
    { title: 'Half the day. Total control.', body: ({ amountStr }) => `The morning is over and your total accumulation has reached ${amountStr}. Keep your strategy running.` },
    { title: ({ benchmarkYearsStr }) => `${benchmarkYearsStr}-year potential taking shape.`, body: ({ totalForecastStr, benchmarkYearsStr }) => `If you continue saving for ${benchmarkYearsStr} years, your combined capital and investment returns will raise your portfolio forecast to ${totalForecastStr}.` },
    { title: 'Math does not lie.', body: ({ amountStr }) => `Emotions vary, but the accumulated sum (${amountStr}) is a mathematical fact. Financial evidence is on your side.` },
    { title: 'The industry lost a customer.', body: () => `Today you vote with your wallet. You refuse to pay illegal 'taxes' on addiction, and it shows.` },
    { title: 'Afternoon review.', body: ({ amountStr }) => `Your wealth accumulation reads ${amountStr} at this exact second. The direction is up.` },
    { title: 'Solid foundation.', body: ({ dailyCostStr }) => `A daily ${dailyCostStr} might not feel huge right now, but making it part of an investment plan builds a solid foundation.` },
    { title: ({ amountStr }) => `Current accumulation: ${amountStr}`, body: ({ amountStr }) => `The ${amountStr} you have saved so far is permanently secured. You have regained control of your capital.` },
    { title: 'Scaling potential.', body: ({ investedStr, benchmarkYearsStr }) => `Your savings to date could grow to ${investedStr} in ${benchmarkYearsStr} years through compound interest.` },
    { title: 'The evening is yours.', body: ({ amountStr }) => `Another full day soon behind without unnecessary purchases. Accumulating ${amountStr} tells you the strategy holds.` },
    { title: 'Yield confirmation.', body: ({ dailyCostStr }) => `Your saving pace of ${dailyCostStr} a day means turning a routine to your advantage. You're building something new.` },
    { title: 'Day wrapped up.', body: ({ amountStr }) => `Night falls. Balance strengthens. Let the record show: ${amountStr} in total accumulation. Excellent start for tomorrow.` },
  ]
};

const HOOKED_HOURLY_MESSAGES: Record<string, MsgDefinition[]> = {
  fi: [
    { title: 'Vuoto on aktiivinen.', body: ({ hourlyCostStr }) => `Päivä alkaa ja mittari käy. Siirrät ${hourlyCostStr} tunnissa varallisuuttasi teollisuudelle.` },
    { title: ({ amountStr }) => `Lasku tähän mennessä: ${amountStr}`, body: ({ amountStr }) => `Kokonaiskulutuksesi seurannan alusta on nyt ${amountStr}. Summa kumuloituu reaaliajassa.` },
    { title: 'Tasainen taloudellinen rasite.', body: ({ dailyCostStr }) => `Riippuvuus maksaa sinulle noin ${dailyCostStr} päivässä. Tämä summa siirtyy suoraan teollisuuden taseen hyväksi.` },
    { title: 'Vaihtoehtoinen polku.', body: ({ amountStr }) => `Olet menettänyt ${amountStr}. Et menetä vain rahaa, vaan myös sen potentiaalisen tuoton.` },
    { title: 'Päivän puoliväli.', body: ({ amountStr, investedStr, benchmarkYearsStr }) => `Laskurissa on jo ${amountStr} suoria kuluja. Tämä summa markkinoilla voisi kasvaa ${investedStr} arvoiseksi seuraavan ${benchmarkYearsStr} vuoden aikana.` },
    { title: 'Menetetty kasvupotentiaali.', body: ({ amountStr, investedStr, benchmarkYearsStr }) => `Tähän asti kuluttamasi ${amountStr} olisi osakemarkkinoilla tuonut sinulle sijoitussalkkuun ${investedStr} arvon ${benchmarkYearsStr} vuodessa.` },
    { title: 'Inflaation rangaistus.', body: ({ dailyCostStr }) => `Hinnat nousevat vuosittain. Tämänpäiväinen kulutustahtisi (${dailyCostStr} / päivä) tulee aina vain kalliimmaksi.` },
    { title: 'Kustannus ilman tuottoa.', body: () => `Riippuvuus on tilaus, jonka laskun maksat säännöllisesti saamatta tilalle minkäänlaista säilyvää arvoa.` },
    { title: 'Vuosittainen suonenisku.', body: ({ yearlyCostStr }) => `Nykyisellä kulutustottumuksellasi rahoitat riippuvuuttasi peräti ${yearlyCostStr} edestä vuosittain.` },
    { title: 'Tappion kumuloituminen.', body: () => `Taloudellinen valintasi kerryttää vain puhdasta tappiota ilman minkäänlaista sijoitusriskiä - aivan varmasti.` },
    { title: 'Mittari ei pysähdy.', body: ({ amountStr }) => `Kokonaiskulut seurannan laukaisemisesta ovat nyt ${amountStr}. Tappio kertaantuu tasaisesti.` },
    { title: 'Näkymätön vaihtoehtoiskustannus.', body: ({ investedStr, benchmarkYearsStr }) => `Menetät jatkuvasti korkoa korolle -tuottoa, mikä olisi tuonut salkkuusi peräti ${investedStr} seuraavan ${benchmarkYearsStr} vuoden aikana.` },
    { title: 'Pitkäjänteinen tappio.', body: ({ totalForecastStr, benchmarkYearsStr }) => `Kokonaiskustannukset ja menetetty tuotto tarkoittavat ${totalForecastStr} vaihtoehtoiskustannusta ${benchmarkYearsStr} vuoden jaksolla.` },
    { title: ({ amountStr }) => `Kulutus seurannan ajalta: ${amountStr}`, body: ({ amountStr }) => `Olet siirtänyt ${amountStr} verran arvoa pois itseltäsi. Se summa on korroosiota henkilökohtaisessa taseessasi.` },
    { title: 'Päivä vahvistettu.', body: ({ yearlyCostStr }) => `Nykyinen tahtisi vastaa ${yearlyCostStr} rasitetta vuodessa. Valinta on edelleen sinun.` },
  ],
  en: [
    { title: 'The leak is active.', body: ({ hourlyCostStr }) => `Day begins and the meter is running. You are transferring ${hourlyCostStr} an hour to the industry.` },
    { title: ({ amountStr }) => `Bill so far: ${amountStr}`, body: ({ amountStr }) => `Your total consumption since tracking started is now ${amountStr}. The sum accumulates in real time.` },
    { title: 'Steady financial burden.', body: ({ dailyCostStr }) => `Your addiction costs you about ${dailyCostStr} a day. This sum goes directly to the industry's balance sheet.` },
    { title: 'The alternative path.', body: ({ amountStr }) => `You have lost ${amountStr}. You're not just losing money, but its potential to generate returns.` },
    { title: 'Half the day.', body: ({ amountStr, investedStr, benchmarkYearsStr }) => `The ticker already shows ${amountStr} in direct costs. In the market, this could grow to ${investedStr} over the next ${benchmarkYearsStr} years.` },
    { title: 'Lost growth potential.', body: ({ amountStr, investedStr, benchmarkYearsStr }) => `The ${amountStr} you've spent so far would have brought your investment portfolio to ${investedStr} in ${benchmarkYearsStr} years.` },
    { title: 'Inflation penalty.', body: ({ dailyCostStr }) => `Prices rise annually. Your current spending pace (${dailyCostStr} / day) will only get more expensive.` },
    { title: 'Cost without return.', body: () => `Addiction is a subscription where you pay regularly without receiving any lasting value for your wealth.` },
    { title: 'Annual drain.', body: ({ yearlyCostStr }) => `With your current consumption habit, you fund your addiction by a whopping ${yearlyCostStr} annually.` },
    { title: 'Accumulating loss.', body: () => `Your financial choice simply accumulates pure loss without any investment risk - with absolute certainty.` },
    { title: 'The meter won\'t stop.', body: ({ amountStr }) => `Total costs since tracking started are now ${amountStr}. The loss compounds steadily.` },
    { title: 'Invisible opportunity cost.', body: ({ investedStr, benchmarkYearsStr }) => `You continuously lose compound interest, which would have brought your portfolio ${investedStr} over the next ${benchmarkYearsStr} years.` },
    { title: 'Long-term loss.', body: ({ totalForecastStr, benchmarkYearsStr }) => `Total costs and lost returns mean a ${totalForecastStr} opportunity cost over a ${benchmarkYearsStr} year period.` },
    { title: ({ amountStr }) => `Consumption during tracking: ${amountStr}`, body: ({ amountStr }) => `You have transferred ${amountStr} of value away from yourself. That sum is corrosion in your personal balance sheet.` },
    { title: 'Day confirmed.', body: ({ yearlyCostStr }) => `Your current pace corresponds to a ${yearlyCostStr} burden per year. The choice remains yours.` },
  ]
};

const COMMON_MESSAGES: Record<string, Record<string, string>> = {
  fi: {
    welcomeFreeTitle: 'Vastaisku alkaa.',
    welcomeFreeBody: 'Lopetit riippuvuuden rahoittamisen. Strategia on nyt aktiivinen. Tästä hetkestä lähtien jokainen sekunti kasvattaa varallisuuttasi — ei jonkun muun.',
    welcomeHookedTitle: 'Seuranta aktivoitu.',
    welcomeHookedBody: 'Tästä hetkestä lähtien näet, mitä riippuvuutesi maksaa. Luvut raportoivat totuuden sellaisena kuin se on.',
  },
  en: {
    welcomeFreeTitle: 'The counterstrike begins.',
    welcomeFreeBody: 'You stopped funding your addiction. Strategy is active. From this moment on, every second builds your own wealth.',
    welcomeHookedTitle: 'Tracking activated.',
    welcomeHookedBody: 'From this moment, you will see exactly what your addiction costs. The numbers just report the cold truth.',
  }
};

function resolveTitle(msg: MsgDefinition, vars: MsgVars): string {
  return typeof msg.title === 'function' ? msg.title(vars) : msg.title;
}

function buildVars(settings: UserSettings, appState: AppState, targetDate: Date, lang: string, currency: string): MsgVars {
  const daysElapsed = (targetDate.getTime() - appState.startTime) / (1000 * 60 * 60 * 24);
  const positiveDays = Math.max(0, daysElapsed);

  const accumulated = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, positiveDays);
  
  const benchmarkYears = 10; 
  const invested = calculateSecuredFutureValue(accumulated, benchmarkYears, settings.expectedReturn);
  const totalForecast = calculateTotalForecast(settings.dailyCost, settings.annualPriceIncrease, benchmarkYears, settings.expectedReturn);
  const yearlyCost = settings.dailyCost * 365.25;

  // We must import the formatting logic but since notifications are purely background, we define a small helper here.
  // We use formatCurrencyString from i18n
  return {
    amountStr: formatCurrency(Math.abs(accumulated), currency as any, lang as any, 0),
    dailyCostStr: formatCurrency(settings.dailyCost, currency as any, lang as any, 0),
    hourlyCostStr: formatCurrency(settings.dailyCost / 24, currency as any, lang as any, 2),
    yearlyCostStr: formatCurrency(yearlyCost, currency as any, lang as any, 0),
    investedStr: formatCurrency(Math.abs(invested), currency as any, lang as any, 0),
    totalForecastStr: formatCurrency(Math.abs(totalForecast), currency as any, lang as any, 0),
    benchmarkYearsStr: benchmarkYears.toString(),
  };
}

export async function scheduleMotivationPlan(settings: UserSettings, appState: AppState) {
  await clearAllNotifications();

  if (settings.notificationLevel === 0) return;

  const isFree = appState.status !== 'riippuvainen';
  const now = Date.now();
  const notifications: any[] = [];
  let idCounter = 1;

  const lang = settings.language || 'en';
  const currency = settings.currency || 'USD';
  const commonT = COMMON_MESSAGES[lang] || COMMON_MESSAGES.en;

  const isNewUser = now - appState.startTime < 60000;
  if (isNewUser) {
    notifications.push({
      id: idCounter++,
      title: isFree ? commonT.welcomeFreeTitle : commonT.welcomeHookedTitle,
      body: isFree ? commonT.welcomeFreeBody : commonT.welcomeHookedBody,
      schedule: { at: new Date(now + 10000) },
    });
  }

  // ── MILESTONES ─────────────────────────────────────────────────────────────
  if (isFree) {
    const freeMilestones: Record<string, any[]> = {
      fi: [
        { days: 1, title: 'Ensimmäinen vuorokausi takana.', body: (v: MsgVars) => `Olet palauttanut itsellesi ${v.amountStr} käteistä ja aloittanut matkan taloudelliseen vapauteen.` },
        { days: 3, title: 'Kolme päivää. Sitkeys näkyy.', body: (v: MsgVars) => `Kolme vuorokautta johdonmukaista toimintaa. Olet jo palauttanut ${v.amountStr} pääomaa.` },
        { days: 7, title: 'Viikko selvitetty. Talous kiittää.', body: (v: MsgVars) => `Seitsemän päivää. Olet turvannut ${v.amountStr} pääomaa, joka kasvaa sijoitettuna ${v.investedStr} verran 10 vuodessa.` },
        { days: 30, title: 'Kuukausi. Merkittävä käännekohta.', body: (v: MsgVars) => `Kolmekymmentä päivää. Olet kerännyt ${v.amountStr} pääomaa. Tähän summaan ei enää kosketa.` },
        { days: 90, title: 'Neljännesvuosi. Varallisuus rakentuu.', body: (v: MsgVars) => `Kolme kuukautta kurinalaisuutta. Olet kerännyt ${v.amountStr} puhdasta pääomaa.` },
        { days: 365, title: 'Vuosi vapaana. Satoa korjataan.', body: (v: MsgVars) => `Täsmälleen vuosi. Olet säästänyt ${v.amountStr} puhdasta pääomaa ja rakentanut ${v.investedStr} sijoituspotentiaalia.` },
      ],
      en: [
        { days: 1, title: 'First 24 hours complete.', body: (v: MsgVars) => `You have reclaimed ${v.amountStr} in cash and started your journey to financial freedom.` },
        { days: 3, title: 'Three days. Resilience shows.', body: (v: MsgVars) => `Three days of consistent action. You have already reclaimed ${v.amountStr} in capital.` },
        { days: 7, title: 'A week cleared. Finances thank you.', body: (v: MsgVars) => `Seven days. You've secured ${v.amountStr} in capital, which invested grows to ${v.investedStr} in 10 years.` },
        { days: 30, title: 'One month. Major milestone.', body: (v: MsgVars) => `Thirty days. You have accumulated ${v.amountStr} in capital. This money is permanently yours.` },
        { days: 90, title: 'A quarter year. Wealth is building.', body: (v: MsgVars) => `Three months of discipline. You have accumulated ${v.amountStr} of pure capital.` },
        { days: 365, title: 'One year free. Reaping the rewards.', body: (v: MsgVars) => `Exactly one year. You have saved ${v.amountStr} in pure capital and built ${v.investedStr} in investment potential.` }
      ]
    };

    const milestonesToUse = freeMilestones[lang] || freeMilestones.en;
    for (const milestone of milestonesToUse) {
      const targetDate = new Date(appState.startTime + milestone.days * 24 * 60 * 60 * 1000);
      if (targetDate.getTime() > now) {
        const vars = buildVars(settings, appState, targetDate, lang, currency);
        notifications.push({
          id: idCounter++,
          title: milestone.title,
          body: milestone.body(vars),
          schedule: { at: targetDate },
        });
      }
    }
  } else {
    // Hooked Milestones
    const hookedMilestones: Record<string, any[]> = {
      fi: [
        { days: 7, title: 'Viikon katsaus. Lasku on tullut.', body: (v: MsgVars) => `Viikko seurantaa. Olet siirtänyt ${v.amountStr} varallisuuttasi riippuvuuden ylläpitoon.` },
        { days: 30, title: 'Kuukausilaskelma.', body: (v: MsgVars) => `Olet siirtänyt ${v.amountStr} varallisuuttasi muiden hallintaan. Vuodessa tämä kasvaa luvuksi ${v.yearlyCostStr}.` },
        { days: 365, title: 'Vuosi seurantaa. Loppulasku.', body: (v: MsgVars) => `Olet siirtänyt ${v.amountStr} varallisuuttasi teollisuudelle. Sijoitettuna summa olisi tuottanut ${v.investedStr} 10 vuodessa.` },
      ],
      en: [
        { days: 7, title: 'Weekly review. The bill arrived.', body: (v: MsgVars) => `One week of tracking. You have transferred ${v.amountStr} of your wealth to fund your addiction.` },
        { days: 30, title: 'Monthly calculation.', body: (v: MsgVars) => `You have transferred ${v.amountStr} of your wealth to the industry. Annually this grows to ${v.yearlyCostStr}.` },
        { days: 365, title: 'One year tracked. The final bill.', body: (v: MsgVars) => `You've transferred ${v.amountStr} to the industry. Invested, this would have yielded ${v.investedStr} in 10 years.` },
      ]
    };

    const milestonesToUse = hookedMilestones[lang] || hookedMilestones.en;
    for (const milestone of milestonesToUse) {
      const targetDate = new Date(appState.startTime + milestone.days * 24 * 60 * 60 * 1000);
      if (targetDate.getTime() > now) {
        const vars = buildVars(settings, appState, targetDate, lang, currency);
        notifications.push({
          id: idCounter++,
          title: milestone.title,
          body: milestone.body(vars),
          schedule: { at: targetDate },
        });
      }
    }
  }

  // ── HOURLY NOTIFICATIONS ──────────────────────────────────────────────
  if (settings.notificationLevel >= 2) {
    const isIntensive = settings.notificationLevel === 3;
    const daysToSchedule = 4;

    for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
      const baseDate = new Date(now + dayOffset * 24 * 60 * 60 * 1000);
      const hoursToSchedule = isIntensive
        ? [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
        : [9, 21];

      for (const hour of hoursToSchedule) {
        const targetDate = new Date(baseDate);
        targetDate.setHours(hour, 0, 0, 0);

        if (targetDate.getTime() <= now + 60000) continue;

        const msgIndex = hour - 8;
        const msgs = isFree ? (FREE_HOURLY_MESSAGES[lang] || FREE_HOURLY_MESSAGES.en) : (HOOKED_HOURLY_MESSAGES[lang] || HOOKED_HOURLY_MESSAGES.en);
        const msg = msgs[msgIndex];
        if (!msg) continue;

        const vars = buildVars(settings, appState, targetDate, lang, currency);
        notifications.push({
          id: idCounter++,
          title: resolveTitle(msg, vars),
          body: msg.body(vars),
          schedule: { at: targetDate },
        });

        if (notifications.length >= 62) break;
      }
      if (notifications.length >= 62) break;
    }
  }

  if (notifications.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications });
    } catch (e) {
      console.error('Error scheduling notifications', e);
    }
  }
}
