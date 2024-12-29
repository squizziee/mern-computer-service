import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'
import { Link } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [authenticated, setAuthenticated] = useState({});
    const [state, setState] = useState(Date.now());

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' },
    ]

    function fetchOrdersWithFilter(filter) {
        fetch(`/api/order/filter/${filter.value}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setOrders(data);
            })
            .catch((err) => {
                console.log(err.message);
            });

    }
    // fetch('/api/order')
    //     .then((response) => response.json())
    //     .then((data) => {
    //         console.log(data);
    //         setOrders(data);
    //     })
    //     .catch((err) => {
    //         console.log(err.message);
    //     });

    function fetchOrders() {
        fetch('/api/order')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setOrders(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated({ authenticated: true, user: user })
            } else {
                setAuthenticated({ authenticated: false })
            }

        })
    }, [])

    useEffect(() => {
        fetchOrders()
    }, []);

    return (
        <>
            <Layout>
                <div style={{ margin: '20px 20px 0 20px' }}>
                    <Select defaultValue={filterOptions[0]} placeholder='Filter' options={filterOptions} onChange={fetchOrdersWithFilter} />
                </div>

                <div className='order-block-container'>
                    {
                        orders.map((order, index) => (
                            <div key={index}>
                                <OrderBlock order={order} onUpdate={fetchOrders} authenticated={authenticated} />
                            </div>

                        ))
                    }
                </div>

            </Layout>
        </>
    );
}

const OrderBlock = ({ order, onUpdate, authenticated }) => {
    function cancelOrder() {
        axios({
            method: 'PUT',
            url: `api/order/cancel/${order.id}`,
        })
            .then((data) => {
                console.log(data);
                onUpdate();
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
    }

    function completeOrder() {
        axios({
            method: 'PUT',
            url: `api/order/complete/${order.id}`,
        })
            .then((data) => {
                console.log(data);
                onUpdate();
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
    }

    return (
        <>
            <div className='order-block'>
                {
                    order.service ?
                        <div>
                            {
                                order.is_completed ?
                                    <div className='order-completed'>
                                        <span>Completed</span>
                                    </div>
                                    :
                                    <div></div>
                            }
                            {
                                order.is_cancelled ?
                                    <div className='order-cancelled'>
                                        <span>Cancelled</span>
                                    </div>
                                    :
                                    <div></div>
                            }
                        </div>
                        :
                        <div className='order-cancelled'>
                            <span>Deleted</span>
                        </div>
                }

                {
                    !order.service ?
                        <div></div>
                        :
                        <div>
                            <div className='order-general'>
                                <div className='order-id'>
                                    #{order.id.substring(5)}
                                </div>
                                <div>
                                    <strong>{order.client.first_name} {order.client.last_name} </strong>({order.client.phone_number})
                                </div>
                            </div>
                            <div className='order-service'>
                                <strong>[{order.service.service_type.name}]</strong>
                                <em> {order.service.name} - {order.additional_info ? order.additional_info : 'no additional info'}</em>
                                <br></br>
                                {
                                    order.service.device_types.map((deviceType, index) => (
                                        <div className='device-type' key={index}>
                                            {deviceType.name}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='order-total'>
                                {
                                    authenticated.authenticated ?
                                        <div className='buttons'>
                                            <button onClick={cancelOrder}>Cancel</button>
                                            <button onClick={completeOrder} style={{ backgroundColor: "#ffc400", color: "#000000" }}>Complete</button>
                                        </div>
                                        :
                                        null
                                }

                                <div className='order-price'>
                                    ${order.service.base_price}
                                </div>
                            </div>
                        </div>
                }

            </div>
        </>
    );
}