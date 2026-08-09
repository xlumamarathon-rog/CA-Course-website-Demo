import './globals.css';
import { ThemeProvider, themeBootScript } from '@/lib/theme';
import DemoBar from '@/components/DemoBar';
import AnnouncementBar from '@/components/AnnouncementBar';
import { ConfirmProvider } from '@/components/Confirm';
import Nav from '@/components/Nav';

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
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ConfirmProvider>
          <DemoBar />
          <AnnouncementBar />
          <Nav />
          <main>{children}</main>
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
