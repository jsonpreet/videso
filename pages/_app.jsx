import { ThemeProvider } from 'next-themes';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NextNProgress from 'nextjs-progressbar';
import Head from 'next/head';
import { lazy, Suspense, useEffect, useState } from 'react'
import MetaTags from '@app/components/Common/MetaTags';
import { Devtools } from '@app/components/DevTools';
import { queryConfig, queryConfigAuto } from '@app/utils/constants';

import '@styles/globals.scss'
import { useRouter } from 'next/router';
import Layout from '@app/components/Common/Layout';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [config, setConfig] = useState(queryConfig);

  useEffect(() => {
    if (router.pathname === '/watch/[id]') {
      setConfig(queryConfig);
    } else {
      setConfig(queryConfigAuto);
    }
  }, [router]);
  const [queryClient] = useState(() => new QueryClient(config))
  return (
    <>
      <MetaTags/>
      <NextNProgress color="#db2777" showOnShallow={true} />
      <ThemeProvider enableSystem={false} attribute="class">
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Devtools />
          </Hydrate>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
