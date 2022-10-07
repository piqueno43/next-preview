import { ApolloError, isApolloError } from '@apollo/client'
import { useRouter } from 'next/router'
import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext';


export default function login() {
  const { user } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { isAuthenticated, signIn, signOut } = useContext(AuthContext)



  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = {
      username,
      password,
    }
    await signIn(data);
  }

  if (isAuthenticated) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}>
        <p>{user?.firstName} {user?.lastName}</p>
        <p>Você já está logado</p>
        <button onClick={signOut}>Sign out</button>
      </div>
    )
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
    }}>
      <h1>Login</h1>


      <form action="/login" method="post" onSubmit={login}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "30vh",
          gap: "1rem",
          width: "320px"
        }}
      >
        <input
          style={{
            width: "100%",
            height: "2rem",
            border: "1px solid #ccc",
            padding: "0.5rem",
          }}
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          style={{
            width: "100%",
            height: "2rem",
            border: "1px solid #ccc",
            padding: "0.5rem",
          }}
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input type="submit" value="Login"
          style={{
            width: "100%",
            height: "2rem",
            border: "1px solid #ccc",
            padding: "0.5rem",
            backgroundColor: "#95a5a6",
            color: "#fff",

          }}
        />
      </form>
    </div>
  )
}
