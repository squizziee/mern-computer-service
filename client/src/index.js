import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import Layout from './components/Layout';
import Home from './components/Home';
import Profile from './components/Profile';
import Catalog from './components/Catalog';
import Register from './components/Register';
import ServiceInfo from './components/Service';
import ServiceTypes from './components/ServiceTypes';
import DeviceTypes from './components/DeviceTypes';
import Orders from './components/Orders';
import Login from './components/Login';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="catalog" element={<Catalog />} />
      <Route path="servicetypes" element={<ServiceTypes />} />
      <Route path="devicetypes" element={<DeviceTypes />} />
      <Route path="catalog/:id" element={<ServiceInfo />} />
      <Route path="profile" element={<Profile />} />
      <Route path="orders" element={<Orders />} />
      {/* <Route path="*" element={<NoPage />} /> */}
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
