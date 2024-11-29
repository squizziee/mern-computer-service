import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import qs from 'qs'
import axios from 'axios'
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Register() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [authenticated, setAuthenticated] = useState({});

    function getLoginDetails() {
        fetch('/login/status')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setAuthenticated(data);
            })
    }

    useEffect(() => {
        getLoginDetails();
    }, [])



    return (
        <>
            <Layout>
                {
                    authenticated.authenticated ?
                        <div className='no-register'>
                            You are registered. Come discover <Link to={'/catalog'}>the catalog</Link>.
                        </div>
                        :
                        <RegisterForm />
                }

            </Layout>
        </>
    );
}

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {

    }

    registerUserGoogle() {
        window.location.href = "http://localhost:3000/register/google";
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

    handleSubmit(e) {
        e.preventDefault();
        console.log(this.state);

        if (this.state.usernameValid &&
            this.state.emailValid &&
            this.state.passwordValid) {
            console.log("Valid");
            axios({
                method: 'POST',
                url: '/register',
                data: qs.stringify({
                    username: this.state.username,
                    email: this.state.email,
                    password: this.state.password,
                }),
                headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
            })
                .then((data) => {
                    console.log(data);
                })
                .catch((err) => {
                    alert("Error occured: " + err);
                })
        }
    }

    render() {
        let usernameColor = this.state.usernameValid === true ? "#f7f7f7" : "pink";
        let emailColor = this.state.emailValid === true ? "#f7f7f7" : "pink";
        let passwordColor = this.state.passwordValid === true ? "#f7f7f7" : "pink";
        return (
            <div className='register-block'>
                <div className='register-block-title'>Register</div>
                <form onSubmit={this.handleSubmit}>
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