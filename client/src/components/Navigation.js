import React from 'react';
import ReactDOM from 'react-dom/client';
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { FaBeer, FaMicrochip, FaScrewdriver, FaUser } from 'react-icons/fa';

export default function Navigation() {
    const [authenticated, setAuthenticated] = useState({});
    const [bitcoinStatus, setBitcoinStatus] = useState({});
    const [ip, setIp] = useState({});

    useEffect(() => {
        fetch('/login/status')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setAuthenticated(data);
            })
    }, [])

    useEffect(() => {
        fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setBitcoinStatus(data)
            })
    }, [])

    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setIp(data)
            })
    }, [])

    return (
        <div className='navigation'>
            <div className='main-routes'>
                <FaMicrochip className='navbar-logo' size={30} />
                <Link to="/">Home</Link>
                <Link to="/catalog">Catalog</Link>
                <Link to="/login">Login</Link>
                {
                    authenticated.authenticated ?
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
                                bitcoinStatus.bpi ?
                                    <div>
                                        BTC:&nbsp;
                                        ${bitcoinStatus.bpi.USD.rate}
                                    </div>
                                    :
                                    <div></div>
                            }
                        </span>
                        <span>
                            {
                                ip.ip ?
                                    <div>
                                        IP:&nbsp;
                                        {ip.ip}
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
                        authenticated.authenticated ?
                            <div>
                                <Link to="/profile">
                                    {authenticated.user.user_profile.first_name} {authenticated.user.user_profile.last_name}
                                </Link>
                                <span>
                                    {authenticated.user.email}
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