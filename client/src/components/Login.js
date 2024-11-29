import React, { useEffect, useReducer, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import qs from 'qs'
import axios from 'axios'
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';


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
                window.location.reload();
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
                        <div className='no-login'>
                            <span>
                                Logged in as <Link to={'/profile'}>{authenticated.user.user_profile.first_name} {authenticated.user.user_profile.last_name}</Link>
                            </span>
                            <button onClick={logOut}>Log out</button>
                        </div>
                        :
                        <LoginForm onLogin={setLoginStatus} />
                }

            </Layout>
        </>
    );
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {

    }

    registerUserGoogle() {
        window.location.href = "http://localhost:3000/register/google";
    }

    onUsernameChange(e) {
        var val = e.target.value;
        var valid = this.validateUsername(val);
        this.setState({ username: val, usernameValid: valid });
    }

    onPasswordChange(e) {
        var val = e.target.value;
        var valid = this.validatePassword(val);
        this.setState({ password: val, passwordValid: valid });
    }

    handleSubmit(e) {
        e.preventDefault();
        console.log(this.state);

        axios({
            method: 'POST',
            url: `login?username=${this.state.username}&password=${this.state.password}`,
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
        })
            .then((data) => {
                console.log(data);
                this.props.onLogin();
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
    }

    render() {
        return (
            <div className='register-block'>
                <div className='register-block-title'>Login</div>
                <form onSubmit={this.handleSubmit}>
                    <p>
                        <label>Username</label><br />
                        <input type='text'
                            onChange={this.onUsernameChange} />
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
                    <button className='button-google' onClick={this.registerUserGoogle}><FaGoogle /></button>
                </div>

            </div>

        );
    }
}