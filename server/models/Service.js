import FirestoreAccessor from "../services/data/FirestoreAccessor.js";
import DeviceTypeModel from "./DeviceType.js";
import ServiceTypeModel from "./ServiceType.js";
import { FieldPath } from "firebase-admin/firestore";

class ServiceModel {
    constructor({ id, name, description, base_price, service_type, device_types, created_at, last_updated_at }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.base_price = base_price
        this.service_type = service_type;
        this.device_types = device_types;
        this.created_at = created_at;
        this.last_updated_at = last_updated_at;
    }

    toJson() {
        let serviceTypeId = this.service_type.id
        let deviceIds = []

        for (let device of this.device_types) {
            deviceIds.push(device.id)
        }

        return {
            name: this.name,
            description: this.description,
            base_price: Number(this.base_price),
            service_type: serviceTypeId,
            device_types: deviceIds,
            created_at: this.created_at,
            last_updated_at: this.last_updated_at,
        }
    }

    static async fromJson(jsonObj, id, db) {
        // makes me cry every time using this inside models but whatever
        let serviceTypeSnapshot = await db.collection("service_types").where(FieldPath.documentId(), '==', jsonObj.service_type).get();

        if (serviceTypeSnapshot.empty) throw new Error("No service type with id of " + jsonObj.service_type);

        const deviceTypeArr = []

        for (let dtid of jsonObj.device_types) {
            let deviceTypeSnapshot = await db.collection("device_types").where(FieldPath.documentId(), '==', dtid).get();

            if (deviceTypeSnapshot.empty) throw new Error("No device type with id of " + dtid);

            deviceTypeArr.push(
                DeviceTypeModel.fromJson(
                    deviceTypeSnapshot.docs[0].data(),
                    deviceTypeSnapshot.docs[0].id
                )
            );
        }

        return new ServiceModel({
            id: id,
            name: jsonObj.name,
            description: jsonObj.description,
            base_price: Number(jsonObj.base_price),
            service_type: ServiceTypeModel.fromJson(serviceTypeSnapshot.docs[0].data(), serviceTypeSnapshot.docs[0].id),
            device_types: deviceTypeArr,
            created_at: jsonObj.created_at.toDate(),
            last_updated_at: jsonObj.last_updated_at.toDate(),
        })
    }
}

export default ServiceModel