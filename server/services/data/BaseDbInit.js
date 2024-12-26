const ServiceTypeModel = require("../../models/ServiceType");
const { DeviceTypeModel } = require("../../models/DeviceType");
const ServiceModel = require("../../models/Service");

class BaseDbInit {
    async initializeServiceTypes() {
        let serviceType1 = new ServiceTypeModel({
            name: "Upgrade",
            description: "Reasonable upgrades for tech"
        });
        let serviceType2 = new ServiceTypeModel({
            name: "Repairment",
            description: "Repairment of damaged tech"
        });
        let serviceType3 = new ServiceTypeModel({
            name: "Maintenance",
            description: "Basic tech maintenance and checkup"
        });

        await serviceType1.save();
        await serviceType2.save();
        await serviceType3.save();
    }

    async initializeDeviceTypes() {
        let deviceType1 = new DeviceTypeModel({
            name: "Tablet",
            description: "Tablets from 7 inch old ones to iPad Pro"
        });
        let deviceType2 = new DeviceTypeModel({
            name: "Smartphone",
            description: "Any kind of portable phone"
        });
        let deviceType3 = new DeviceTypeModel({
            name: "Laptop",
            description: "Any kind of laptop, from old to new, from basic to monstrous"
        });
        let deviceType4 = new DeviceTypeModel({
            name: "PC",
            description: "Standalone computer"
        });

        await deviceType1.save();
        await deviceType2.save();
        await deviceType3.save();
        await deviceType4.save();
    }

    async initializeServices() {
        let service1 = new ServiceModel({
            service_type: await ServiceTypeModel.findOne({ 'name': 'Repairment' }),
            name: "Liquid damage repairment",
            description: "Repairment of tech damaged by any kinds if liquids, most likely will include additional cost for components",
            base_price: 20.0,
            device_types: [
                await DeviceTypeModel.findOne({ 'name': 'Tablet' }),
                await DeviceTypeModel.findOne({ 'name': 'PC' }),
                await DeviceTypeModel.findOne({ 'name': 'Laptop' }),
                await DeviceTypeModel.findOne({ 'name': 'Smartphone' }),
            ]
        });

        await service1.save();
    }
}

export default BaseDbInit;