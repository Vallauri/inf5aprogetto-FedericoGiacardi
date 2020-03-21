const mongoose = require("mongoose");

const argomenti = mongoose.Schema({
    codArg: { type: Number, ref: "Argomenti", required: true },
});

// const moderatori = mongoose.Schema({
//     codMod : { type: Number, ref: "Moderatori", required: true }
// });

const materie = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    dataCreazione: { type: Date, required: true },
    //moderatori: { type: Number, ref: "Moderatori", required: true }, //il moderatore è l'utente che crea la materia
    argomenti: [argomenti]
});

module.exports = mongoose.model("Materie", materie);