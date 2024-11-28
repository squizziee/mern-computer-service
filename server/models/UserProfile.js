const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        minlength: [1, 'Minimumlength for first name is 1'],
        maxlength: [50, 'Maximum length for first name is 50']
    },
    last_name: {
        type: String,
        required: true,
        minlength: [6, 'Minimumlength for first name is 6'],
        maxlength: [100, 'Maximum length for first name is 50']
    },
    phone_number: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /(\+375|8)( ?\(?0?\d\d\)? ?)((\d\d\d-\d\d-\d\d)|(\d\d\d\d\d\d\d)|(\d\d\d \d\d \d\d))/.test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
    address: {
        type: String,
        required: true,
        minlength: [4, 'Minimumlength for first name is 6'],
        maxlength: [200, 'Maximum length for first name is 50']
    },
    passport_serial: {
        type: String,
        required: true,
        minlength: [4, 'Minimumlength for first name is 6'],
        maxlength: [100, 'Maximum length for first name is 50']
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

const UserProfileModel = mongoose.model('UserProfile', UserProfileSchema);
module.exports = {
    UserProfileModel,
    UserProfileSchema
}