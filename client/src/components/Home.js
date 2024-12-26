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
        // const token = localStorage.getItem('@token');

        // if (token) {
        //     signInWithCustomToken(auth, token)
        //         .then((userCredential) => {
        //             setUser(auth.currentUser)
        //         })
        //         .catch((error) => {
        //             console.error('Error signing in with token:', error);
        //         });
        // } else {
        //     // User is signed out
        //     // ...
        //     console.log("user is logged out")
        // }
        console.log("aaaa");

        setUser(auth.currentUser)

    }, [])

    return (
        <>
            <Layout>
                {
                    <div className='greeting-container'>
                        {
                            user ?
                                <div className='greeting'>
                                    <span>Hi, {user.displayName}!</span>
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