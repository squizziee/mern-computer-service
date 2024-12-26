import React from 'react';
import ReactDOM from 'react-dom/client';
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { FaBeer, FaMicrochip, FaScrewdriver, FaUser } from 'react-icons/fa';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default class Navigation extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            bitcoinStatus: null,
            ip: null,
            user: null,
            profile: null,
        }

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
        fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                this.setState({ bitcoinStatus: data })
            })

        fetch('https://api.ipify.org?format=json')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                this.setState({ ip: data })
            })

        onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            this.setState({ user: user, loading: false });
            await this.getProfile();
        })
    }

    render() {
        return (
            <div className='navigation'>
                <div className='main-routes'>
                    <FaMicrochip className='navbar-logo' size={30} />
                    <Link to="/">Home</Link>
                    <Link to="/catalog">Catalog</Link>
                    <Link to="/login">Login</Link>
                    {
                        this.state.user && this.state.profile ?
                            <div></div>
                            :
                            <Link to="/register">Register</Link>
                    }
                    <Link to="/servicetypes">Types</Link>
                    <Link to="/devicetypes">Devices</Link>
                    <Link to="/orders">Orders</Link>
                </div>
                <div style={{ display: "flex" }}>
                    <div className='misc-info'>
                        <div>
                            <span>
                                {
                                    this.state.bitcoinStatus ?
                                        <div>
                                            BTC:&nbsp;
                                            ${this.state.bitcoinStatus.bpi.USD.rate}
                                        </div>
                                        :
                                        <div></div>
                                }
                            </span>
                            <span>
                                {
                                    this.state.ip ?
                                        <div>
                                            IP:&nbsp;
                                            {this.state.ip.ip}
                                        </div>
                                        :
                                        <div></div>
                                }
                            </span>
                        </div>
                    </div>
                    <div className='misc-info'>
                        <div>
                            <span>
                                {(new Date()).toLocaleDateString()}
                            </span>
                            <span>
                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </span>
                        </div>
                    </div>
                    <div className='auth-info'>
                        {
                            this.state.user && this.state.profile ?
                                <div>
                                    <Link to="/profile">
                                        {this.state.profile.first_name} {this.state.profile.last_name}
                                    </Link>
                                    <span>
                                        {this.state.user.email}
                                    </span>
                                </div>
                                :
                                <div></div>
                        }
                    </div>
                </div>

            </div>
        );
    }
}