const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    service_type: {
        type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType',
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
    },
    device_types: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'DeviceType',
        required: true
    },
});

const ServiceModel = mongoose.model('Service', ServiceSchema);
module.exports = ServiceModel;