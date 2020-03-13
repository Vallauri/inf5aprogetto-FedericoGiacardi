const mongoose = require("mongoose");

const tipiGruppo = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true }
});

module.exports = mongoose.model("TipiGruppo", tipiGruppo);