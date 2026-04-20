import React from 'react';
import WebsiteNav from '../components/WebsiteNav';

export default function Privacy() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#0D0D0D] text-white font-sans w-full relative">
      <WebsiteNav />

      <main className="max-w-2xl w-full mx-auto px-6 pt-[120px] md:pt-[160px] pb-32 relative z-10">

        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-3 text-white/90">Privacy Policy</h1>
          <div className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/20">
            Last updated: April 13, 2026
          </div>
        </div>

        <div className="privacy-content w-full">
          <style>{`
            .privacy-content h2 {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.45em;
              color: rgba(255,255,255,0.3);
              margin-top: 48px;
              margin-bottom: 20px;
              font-weight: 500;
            }
            .privacy-content p {
              margin-bottom: 20px;
              font-weight: 300;
              color: rgba(255,255,255,0.45);
              line-height: 1.85;
              font-size: 16px;
            }
            .privacy-content strong {
              color: rgba(255,255,255,0.85);
              font-weight: 500;
            }
            .privacy-content .highlight {
              border-left: 1px solid rgba(255,255,255,0.1);
              padding: 4px 0 4px 24px;
              margin-bottom: 48px;
              font-size: 16px;
              font-weight: 300;
              line-height: 1.85;
              color: rgba(255,255,255,0.5);
            }
          `}</style>

          <div className="highlight">
            <strong>Short version:</strong> We do not collect, store or share any personal data. The app works fully offline.
          </div>

          <h2>1. Overview</h2>
          <p>Thank you for choosing <strong>Addiction Ticker</strong>. Your privacy is critically important to us. This privacy policy explains how we handle your data.</p>

          <h2>2. What data do we collect?</h2>
          <p>The application does not collect, transmit, or store any personal data, analytics, or device information to external servers. We do not use any third-party tracking code (such as Google Analytics or Facebook Pixel).</p>

          <h2>3. Where is data stored?</h2>
          <p>All data you enter into the application (such as daily consumption, start date, and motivation settings) is stored exclusively in your device's local memory. This data never leaves your phone, unless you choose to share the results calculated by the app.</p>
          <p>Because we do not store your data, we are also unable to recover it if you delete the application or change devices.</p>

          <h2>4. Who do we share your data with?</h2>
          <p>Since we do not collect your data, we have nothing to share or sell to third parties.</p>

          <h2>5. Permissions required by the app</h2>
          <p>The application may request permission to send local notifications to support your goals. These notifications are generated entirely on your own device and their content is never transmitted to the network.</p>

          <h2>6. Children's privacy</h2>
          <p>The application is not directed at children under the age of 13, and we do not knowingly collect personal data from anyone, including children.</p>

          <h2>7. Changes to this privacy policy</h2>
          <p>We may update this privacy policy from time to time. We recommend checking this page regularly for any changes. Changes take effect immediately upon publication on this page.</p>

          <h2>8. Contact</h2>
          <p>For any questions regarding this application, you can contact us by email: <strong>touko.aunio@icloud.com</strong></p>
        </div>

        <div className="mt-24 pt-8 border-t border-white/[0.04] text-center text-[9px] uppercase tracking-[0.35em] font-medium text-white/20">
          © 2026 Addiction Ticker. All rights reserved.
        </div>
      </main>
    </div>
  );
}
