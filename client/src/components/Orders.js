import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'
import { Link } from "react-router-dom";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [state, setState] = useState(Date.now());
    const [authenticated, setAuthenticated] = useState({});

    const filterOptions = [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' },
    ]

    function fetchOrdersWithFilter(filter) {
        fetch(`/api/order${filter.value}`)
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
        fetchOrders()
    }, []);

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
                <div style={{ margin: '20px 20px 0 20px' }}>
                    <Select defaultValue={filterOptions[0]} placeholder='Filter' options={filterOptions} onChange={fetchOrdersWithFilter} />
                </div>

                <div className='order-block-container'>
                    {
                        orders.map((order, index) => (
                            <div key={index}>
                                <OrderBlock order={order} onUpdate={fetchOrders} />
                            </div>

                        ))
                    }
                </div>

            </Layout>
        </>
    );
}

const OrderBlock = ({ order, onUpdate }) => {
    function cancelOrder() {
        axios({
            method: 'PUT',
            url: `api/order/cancel/${order._id}`,
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
            url: `api/order/complete/${order._id}`,
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
                                order.isCompleted ?
                                    <div className='order-completed'>
                                        <span>Completed</span>
                                    </div>
                                    :
                                    <div></div>
                            }
                            {
                                order.isCancelled ?
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
                                    #{order._id.substring(5)}
                                </div>
                                <div>
                                    <strong>{order.client.user_profile.first_name} {order.client.user_profile.last_name} </strong>({order.client.email})
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
                                <div className='buttons'>
                                    <button onClick={cancelOrder}>Cancel</button>
                                    <button onClick={completeOrder} style={{ backgroundColor: "#ffc400", color: "#000000" }}>Complete</button>
                                </div>
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