import React from 'react';
import { Capacitor } from '@capacitor/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import TickerApp from './pages/TickerApp';
import Info from './pages/Info';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import PortraitLock from './components/PortraitLock';

export default function App() {
  const isNative = Capacitor.isNativePlatform();

  // iOS App skips the web landing page entirely
  if (isNative) {
    return (
      <>
        <PortraitLock />
        <TickerApp />
      </>
    );
  }

  // Smart routing logic
  const hasData = localStorage.getItem('addiction_settings') !== null;

  return (
    <>
      <PortraitLock />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={hasData ? <Navigate to="/app" replace /> : <Landing />} />
          <Route path="/app" element={<TickerApp />} />
          <Route path="/info" element={<Info />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
