import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout';
import axios from 'axios'
import qs from 'qs'
import Select from 'react-select'
import { Link } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default class Catalog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            loading: true,
            editedService: null,
            services: null,
            visibleServices: null,
            serviceTypes: null,
            deviceTypes: null,
            rerenderCount: 0
        };

        this.fetchServices = this.fetchServices.bind(this);
        this.setEditedService = this.setEditedService.bind(this);
        this.setVisibleServices = this.setVisibleServices.bind(this);
        this.rerender = this.rerender.bind(this);
    }

    setEditedService(service) {
        this.setState({ editedService: service })
        this.rerender();
    }

    rerender() {
        this.setState({ rerenderCount: this.state.rerenderCount + 1 })
    }

    async fetchServices(firstLoading = true) {
        this.setState({ loading: true })
        fetch('/api/service')
            .then((response) => response.json())
            .then((data) => {
                if (firstLoading) this.setState({ services: data, visibleServices: data });
                else this.setState({ services: data, visibleServices: data, loading: false });
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    async fetchOther() {
        this.setState({ loading: true })
        fetch('/api/servicetype')
            .then((response) => response.json())
            .then((data) => {
                this.setState({ serviceTypes: data });
            })
            .catch((err) => {
                console.log(err.message);
            });
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
            await this.fetchServices();
            await this.fetchOther();
            this.setState({ user: user });
            this.setState({ loading: false });
        })
    }

    setVisibleServices(data) {
        this.setState({ visibleServices: data })
    }

    render() {
        return (
            <>
                <Layout>
                    {
                        this.state.user && this.state.serviceTypes && this.state.deviceTypes ?
                            <div className='crud-container'>
                                <CreateForm
                                    serviceTypes={this.state.serviceTypes}
                                    deviceTypes={this.state.deviceTypes}
                                    name=""
                                    basePrice="0"
                                    description=""
                                    onCommit={e => this.fetchServices(false)} />
                                {
                                    this.state.editedService ?
                                        <EditForm
                                            serviceTypes={this.state.serviceTypes}
                                            deviceTypes={this.state.deviceTypes}
                                            service={this.state.editedService}
                                            key={this.state.rerenderCount + 23}
                                            onCommit={e => this.fetchServices(false)} />
                                        :
                                        <div></div>
                                }
                            </div>
                            :
                            <div></div>
                    }
                    {
                        this.state.user && !this.state.loading ?
                            <div>
                                <SearchBlock
                                    serviceTypes={this.state.serviceTypes}
                                    deviceTypes={this.state.deviceTypes}
                                    onSearchResults={this.setVisibleServices} />
                                <div className='service-block-container'>
                                    {
                                        this.state.visibleServices ?
                                            this.state.visibleServices.map((service, index) => (
                                                <div key={index}>
                                                    <ServiceBlock
                                                        user={this.state.user}
                                                        authenticated={!!this.state.user}
                                                        service={service}
                                                        onDelete={e => this.fetchServices(false)}
                                                        onEdit={e => this.setEditedService(service)} />
                                                </div>

                                            ))
                                            :
                                            <div>Loading...</div>
                                    }
                                </div>
                            </div>
                            :
                            <div>

                            </div>
                    }

                </Layout>
            </>
        );
    }
}

function Catalogc() {
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
                console.log(data);
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
                {
                    authenticated.authenticated ?
                        <div className='crud-container'>
                            <CreateForm name="" basePrice="0" description="" onCommit={fetchServices} />
                            {
                                editedService ?
                                    //<EditBlock service={editedService} key={state} onEditCommited={fetchServices} />
                                    <EditForm service={editedService} key={state} onCommit={fetchServices} />
                                    :
                                    <div></div>
                            }
                        </div>
                        :
                        <div></div>
                }
                <SearchBlock onSearchResults={setServices} />
                <div className='service-block-container'>
                    {
                        services.map((service, index) => (
                            <div key={index}>
                                <ServiceBlock user={authenticated.user} authenticated={authenticated.authenticated} service={service} onDelete={fetchServices} onEdit={(e) => { aboba(service); setState(Date.now()) }} />
                            </div>

                        ))
                    }
                </div>

            </Layout>
        </>
    );
}

