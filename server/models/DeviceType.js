class DeviceTypeModel {
    constructor({ name, description, created_at, last_updated_at }) {
        this.name = name;
        this.description = description;
        this.created_at = created_at;
        this.last_updated_at = last_updated_at;
    }

    toJson() {
        return {
            name: this.name,
            description: this.description,
            created_at: this.created_at,
            last_updated_at: this.last_updated_at,
        }
    }

    static fromJson(jsonObj) {
        return new DeviceTypeModel({
            name: jsonObj.name,
            description: jsonObj.description,
            created_at: jsonObj.created_at.toDate(),
            last_updated_at: jsonObj.last_updated_at.toDate(),
        })
    }
}

export default DeviceTypeModel