import { AppProps, AppInitialProps } from 'next/app'
import { ApolloProvider } from '@apollo/client'
import apolloClient from '../services/apolloClient'
import { AuthProvider } from '../contexts/AuthContext';

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps & AppInitialProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ApolloProvider>
  )
}

export default MyApp
