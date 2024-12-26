import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import qs from 'qs'
import axios from 'axios'
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export default class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            login: "",
            password: "",
            user: null,
            loading: false,
        };

        this.setCurrentUser = this.setCurrentUser.bind(this);
    }

    async componentDidMount() {
        onAuthStateChanged(auth, async (user) => {
            this.setState({ user: user, loading: false });
        })
    }

    setCurrentUser() {
        this.setState({ loading: true });
        onAuthStateChanged(auth, async (user) => {
            this.setState({ user: user, loading: false });
        })
    }

    render() {
        return (
            <>
                <Layout>
                    {
                        this.state.loading ?
                            <div>Loading</div>
                            :
                            <div>
                                {
                                    this.state.user ?
                                        <div className='no-register'>
                                            You are registered. Come discover <Link to={'/catalog'}>the catalog</Link>.
                                        </div>
                                        :
                                        <RegisterForm onFinished={this.setCurrentUser} />
                                }
                            </div>
                    }


                </Layout>
            </>
        );
    }
}

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.registerUser = this.registerUser.bind(this);
    }

    async componentDidMount() {

    }

    async registerUser(e) {
        e.preventDefault();
        console.log(this.state);

        if (this.state.usernameValid &&
            this.state.emailValid &&
            this.state.passwordValid) {
            console.log("Valid");
            await createUserWithEmailAndPassword(auth, this.state.email, this.state.password)
                .then(credential => {
                    updateProfile(credential.user, { displayName: this.state.username })
                });
            await signInWithEmailAndPassword(auth, this.state.email, this.state.password)
                .then((credential) => {
                    axios({
                        url: "/auth/new",
                        method: "POST",
                        data: qs.stringify({ user_id: credential.user.uid }),
                    })
                });
            onAuthStateChanged(auth, async (user) => {
                this.props.onFinished();
            })
        }
    }

    registerUserGoogle() {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then((credential) => {
                axios({
                    url: "/auth/new",
                    method: "POST",
                    data: qs.stringify({ user_id: credential.user.uid }),
                })
            })
            .catch((error) => {
                console.log(error)
                alert("Email already in use")
            })


    }

    validateUsername(name) {
        return name.length > 3 && name.length < 50;
    }

    validateEmail(email) {
        return /(\w*(?<=\w)\.)*(\w)+@(\w+)\.(\w+)/.test(email);
    }

    validatePassword(password) {
        return password.length >= 8;
    }

    onUsernameChange(e) {
        var val = e.target.value;
        var valid = this.validateUsername(val);
        this.setState({ username: val, usernameValid: valid });
    }

    onEmailChange(e) {
        var val = e.target.value;
        var valid = this.validateEmail(val);
        this.setState({ email: val, emailValid: valid });
    }

    onPasswordChange(e) {
        var val = e.target.value;
        var valid = this.validatePassword(val);
        this.setState({ password: val, passwordValid: valid });
    }

    render() {
        let usernameColor = this.state.usernameValid === true ? "#f7f7f7" : "pink";
        let emailColor = this.state.emailValid === true ? "#f7f7f7" : "pink";
        let passwordColor = this.state.passwordValid === true ? "#f7f7f7" : "pink";
        return (
            <div className='register-block'>
                <div className='register-block-title'>Register</div>
                <form onSubmit={this.registerUser}>
                    <p>
                        <label>Email</label><br />
                        <input type="text" value={this.state.name}
                            onChange={this.onEmailChange} style={{ backgroundColor: emailColor }} />
                    </p>
                    <p>
                        <label>Username</label><br />
                        <input type='text'
                            onChange={this.onUsernameChange} style={{ backgroundColor: usernameColor, resize: 'none' }} />
                    </p>
                    <p>
                        <label>Password</label><br />
                        <input type="password"
                            onChange={this.onPasswordChange} style={{ backgroundColor: passwordColor }} />
                    </p>

                    <button>Register</button>
                </form>
                <div className='google-block'>
                    <span className='google-text'>Or register with <strong>Google</strong></span>
                    <button className='button-google' onClick={this.registerUserGoogle}><FaGoogle /></button>
                </div>

            </div>

        );
    }
}