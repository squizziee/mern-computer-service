const ServiceModel = require("../../models/Service");
const mongoose = require('mongoose');
const { ServiceTypeModel } = require("../../models/ServiceType");
const { DeviceTypeModel } = require("../../models/DeviceType");
const { UserProfileModel } = require("../../models/UserProfile");

class DbAccessor {

    // services
    async getServiceById(id) {
        return await ServiceModel.findById(id);
    }

    async addService({ service_type_id, name, description, base_price, device_types }) {
        let types = [];
        try {
            for (let id of device_types) {
                types.push(await DeviceTypeModel.findById(id));
            }
        } catch (err) {
            types.push(await DeviceTypeModel.findById(device_types))
        }

        let tmp = new ServiceModel({
            service_type: await ServiceTypeModel.findById(service_type_id),
            name: name,
            description: description,
            base_price: base_price,
            device_types: types,
        })
        await tmp.save();
        return tmp.id;
    }

    async updateServiceById({ service_id, service_type_id, name, description, base_price, device_types }) {

        let types = [];
        if (device_types) {
            try {
                for (let id of device_types) {
                    types.push(await DeviceTypeModel.findById(id));
                }
            } catch (err) {
                types.push(await DeviceTypeModel.findById(device_types))
            }
        }
        return await ServiceModel.findByIdAndUpdate(service_id, {
            service_type: await ServiceTypeModel.findById(service_type_id),
            name: name,
            description: description,
            base_price: base_price,
            device_types: types,
        })
    }

    async deleteServiceById(id) {
        return await ServiceModel.findByIdAndDelete(id);
    }

    async getServices({ service_type_id_list, min_price, max_price, device_types, text_query, sort_by }) {
        let result;
        let queried = false;
        let dir;

        if (sort_by) {
            if (sort_by[0] == '-') {
                dir = '-'
                sort_by = sort_by.substring(1);
            }
        }
        else {
            dir = '+'
        }

        if (service_type_id_list && service_type_id_list.length > 0) {
            result = ServiceModel.where('service_type._id').in(service_type_id_list);
            queried = true;
        }
        if (min_price) {
            if (queried) {
                result = result.where('base_price').gt(min_price);
            }
            else {
                result = ServiceModel.where('base_price').gt(min_price);
                queried = true;
            }
        }
        if (max_price) {
            if (queried) {
                result = result.where('base_price').lt(max_price);
            }
            else {
                result = ServiceModel.where('base_price').lt(max_price);
                queried = true;
            }
        }
        if (device_types) {
            if (queried) {
                result = result.where('device_types._id').in(device_types);
                // result = result.find({
                //     device_types: { $in: device_types }
                // });
            }
            else {
                result = ServiceModel.where('device_types._id').in(device_types);
                // result = ServiceModel.find({
                //     device_types: { $in: device_types }
                // });
                queried = true;
            }
        }
        if (text_query) {
            if (queried) {
                var copy = result.clone();
                const result1 = await result.find({
                    description: {
                        $regex: new RegExp(`${text_query}`),
                        $options: 'i'
                    }
                })
                const result2 = await copy.find({
                    name: {
                        $regex: new RegExp(`${text_query}`),
                        $options: 'i'
                    }
                })
                try {
                    result = [...new Map([...result1, ...result2].map(item => [item._id.toString(), item])).values()];
                } catch (err) {
                    console.log(err);
                }
            }
            else {
                const result1 = await ServiceModel.find({
                    description: {
                        $regex: new RegExp(`${text_query}`),
                        $options: 'i'
                    }
                })
                const result2 = await ServiceModel.find({
                    name: {
                        $regex: new RegExp(`${text_query}`),
                        $options: 'i'
                    }
                })
                try {
                    result = [...new Map([...result1, ...result2].map(item => [item._id.toString(), item])).values()];
                } catch (err) {
                    console.log(err);
                }
                queried = true;
            }
            return this.#sort_result(result, sort_by, dir);
        }
        else {
            if (!queried) {
                result = ServiceModel.find({});
            }
            return this.#sort_result(await result.exec(), sort_by, dir);
        }
    }

    async #sort_result(source, field, dir) {
        if (!field) {
            return source;
        }

        let result;

        if (field == 'service_type') {
            result = source.sort((a, b) => {
                return a.service_type.toString().localeCompare(b.service_type.toString());
            });
        }
        else if (field == 'name') {
            result = source.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
        else if (field == 'base_price') {
            result = source.sort((a, b) => {
                return a.base_price - b.base_price;
            });
        }
        console.log(result);
        console.log(field);

        if (dir == '-') {
            result = result.reverse();
        }
        return result;
    }

    // service types
    async getServiceTypeById(service_type_id) {
        return await ServiceTypeModel.findById(service_type_id);
    }

    async addServiceType({ name, description }) {
        let now = new Date();
        let newST = new ServiceTypeModel({
            name: name,
            description: description,
            created_at: now,
            last_updated_at: now
        });
        await newST.save();
    }

    async updateServiceTypeById({ service_type_id, name, description }) {
        let now = new Date();
        await ServiceTypeModel.findByIdAndUpdate(service_type_id, {
            name: name,
            description: description,
            last_updated_at: now
        });
    }

    async deleteServiceTypeById(service_type_id) {
        await ServiceTypeModel.findByIdAndDelete(service_type_id);
    }

    async getServiceTypes() {
        return await ServiceTypeModel.find({});
    }

    // device types
    async getDeviceTypeById(device_type_id) {
        return await DeviceTypeModel.findById(device_type_id);
    }

    async addDeviceType({ name, description }) {
        let now = new Date();
        let newDT = new DeviceTypeModel({
            name: name,
            description: description,
            created_at: now,
            last_updated_at: now
        });
        await newDT.save();
    }

    async updateDeviceTypeById({ device_type_id, name, description }) {
        let now = new Date();
        await DeviceTypeModel.findByIdAndUpdate(device_type_id, {
            name: name,
            description: description,
            last_updated_at: now
        });
    }

    async deleteDeviceTypeById(device_type_id) {
        await ServiceTypeModel.findByIdAndDelete(device_type_id);
    }

    async getDeviceTypes() {
        return await DeviceTypeModel.find({});
    }

    // user profiles
    async updateUserProfileById({ user_profile_id, first_name, last_name, phone_number, address, passport_serial }) {
        let now = new Date();
        await UserProfileModel.findByIdAndUpdate(user_profile_id, {
            first_name: first_name,
            last_name: last_name,
            phone_number: phone_number,
            address: address,
            passport_serial: passport_serial,
            last_updated_at: now
        });
    }
}

module.exports = DbAccessor;