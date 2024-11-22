import React from 'react';
import ReactDOM from 'react-dom/client';
import Navigation from './Navigation';

export default function Layout({ children }) {
    return (
        <>
            <Navigation />
            <main>{children}</main>
        </>
    );
}