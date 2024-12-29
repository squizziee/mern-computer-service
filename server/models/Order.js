// const mongoose = require('mongoose');
// const { ServiceSchema } = require('./Service');
// const { UserSchema } = require('./User');
// const Schema = mongoose.Schema;

// const OrderSchema = new Schema({
//     service: {
//         type: Schema.Types.ObjectId,
//         ref: 'Service',
//         required: true,
//     },
//     client: {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     additional_info: {
//         type: String,
//         maxlength: [1000, 'Maximum length is 1000']
//     },
//     isCancelled: {
//         type: Boolean,
//         required: true,
//     },
//     isCompleted: {
//         type: Boolean,
//         required: true,
//     },
//     created_at: {
//         type: Date,
//         required: true
//     },
// });

import ServiceModel from "./Service.js";
import { FieldPath } from "firebase-admin/firestore";
import UserProfileModel from "./UserProfile.js";

class OrderModel {
    constructor({ id, service, client, additional_info, is_cancelled, is_completed, created_at, last_updated_at }) {
        this.id = id;
        this.service = service;
        this.additional_info = additional_info;
        this.client = client;
        this.is_cancelled = is_cancelled;
        this.is_completed = is_completed;
        this.created_at = created_at;
        this.last_updated_at = last_updated_at;
    }

    toJson() {
        return {
            additional_info: this.additional_info,
            service: this.service.id,
            client: this.client.user,
            is_cancelled: this.is_cancelled,
            is_completed: this.is_completed,
            created_at: this.created_at,
            last_updated_at: this.last_updated_at,
        }
    }

    static async fromJson(jsonObj, id, db) {
        // makes me cry every time using this inside models but whatever
        let serviceSnapshot = await db.collection("services").where(FieldPath.documentId(), '==', jsonObj.service).get();

        if (serviceSnapshot.empty) throw new Error("No service with id of " + jsonObj.service);

        let userProfileSnapshot = await db.collection("user_profiles").where('user', '==', jsonObj.client).get();

        if (userProfileSnapshot.empty) throw new Error("No profile with id of " + jsonObj.client);

        return new OrderModel({
            id: id,
            additional_info: jsonObj.additional_info,
            service: await ServiceModel.fromJson(serviceSnapshot.docs[0].data(), serviceSnapshot.docs[0].id, db),
            client: UserProfileModel.fromJson(userProfileSnapshot.docs[0].data(), userProfileSnapshot.docs[0].id),
            created_at: jsonObj.created_at.toDate(),
            is_cancelled: jsonObj.is_cancelled,
            is_completed: jsonObj.is_completed,
            last_updated_at: jsonObj.last_updated_at.toDate(),
        })
    }
}

export default OrderModel