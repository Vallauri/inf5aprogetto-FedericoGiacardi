const mongoose = require("mongoose");

const risposte = mongoose.Schema({
    testo: { type: String, required: true },
    corretta: { type: Boolean, default: false }
});

const domande = mongoose.Schema({
    testo: { type: String, required: true },
    risposte: [risposte]
});

const esami = mongoose.Schema({
    _id: { type: Number, required: true },
    dataCreazione: { type: Date, required: true },
    codUtente: { type: Number, ref: "Moderatori", required: true },
    descrizione: { type: String, required: true },
    domande:[domande]
});

module.exports = mongoose.model("Esami", esami);