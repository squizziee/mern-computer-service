import React, { useEffect, useReducer, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import qs from 'qs'
import axios from 'axios'

export default function Register() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [authenticated, setAuthenticated] = useState({ authenticated: false });
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    function registerUser() {
        axios({
            method: 'POST',
            url: '/register',
            data: qs.stringify({
                username: login,
                email: email,
                password: password,
            }),
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
        })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
        // fetch(`/register`, {
        //     method: 'POST',
        //     headers: { 'content-type': 'application/x-www-form-urlencoded' },
        //     body: JSON.stringify({
        //         'username': login,
        //         'email': email,
        //         'password': password,
        //     })
        // })
        //     .then((data) => {
        //         console.log(data);
        //     })
        //     .catch((err) => {
        //         alert("Error occured: " + err);
        //     })
    }

    function registerUserGoogle() {

        window.location.href = "http://localhost:3000/register/google";
        // axios({
        //     method: 'POST',
        //     url: '/register/google',
        //     headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
        // })
        // fetch(`register/google`, {
        //     method: 'POST',
        // })
        //     .then((data) => {
        //         console.log(data);
        //     })
        //     .catch((err) => {
        //         alert("Error occured: " + err);
        //     })
    }

    return (
        <>
            <Layout>
                {
                    <div>
                        <input type='text' name="login" onChange={(e) => setLogin(e.target.value)} />
                        <input type='text' name="email" onChange={(e) => setEmail(e.target.value)} />
                        <input type='password' name="password" onChange={(e) => setPassword(e.target.value)} />
                        <button onClick={registerUser}>Register</button>
                        <button onClick={registerUserGoogle}>Register with Google</button>
                    </div>
                }

            </Layout>
        </>
    );
}