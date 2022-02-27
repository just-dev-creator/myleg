const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String
    },
    group: {
        required: false,
        type: String
    },
    messagingToken:  {
        required: false,
        type: String
    }
}, {
    collection: 'users'
})

module.exports = mongoose.model('User', userSchema)