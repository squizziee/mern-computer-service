const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { UserProfileSchema } = require('./UserProfile');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [1, 'Minimumlength for first name is 1'],
        maxlength: [50, 'Maximum length for first name is 50']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function () {
                return /(\w*(?<=\w)\.)*(\w)+@(\w+)\.(\w+)/.test(this.email);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    user_profile: {
        type: Schema.Types.ObjectId,
        ref: 'UserProfile',
        required: true
    },
    google_id: {
        type: String,
        unique: true,
        sparse: true
    },
    facebook_id: {
        type: String,
        unique: true,
        sparse: true
    }
});

UserSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model('User', UserSchema);
module.exports = {
    UserModel,
    UserSchema
}