import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'
import { Link } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default class DeviceTypes extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            login: "",
            password: "",
            user: null,
            loading: true,
            editedDeviceType: null,
            deviceTypes: null,
            rerenderCount: 0
        };

        this.fetchDeviceTypes = this.fetchDeviceTypes.bind(this);
        this.setEditedDeviceType = this.setEditedDeviceType.bind(this);
        this.rerender = this.rerender.bind(this);
    }

    setEditedDeviceType(type) {
        this.setState({ editedDeviceType: type })
        this.rerender();
    }

    rerender() {
        this.setState({ rerenderCount: this.state.rerenderCount + 1 })
    }

    async fetchDeviceTypes() {
        fetch('/api/devicetype')
            .then((response) => response.json())
            .then((data) => {
                this.setState({ deviceTypes: data });
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    async componentDidMount() {
        onAuthStateChanged(auth, async (user) => {
            await this.fetchDeviceTypes();
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
                                <CreateForm name="" description="" key={this.state.rerenderCount} onCommit={this.fetchDeviceTypes} />
                                {
                                    this.state.editedDeviceType ?
                                        <EditForm deviceType={this.state.editedDeviceType} key={this.state.rerenderCount + 69} onCommit={this.fetchDeviceTypes} />
                                        :
                                        <div></div>
                                }
                            </div>
                            :
                            <div></div>
                    }
                    {
                        this.state.deviceTypes ?
                            <div className='service-block-container'>
                                {
                                    this.state.deviceTypes.map((deviceType, index) => (
                                        <div key={index}>
                                            <DeviceTypeBlock authenticated={!!this.state.user} deviceType={deviceType} onDelete={this.fetchDeviceTypes} onEdit={e => this.setEditedDeviceType(deviceType)} />
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

function DeviceTypeBlock({ deviceType, onDelete, onEdit, authenticated }) {
    function deleteDeviceType(id) {
        axios({
            method: 'DELETE',
            url: `/api/devicetype/${id}`,
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
                <div className='service-block-title'>{deviceType.name}</div>
                {
                    authenticated ?
                        <div>
                            <div className='service-block-time'>
                                <div>
                                    Created (your timezone): {(new Date(deviceType.created_at)).toLocaleString()}
                                    <br></br>
                                    Created (UTC): {(new Date(deviceType.created_at)).toUTCString()}
                                </div>
                            </div>
                            <div className='service-block-time'>
                                <div>
                                    Updated (your timezone): {(new Date(deviceType.last_updated_at)).toLocaleString()}
                                    <br></br>
                                    Updated (UTC): {(new Date(deviceType.last_updated_at)).toUTCString()}
                                </div>
                            </div>
                        </div>

                        :
                        <div></div>
                }
                <div className='service-block-description'>
                    {deviceType.description}
                </div>
                {
                    authenticated ?
                        <div className='service-block-buttons'>
                            <button style={{ backgroundColor: 'red' }} onClick={(e) => { deleteDeviceType(deviceType.id) }}>Delete</button>
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
                url: `api/devicetype`,
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
            name: this.props.deviceType.name,
            nameValid: this.validateName(this.props.deviceType.name),
            description: this.props.deviceType.description,
            descriptionValid: this.validateDescription(this.props.deviceType.description),
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
                url: `api/devicetype/${this.props.deviceType.id}`,
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