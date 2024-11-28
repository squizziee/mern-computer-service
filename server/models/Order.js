const mongoose = require('mongoose');
const { ServiceSchema } = require('./Service');
const { UserSchema } = require('./User');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    service: {
        type: ServiceSchema,
        required: true,
    },
    client: {
        type: UserSchema,
        required: true,
    },
    additional_info: {
        type: String,
        maxlength: [1000, 'Maximum length is 1000']
    },
    isCancelled: {
        type: Boolean,
        required: true,
    },
    isCompeleted: {
        type: Boolean,
        required: true,
    },
    created_at: {
        type: Date,
        required: true
    },
});

const OrderModel = mongoose.model('Order', OrderSchema);
module.exports = OrderModel;