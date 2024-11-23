const ServiceModel = require("../../models/Service");
const mongoose = require('mongoose');
const { ServiceTypeModel } = require("../../models/ServiceType");
const { DeviceTypeModel } = require("../../models/DeviceType");

class DbAccessor {
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

    async getServices({ service_type_id, min_price, max_price, device_types, text_query, sort_by }) {
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

        if (service_type_id) {
            result = ServiceModel.where('service_type_id').equals(service_type_id);
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
                result = result.find({
                    device_types: { $in: device_types }
                });
            }
            else {
                result = ServiceModel.find({
                    device_types: { $in: device_types }
                });
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

    async getServiceTypes() {
        return await ServiceTypeModel.find({});
    }

    async getDeviceTypes() {
        return await DeviceTypeModel.find({});
    }
}

module.exports = DbAccessor;