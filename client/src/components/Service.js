import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import axios from "axios"
import Layout from "./Layout";
import qs from 'qs';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function ServiceInfo() {
    const { id } = useParams()
    const [service, setService] = useState({})
    const [authenticated, setAuthenticated] = useState({});

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated({ authenticated: true, user: user });
            }
            else {
                setAuthenticated({ authenticated: false, user: null });
            }
        })
    }, [])

    function deleteService(id) {
        axios({
            method: 'DELETE',
            url: `/api/service/${id}`,
        })
            .then((data) => {
                console.log(data);
                window.location.href = '/catalog';
            })
            .catch((err) => {
                console.log("Error occured: " + err);
            })
    }

    useEffect(() => {
        fetch(`/api/service/${id}`)
            .then(response => response.json())
            .then((data) => {
                console.log(data);
                setService(data);
            })
            .catch((err) => {
                console.log(err);
            })
    }, [])

    function orderService() {
        if (!window.confirm('Are you sure you want to purchase the service?')) {
            return;
        }
        let info = window.prompt("Any additional info you want us to know")
        axios({
            method: 'POST',
            url: `/api/order/`,
            data: qs.stringify({
                service: service,
                client: authenticated.user,
                additional_info: info
            }),
        })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
    }

    return (
        <>
            <Layout>
                <div className='service-info-container'>
                    {
                        service.id ?
                            <div className='service-info-block'>
                                <div className="name">{service.name}</div>
                                <div className="type">{service.service_type.name}</div>
                                <div className="description">{service.description}</div>
                                <div className="devices">
                                    {
                                        service.device_types.map((device_type, index) => (
                                            <div className='gadget' key={index}>
                                                <strong>{device_type.name}</strong>
                                                &nbsp;-&nbsp;{device_type.description}
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="buttons">
                                    <div>
                                        {
                                            authenticated.authenticated ?
                                                <div style={{ display: 'inline-block' }}>
                                                    <button style={{ backgroundColor: 'red' }} onClick={(e) => { deleteService(service.id) }}>Delete</button>
                                                    <button onClick={orderService}>Purchase</button>
                                                </div>

                                                :
                                                <div></div>
                                        }

                                        <button onClick={(e) => { window.location.href = '/catalog' }}>Close</button>
                                    </div>
                                    <div className="price">
                                        ${service.base_price}
                                    </div>
                                </div>
                            </div>
                            :
                            <div></div>
                    }

                </div>
            </Layout>

        </>
    );
}