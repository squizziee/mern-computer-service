const mongoose = require('mongoose');
const { DeviceTypeSchema } = require('./DeviceType');
const { ServiceTypeSchema } = require('./ServiceType');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    service_type: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceType',
        required: true,
    },
    name: {
        type: String,
        required: true,
        minlength: [1, 'Minimum length for is 1'],
        maxlength: [100, 'Maximum length is 100']
    },
    description: {
        type: String,
        required: true,
        minlength: [1, 'Minimum length for is 1'],
        maxlength: [1000, 'Maximum length is 1000']
    },
    base_price: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v > 0;
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
    device_types: {
        type: [Schema.Types.ObjectId],
        ref: 'DeviceType',
        required: true
    },
    created_at: {
        type: Date,
        required: true
    },
    last_updated_at: {
        type: Date,
        required: true
    },
});

const ServiceModel = mongoose.model('Service', ServiceSchema);
module.exports = {
    ServiceModel,
    ServiceSchema
};