import React, { useState, useEffect } from 'react';
import Onboarding, { UserSettings, InitialStatus } from './components/Onboarding';
import Ticker, { AppState } from './components/Ticker';
import Settings from './components/Settings';
import { requestNotificationPermission, scheduleMotivationPlan, clearAllNotifications } from './utils/notifications';

type ViewState = 'onboarding' | 'ticker' | 'settings';

export default function App() {
  const [view, setView] = useState<ViewState>('onboarding');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    requestNotificationPermission();

    try {
      const savedSettings = localStorage.getItem('addiction_settings');
      const savedState = localStorage.getItem('addiction_state');
      
      if (savedSettings && savedState) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.expectedReturn === undefined) {
          parsedSettings.expectedReturn = 7.0;
        }
        if (parsedSettings.investReminderThreshold === undefined) {
          parsedSettings.investReminderThreshold = 0.01;
        }
        if (parsedSettings.language !== undefined) {
          delete parsedSettings.language;
          // Silently overwrite legacy settings in the background
          localStorage.setItem('addiction_settings', JSON.stringify(parsedSettings));
        }
        if (!parsedSettings.currency) {
          parsedSettings.currency = 'EUR';
          parsedSettings.timeFormat = '24h';
        }
        setSettings(parsedSettings);
        
        const parsedState = JSON.parse(savedState);
        // Clean up legacy periods if they exist
        if (parsedState.periods) {
          delete parsedState.periods;
          localStorage.setItem('addiction_state', JSON.stringify(parsedState));
        }
        
        if (!parsedState.lastTransferTime) {
          parsedState.lastTransferTime = parsedState.startTime;
        }
        
        if (!parsedState.lastTransferTime) {
          parsedState.lastTransferTime = parsedState.startTime;
        }
        
        if (!parsedState.lastDismissedAmount) {
          parsedState.lastDismissedAmount = 0;
        }
        
        setAppState(parsedState);
        scheduleMotivationPlan(parsedSettings, parsedState);
        setView('ticker');
      }
    } catch (e) {
      console.error('Failed to load saved data, resetting:', e);
      localStorage.removeItem('addiction_settings');
      localStorage.removeItem('addiction_state');
    }
  }, []);

  const handleSaveSettings = (newSettings: UserSettings, initialStatus?: InitialStatus) => {
    setSettings(newSettings);
    localStorage.setItem('addiction_settings', JSON.stringify(newSettings));
    
    if (!appState) {
      const now = initialStatus ? initialStatus.startTime : Date.now();
      const status = initialStatus && initialStatus.type === 'hooked' ? 'riippuvainen' : 'vapaa';
      
      const initialState: AppState = { 
        status: status, 
        startTime: now,
        lastTransferTime: now,
        lastDismissedAmount: 0
      };
      setAppState(initialState);
      localStorage.setItem('addiction_state', JSON.stringify(initialState));
      scheduleMotivationPlan(newSettings, initialState);
    } else {
      scheduleMotivationPlan(newSettings, appState);
    }
    setView('ticker');
  };

  const handleUpdateState = (newState: AppState) => {
    setAppState(newState);
    localStorage.setItem('addiction_state', JSON.stringify(newState));
    if (settings) {
      scheduleMotivationPlan(settings, newState);
    }
  };

  const handleEditSettings = () => {
    setView('settings');
  };

  const handleSaveEditedSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('addiction_settings', JSON.stringify(newSettings));
    if (appState) {
      scheduleMotivationPlan(newSettings, appState);
    }
  };

  const handleResetAll = () => {
    clearAllNotifications();
    localStorage.removeItem('addiction_settings');
    localStorage.removeItem('addiction_state');
    setSettings(null);
    setAppState(null);
    setView('onboarding');
  };

  const renderContent = () => {
    if (view === 'onboarding') {
      return <Onboarding onSave={handleSaveSettings} initialSettings={settings} />;
    }

    if (settings && appState) {
      return (
        <>
          <Ticker settings={settings} appState={appState} onUpdateState={handleUpdateState} onEditSettings={handleEditSettings} onResetAll={handleResetAll} />
          {view === 'settings' && (
            <div className="fixed inset-0 z-50 bg-[#050505] overflow-y-auto no-scrollbar">
              <Settings 
                initialSettings={settings} 
                appState={appState} 
                onSave={handleSaveEditedSettings} 
                onUpdateState={handleUpdateState} 
                onCancel={() => setView('ticker')} 
              />
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full bg-[#050505] overflow-hidden">
      {/* App Content */}
      <div className="w-full h-full bg-[#050505] overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
