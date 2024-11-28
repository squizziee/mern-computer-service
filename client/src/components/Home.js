import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import { useEffect, useState, CSSProperties } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [authenticated, setAuthenticated] = useState({});

    useEffect(() => {
        fetch('/login/status')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setAuthenticated(data);
            })
    }, [])

    return (
        <>
            <Layout>
                {
                    authenticated ?
                        <div className='greeting-container'>
                            {
                                authenticated.authenticated ?
                                    <div className='greeting'>
                                        <span>Hi, {authenticated.user.user_profile.first_name} {authenticated.user.user_profile.last_name}!</span>
                                        <span>Check out the <Link to={'/catalog'}>catalog</Link>  CRUD, cool stuff.</span>
                                    </div>
                                    :
                                    <div className='greeting'>
                                        <span>Hi, newbie!</span>
                                        <span>Come <Link to={'/register'}>register</Link> in the club. Welcome!</span>
                                    </div>
                            }

                        </div>
                        :
                        <div className='preloader-container'>
                            <div className='preloader'>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>

                }
            </Layout>
        </>
    );
}