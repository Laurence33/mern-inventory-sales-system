const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema
const AdminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date_registered: {
        type: Date,
        default: Date.now
    },
    date_logged_in: {
        type: Date
    }
});

module.exports = Admin = mongoose.model('admin', AdminSchema)
