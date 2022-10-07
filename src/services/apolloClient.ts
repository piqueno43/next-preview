import { ApolloClient, ApolloLink, createHttpLink, FetchResult, from, fromPromise, gql, InMemoryCache, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLError } from 'graphql';
import {  parseCookies } from 'nookies';


import { httpsAgent } from './httpsAgent';

const cache = new InMemoryCache({
  resultCaching: false
});

const link = createHttpLink({  
  uri: `${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/graphql/`,
  fetchOptions: {
    agent: process.env.NODE_ENV === 'development' ? undefined : httpsAgent
  }, 
});
const apolloClient = new ApolloClient({
  connectToDevTools: true,
  cache,  
  link,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore'
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    },
    mutate: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }
  }
});
export default apolloClient;