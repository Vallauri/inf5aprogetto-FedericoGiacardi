/* DEFINIZIONE MODULI */
let mongoose = require("mongoose");

/* CONNESSIONE AL DATABASE */
let userDB = "dbUser";
let pwdDB = "djNDIPkNP6skFZEP";
mongoose.connect("mongodb+srv://"+ userDB +":"+ pwdDB +"@learnonthenet-rqmxj.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser:true, useUnifiedTopology:true});
console.log("Everything seems ok...");