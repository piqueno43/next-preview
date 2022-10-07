import { destroyCookie, parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { ApolloLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import apolloClient from "../services/apolloClient";
import jwtDecode from "jwt-decode";
import Router from "next/router";
import { useLoginMutation, useRefreshAuthTokenMutation } from "../graphql/generated";


const refreshTokenCookieName = process.env.NEXT_PUBLIC_REFRESH_TOKEN;

type User = {
  firstName: string
  lastName: string
}

type SignInCredentials = {
  username: string;
  password: string;
};

type AuthContextType = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie({}, 'hepta.auth.token.1.0.0', { path: '/' });
  destroyCookie({}, 'hepta.auth.refresh.token.1.0.0', { path: '/' });

  authChannel = new BroadcastChannel('auth');

  authChannel.postMessage("signOut");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const client = apolloClient;
  const [login] = useLoginMutation();
  const [refreshAuthToken] = useRefreshAuthTokenMutation();

  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          authChannel.close();
          Router.push("/");
          break;
        case "signIn":
          authChannel.close();
          Router.push("/");
          break;
        default:
          break;
      }
    }
  }, [authChannel]);

  useEffect(() => {
    const { 'hepta.auth.token.1.0.0': authToken } = parseCookies();

    if (authToken) {
      const { data: { user: { id } } } = jwtDecode<{ data: { user: { id: string } } }>(authToken);

      if (id) {
        client.query({
          query: gql`
            query UserById($id: ID!) {
              user(id: $id, idType: DATABASE_ID) {    
                firstName
                lastName
              }
            }
          `,
          variables: {
            id,
          },
        }).then(({ data }) => {
          setUser({
            firstName: data?.user.firstName,
            lastName: data?.user.lastName,
          });
        }).catch(error => {
          setUser(null);
        }).finally(() => {
          setCookie({}, 'hepta.auth.token.1.0.0', authToken, {
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
          });
        })
      }
    }
  }, []);

  // refresh token if expired 1 day before expiration
  useEffect(() => {
    const { 'hepta.auth.refresh.1.0.0': token } = parseCookies();
    if (token) {
      refreshAuthToken({
        variables: {
          input: token,
        },
      }).then(({ data }) => {
        if (data?.refreshJwtAuthToken.authToken) {
          setCookie({}, 'hepta.auth.token.1.0.0', data?.refreshJwtAuthToken.authToken, {
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
          });
        }
      }).catch(error => {
        destroyCookie({}, 'hepta.auth.token.1.0.0');
        destroyCookie({}, 'hepta.auth.refresh.1.0.0');
      }).finally(() => {
        setCookie({}, 'hepta.auth.token.1.0.0', token, {
          maxAge: 60 * 60 * 24, // 1 day
          path: "/",
        });
      })
    }
  }, [refreshAuthToken]);

  async function signIn({ username, password, }: SignInCredentials) {
    try {

      const response = await login({
        variables: {
          username,
          password,
        },
      });

      const { authToken, refreshToken, user: { lastName, firstName } } = response.data.login;

      setCookie(undefined, 'hepta.auth.token.1.0.0', authToken, {
        maxAge: 1,
        path: "/",
      });

      setCookie(undefined, 'hepta.auth.refresh.1.0.0', refreshToken, {
        maxAge: 1, // 1 minute
        path: "/",
      });

      setUser({ firstName, lastName })

      authChannel.postMessage('signIn');

      window.location.href = "/";
    } catch (error) {
      throw new Error(error);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isAuthenticated
      }}>
      {children}
    </AuthContext.Provider>
  );
}
