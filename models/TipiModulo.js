const mongoose = require("mongoose");

const tipiModulo = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true }
});

module.exports = mongoose.model("TipiModulo", tipiModulo);