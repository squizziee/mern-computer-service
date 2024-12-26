import React, { Component, useEffect, useReducer, useState } from 'react';
import Layout from './Layout';
import qs from 'qs'
import axios from 'axios'
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';


export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            login: "",
            password: "",
            user: null,
            profile: null,
            loading: true,
        };

        this.logOut = this.logOut.bind(this);
        this.setCurrentUser = this.setCurrentUser.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }

    async getProfile() {
        this.setState({ loading: true });
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                this.setState({ loading: false });
                return;
            }
            console.log("User present, fetching profile");
            fetch(`/profile/${user.uid}`)
                .then(async (response) => {
                    if (response.status == 404) {
                        console.log("No profile, logging out");
                        await auth.signOut();
                        return;
                    } else {
                        const data = await response.json()
                        this.setState({ profile: data, loading: false });
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        })
    }

    async componentDidMount() {
        onAuthStateChanged(auth, async (user) => {
            this.setState({ user: user, loading: false });
            await this.getProfile();
        })
    }

    setCurrentUser() {
        this.setState({ loading: true });
        onAuthStateChanged(auth, async (user) => {
            this.setState({ user: user, loading: false });
        })

    }

    async logOut() {
        this.setState({ loading: true });
        await auth.signOut()

        onAuthStateChanged(auth, (user) => {
            this.setState({ user: null, loading: false });
        })
    }

    render() {
        return (
            <>
                <Layout>
                    {
                        this.state.loading ?
                            <div>Loading...</div>
                            :
                            <div>
                                {
                                    this.state.user && this.state.profile ?
                                        <div className='no-login'>
                                            <span>
                                                Logged in as <Link to={'/profile'}>{this.state.profile.first_name} {this.state.profile.last_name}</Link>
                                            </span>
                                            <button onClick={this.logOut}>Log out</button>
                                        </div>
                                        :
                                        <LoginForm onLogin={this.setCurrentUser} />
                                }
                            </div>
                    }


                </Layout>
            </>
        );
    }

}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.loginWithEmailAndPassword = this.loginWithEmailAndPassword.bind(this);
        this.loginWithGoogle = this.loginWithGoogle.bind(this);
    }

    async componentDidMount() {

    }

    loginWithGoogle() {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then(_ => this.props.onLogin())
            .catch((error) => {
                console.log(error)
            })
    }

    loginWithEmailAndPassword() {
        signInWithEmailAndPassword(auth, this.state.email, this.state.password)
            .then(a => {
                this.props.onLogin();
            })
            .catch((error) => {
                console.log(error)
            })
    }

    onEmailChange(e) {
        var val = e.target.value;
        this.setState({ email: val });
    }

    onPasswordChange(e) {
        var val = e.target.value;
        this.setState({ password: val });
    }

    render() {
        return (
            <div className='register-block'>
                <div className='register-block-title'>Login</div>
                <form onSubmit={this.loginWithEmailAndPassword}>
                    <p>
                        <label>Email</label><br />
                        <input type='text'
                            onChange={this.onEmailChange} />
                    </p>
                    <p>
                        <label>Password</label><br />
                        <input type="password"
                            onChange={this.onPasswordChange} />
                    </p>

                    <button>Login</button>
                </form>
                <div className='google-block'>
                    <span className='google-text'>Or log in with <strong>Google</strong></span>
                    <button className='button-google' onClick={this.loginWithGoogle}><FaGoogle /></button>
                </div>

            </div>

        );
    }
}