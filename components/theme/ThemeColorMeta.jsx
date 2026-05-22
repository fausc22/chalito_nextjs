import { useEffect } from 'react';
import Head from 'next/head';
import { useTheme } from 'next-themes';

const LIGHT_COLOR = '#f8fafc';
const DARK_COLOR = '#020617';

export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === 'dark' ? DARK_COLOR : LIGHT_COLOR;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }, [resolvedTheme]);

  const content = resolvedTheme === 'dark' ? DARK_COLOR : LIGHT_COLOR;

  return (
    <Head>
      <meta name="theme-color" content={content} />
    </Head>
  );
}
