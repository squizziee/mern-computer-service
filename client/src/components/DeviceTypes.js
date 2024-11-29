import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'
import { Link } from "react-router-dom";

export default function DeviceTypes() {
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [authenticated, setAuthenticated] = useState({});
    const [editedDeviceType, setEditedDeviceType] = useState();
    const [state, setState] = useState(Date.now());

    function aboba(serviceType) {
        console.log(serviceType);
        setEditedDeviceType(serviceType)
    }

    function fetchDeviceTypes() {
        fetch('/api/devicetype')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setDeviceTypes(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    useEffect(() => {
        fetchDeviceTypes()
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
                {
                    authenticated.authenticated ?
                        <div className='crud-container'>
                            <CreateForm name="" description="" onCommit={fetchDeviceTypes} />
                            {
                                editedDeviceType ?
                                    //<EditBlock service={editedService} key={state} onEditCommited={fetchServices} />
                                    <EditForm service={editedDeviceType} key={state} onCommit={fetchDeviceTypes} />
                                    :
                                    <div></div>
                            }
                        </div>
                        :
                        <div></div>
                }
                <div className='service-block-container'>
                    {
                        deviceTypes.map((deviceType, index) => (
                            <div key={index}>
                                <DeviceTypeBlock authenticated={authenticated.authenticated} deviceType={deviceType} onDelete={fetchDeviceTypes} onEdit={(e) => { aboba(deviceType); setState(Date.now()) }} />
                            </div>

                        ))
                    }
                </div>

            </Layout>
        </>
    );
}

function DeviceTypeBlock({ deviceType, onDelete, onEdit, authenticated }) {
    function deleteDeviceType(id) {
        axios({
            method: 'DELETE',
            url: `/api/devicetype/${id}`,
        })
            .then((data) => {
                console.log(data);
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
                            <button style={{ backgroundColor: 'red' }} onClick={(e) => { deleteDeviceType(deviceType._id) }}>Delete</button>
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
                    console.log(data);
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
        console.log(descriptionColor);

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
            name: this.props.service.name,
            nameValid: this.validateName(this.props.service.name),
            description: this.props.service.description,
            descriptionValid: this.validateDescription(this.props.service.description),
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
            console.log(this.props.service._id);
            axios({
                method: 'PUT',
                url: `api/devicetype/${this.props.service._id}`,
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