import React, { useEffect, useReducer, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';

export default function Login() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState({ authenticated: false });
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    function authenticate() {
        fetch(`login?username=${login}&password=${password}`, {
            method: 'POST',
        })
            .then((data) => {
                console.log(data);
                setLoginStatus();
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
    }

    function logOut() {
        fetch(`logout`, {
            method: 'POST',
        })
            .then((data) => {
                console.log(data);
                setLoginStatus();
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
    }

    function setLoginStatus() {
        fetch('/login/status')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setAuthenticated(data);
            })
    }

    useEffect(() => {
        setLoginStatus();
    }, [])

    return (
        <>
            <Layout>
                {
                    authenticated.authenticated ?
                        <div>
                            <button onClick={logOut}>Log out</button>
                        </div>
                        :
                        <div>
                            <input type='text' name="login" onChange={(e) => setLogin(e.target.value)} />
                            <input type='password' name="password" onChange={(e) => setPassword(e.target.value)} />
                            <button onClick={authenticate}>Log in</button>
                        </div>
                }

            </Layout>
        </>
    );
}