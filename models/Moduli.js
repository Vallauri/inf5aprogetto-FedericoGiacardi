const mongoose = require("mongoose");

const argomenti = mongoose.Schema({
    codArgomento: { type: Number, ref: "Argomenti", required: true }
});

const lezioni = mongoose.Schema({
    codLezione: { type: Number, ref: "Lezioni", required: true },
    dataAggiunta: { type: Date, required: true }
});

const moduli = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    dataCreazione: { type: Date, required: true },
    codTipoModulo: { type: Number, ref:"TipiModulo", required: true },
    codMateria: { type: Number, ref:"Materie", required: true },
    codAutore: { type: Number, ref:"Utenti", required: true },
    dataCreazione: { type: Date, required: true },
    argomenti: [argomenti],
    lezioni: [lezioni]
});

module.exports = mongoose.model("Moduli", moduli);