const mongoose = require("mongoose");

const argomenti = mongoose.Schema({
    codArgomento: { type: Number, ref: "Argomenti", required: true },
    dataAggiunta: { type: Date, required: true }
});

const argomentiDaApp = mongoose.Schema({
    codArgomento: { type: Number, ref: "Argomenti", required: true },
});

const allegati = mongoose.Schema({
    codAllegato: { type: Number, ref: "Allegati", required: true },
});

//Per passare ad appunti definitivi deve essere approvata dai moderatori di tutti gli argomenti collegati
const appunti = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    dataCaricamento: { type: Date, required: true },
    nomeAutore: { type: String, required: true },
    cognomeAutore: { type: String, required: true },
    codUtente: { type: Number, ref: "Utenti", required: true },
    argomenti: [argomenti],
    argomentiDaApprovare: [argomentiDaApp], //Elenco di tutti gli argomenti che devono ancora approvare l'appunto: all'inizio sono tutti gli argomenti, man mano che i moderatori dei vari argomenti approvano, il loro argomento viene tolto dal vettore
    allegati: [allegati]
});

module.exports = mongoose.model("AppuntiTemp", appunti);