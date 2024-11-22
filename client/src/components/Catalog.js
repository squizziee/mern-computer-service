import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';

export default function Catalog() {
    const [services, setServices] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetch('/api/service')
            .then((response) => response.json())
            .then((data) => {
                setServices(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);

    return (
        <>
            <Layout>
                <SearchBlock onSearchResults={setServices} />
                {
                    services.map((service, index) => (
                        <div key={index}>
                            <ServiceBlock service={service} />
                        </div>

                    ))
                }
            </Layout>
        </>
    );
}

function ServiceBlock({ service }) {
    return (
        <>
            <div className='service-block'>
                <div>{service.name}</div>
                <div>{service.description}</div>
                <div>${service.base_price}</div>
                <div>{service.service_type.name}</div>
                <div>{service.service_type.name}</div>
                <div>
                    {
                        service.device_types.map((device_type, index) => (
                            <div key={index}>
                                - {device_type.name} -
                                {device_type.description}
                            </div>
                        ))
                    }
                </div>
                <br></br>
            </div>
        </>
    );
}

function SearchBlock({ onSearchResults }) {
    const [query, setQuery] = useState("");

    function search() {
        let queryString = `/api/service?text_query=${query}`;
        console.log(queryString);

        fetch(queryString)
            .then(response => response.json())
            .then((data) => {
                console.log(data)
                onSearchResults(data);
            })
    }

    return (
        <>
            <div className='search-block'>
                <input type='text' name="query" onChange={(e) => setQuery(e.target.value)} />
                <button onClick={search}>Search</button>
            </div>
        </>
    );
}