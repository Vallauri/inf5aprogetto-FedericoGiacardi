const mongoose = require("mongoose");

const argomenti = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    codMateria: { type: Number, ref: "Materie", required: true },
    codModeratore: { type: Number, ref: "Utenti", required: true }, //Colui che crea l'argomento
    validita: { type: String, required: true, default:"true" }
});

module.exports = mongoose.model("Argomenti", argomenti);