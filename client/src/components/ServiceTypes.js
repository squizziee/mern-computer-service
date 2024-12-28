import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'
import { Link } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default class ServiceTypes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            login: "",
            password: "",
            user: null,
            loading: true,
            editedServiceType: null,
            serviceTypes: null,
            rerenderCount: 0
        };

        this.fetchServiceTypes = this.fetchServiceTypes.bind(this);
        this.setEditedServiceType = this.setEditedServiceType.bind(this);
        this.rerender = this.rerender.bind(this);
    }

    setEditedServiceType(type) {
        this.setState({ editedServiceType: type })
        this.rerender();
    }

    rerender() {
        this.setState({ rerenderCount: this.state.rerenderCount + 1 })
    }

    async fetchServiceTypes() {
        fetch('/api/servicetype')
            .then((response) => response.json())
            .then((data) => {
                this.setState({ serviceTypes: data });
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    async componentDidMount() {
        onAuthStateChanged(auth, async (user) => {
            await this.fetchServiceTypes();
            this.setState({ user: user });
            this.setState({ loading: false });
        })


    }



    render() {
        return (
            <>
                <Layout>
                    {
                        this.state.user ?
                            <div className='crud-container'>
                                <CreateForm name="" description="" key={this.state.rerenderCount} onCommit={this.fetchServiceTypes} />
                                {
                                    this.state.editedServiceType ?
                                        <EditForm serviceType={this.state.editedServiceType} key={this.state.rerenderCount + 69} onCommit={this.fetchServiceTypes} />
                                        :
                                        <div></div>
                                }
                            </div>
                            :
                            <div></div>
                    }
                    {
                        this.state.serviceTypes ?
                            <div className='service-block-container'>
                                {
                                    this.state.serviceTypes.map((serviceType, index) => (
                                        <div key={index}>
                                            <ServiceTypeBlock authenticated={!!this.state.user} serviceType={serviceType} onDelete={this.fetchServiceTypes} onEdit={e => this.setEditedServiceType(serviceType)} />
                                        </div>

                                    ))
                                }
                            </div>
                            :
                            <div>Loading...</div>
                    }

                </Layout>
            </>
        );
    }
}

function ServiceTypeBlock({ serviceType, onDelete, onEdit, authenticated }) {
    function deleteServiceType(id) {
        axios({
            method: 'DELETE',
            url: `/api/servicetype/${id}`,
        })
            .then((data) => {
                onDelete();
            })
            .catch((err) => {
                alert("Error occured: " + err);
            })
    }

    return (
        <>
            <div className='service-block'>
                <div className='service-block-title'>{serviceType.name}</div>
                {
                    authenticated ?
                        <div>
                            <div className='service-block-time'>
                                <div>
                                    Created (your timezone): {(new Date(serviceType.created_at)).toLocaleString()}
                                    <br></br>
                                    Created (UTC): {(new Date(serviceType.created_at)).toUTCString()}
                                </div>
                            </div>
                            <div className='service-block-time'>
                                <div>
                                    Updated (your timezone): {(new Date(serviceType.last_updated_at)).toLocaleString()}
                                    <br></br>
                                    Updated (UTC): {(new Date(serviceType.last_updated_at)).toUTCString()}
                                </div>
                            </div>
                        </div>

                        :
                        <div></div>
                }
                <div className='service-block-description'>
                    {serviceType.description}
                </div>
                {
                    authenticated ?
                        <div className='service-block-buttons'>
                            <button style={{ backgroundColor: 'red' }} onClick={(e) => { deleteServiceType(serviceType.id) }}>Delete</button>
                            <button onClick={onEdit}>Edit</button>
                        </div>
                        :
                        <div>

                        </div>

                }

            </div>
        </>
    );
}

class CreateForm extends React.Component {
    constructor(props) {
        super(props);

        let name = props.name;
        let nameIsValid = this.validateName(name);

        let description = props.description;
        let descriptionIsValid = this.validateDescription(description);

        this.state = {
            name: name,
            nameValid: nameIsValid,
            description: description,
            descriptionValid: descriptionIsValid,
        };

        this.onNameChange = this.onNameChange.bind(this);
        this.onDescriptionChange = this.onDescriptionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {

    }

    validateName(name) {
        return name.length > 1 && name.length < 100;
    }

    validateDescription(description) {
        return description.length > 1 && description.length < 1000;
    }

    onNameChange(e) {
        var val = e.target.value;
        var valid = this.validateName(val);
        this.setState({ name: val, nameValid: valid });
    }

    onDescriptionChange(e) {
        var val = e.target.value;

        var valid = this.validateDescription(val);
        this.setState({ description: val, descriptionValid: valid });
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.state.nameValid &&
            this.state.descriptionValid) {
            axios({
                method: 'POST',
                url: `api/servicetype`,
                data: qs.stringify({
                    name: this.state.name,
                    description: this.state.description,
                }),
                headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
            })
                .then((data) => {
                    this.props.onCommit();
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    render() {
        let nameColor = this.state.nameValid === true ? "transparent" : "pink";
        let descriptionColor = this.state.descriptionValid === true ? "transparent" : "pink";

        return (
            <div className='general-block'>
                <div className='general-block-title'>Create new</div>
                <form onSubmit={this.handleSubmit}>
                    <p>
                        <label>Name</label><br />
                        <input type="text" value={this.state.name}
                            onChange={this.onNameChange} style={{ borderColor: nameColor }} />
                    </p>
                    <p>
                        <label>Description</label><br />
                        <textarea value={this.state.description}
                            onChange={this.onDescriptionChange} style={{ borderColor: descriptionColor, resize: 'none' }} />
                    </p>

                    <button>Create</button>
                </form>
            </div>

        );
    }
}

class EditForm extends React.Component {
    constructor(props) {
        super(props);

        let name = "";
        let nameIsValid = this.validateName(name);

        let description = "";
        let descriptionIsValid = this.validateDescription(description);

        this.state = {
            name: name,
            nameValid: nameIsValid,
            description: description,
            descriptionValid: descriptionIsValid,
        };

        this.onNameChange = this.onNameChange.bind(this);
        this.onDescriptionChange = this.onDescriptionChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        this.setState({
            name: this.props.serviceType.name,
            nameValid: this.validateName(this.props.serviceType.name),
            description: this.props.serviceType.description,
            descriptionValid: this.validateDescription(this.props.serviceType.description),
        });
    }

    validateName(name) {
        return name.length > 1 && name.length < 100;
    }

    validateDescription(description) {
        return description.length > 1 && description.length < 1000;
    }

    onNameChange(e) {
        var val = e.target.value;
        var valid = this.validateName(val);
        this.setState({ name: val, nameValid: valid });
    }

    onDescriptionChange(e) {
        var val = e.target.value;
        var valid = this.validateDescription(val);
        this.setState({ description: val, descriptionValid: valid });
    }


    handleSubmit(e) {
        e.preventDefault();
        console.log(this.state);

        if (this.state.nameValid &&
            this.state.descriptionValid) {
            console.log("Valid");
            axios({
                method: 'PUT',
                url: `api/servicetype/${this.props.serviceType.id}`,
                data: qs.stringify({
                    name: this.state.name,
                    description: this.state.description,
                }),
                headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
            })
                .then((data) => {
                    console.log(data);
                    this.props.onCommit();
                })
                .catch((err) => {
                    console.log(err);
                    this.props.onCommit();
                })
        }
    }

    render() {
        let nameColor = this.state.nameValid === true ? "#f7f7f7" : "pink";
        let descriptionColor = this.state.descriptionValid === true ? "#f7f7f7" : "pink";

        return (
            <div className='general-block'>
                <div className='general-block-title'>Edit</div>
                <form onSubmit={this.handleSubmit}>
                    <p>
                        <label>Name</label><br />
                        <input type="text" value={this.state.name}
                            onChange={this.onNameChange} style={{ backgroundColor: nameColor }} />
                    </p>
                    <p>
                        <label>Description</label><br />
                        <textarea value={this.state.description}
                            onChange={this.onDescriptionChange} style={{ backgroundColor: descriptionColor, resize: 'none' }} />
                    </p>

                    <button>Apply</button>
                </form>
            </div>

        );
    }
}