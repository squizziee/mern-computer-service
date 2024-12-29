import React, { createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import { useEffect, useState, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../firebase';

export default function Home() {
    const [user, setUser] = useState()
    const [loading, setLoading] = useState(true)
    const [state, setState] = useState(() => {
        // Retrieve persisted state from localStorage
        console.log("called");

        setUser(auth.currentUser);
        setTimeout(() => { setUser(auth.currentUser); }, 500);
    }, []);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user)
        })

    }, [])

    return (
        <>
            <Layout>
                {
                    <div className='greeting-container'>
                        {
                            user ?
                                <div className='greeting'>
                                    <span style={{ position: "relative" }}>
                                        Hi, {user.displayName}!
                                        {
                                            user.providerData[0].providerId == "google.com" ?
                                                <div style={{
                                                    display: "inline",
                                                    fontSize: "12px",
                                                    textTransform: "uppercase",
                                                    color: "#cccccc",
                                                    position: "absolute",
                                                    top: "0",
                                                    right: "0"
                                                }}>
                                                    Logged in with Google
                                                </div>
                                                :
                                                null
                                        }
                                    </span>
                                    <span>Check out the <Link to={'/catalog'}>catalog</Link>  CRUD, cool stuff.</span>
                                </div>
                                :
                                <div className='greeting'>
                                    <span>Hi, newbie!</span>
                                    <span>Come <Link to={'/register'}>register</Link> in the club. Welcome!</span>
                                </div>
                        }

                    </div>

                }
            </Layout>
        </>
    );
}