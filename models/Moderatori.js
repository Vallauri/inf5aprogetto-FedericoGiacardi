const mongoose = require("mongoose");

const matModerate = mongoose.Schema({
    codMat: { type: Number, ref:"Materie", required: true }
});

const moderatori = mongoose.Schema({
    _id: { type: Number, required: true },
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    dataNascita: { type: Date, required: true },
    mail: { type: String, required: true },
    telefono: { type: String, required: true },
    user: { type: String, required: true },
    pwd: { type: String, required: true },
    materie:[matModerate]
});

// Così facciamo la ricorsione: possiamo riferci allo schema corrente solo dopo averlo creato, quindi siamo costretti ad aggiungere il campo allo schema separatamente rispetto alla creazione stessa
moderatori.add({ codDirettore: { type: Number, ref: "Moderatori", required: true } });

module.exports = mongoose.model("Moderatori", moderatori);