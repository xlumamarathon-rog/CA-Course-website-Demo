import './globals.css';
import Nav from '@/components/Nav';

export const metadata = {
  title: 'Thinking Bridge — Practical finance training & placements',
  description: 'Practical, hands-on finance masterclasses taught by Big 4 professionals. 80,000 learners, 20,000 placements.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="amber">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
