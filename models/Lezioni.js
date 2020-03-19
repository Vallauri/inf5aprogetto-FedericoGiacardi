const mongoose = require("mongoose");

const appunti = mongoose.Schema({
    codAppunto: { type: Number, ref:"Appunti", required: true },
    codUtente: { type: Number, ref:"Utenti", required: true },
    dataAggiunta: { type: Date, required: true }
});

const lezioni = mongoose.Schema({
    _id: { type: Number, required: true },
    titolo: { type: String, required: true },
    dataCreazione: { type: Date, required: true },
    dataScadenza: { type: Date},
    autore: { type: Number, ref:"Moderatori", required: true },
    appunti: [appunti]
});

module.exports = mongoose.model("Lezioni", lezioni);