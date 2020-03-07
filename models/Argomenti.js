const mongoose = require("mongoose");

const autoriArgomenti = mongoose.Schema({
    codMod: { type: Number, ref:"Moderatori", required: true },
    dataCaricamento: { type: Date, required: true }
});

const argomenti = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    autori:[autoriArgomenti]
});

module.exports = mongoose.model("Argomenti", argomenti);