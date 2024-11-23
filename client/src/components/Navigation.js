import React from 'react';
import ReactDOM from 'react-dom/client';
import { Link } from "react-router-dom";

export default function Navigation() {
    return (
        <div className='navigation'>
            <Link to="/">Home</Link>
            <Link to="/catalog">Catalog</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/profile">Profile</Link>
        </div>
    );
}