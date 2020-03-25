const mongoose = require("mongoose");

const parteDi = mongoose.Schema({
    codGruppo: { type: Number, ref:"Gruppi", required: true},
    dataInizio: { type: Date, required: true },
    dataFine: Date
});

const eseguonoEsami = mongoose.Schema({
    codEsame: { type: Number, ref: "Esami", required: true },
    data: { type: Date, required: true },
    voto: { type: Number, required: true }
});

const svolgonoModuliUtenti = mongoose.Schema({
    codModulo: { type: Number, ref: "Moduli", required: true },
    dataInizio: { type: Date, required: true },
    dataFine: { type: Date},
    scadenza: { type: Date}
});

const svolgonoLezioni = mongoose.Schema({
    codLez: { type: Number, ref: "Lezioni", required: true },
    dataInizio: { type: Date, required: true },
    dataFine: { type: Date },
    completata: { type: Boolean, default: false }
});

const consultanoAppunti  = mongoose.Schema({
    codApp: { type: Number, ref: "Appunti", required: true },
    dataConsultazione: { type: Date, required: true }
});

const modificanoAppunti = mongoose.Schema({
    codApp: { type: Number, ref: "Appunti", required: true },
    dataModifica: { type: Date, required: true },
    modifica: { type: String, required: true },
    approvata: { type: Boolean, default: false}
});

const eseguonoEsamiGruppi = mongoose.Schema({
    codGruppo: { type: Number, ref: "Gruppi", required: true },
    codEsame: { type: Number, ref: "Esami", required: true },
    data: { type: Date, required: true }, //la data in cui si svolge l'esame  
    voto: { type: Number } //, required: true 
});

const svolgonoModuliGruppi = mongoose.Schema({
    codGruppo: { type: Number, ref: "Gruppi", required: true },
    codModulo: { type: Number, ref: "Moduli", required: true },
    dataInizio: { type: Date, required: true },
    dataFine: { type: Date },
    scadenza: { type: Date }
});

const matModerate = mongoose.Schema({
    codMat: { type: Number, ref: "Materie", required: true }
});


const utenti = mongoose.Schema({
    _id: { type: Number, required: true},
    nome: { type: String, required: true},
    cognome: { type: String, required: true},
    dataNascita: { type: Date, required: true},
    mail: { type: String, required: true},
    telefono: { type: String, required: true},
    user: { type: String, required: true},
    pwd: { type: String, required: true},
    foto: { type: String},
    recensione: { type: String},
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: String },
    materie: [matModerate],
    gruppo: [parteDi],
    esami: [eseguonoEsami],
    esamiGruppi: [eseguonoEsamiGruppi],
    moduli: [svolgonoModuliUtenti],
    moduliGruppi: [svolgonoModuliGruppi],
    lezioni: [svolgonoLezioni],
    appuntiConsultati: [consultanoAppunti],
    modificheAppunti: [modificanoAppunti]
});

module.exports = mongoose.model("Utenti", utenti);