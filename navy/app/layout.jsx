import './globals.css';
import Nav from '@/components/Nav';
import AnnouncementBar from '@/components/AnnouncementBar';
import { ConfirmProvider } from '@/components/Confirm';

export const metadata = {
  title: 'Ledgerline — Practical finance training & placements',
  description: 'Practical, hands-on finance masterclasses taught by Big 4 professionals. 80,000 learners, 20,000 placements.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="navy">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConfirmProvider>
          <AnnouncementBar />
          <Nav />
          <main>{children}</main>
        </ConfirmProvider>
      </body>
    </html>
  );
}
