import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'

export default function Catalog() {
    const [services, setServices] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [authenticated, setAuthenticated] = useState({});
    const [editedService, setEditedService] = useState();
    const [state, setState] = useState(Date.now());

    function aboba(service) {
        console.log(service);
        setEditedService(service)
    }

    function fetchServices() {
        fetch('/api/service')
            .then((response) => response.json())
            .then((data) => {
                setServices(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    useEffect(() => {
        fetchServices()
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
                <UserForm name="" basePrice="0" description="" onCommit={fetchServices} />
                {
                    editedService ?
                        <EditBlock service={editedService} key={state} onEditCommited={fetchServices} />
                        :
                        <div></div>
                }
                <AddBlock onCommited={fetchServices} />
                <SearchBlock onSearchResults={setServices} />
                {
                    services.map((service, index) => (
                        <div key={index}>
                            <ServiceBlock service={service} onDelete={fetchServices} onEdit={(e) => { aboba(service); setState(Date.now()) }} />
                        </div>

                    ))
                }
            </Layout>
        </>
    );
}

function ServiceBlock({ service, onDelete, onEdit }) {
    function deleteService(id) {
        axios({
            method: 'DELETE',
            url: `api/service/${id}`,
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
                <div>{service.name}</div>
                <div>{service.description}</div>
                <div>${service.base_price}</div>
                {/* <div>{service.service_type}</div> */}
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
                <button onClick={(e) => { deleteService(service._id) }}>Delete</button>
                <button onClick={onEdit}>Edit</button>
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

function EditBlock({ service, onEditCommited }) {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [chosenName, setChosenName] = useState("");
    const [chosenBasePrice, setChosenBasePrice] = useState(0);
    const [chosenDescription, setChosenDescription] = useState("");
    const [chosenServiceType, setChosenServiceType] = useState({});
    const [chosenDeviceTypes, setChosenDeviceTypes] = useState([]);

    function fetchServiceTypes() {
        setChosenName(service.name);
        setChosenDescription(service.description);
        setChosenBasePrice(service.base_price)
        fetch('/api/servicetype')
            .then((response) => response.json())
            .then((data) => {
                let options = [];
                for (const entry of data) {
                    options.push({ value: entry._id, label: entry.name })
                }
                setServiceTypes(options);

                // set active options
                for (const st of options) {
                    if (st.value == service.service_type._id) {
                        setChosenServiceType(st);
                        break;
                    }
                }
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    function fetchDeviceTypes() {
        fetch('/api/devicetype')
            .then((response) => response.json())
            .then((data) => {
                let options = [];
                for (const entry of data) {
                    options.push({ value: entry._id, label: entry.name })
                }
                setDeviceTypes(options);

                // set active options
                let deviceTypesTmp = service.device_types.map((dt) => { return { value: dt._id, label: dt.name } });
                console.log(service.device_types);
                console.log(deviceTypesTmp);
                setChosenDeviceTypes(deviceTypesTmp);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    function applyChanges() {
        console.log(service._id);
        console.log(chosenServiceType.value);
        console.log(chosenDeviceTypes);
        console.log(chosenDescription);
        console.log(chosenName);
        console.log(chosenDeviceTypes.map((dt) => dt.value));

        axios({
            method: 'PUT',
            url: `api/service/${service._id}`,
            data: qs.stringify({
                service_type_id: chosenServiceType.value,
                name: chosenName,
                description: chosenDescription,
                base_price: chosenBasePrice,
                device_types: chosenDeviceTypes.map((dt) => dt.value),
            }),
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
        })
            .then((data) => {
                console.log(data);
                onEditCommited();
            })
            .catch((err) => {
                console.log(err);
                onEditCommited();
            })
    }

    useEffect(() => {
        fetchServiceTypes();
        fetchDeviceTypes();

    }, [])

    return (
        <>
            <div className='edit-block'>
                {serviceTypes && deviceTypes ?
                    <div>
                        <input type='text' value={chosenName} onChange={(e) => setChosenName(e.target.value)} />
                        <textarea value={chosenDescription} onChange={(e) => setChosenDescription(e.target.value)} />
                        <input type='text' value={chosenBasePrice} onChange={(e) => setChosenBasePrice(e.target.value)} />
                        <Select options={serviceTypes} value={chosenServiceType} onChange={setChosenServiceType} />
                        <Select options={deviceTypes} value={chosenDeviceTypes} closeMenuOnSelect={false} isMulti onChange={setChosenDeviceTypes} />
                        <button onClick={applyChanges}>Apply</button>
                    </div>
                    :
                    <div></div>
                }
            </div>
        </>
    );
}

function AddBlock({ onCommited }) {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [chosenName, setChosenName] = useState("");
    const [chosenBasePrice, setChosenBasePrice] = useState(0);
    const [chosenDescription, setChosenDescription] = useState("");
    const [chosenServiceType, setChosenServiceType] = useState({});
    const [chosenDeviceTypes, setChosenDeviceTypes] = useState([]);

    function fetchServiceTypes() {
        fetch('/api/servicetype')
            .then((response) => response.json())
            .then((data) => {
                let options = [];
                for (const entry of data) {
                    options.push({ value: entry._id, label: entry.name })
                }
                setServiceTypes(options);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    function fetchDeviceTypes() {
        fetch('/api/devicetype')
            .then((response) => response.json())
            .then((data) => {
                let options = [];
                for (const entry of data) {
                    options.push({ value: entry._id, label: entry.name })
                }
                setDeviceTypes(options);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    function createNew() {
        console.log(chosenServiceType.value);
        console.log(chosenDeviceTypes);
        console.log(chosenDescription);
        console.log(chosenName);
        console.log(chosenDeviceTypes.map((dt) => dt.value));

        axios({
            method: 'POST',
            url: `api/service`,
            data: qs.stringify({
                service_type_id: chosenServiceType.value,
                name: chosenName,
                description: chosenDescription,
                base_price: chosenBasePrice,
                device_types: chosenDeviceTypes.map((dt) => dt.value),
            }),
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
        })
            .then((data) => {
                console.log(data);
                onCommited();
            })
            .catch((err) => {
                console.log(err);
                onCommited();
            })
    }

    useEffect(() => {
        fetchServiceTypes();
        fetchDeviceTypes();
    }, [])

    return (
        <>
            <div className='edit-block'>
                {serviceTypes && deviceTypes ?
                    <div>
                        <input type='text' value={chosenName} onChange={(e) => setChosenName(e.target.value)} />
                        <textarea value={chosenDescription} onChange={(e) => setChosenDescription(e.target.value)} />
                        <input type='text' value={chosenBasePrice} onChange={(e) => setChosenBasePrice(e.target.value)} />
                        <Select options={serviceTypes} value={chosenServiceType} onChange={setChosenServiceType} />
                        <Select options={deviceTypes} value={chosenDeviceTypes} closeMenuOnSelect={false} isMulti onChange={setChosenDeviceTypes} />
                        <button onClick={createNew}>Create</button>
                    </div>
                    :
                    <div></div>
                }
            </div>
        </>
    );
}

class UserForm extends React.Component {
    constructor(props) {
        super(props);

        let name = props.name;
        let nameIsValid = this.validateName(name);

        let description = props.description;
        let descriptionIsValid = this.validateDescription(description);

        let basePrice = props.basePrice
        let basePriceIsValid = this.validateBasePrice(basePrice);

        this.state = {
            name: name,
            nameValid: nameIsValid,
            description: description,
            descriptionValid: descriptionIsValid,
            basePrice: basePrice,
            basePriceValid: basePriceIsValid
        };

        this.onNameChange = this.onNameChange.bind(this);
        this.onDescriptionChange = this.onDescriptionChange.bind(this);
        this.onBasePriceChange = this.onBasePriceChange.bind(this);
        this.onServiceTypeChange = this.onServiceTypeChange.bind(this);
        this.onDeviceTypesChange = this.onDeviceTypesChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        let serviceTypeData =
            await fetch('/api/servicetype')
                .then((response) => response.json())
                .then((data) => {
                    let options = [];
                    for (const entry of data) {
                        options.push({ value: entry._id, label: entry.name })
                    }
                    return options;
                })
                .catch((err) => {
                    console.log(err.message);
                });
        let deviceTypeData =
            await fetch('/api/devicetype')
                .then((response) => response.json())
                .then((data) => {
                    let options = [];
                    for (const entry of data) {
                        options.push({ value: entry._id, label: entry.name })
                    }
                    return options;
                })
                .catch((err) => {
                    console.log(err.message);
                });
        this.setState({
            serviceTypes: serviceTypeData,
            deviceTypes: deviceTypeData
        })
    }

    validateName(name) {
        return name.length > 1 && name.length < 100;
    }

    validateDescription(description) {
        return description.length > 1 && description.length < 1000;
    }

    validateBasePrice(basePrice) {
        return basePrice > 0;
    }

    validateDeviceTypes(deviceTypes) {
        return deviceTypes.length > 0;
    }

    validateServiceType(serviceType) {
        return !!serviceType;
    }

    onNameChange(e) {
        var val = e.target.value;
        console.log(val);
        var valid = this.validateName(val);
        this.setState({ name: val, nameValid: valid });
    }

    onDescriptionChange(e) {
        var val = e.target.value;
        console.log(val);
        var valid = this.validateDescription(val);
        this.setState({ description: val, descriptionValid: valid });
    }

    onBasePriceChange(e) {
        var val = e.target.value;
        console.log(val);
        var valid = this.validateBasePrice(val);
        this.setState({ basePrice: val, basePriceValid: valid });
    }

    onDeviceTypesChange(e) {
        console.log(e);
        var valid = this.validateDeviceTypes(e);
        this.setState({ selectedDeviceTypes: e, selectedDeviceTypesValid: valid });
    }

    onServiceTypeChange(e) {
        console.log(e);
        var valid = this.validateServiceType(e);
        this.setState({ selectedServiceType: e, selectedServiceTypeValid: valid });
    }

    handleSubmit(e) {
        e.preventDefault();
        console.log(this.state);

        if (this.state.nameValid &&
            this.state.descriptionValid &&
            this.state.basePriceValid &&
            this.state.selectedDeviceTypesValid &&
            this.state.selectedServiceTypeValid) {
            axios({
                method: 'POST',
                url: `api/service`,
                data: qs.stringify({
                    service_type_id: this.state.selectedServiceType.value,
                    name: this.state.name,
                    description: this.state.description,
                    base_price: this.state.basePrice,
                    device_types: this.state.selectedDeviceTypes.map((dt) => dt.value),
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
        let nameColor = this.state.nameValid === true ? "green" : "red";
        let descriptionColor = this.state.descriptionValid === true ? "green" : "red";
        let basePriceColor = this.state.basePriceValid === true ? "green" : "red";
        return (
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
                <p>
                    <label>Base price</label><br />
                    <input type="number" value={this.state.basePrice}
                        onChange={this.onBasePriceChange} style={{ borderColor: basePriceColor }} />
                </p>
                {
                    this.state.serviceTypes && this.state.deviceTypes ?
                        <div>
                            <Select options={this.state.serviceTypes} onChange={this.onServiceTypeChange} />
                            <Select options={this.state.deviceTypes} closeMenuOnSelect={false} isMulti onChange={this.onDeviceTypesChange} />
                        </div>
                        :
                        <div></div>
                }

                <input type="submit" value="Add" />
            </form>
        );
    }
}