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
    dataScadenza: { type: Date, required: true }, // data oltre la quale non si può più sostenere l'esame
    durata: { type: Number, required: true }, // la salvo in secondi
    numDomande: { type: Number, required: true },
    codUtente: { type: Number, ref: "Utenti", required: true },
    codModulo: { type: Number, ref: "Moduli", required: true },
    descrizione: { type: String, required: true },
    validita: { type: Boolean, required: true },
    domande:[domande]
});

module.exports = mongoose.model("Esami", esami);