function ServiceBlock({ user, service, onDelete, onEdit, authenticated }) {
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

    function onInfo(e) {
        window.location.href = `/catalog/${service.id}`;
    }

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
                client: user,
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
            <div className='service-block'>
                <div className='service-block-title'>{service.name}</div>
                <div className='service-block-category'>
                    <div>{service.service_type.name}</div>
                    <div>${service.base_price}</div>
                </div>
                {
                    authenticated ?
                        <div>
                            <div className='service-block-time'>
                                <div>
                                    Created (your timezone): {(new Date(service.created_at)).toLocaleString()}
                                    <br></br>
                                    Created (UTC): {(new Date(service.created_at)).toUTCString()}
                                </div>
                            </div>
                            <div className='service-block-time'>
                                <div>
                                    Updated(your timezone): {(new Date(service.last_updated_at)).toLocaleString()}
                                    <br></br>
                                    Updated (UTC): {(new Date(service.last_updated_at)).toUTCString()}
                                </div>
                            </div>
                        </div>
                        :
                        <div></div>
                }
                <div className='service-block-description'>
                    {
                        service.description.length > 80 ?
                            <span>{service.description.substring(0, 80)}...</span>
                            :
                            <span>{service.description}</span>
                    }
                </div>
                <div className='service-block-gadgets'>
                    {
                        service.device_types.map((device_type, index) => (
                            <div className='gadget' key={index}>
                                <strong>{device_type.name}</strong>
                                &nbsp;-&nbsp;{device_type.description}
                            </div>
                        ))
                    }
                </div>
                {
                    authenticated ?
                        <div className='service-block-buttons'>
                            <button style={{ backgroundColor: 'red' }} onClick={(e) => { deleteService(service.id) }}>Delete</button>
                            <button onClick={onEdit}>Edit</button>
                            <button onClick={onInfo}>View</button>
                            <button onClick={orderService}>Purchase</button>
                        </div>
                        :
                        <div className='service-block-buttons'>
                            <button onClick={onInfo}>View</button>
                        </div>

                }

            </div>
        </>
    );
}

