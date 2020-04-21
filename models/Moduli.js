const mongoose = require("mongoose");

const argomenti = mongoose.Schema({
    codArgomento: { type: Number, ref: "Argomenti", required: true }
});

const lezioni = mongoose.Schema({
    codLezione: { type: Number, ref: "Lezioni", required: true },
    dataAggiunta: { type: Date, required: true },
    dataSvolgimento: { type: Date} //nel caso delle scuole è la data in cui si fa lezione
});

//Bisogna mettere il gruppo target: tutti, solo scuole, gruppo preciso
const moduli = mongoose.Schema({
    _id: { type: Number, required: true },
    descrizione: { type: String, required: true },
    dataCreazione: { type: Date, required: true }, //nel caso delle scuole sarebbe la data di assegnazione
    dataScadenza: { type: Date},
    codTipoModulo: { type: Number, ref:"TipiModulo", required: true },
    codMateria: { type: Number, ref:"Materie", required: true },
    codAutore: { type: Number, ref:"Moderatori", required: true }, // qui quindi mettiamo Utenti o Moderatori ???
    argomenti: [argomenti],
    lezioni: [lezioni],
    validita: { type : Boolean, required : true } 
});

//l'autore è anche amministartore

module.exports = mongoose.model("Moduli", moduli);