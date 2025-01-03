import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import { useEffect, useState } from 'react';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            login: "",
            password: "",
            user: null,
            profile: null,
            loading: true,
        };

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
                .then(data => data.json())
                .then(data => {
                    this.setState({ profile: data, loading: false });
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


    render() {
        return (
            <Layout>
                {
                    this.state.user && this.state.profile ?
                        <div className='profile-edit-block-container'>
                            <EditForm profile={this.state.profile} user={this.state.user} onCommit={this.getProfile} />
                        </div>
                        :
                        <div></div>
                }
            </Layout>
        );
    }
}

class EditForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.onFirstNameChange = this.onFirstNameChange.bind(this);
        this.onLastNameChange = this.onLastNameChange.bind(this);
        this.onPassportSerialChange = this.onPassportSerialChange.bind(this);
        this.onAddressChange = this.onAddressChange.bind(this);
        this.onPhoneNumberChange = this.onPhoneNumberChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        this.setState({
            firstName: this.props.profile.first_name,
            firstNameValid: this.validateName(this.props.profile.first_name),
            lastName: this.props.profile.last_name,
            lastNameValid: this.validateName(this.props.profile.last_name),
            passportSerial: this.props.profile.passport_serial,
            passportSerialValid: this.validatePassportSerial(this.props.profile.passport_serial),
            address: this.props.profile.address,
            addressValid: this.validateAddress(this.props.profile.address),
            phoneNumber: this.props.profile.phone_number,
            phoneNumberValid: this.validatePhoneNumber(this.props.profile.phone_number),
        });
    }

    validateName(name) {
        return name.length > 1 && name.length < 100;
    }

    validatePassportSerial(serial) {
        return serial.length >= 4;
    }

    validateAddress(address) {
        return address.length >= 4;
    }

    validatePhoneNumber(number) {
        return /(\+375|8)( ?\(?0?\d\d\)? ?)((\d\d\d-\d\d-\d\d)|(\d\d\d\d\d\d\d)|(\d\d\d \d\d \d\d))/.test(number);
    }

    onFirstNameChange(e) {
        var val = e.target.value;
        var valid = this.validateName(val);
        this.setState({ firstName: val, firstNameValid: valid });
    }

    onLastNameChange(e) {
        var val = e.target.value;
        var valid = this.validateName(val);
        this.setState({ lastName: val, lastNameValid: valid });
    }

    onPassportSerialChange(e) {
        var val = e.target.value;
        var valid = this.validatePassportSerial(val);
        this.setState({ passportSerial: val, passportSerialValid: valid });
    }

    onAddressChange(e) {
        var val = e.target.value;
        var valid = this.validateAddress(val);
        this.setState({ address: val, addressValid: valid });
    }

    onPhoneNumberChange(e) {
        var val = e.target.value;
        var valid = this.validatePhoneNumber(val);
        this.setState({ phoneNumber: val, phoneNumberValid: valid });
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log(this.state);

        if (this.state.firstNameValid &&
            this.state.lastNameValid &&
            this.state.passportSerialValid &&
            this.state.addressValid &&
            this.state.phoneNumberValid) {
            console.log("Valid");
            const token = await this.props.user.getIdToken()
            axios({
                method: 'PUT',
                url: `api/profile/${this.props.user.uid}`,
                data: qs.stringify({
                    first_name: this.state.firstName,
                    last_name: this.state.lastName,
                    passport_serial: this.state.passportSerial,
                    address: this.state.address,
                    phone_number: this.state.phoneNumber,
                }),
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                    'Authorization': 'Bearer ' + token
                },
            })
                .then((data) => {
                    console.log(data);
                    this.props.onCommit();
                })
                .catch((err) => {
                    console.log(err);
                    this.props.onCommit();
                })
        }
    }

    render() {
        let firstNameColor = this.state.firstNameValid ? "transparent" : "pink";
        let lastNameColor = this.state.lastNameValid ? "transparent" : "pink";
        let passportSerialColor = this.state.passportSerialValid ? "transparent" : "pink";
        let addressColor = this.state.addressValid ? "transparent" : "pink";
        let phoneNumberColor = this.state.phoneNumberValid ? "transparent" : "pink";

        return (
            <div className='profile-edit-block'>
                <div className='profile-edit-block-title'>Profile</div>
                <div className='profile-edit-block-dates'>
                    <span>
                        <strong>Created (your timezone):</strong> {(new Date(this.props.profile.created_at)).toLocaleString()},
                        <strong> UTC:</strong> {(new Date(this.props.profile.created_at)).toUTCString()}
                    </span>
                    <br></br>
                    <span>
                        <strong>Last updated (your timezone):</strong> {(new Date(this.props.profile.last_updated_at)).toLocaleString()},
                        <strong> UTC:</strong> {(new Date(this.props.profile.last_updated_at)).toUTCString()}
                    </span>

                </div>
                <form onSubmit={this.handleSubmit}>
                    <p>
                        <label>First name</label><br />
                        <input type="text" value={this.state.firstName}
                            onChange={this.onFirstNameChange} style={{ borderColor: firstNameColor }} />
                    </p>
                    <p>
                        <label>Last name</label><br />
                        <input type="text" value={this.state.lastName}
                            onChange={this.onLastNameChange} style={{ borderColor: lastNameColor }} />
                    </p>
                    <p>
                        <label>Passport serial number</label><br />
                        <input type="text" value={this.state.passportSerial}
                            onChange={this.onPassportSerialChange} style={{ borderColor: passportSerialColor }} />
                    </p>
                    <p>
                        <label>Address</label><br />
                        <input type="text" value={this.state.address}
                            onChange={this.onAddressChange} style={{ borderColor: addressColor }} />
                    </p>
                    <p>
                        <label>Phone number</label><br />
                        <input type="text" value={this.state.phoneNumber}
                            onChange={this.onPhoneNumberChange} style={{ borderColor: phoneNumberColor }} />
                    </p>

                    <button>Apply</button>
                </form>
            </div>

        );
    }
}