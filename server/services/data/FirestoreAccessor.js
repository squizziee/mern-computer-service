import { FieldPath } from "firebase-admin/firestore";
import UserProfileModel from "../../models/UserProfile.js";
import serviceAccount from '../../mern-app-ccdfc-firebase-adminsdk-e09i1-12e86f6e91.json' with { type: "json" };
import admin from 'firebase-admin'
import DeviceTypeModel from "../../models/DeviceType.js";
import ServiceTypeModel from "../../models/ServiceType.js";
import ServiceModel from "../../models/Service.js";
import OrderModel from "../../models/Order.js";

class FirestoreAccessor {


    constructor() {
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            })
        }
        this.db = admin.firestore();
    }

    async getServiceById(id) {
        const serviceSnapshot = await this.db.collection('services').where(FieldPath.documentId(), '==', id).get();

        if (serviceSnapshot.empty) throw new Error("No service with id of " + id);

        return await ServiceModel.fromJson(serviceSnapshot.docs[0].data(), serviceSnapshot.docs[0].id, this.db)
    }

    async addService({ service_type_id, name, description, base_price, device_types }) {
        const serviceTypeSnapshot = await this.db.collection('service_types').where(FieldPath.documentId(), '==', service_type_id).get();
        if (serviceTypeSnapshot.empty) throw new Error("No service type with id of " + service_type_id)

        const deviceTypeArr = []

        if (!(device_types instanceof Array)) device_types = [device_types]

        for (let dtid of device_types) {

            const deviceTypeSnapshot = await this.db.collection('device_types').where(FieldPath.documentId(), '==', dtid).get();

            if (deviceTypeSnapshot.empty) throw new Error("No device type with id of " + dtid);

            deviceTypeArr.push(DeviceTypeModel.fromJson(deviceTypeSnapshot.docs[0].data(), deviceTypeSnapshot.docs[0].id));
        }

        const now = new Date();

        const newService = new ServiceModel({
            name: name,
            description: description,
            base_price: base_price,
            service_type: ServiceTypeModel.fromJson(serviceTypeSnapshot.docs[0].data(), serviceTypeSnapshot.docs[0].id),
            device_types: deviceTypeArr,
            created_at: now,
            last_updated_at: now
        })

        newService.id = (await this.db.collection('services').add(newService.toJson())).id;
        return newService;
    }

    async updateServiceById({ service_id, service_type_id, name, description, base_price, device_types }) {
        const serviceSnapshot = await this.db.collection('services').where(FieldPath.documentId(), '==', service_id).get();

        if (serviceSnapshot.empty) throw new Error("No service with id of " + id);

        await serviceSnapshot.docs[0].ref.update({
            service_type: service_type_id,
            name: name,
            description: description,
            base_price: base_price,
            device_types: device_types
        });
    }

    async deleteServiceById(id) {
        const serviceSnapshot = await this.db.collection('services').where(FieldPath.documentId(), '==', id).get();

        if (serviceSnapshot.empty) throw new Error("No service with id of " + id);

        await serviceSnapshot.docs[0].ref.delete();
    }

    async getServices({ service_type_id_list, min_price, max_price, device_types, text_query, sort_by }) {
        let query = this.db.collection('services');

        if (service_type_id_list) {
            if (service_type_id_list instanceof Array) query = query.where('service_type', 'in', service_type_id_list);
            else query = query.where('service_type', '==', service_type_id_list);
        }

        if (min_price) query = query.where('base_price', '>=', min_price);

        if (max_price) query = query.where('base_price', '<=', max_price);

        if (device_types) {
            if (device_types instanceof Array) query = query.where('device_types', 'array-contains-any', device_types);
            else query = query.where('device_types', 'array-contains', device_types);
        }

        const serviceSnapshot = await query.get();
        if (serviceSnapshot.empty) return;

        let services = []
        for (let doc of serviceSnapshot.docs) {
            try {
                services.push(await ServiceModel.fromJson(doc.data(), doc.id, this.db));
            } catch (err) {
                console.log("<-----------------------------> Corrupted service");
            }
        }

        if (text_query) services = this.#text_search(services, text_query);

        if (sort_by && sort_by !== "undefined") services = this.#sort(services, sort_by)

        return services;
    }

    #text_search(services, query) {
        let filtered = services.filter(service => (service.name + "\n" + service.description).toLowerCase().includes(query.toLowerCase()));
        return filtered;
    }

    async #sort(services, field) {
        console.log("Sort required");

        console.assert(services)
        console.assert(field)

        let dir;
        if (field[0] == '-') {
            dir = '-'
            field = field.substring(1);
        }
        else dir = '+'

        let result;

        if (field == 'service_type') {
            result = services.sort((a, b) => {
                return a.service_type.toString().localeCompare(b.service_type.toString());
            });
        }
        else if (field == 'name') {
            result = services.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
        else if (field == 'base_price') {
            result = services.sort((a, b) => {
                return a.base_price - b.base_price;
            });
        }

        if (dir == '-') result = result.reverse();

        return result;
    }

    // service types
    async getServiceTypeById(service_type_id) {
        const st = await this.db.collection('service_types').where(FieldPath.documentId(), '==', service_type_id).get();

        if (st.empty) return;

        return ServiceTypeModel.fromJson(dt.docs[0].data(), dt.docs[0].id);
    }

    async addServiceType({ name, description }) {
        const now = new Date();
        const newServiceType = new ServiceTypeModel({
            name: name,
            description: description,
            created_at: now,
            last_updated_at: now
        })
        console.log("Here");
        newServiceType.id = (await this.db.collection('service_types').add(newServiceType.toJson())).id;

        return newServiceType;
    }

    async updateServiceTypeById({ service_type_id, name, description }) {
        const st = await this.db.collection('service_types').where(FieldPath.documentId(), '==', service_type_id).get();

        if (st.empty) return;

        await st.docs[0].ref.update({
            name: name,
            description: description,
            last_updated_at: new Date()
        });
    }

    async deleteServiceTypeById(service_type_id) {
        const st = await this.db.collection('service_types').where(FieldPath.documentId(), '==', service_type_id).get();

        if (st.empty) return;

        await st.docs[0].ref.delete();
    }

    async getServiceTypes() {
        const st = await this.db.collection('service_types').get();
        let result = []

        for (const doc of st.docs) {
            result.push(DeviceTypeModel.fromJson(doc.data(), doc.id))
        }

        return result;
    }

    // device types
    async getDeviceTypeById(device_type_id) {
        const dt = await this.db.collection('device_types').where(FieldPath.documentId(), '==', device_type_id).get();

        if (dt.empty) return;

        return DeviceTypeModel.fromJson(dt.docs[0].data(), dt.docs[0].id);
    }

    async addDeviceType({ name, description }) {
        const now = new Date();
        const newDeviceType = new DeviceTypeModel({
            name: name,
            description: description,
            created_at: now,
            last_updated_at: now
        })
        console.log("Here");
        newDeviceType.id = (await this.db.collection('device_types').add(newDeviceType.toJson())).id;

        return newDeviceType;
    }

    async updateDeviceTypeById({ device_type_id, name, description }) {
        const dt = await this.db.collection('device_types').where(FieldPath.documentId(), '==', device_type_id).get();

        if (dt.empty) return;

        await dt.docs[0].ref.update({
            name: name,
            description: description,
            last_updated_at: new Date()
        });
    }

    async deleteDeviceTypeById(device_type_id) {
        const dt = await this.db.collection('device_types').where(FieldPath.documentId(), '==', device_type_id).get();

        if (dt.empty) return;

        await dt.docs[0].ref.delete();
    }

    async getDeviceTypes() {
        const dt = await this.db.collection('device_types').get();
        let result = []

        for (const doc of dt.docs) {
            result.push(DeviceTypeModel.fromJson(doc.data(), doc.id))
        }

        return result;
    }

    // user profiles
    async createUserProfile(user_id) {
        const existsAlready = !(await this.db.collection('user_profiles').where('user', '==', user_id).get()).empty;

        if (existsAlready) throw new Error("Profile already exists");

        const newProfile = UserProfileModel.defaultProfile(user_id);

        await this.db.collection('user_profiles').add(newProfile.toJson());
        return newProfile;
    }

    async updateProfileByUserId({ user_id, first_name, last_name, phone_number, address, passport_serial }) {
        const profile = await this.db.collection('user_profiles').where('user', '==', user_id).get();

        if (profile.empty) return;

        await profile.docs[0].ref.update({
            first_name: first_name,
            last_name: last_name,
            phone_number: phone_number,
            address: address,
            passport_serial: passport_serial,
            last_updated_at: new Date()
        });
    }

    async getUserProfile(user_id) {
        const profile = await this.db.collection('user_profiles').where('user', '==', user_id).get()
        if (profile.empty) throw new Error("No such profile");

        return UserProfileModel.fromJson(profile.docs[0].data());
    }

    // orders
    async addOrder({ service_id, client_id, additional_info }) {
        const serviceSnapshot = await this.db.collection('services').where(FieldPath.documentId(), '==', service_id).get();
        if (serviceSnapshot.empty) throw new Error("No service with id of " + service_id)

        const userProfileSnapshot = await this.db.collection('user_profiles').where('user', '==', client_id).get();
        if (userProfileSnapshot.empty) throw new Error("No profile with id of " + client_id)

        const now = new Date();

        const newOrder = new OrderModel({
            service: await ServiceModel.fromJson(serviceSnapshot.docs[0].data(), serviceSnapshot.docs[0].id, this.db),
            additional_info: additional_info ? additional_info : "",
            client: UserProfileModel.fromJson(userProfileSnapshot.docs[0].data(), userProfileSnapshot.docs[0].id),
            is_completed: false,
            is_cancelled: false,
            created_at: now,
            last_updated_at: now
        })

        newOrder.id = (await this.db.collection('orders').add(newOrder.toJson())).id;
        return newOrder;
    }

    async getOrderById(order_id) {
        const orderSnapshot = await this.db.collection('orders').where(FieldPath.documentId(), '==', order_id).get();

        if (orderSnapshot.empty) throw new Error("No order with id of " + order_id)

        return await OrderModel.fromJson(orderSnapshot.docs[0].data(), orderSnapshot.docs[0].id);
    }

    async getOrders() {
        const orderSnapshot = await this.db.collection('orders').get();

        if (orderSnapshot.empty) return [];

        let orders = []

        for (const doc of orderSnapshot.docs) {
            try {
                orders.push(await OrderModel.fromJson(doc.data(), doc.id, this.db))
            } catch (err) {

            }

        }

        return orders;
    }

    async getPendingOrders() {
        const orderSnapshot = await this.db.collection('orders')
            .where('is_completed', '==', false)
            .where('is_cancelled', '==', false)
            .get();

        if (orderSnapshot.empty) return [];

        let orders = []

        for (const doc of orderSnapshot.docs) {
            try {
                orders.push(await OrderModel.fromJson(doc.data(), doc.id, this.db))
            } catch (err) {/* skipping errors */ }

        }

        return orders;
    }

    async getCompletedOrders() {
        const orderSnapshot = await this.db.collection('orders')
            .where('is_completed', '==', true)
            .get();

        if (orderSnapshot.empty) return [];

        let orders = []

        for (const doc of orderSnapshot.docs) {
            try {
                orders.push(await OrderModel.fromJson(doc.data(), doc.id, this.db))
            } catch (err) {/* skipping errors */ }

        }

        return orders;
    }

    async getCancelledOrders() {
        const orderSnapshot = await this.db.collection('orders')
            .where('is_cancelled', '==', true)
            .get();

        if (orderSnapshot.empty) return [];

        let orders = []

        for (const doc of orderSnapshot.docs) {
            try {
                orders.push(await OrderModel.fromJson(doc.data(), doc.id, this.db))
            } catch (err) {/* skipping errors */ }

        }

        return orders;
    }

    async cancelOrderById(order_id) {
        const orderSnapshot = await this.db.collection('orders').where(FieldPath.documentId(), '==', order_id).get();

        if (orderSnapshot.empty) throw new Error("No order with id of " + order_id)

        await orderSnapshot.docs[0].ref.update({ is_cancelled: true });
    }

    async completeOrderById(order_id) {
        const orderSnapshot = await this.db.collection('orders').where(FieldPath.documentId(), '==', order_id).get();

        if (orderSnapshot.empty) throw new Error("No order with id of " + order_id)

        await orderSnapshot.docs[0].ref.update({ is_completed: true });
    }
}

export default FirestoreAccessor;