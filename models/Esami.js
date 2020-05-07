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
    codUtente: { type: Number, ref: "Utenti", required: true },
    descrizione: { type: String, required: true },
    domande:[domande],
    codModulo: { type: Number, ref: "Moduli", required: true },
    numDomande: { type: Number, required: true, default:0 },
    durata: { type: Number, required: true, default:0 },
    dataScadenza: { type: Date, required: true },
    validita: { type: String, default: "true", required: true, } 
});

module.exports = mongoose.model("Esami", esami);