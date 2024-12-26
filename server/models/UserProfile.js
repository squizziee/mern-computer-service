class UserProfileModel {
    constructor({ user, first_name, last_name, phone_number, address, passport_serial, created_at, last_updated_at }) {
        this.user = user;
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone_number = phone_number;
        this.address = address;
        this.passport_serial = passport_serial
        this.created_at = created_at;
        this.last_updated_at = last_updated_at;
    }

    static defaultProfile(user_id) {
        const now = new Date();
        return new UserProfileModel({
            user: user_id,
            first_name: 'Anonymous',
            last_name: 'Client',
            address: 'None',
            phone_number: '+375330000000',
            passport_serial: "None",
            created_at: now,
            last_updated_at: now
        })
    }

    toJson() {
        return {
            user: this.user,
            first_name: this.first_name,
            last_name: this.last_name,
            phone_number: this.phone_number,
            address: this.address,
            passport_serial: this.passport_serial,
            created_at: this.created_at,
            last_updated_at: this.last_updated_at
        }
    }

    static fromJson(jsonObj) {

        return new UserProfileModel({
            user: jsonObj.user,
            first_name: jsonObj.first_name,
            last_name: jsonObj.last_name,
            phone_number: jsonObj.phone_number,
            address: jsonObj.address,
            passport_serial: jsonObj.passport_serial,
            created_at: jsonObj.created_at.toDate(),
            last_updated_at: jsonObj.last_updated_at.toDate()
        })
    }
}

export default UserProfileModel
