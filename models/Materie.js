const mongoose = require("mongoose");

const argomenti = mongoose.Schema({
    codArg: { type: Number, ref: "Argomenti", required: true },
});

const materie = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    codMod: { type: Number, ref: "Moderatori", required: true }, //una materia può avere più moderatori
    argomenti: [argomenti]
});

module.exports = mongoose.model("Materie", materie);