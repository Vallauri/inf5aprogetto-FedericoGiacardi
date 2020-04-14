const mongoose = require("mongoose");

const argomenti = mongoose.Schema({
    codArgomento: { type: Number, ref:"Argomenti", required: true },
    dataAggiunta: { type: Date, required: true }
    // dataRimozione: { type: Date}
});

const allegati = mongoose.Schema({
    codAllegato: { type: Number, ref: "Allegati", required: true },
});

const appunti = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    dataCaricamento: { type: Date, required: true },
    nomeAutore: { type: String, required: true },
    cognomeAutore: { type: String, required: true },
    codUtente: { type: Number, ref: "Utenti", required: true },
    argomenti: [argomenti],
    allegati: [allegati]
});

module.exports = mongoose.model("Appunti", appunti);