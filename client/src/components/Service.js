import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import axios from "axios"
import Layout from "./Layout";

export default function ServiceInfo() {
    const { id } = useParams()
    const [service, setService] = useState({})
    const [authenticated, setAuthenticated] = useState({});

    useEffect(() => {
        fetch('/login/status')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setAuthenticated(data);
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

    return (
        <>
            <Layout>
                <div className='service-info-container'>
                    {
                        service._id ?
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
                                                <button style={{ backgroundColor: 'red' }} onClick={(e) => { deleteService(service._id) }}>Delete</button>
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