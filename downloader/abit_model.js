const mongoose = require('mongoose');

const abitSchema = new mongoose.Schema({
    date: {
        required: true,
        type: Date,
        unique: true
    },
    groups: {
        required: true,
        type: Array
    }
}, {
    collection: 'abit'
});

module.exports = mongoose.model('Abit', abitSchema);