function SearchBlock({ onSearchResults }) {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [deviceTypes, setDeviceTypes] = useState([]);

    const [query, setQuery] = useState("");
    const [chosenMinPrice, setChosenMinPrice] = useState(0);
    const [chosenMaxPrice, setChosenMaxPrice] = useState(0);
    const [sortBy, setSortBy] = useState({});
    const [chosenServiceTypes, setChosenServiceTypes] = useState({});
    const [chosenDeviceTypes, setChosenDeviceTypes] = useState([]);

    const sortOptions = [
        { value: 'service_type', label: 'Sort by service type' },
        { value: '-service_type', label: 'Sort by service type (reverse)' },
        { value: 'name', label: 'Sort by name' },
        { value: '-name', label: 'Sort by name (reverse)' },
        { value: 'base_price', label: 'Sort from cheap to expensive' },
        { value: '-base_price', label: 'Sort from expensive to cheap' },
    ]

    function assembleQueryParams() {
        const params = new URLSearchParams({});
        if (query) params.append('text_query', query);
        if (chosenMinPrice) params.append('min_price', chosenMinPrice);
        if (chosenMaxPrice) params.append('max_price', chosenMaxPrice);
        if (sortBy) params.append('sort', sortBy.value);
        try {
            if (chosenServiceTypes) {
                for (let s of chosenServiceTypes) {
                    params.append('service_type_list', s.value);
                }
            }
        } catch (err) { }
        try {
            if (chosenDeviceTypes) {
                for (let d of chosenDeviceTypes) {
                    params.append('device_types', d.value);
                }
            }
        } catch (err) { }

        return params.toString()
    }

    function search() {
        let params = assembleQueryParams();
        let queryString = `/api/service?${params}`;
        console.log(queryString);

        fetch(queryString)
            .then(response => response.json())
            .then((data) => {
                console.log(data)
                onSearchResults(data);
            })
    }

    function fetchServiceTypes() {
        fetch('/api/servicetype')
            .then((response) => response.json())
            .then((data) => {
                let options = [];
                for (const entry of data) {
                    options.push({ value: entry.id, label: entry.name })
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
                    options.push({ value: entry.id, label: entry.name })
                }
                setDeviceTypes(options);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    useEffect(() => {
        fetchServiceTypes();
        fetchDeviceTypes();
    }, [])

    return (
        <>
            <div className='search-block general-block'>
                <div className='general-block-title'>Search</div>
                <input type='text' placeholder='Search anything...' onChange={(e) => setQuery(e.target.value)} />
                <input type='number' placeholder='Minimum price' onChange={(e) => setChosenMinPrice(e.target.value)} />
                <input type='number' placeholder='Maximum price' onChange={(e) => setChosenMaxPrice(e.target.value)} />
                {serviceTypes && deviceTypes ?
                    <div>
                        <Select placeholder='Service types' options={serviceTypes} closeMenuOnSelect={false} isMulti onChange={setChosenServiceTypes} />
                        <Select placeholder='Device types' options={deviceTypes} closeMenuOnSelect={false} isMulti onChange={setChosenDeviceTypes} />
                        <Select placeholder='Sort by' options={sortOptions} onChange={setSortBy} />
                        <button onClick={search}>Search</button>
                    </div>
                    :
                    <div></div>
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
        let serviceTypeData = [];

        for (const entry of this.props.serviceTypes) {
            serviceTypeData.push({ value: entry.id, label: entry.name })
        }

        let deviceTypeData = [];

        for (const entry of this.props.deviceTypes) {
            deviceTypeData.push({ value: entry.id, label: entry.name })
        }

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
                    this.props.onCommit();
                })
        }
    }

    render() {
        let nameColor = this.state.nameValid === true ? "transparent" : "pink";
        let descriptionColor = this.state.descriptionValid === true ? "transparent" : "pink";
        let basePriceColor = this.state.basePriceValid === true ? "transparent" : "pink";
        let typeColor = this.state.basePriceValid === true ? "transparent" : "pink";
        let deviceColor = this.state.basePriceValid === true ? "transparent" : "pink";
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
                    <p>
                        <label>Base price</label><br />
                        <input type="number" value={this.state.basePrice}
                            onChange={this.onBasePriceChange} style={{ borderColor: basePriceColor }} />
                    </p>
                    {
                        this.state.serviceTypes && this.state.deviceTypes ?
                            <div>
                                <Select options={this.state.serviceTypes} onChange={this.onServiceTypeChange} styles={{ borderColor: typeColor }} />
                                <Select options={this.state.deviceTypes} closeMenuOnSelect={false} isMulti onChange={this.onDeviceTypesChange} />
                            </div>
                            :
                            <div></div>
                    }

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

        let basePrice = 0;
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
        this.setState({
            name: this.props.service.name,
            nameValid: this.validateName(this.props.service.name),
            description: this.props.service.description,
            descriptionValid: this.validateDescription(this.props.service.description),
            basePrice: this.props.service.base_price,
            basePriceValid: this.validateBasePrice(this.props.service.base_price)
        });

        let serviceTypeData = [];

        for (const entry of this.props.serviceTypes) {
            serviceTypeData.push({ value: entry.id, label: entry.name })
        }

        // set selected options for provided service
        for (const st of serviceTypeData) {
            if (st.value == this.props.service.service_type.id) {
                this.setState({
                    selectedServiceType: st,
                    selectedServiceTypeValid: this.validateServiceType(st)
                });
                break;
            }
        }

        let deviceTypeData = [];

        for (const entry of this.props.deviceTypes) {
            deviceTypeData.push({ value: entry.id, label: entry.name })
        }

        // set selected options for provided service
        let deviceTypesTmp = this.props.service.device_types.map((dt) => { return { value: dt.id, label: dt.name } });
        this.setState({
            selectedDeviceTypes: deviceTypesTmp,
            selectedDeviceTypesValid: this.validateDeviceTypes(deviceTypesTmp)
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
            console.log("Valid");
            axios({
                method: 'PUT',
                url: `api/service/${this.props.service.id}`,
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
                    this.props.onCommit();
                })
        }
    }

    render() {
        let nameColor = this.state.nameValid === true ? "transparent" : "pink";
        let descriptionColor = this.state.descriptionValid === true ? "transparent" : "pink";
        let basePriceColor = this.state.basePriceValid === true ? "transparent" : "pink";
        return (
            <div className='general-block'>
                <div className='general-block-title'>Edit</div>
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
                                <Select options={this.state.serviceTypes} value={this.state.selectedServiceType} onChange={this.onServiceTypeChange} />
                                <Select options={this.state.deviceTypes} value={this.state.selectedDeviceTypes} closeMenuOnSelect={false} isMulti onChange={this.onDeviceTypesChange} />
                            </div>
                            :
                            <div></div>
                    }

                    <button>Apply</button>
                </form>
            </div>

        );
    }
}