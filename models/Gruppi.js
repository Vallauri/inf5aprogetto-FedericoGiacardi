const mongoose = require("mongoose");

const gruppi = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    tipoGruppo: { type: Number, ref:"TipiGruppo", required: true }
});

module.exports = mongoose.model("Gruppi", gruppi);