const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceTypeSchema = new Schema({
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
    created_at: {
        type: Date,
        required: true
    },
    last_updated_at: {
        type: Date,
        required: true
    },
});

const ServiceTypeModel = mongoose.model('ServiceType', ServiceTypeSchema);
module.exports = {
    ServiceTypeModel,
    ServiceTypeSchema
};