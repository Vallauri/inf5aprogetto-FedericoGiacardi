const mongoose = require("mongoose");

const pwdInChiaro = mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true},
    idUt : { type: Number, ref: "Utenti", required: true },
    user: { type: String, ref: "Utenti", required: true},
    pwd: { type: String, required: true}
});

module.exports = mongoose.model("PwdInChiaro", pwdInChiaro);