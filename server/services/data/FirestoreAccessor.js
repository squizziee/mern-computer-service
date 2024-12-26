import { FieldPath, getFirestore } from "firebase-admin/firestore";
import UserProfileModel from "../../models/UserProfile.js";
import serviceAccount from '../../mern-app-ccdfc-firebase-adminsdk-e09i1-12e86f6e91.json' with { type: "json" };
import admin from 'firebase-admin'
import DeviceTypeModel from "../../models/DeviceType.js";

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

    }

    async addService({ service_type_id, name, description, base_price, device_types }) {

    }

    async updateServiceById({ service_id, service_type_id, name, description, base_price, device_types }) {

    }

    async deleteServiceById(id) {

    }

    async getServices({ service_type_id_list, min_price, max_price, device_types, text_query, sort_by }) {

    }

    async #sort_result(source, field, dir) {

    }

    // service types
    async getServiceTypeById(service_type_id) {

    }

    async addServiceType({ name, description }) {

    }

    async updateServiceTypeById({ service_type_id, name, description }) {

    }

    async deleteServiceTypeById(service_type_id) {

    }

    async getServiceTypes() {

    }

    // device types
    async getDeviceTypeById(device_type_id) {
        const dt = await this.db.collection('device_types').where(FieldPath.documentId(), '==', device_type_id).get();

        if (dt.empty) return;

        return DeviceTypeModel.fromJson(dt.docs[0].data());
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

        await this.db.collection('device_types').add(newDeviceType.toJson());

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
    async addOrder({ service, client, additional_info }) {

    }

    async addOrder({ service, client, additional_info }) {

    }

    async getOrderById(order_id) {

    }

    async getOrders() {

    }

    async getPendingOrders() {

    }

    async getCompletedOrders() {

    }

    async getCancelledOrders() {

    }

    async cancelOrderById(order_id) {

    }

    async completeOrderById(order_id) {

    }
}

export default FirestoreAccessor;