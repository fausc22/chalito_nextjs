import { Html, Head, Main, NextScript } from 'next/document';
import { themeBlockingScript } from '../lib/theme';

export default function Document() {
  return (
    <Html lang="es" suppressHydrationWarning>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo-empresa.png" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBlockingScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
