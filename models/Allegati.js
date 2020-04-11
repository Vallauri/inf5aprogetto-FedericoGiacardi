const mongoose = require("mongoose");

const allegati = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    codUtente: { type: Number, ref:"Utenti", required: true },
    dataCaricamento: { type: Date, required: true },
    percorso: { type: String, required: true }
});

module.exports = mongoose.model("Allegati", allegati);