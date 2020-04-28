const mongoose = require("mongoose");

// const argomenti = mongoose.Schema({
//     codArg: { type: Number, ref: "Argomenti", required: true },
// });

const materie = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    dataCreazione: { type: Date, required: true },
    moderatore: { type: Number, ref: "Utenti", required: true }, //il moderatore è l'utente che crea la materia
    // argomenti: [argomenti] messo materia di riferimento in argomenti
});

module.exports = mongoose.model("Materie", materie);