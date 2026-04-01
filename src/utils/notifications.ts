import { LocalNotifications } from '@capacitor/local-notifications';
import { UserSettings } from '../components/Onboarding';
import { AppState } from '../components/Ticker';
import { calculateAccumulated, calculateSecuredFutureValue, calculateTotalForecast } from './finance';
import { TRANSLATIONS, formatCurrency } from './i18n';

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

// Generate the schedule based on Intensity Level
export async function scheduleMotivationPlan(settings: UserSettings, appState: AppState) {
  // Always clear first
  await clearAllNotifications();

  // If hooked or level is 0, we don't schedule anything
  if (appState.status === 'riippuvainen' || settings.notificationLevel === 0) {
    return;
  }

  const t = TRANSLATIONS[settings.language];
  const startDate = new Date(appState.startTime);
  const now = Date.now();
  const notificationsToSchedule: any[] = [];
  let idCounter = 1;

  // The schedule configuration
  const daysToSchedule: number[] = [];

  if (settings.notificationLevel === 3) {
    // Intensive
    daysToSchedule.push(1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30, 60, 90, 180, 365);
  } else if (settings.notificationLevel === 2) {
    // Balanced
    daysToSchedule.push(1, 3, 7, 14, 30, 60, 90, 180, 365);
  } else if (settings.notificationLevel === 1) {
    // Milestones only
    daysToSchedule.push(7, 30, 90, 180, 365);
  }

  daysToSchedule.forEach((day) => {
    const targetDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    
    // Only schedule if it's in the future
    if (targetDate.getTime() > now) {
      const daysElapsed = day;
      
      // Calculate financial stats for THAT exact future day
      const expectedSavings = calculateAccumulated(settings.dailyCost, settings.annualPriceIncrease, daysElapsed);
      const formattedExpectedSavings = formatCurrency(expectedSavings, settings.currency, settings.language);
      
      // Calculate compound interest secured for 20 years from now based on those savings
      const expectedSecured = calculateSecuredFutureValue(expectedSavings, 20, settings.expectedReturn);
      const formattedSecured = formatCurrency(expectedSecured, settings.currency, settings.language);

      // Determine the type of message based on the day (to keep it fresh)
      let title = '';
      let body = '';
      
      if (day === 1 || day === 7 || day === 30 || day === 365) {
        // Milestone time
        const unit = day === 1 ? '1' : day === 7 ? '7' : day === 30 ? '30' : '365';
        title = t.notifTimeTitle.replace('{msg}', unit);
        body = t.notifTimeBody1.replace('{days}', day.toString());
      } else if (day % 3 === 0) {
        // Future Investment focused
        title = t.notifInvestTitle;
        body = t.notifInvestBody
          .replace('{futureValue}', formattedSecured)
          .replace('{years}', '20');
      } else {
        // Pure Savings focused
        title = t.notifSavedTitle.replace('{amount}', formattedExpectedSavings);
        body = t.notifSavedBody.replace('{amount}', formattedExpectedSavings);
      }

      notificationsToSchedule.push({
        id: idCounter++,
        title: title,
        body: body,
        schedule: { at: targetDate },
        smallIcon: 'ic_stat_name', // Needs to be configured in Android later
        sound: undefined,
      });
    }
  });

  // Welcome notification (Scheduled 10 seconds from now to confirm it works)
  if (now - appState.startTime < 60000 && settings.notificationLevel > 0) {
     notificationsToSchedule.push({
        id: 9999,
        title: t.notifWelcomeTitle,
        body: t.notifWelcomeBody,
        schedule: { at: new Date(now + 10000) },
     });
  }

  // Schedule all
  if (notificationsToSchedule.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      console.log(`Scheduled ${notificationsToSchedule.length} notifications.`);
    } catch (e) {
      console.error('Error scheduling notifications', e);
    }
  }
}
