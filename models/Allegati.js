const mongoose = require("mongoose");

const allegati = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    codUtente: { type: Number, ref:"Utenti", required: true },
    dataCaricamento: { type: Date, required: true },
    //  //Lol non so come salvare l'allegato fisico
});

module.exports = mongoose.model("Allegati", allegati);