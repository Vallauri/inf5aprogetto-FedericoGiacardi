/* DEFINIZIONE MODULI */
"use strict"
const fs = require('fs');
const ERRORS = require('errors');
let mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require('nodemailer');
var async = require("async");
var crypto = require("crypto");
require('dotenv').config();
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const textToSpeech = new TextToSpeechV1({});
const port = process.env.PORT || 8888;
const fileContentReader = require("./FileReader/filecontentReader");

const multer = require("multer"); // Modulo per salvataggio immagini su server

/* CONNESSIONE AL DATABASE */
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@learnonthenet-rqmxj.mongodb.net/progetto?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});
console.log("Everything seems ok...");

// code 404 - database connection error
ERRORS.create({
    code: 404,
    name: 'PAGE_NOT_FOUND',
    defaultMessage: 'Risorsa non trovata'
});

// code 600 - database connection error
ERRORS.create({
    code: 600,
    name: 'DB_CONNECTION',
    defaultMessage: 'An error occured when connecting to database'
});

// code 601 - query execution error
ERRORS.create({
    code: 601,
    name: 'QUERY_EXECUTE',
    defaultMessage: 'An error occured during the query execution'
});

// code 603 - Parametri Mancanti
ERRORS.create({
    code: 603,
    name: 'MISSING_PARAMS',
    defaultMessage: 'Parametri Mancanti'
});

// code 604 - Email already used
ERRORS.create({
    code: 604,
    name: 'EMAIL_USED',
    defaultMessage: 'Questa Email è già stata utilizzata'
});

// code 605 - Telephone already used
ERRORS.create({
    code: 605,
    name: 'TELEPHONE_USED',
    defaultMessage: 'Questo Numero di Telefono è già stato utilizzato'
});

// code 606 - Username already used
ERRORS.create({
    code: 606,
    name: 'USERNAME_USED',
    defaultMessage: 'Questo Username è già stato utilizzato'
});

// code 607 - Password already used
ERRORS.create({
    code: 607,
    name: 'PWD_USED',
    defaultMessage: 'Questa Password è già stata utilizzata'
});

// code 608 - Already Existing Note
ERRORS.create({
    code: 608,
    name: 'EXISTING_NOTE',
    defaultMessage: 'Esiste già un Appunto con il medesimo Titolo e Autore'
});

// code 609 - Author of group can't be removed
ERRORS.create({
    code: 609,
    name: 'AUTH_NOT_REMOVED',
    defaultMessage: 'L\'autore del gruppo non può essere rimosso'
});

// code 610 - User already in group
ERRORS.create({
    code: 610,
    name: 'USER_ALREADY_IN_GROUP',
    defaultMessage: 'L\'utente è già presente nel gruppo'
});

// code 611 - User already in course
ERRORS.create({
    code: 611,
    name: 'USER_ALREADY_IN_COURSE',
    defaultMessage: 'L\'utente è già iscritto al corso'
});

// code 612 - Topic already in course
ERRORS.create({
    code: 612,
    name: 'ARG_ALREADY_IN_COURSE',
    defaultMessage: 'L\'argomento è già presente nel corso'
});

// code 613 - Lesson already in course
ERRORS.create({
    code: 613,
    name: 'LEZ_ALREADY_IN_COURSE',
    defaultMessage: 'La lezione è già presente nel corso'
});

// code 614 - TTS Service currently unavailable
ERRORS.create({
    code: 614,
    name: 'DOWNLOAD_FAILED',
    defaultMessage: 'Il download richiesto è fallito'
});

// code 615 - TTS error
ERRORS.create({
    code: 615,
    name: 'TTS_ERROR',
    defaultMessage: 'Si verificato un errore durante la conversione'
});

// code 616 - TTS error
ERRORS.create({
    code: 616,
    name: 'DOWNLOAD_ATTACHMENT_ERROR',
    defaultMessage: 'L\' allegato richiesto non esiste'
});

// code 617 - TTS error
ERRORS.create({
    code: 617,
    name: 'INVALID_ATTACHMENT_ERROR',
    defaultMessage: 'L\' allegato caricato non è valido'
});

// code 618 - User already in Lesson
ERRORS.create({
    code: 618,
    name: 'USER_ALREADY_IN_LESSON',
    defaultMessage: 'L\'utente partecipa già alla lezione'
});

// code 619 - Note already in Lesson
ERRORS.create({
    code: 619,
    name: 'APP_ALREADY_IN_LESSON',
    defaultMessage: 'L\'appunto è già presente nella lezione'
});

// code 620 - Already Existing Course
ERRORS.create({
    code: 620,
    name: 'EXISTING_COURSE',
    defaultMessage: 'Esiste già un Corso con la medesima Descrizione, Materia e Tipo di Corso'
});

// code 621 - Already Existing Group
ERRORS.create({
    code: 621,
    name: 'EXISTING_GROUP',
    defaultMessage: 'Esiste già un Gruppo con il medesimo Nome, Descrizione e Tipo di Gruppo'
});

// code 622 - Already Existing Subject
ERRORS.create({
    code: 622,
    name: 'EXISTING_SUBJECT',
    defaultMessage: 'Esiste già una Materia con la medesima Descrizione'
});

// code 623 - Missing Argument
ERRORS.create({
    code: 623,
    name: 'MISSING_ARGUMENT',
    defaultMessage: 'L\' argomento richiesto non è stato individuato'
});

// code 624 - Already Existing Argument
ERRORS.create({
    code: 624,
    name: 'EXISTING_ARGUMENT',
    defaultMessage: 'Esiste già un argomento con i medesimi dati'
});

// code 625 - Missing Note
ERRORS.create({
    code: 625,
    name: 'MISSING_NOTE',
    defaultMessage: 'L\' appunto richiesto non è stato individuato'
});

// code 626 - Missing Note
ERRORS.create({
    code: 626,
    name: 'MISSING_COURSE',
    defaultMessage: 'Il Corso richiesto non è stato individuato'
});

// code 627 - Exam already exists
ERRORS.create({
    code: 627,
    name: 'EXISTING_EXAM',
    defaultMessage: 'Esiste già in questo corso un esame con la medesima Descrizione e Data di Scadenza'
});

// Impostazioni multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "static/images");
    },
    filename: function (req, file, cb) {
        const now = new Date().toISOString();
        const date = now.replace(/:/g, '-');
        cb(null, date + file.originalname);
    }
});

const storageAllegati = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "static/allegati");
    },
    filename: function (req, file, cb) {
        console.log("FILE CARICATO");
        const now = new Date().toISOString();
        const date = now.replace(/:/g, '-');
        cb(null, date + "_" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.includes("image/")) {
        if (!file.originalname.includes("unset") && !file.originalname.includes("noChange")) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } else {
        req.fileValidationError = 'fileNonValido';
        cb(null, false);
    }

};

const upload = multer({ storage: storage, fileFilter: fileFilter,  });

const uploadAllegati = multer({ storage: storageAllegati });//<!-- Vedere file da rifiutare per rischio sicurezza es.JS -->

const HTTPS = require('https');


// express
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

//Mongoose
let utenti = require("./models/Utenti.js");
let argomenti = require("./models/Argomenti.js");
let argomentiTemp = require("./models/ArgomentiTemp.js");
let appunti = require("./models/Appunti.js");
let esami = require("./models/Esami.js");
let gruppi = require("./models/Gruppi.js");
let tipiGruppi = require("./models/TipiGruppo.js");
let allegati = require("./models/Allegati.js");
let moduli = require("./models/Moduli.js");
let tipiModuli = require("./models/TipiModulo.js");
let pwdInChiaro = require("./models/PwdInChiaro.js");
let materie = require("./models/Materie.js");
let lezioni = require("./models/Lezioni.js");
let appuntiTemp = require("./models/AppuntiTemp.js");
let moduliTemp = require("./models/ModuliTemp.js");


// Online RSA Key Generator
const privateKey = fs.readFileSync("keys/private.key", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = { "key": privateKey, "cert": certificate };

/* ************************************************************ */

// avvio server
const TIMEOUT = 3000; // 60 SEC
let pageNotFound;

var httpsServer = HTTPS.createServer(credentials, app);
httpsServer.listen(port, '127.0.0.1', function () {
    fs.readFile("./static/error.html", function (err, content) {
        if (err)
            content = JSON.stringify(new ERRORS.PAGE_NOT_FOUND({}));
        pageNotFound = content.toString();
    });
    console.log("Server in ascolto https://127.0.0.1: " + this.address().port);
});
httpsServer.timeout = 600000;

/* ************************************************************ */
app.use("/", express.static('./static'));
app.use("/static", express.static("static"));
// middleware
app.use("/", bodyParser.json());
app.use("/", bodyParser.urlencoded({ extended: true }));

app.use("/", function (req, res, next) {
    console.log(">_ " + req.method + ": " + req.originalUrl);
    if (Object.keys(req.query).length != 0)
        console.log("Parametri GET: " + JSON.stringify(req.query));
    if (Object.keys(req.body).length != 0)
        console.log("Parametri BODY: " + JSON.stringify(req.body));
    next();
});

/* --------------------------------------------------------------- */
// controllo token per dare l'accesso oppure no
app.get('/', function (req, res, next) {
    controllaToken(req, res, next);
});
app.get('/index.html', function (req, res, next) {
    controllaToken(req, res, next);
});
/* --------------------------------------------------------------- */

// controllo del token
app.use('/api', function (req, res, next) {
    controllaToken(req, res, next);
});

app.post('/api/chkToken', function (req, res) {
    console.log("Valore admin: "+JSON.parse(JSON.stringify(req.payload)).admin);
    res.send({ "id": JSON.parse(JSON.stringify(req.payload))._id, "amministratore": req.payload.amministratore});
});

function controllaToken(req, res, next) {
    let urlNotToCheck = [
        '/api/login', 
        '/api/logout', 
        '/api/registrati', 
        '/api/reimpostaPwd', 
        '/api/loadCounter', 
        '/api/elRecensioni', 
        '/api/invioMailReimpostaPwd'
    ];
    
    if (urlNotToCheck.find((url) => { return url == req.originalUrl; }))
        next();
    else {
        let token = readCookie(req);
        if (token == '') {
            error(req, res, null, JSON.stringify(new ERRORS.Http403Error({})));
        } else {
            jwt.verify(token, privateKey, function (err, payload) {
                if (err)
                    error(req, res, err, JSON.stringify(new ERRORS.Http401Error({})));
                else {
                    // aggiornamento del token
                    var exp = Math.floor(Date.now() / 1000) + TIMEOUT;
                    payload = { ...payload, 'exp': exp};
                    token = createToken(payload);
                    writeCookie(res, token);
                    req.payload = payload;
                    next();
                }
            });
        }
    }
}

function readCookie(req) {
    var valoreCookie = "";
    if (req.headers.cookie) {
        var cookies = req.headers.cookie.split('; ');
        for (var i = 0; i < cookies.length; i++) {
            cookies[i] = cookies[i].split("=");
            if (cookies[i][0] == "token") {
                valoreCookie = cookies[i][1];
                break;
            }
        }
    }
    return valoreCookie;
}

/* ************************************************************ */

app.post('/api/login', function (req, res, next) {
    let username = req.body.username;

    if (username != "" || req.body.password != "") {
        utenti.findOne({ "user": username }).exec().then(utente => {
            console.log(JSON.parse(JSON.stringify(utente)));
            if (utente == null)
                error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
            else {
                bcrypt.compare(req.body.password, utente.pwd, function (errC, resC) {
                    if (resC) {
                        let token = createToken(utente);
                        writeCookie(res, token);
                        res.send({ "ris": "loginOk" });
                    } else {
                        error(req, res, errC, JSON.stringify(new ERRORS.Http401Error({})));
                    }
                });
            }
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    }else{
        gestErrorePar(req, res);
    }
});

// Logout
app.post('/api/logout', function (req, res, next) {
    res.set("Set-Cookie", "token=;max-age=-1;Path=/;httponly=true");
    res.send({ "ris": "LogOutOk" });
});

app.post("/api/registrati", upload.single("foto"),function (req, res) {
    let path = "";
    if (req.body.nome != "") {
        if (req.body.cognome != "") {
            if (Date.parse(req.body.dataNascita)) {
                if (chkEtaMinima(new Date(req.body.dataNascita)) >= 2920) {
                    if (validaEmail(req.body.email)) {
                        if (validaTelefono(req.body.telefono)) {
                            if (req.body.username != "") {
                                if (validaPwdReg(req.body.password)) {
                                    if (req.fileValidationError != "fileNonValido") {
                                        utenti.count({ "mail": req.body.email }).exec().then(nUtMail => {
                                            if (nUtMail == 0) {
                                                utenti.count({ "telefono": req.body.telefono }).exec().then(nUtTel => {
                                                    if (nUtTel == 0) {
                                                        utenti.count({ "user": req.body.username }).exec().then(nUtUser => {
                                                            if (nUtUser == 0) {
                                                                bcrypt.hash(req.body.password, saltRounds, function (errUtPwd, hashUtPwd) {
                                                                    if (errUtPwd) {
                                                                        error(req, res, errUtPwd, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                                    } else {
                                                                        utenti.find().sort({ _id: 1 }).exec().then(results => {
                                                                            let vet = JSON.parse(JSON.stringify(results));
                                                                            if (req.file == undefined) {
                                                                                path = "static\\images\\default.png";
                                                                            } else {
                                                                                path = req.file.path;
                                                                            }

                                                                            const utInsert = new utenti({
                                                                                _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                                                                nome: req.body.nome,
                                                                                cognome: req.body.cognome,
                                                                                dataNascita: req.body.dataNascita,
                                                                                mail: req.body.email,
                                                                                telefono: req.body.telefono,
                                                                                user: req.body.username,
                                                                                pwd: hashUtPwd,
                                                                                foto: path,
                                                                                amministratore: false
                                                                            });
                                                                            utInsert.save().then(results => { res.send(JSON.stringify("regOk")); }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });

                                                                            /* Poi da rimuovere in Deploy */
                                                                            const utPwdColl = new pwdInChiaro({
                                                                                _id: new mongoose.Types.ObjectId(),
                                                                                idUt: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                                                                user: req.body.username,
                                                                                pwd: req.body.password
                                                                            });
                                                                            utPwdColl.save().then(results => { console.log("Pwd salvata su Collection in chiaro") }).catch(errSave => { console.log("Errore salvataggio Pwd in chiaro; err: " + errSave) });
                                                                        }).catch(err => {
                                                                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                error(req, res, null, JSON.stringify(new ERRORS.USERNAME_USED({})));
                                                            }
                                                        }).catch(errUser => {
                                                            error(req, res, errUser, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                        });
                                                    } else {
                                                        error(req, res, null, JSON.stringify(new ERRORS.TELEPHONE_USED({})));
                                                    }
                                                }).catch(errTel => {
                                                    error(req, res, errTel, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                });
                                            } else {
                                                error(req, res, null, JSON.stringify(new ERRORS.EMAIL_USED({})));
                                            }
                                        }).catch(errMail => {
                                            error(req, res, errMail, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                        });
                                    } else {
                                        error(req, res, null, JSON.stringify(new ERRORS.INVALID_ATTACHMENT_ERROR({})));
                                    }
                                } else {
                                    gestErrorePar(req, res);
                                }
                            } else {
                                gestErrorePar(req, res);
                            }
                        } else {
                            gestErrorePar(req, res);
                        }
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    }
    else {
        gestErrorePar(req, res);
    }
});

app.post('/api/invioMailReimpostaPwd', function (req, res, next) {
    crypto.randomBytes(20, function (err, buf) {
        let token = buf.toString('hex');
        utenti.updateOne({ mail: req.body.email }, { $set: { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 } }).exec().then(results => {
            
            if (results.nModified != 1) {
                res.send({ "tipo": "errore", "mes": "Non è stato trovato alcun Account" });
            }

            console.log(process.env.PWD_GMAIL);
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'learnonthenet7@gmail.com',
                    pass: process.env.PWD_GMAIL
                }
            });

            let mailOptions = {
                from: 'learnonthenet7@gmail.com',
                to: req.body.email,
                subject: 'Aggiornamento Password',
                text: 'Gentile Utente, è stato richiesto un cambio di password per il suo account. Clicchi sul link indicato per completare il cambio password.\n\n' +
                    'https://' + req.headers.host + '/reimpostaPassword.html?token=' + token + '\n\n' +
                    'Se non ha richiesto questa operazione ignori questa mail e la sua password rimarrà invariata.'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                let ret = {};
                if (error) {
                    ret["mes"] = "Ripristino Password fallito. Ritentare.";
                    ret["tipo"] = "errore";
                } else {
                    ret["mes"] = "Abbiamo inviato una mail all'indirizzo specificato con le indicazioni per ultimare il processo.";
                    ret["tipo"] = "ok";
                }
                res.send(JSON.stringify(ret));
            });
        }).catch(errUp =>{
            error(req, res, errUp, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
        
    });
    
});

app.post("/api/reimpostaPwd", function (req, res) {
    utenti.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }).exec().then(result => {
        let ret = {};
        if (!result) {
            ret["mes"] = "Token scaduto o non valido.";
            ret["tipo"] = "errore";
            res.send(JSON.stringify((ret)));
        } else {
            if (validaPwdReg(req.body.password)) {
                if (validaPwdReg(req.body.ripetiPassword)) {
                    if (req.body.password == req.body.ripetiPassword) {
                        //ATTENZIONE!!! PER ORA NON FUNGE. Bisogna scorrere il recordset con un foreach e per ogni record fare il bcrypt.compare
                        bcrypt.hash(req.body.password, saltRounds, function (errReimpPwd, hashReimpPwd) {
                            if (errReimpPwd) {
                                error(req, res, errReimpPwd, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                            } else {
                                utenti.updateOne({ "_id":result._id}, { $set: { "pwd": hashReimpPwd } }).exec().then(results => {
                                    let transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                            user: 'learnonthenet7@gmail.com',
                                            pass: 'S8Fh!lU?y8'
                                        }
                                    });

                                    let mailOptions = {
                                        from: 'learnonthenet7@gmail.com',
                                        to: result.mail,
                                        subject: 'Aggiornamento Password',
                                        text: "Gentile Utente, le scriviamo per notificarle il cambiamento della Password del suo account sulla Piattaforma Learn On The Net.\n La preghiamo di contattare l'amministratore all'indirizzo: learnonthenet7@gmail.com in caso di problemi."
                                    };

                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            ret["mes"] = "Ripristino Password fallito. Ritentare.";
                                            ret["tipo"] = "errore";
                                        } else {
                                            utenti.updateOne({ "_id": parseInt(result._id) }, { $set: { "resetPasswordToken": undefined, "resetPasswordExpires":undefined}}).exec().then(upResToken =>{
                                                ret["mes"] = "reimpPwdOk";
                                                ret["tipo"] = "ok";
                                            }).catch(errResToken => {
                                                error(req, res, errResToken, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                            });
                                        }
                                        res.send(JSON.stringify(ret));
                                    });
                                }).catch(err => {
                                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                });
                            }
                        });
                    }else{
                        gestErrorePar(req, res);
                    }
                }else{
                    gestErrorePar(req, res);
                }
                
            } else {
                gestErrorePar(req, res);
            }
        }
        

    }).catch(err => {
        error(req, res, errUp, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

function validaEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validaTelefono(telefono) {
    let re = /^[0-9]{10,10}$/;
    return re.test(telefono);
}

function validaPwdReg(pwdReg) {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    return re.test(pwdReg);
}

function gestErrorePar(req, res) {
    error(req, res, null, JSON.stringify(new ERRORS.MISSING_PARAMS({})));
}

app.post("/api/loadCounter", function (req, res) {
    let ret = {};
    utenti.count({}).exec().then(resultUt =>{
        ret["utenti"]=resultUt; 
        argomenti.count({}).exec().then(resultArgs => {
            ret["argomenti"] = resultArgs;
            appunti.count({}).exec().then(resultApp => {
                ret["appunti"] = resultApp;
                esami.count({}).exec().then(resultEsami => {
                    ret["esami"] = resultEsami;
                    res.send(ret);
                }).catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    }).catch(err=>{
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/elRecensioni", function (req, res) {
    utenti.find({}).select("recensione user foto").exec().then(results =>{
        res.send(JSON.stringify(results));
    }).catch(err =>{
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

//#region DASHBOARD UTENTE
app.post("/api/elGruppi", function (req, res) {
    console.log(gruppi.collection.name);
    utenti.aggregate([
        { $match:{"_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }},
        {
            $lookup:
            {
                from: gruppi.collection.name,
                "let": { "gruppo": "$gruppo.codGruppo" },
                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$_id", "$$gruppo"] } } },
                    {
                        "$lookup": {
                            "from": tipiGruppi.collection.name,
                            "localField": "tipoGruppo",
                            "foreignField": "_id",
                            "as": "tipoGruppo"
                        }
                    }
                ],
                as: "gruppi"
            }
        }
    ]).exec().then(results => {
        console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/elMaterie", function (req, res) {
    utenti.aggregate([
        { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id), "validita" : "true" } },
        {
            $lookup:
            {
                from: materie.collection.name,
                "let": { "materia": "$materie.codMat" },
                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$_id", "$$materia"] } } },
                    {
                        "$lookup": {
                            "from": argomenti.collection.name,
                            "let": { "argomenti": "$argomenti.codArg" },
                            "pipeline": [
                                { "$match": { "$expr": { "$in": ["$_id", "$$argomenti"] } } },
                                { "$match": { "$expr": { "$eq": ["$validita", "true"] } } }, // non evita che l'appunto sia nell'elenco, ma dovrebbe funzionare tutto lo stesso
                            ],
                            "as": "argomenti"
                        }
                    }
                ],
                as: "materieModerate"
            }
        }
    ]).exec().then(results => {
        console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/elAppunti", function (req, res) {
    utenti.aggregate([
        { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
        {
            $lookup:
            {
                from: appunti.collection.name,
                "let": { "appunto": "$_id" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$codUtente", "$$appunto"] } } },
                    { "$match": { "$expr" : { "$eq": ["$validita", "true"] } } },
                    {
                        "$lookup": {
                            "from": argomenti.collection.name,
                            "let": { "argomenti": "$argomenti.codArgomento" },
                            "pipeline": [
                                { "$match": { "$expr": { "$in": ["$_id", "$$argomenti"] } } },
                                { "$match": { "$expr": { "$eq": ["$validita", "true"] } } }, // non evita che l'appunto sia nell'elenco, ma dovrebbe funzionare tutto lo stesso
                            ],
                            "as": "argomenti"
                        }
                    }
                ],
                as: "appuntiCaricati"
            }
        }
    ]).exec().then(results => {
        console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

//Attenzione!! Modificarlo escludendo gli appunti che non sono accessibili per l'utente tramite controllo target modulo
app.post("/api/feedModuli", function (req, res) {
    utenti.aggregate([
        { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
        {
            $lookup:
            {
                from: moduli.collection.name,
                "let": { "moduloUt": "$moduli.codModulo", "moduloGruppo": "$moduliGruppi.codModulo"},
                "pipeline": [
                    { "$match": { "$expr": { "$or": [{ "$in": ["$_id", "$$moduloUt"] }, { "$in": ["$_id", "$$moduloGruppo"] }] }} },
                    { "$match": { "$expr": { "$eq": ["$validita", "true"] } } },
                    {
                        "$lookup": {
                            "from": argomenti.collection.name,
                            "let": { "argomenti": "$argomenti.codArgomento" },
                            "pipeline": [
                                { "$match": { "$expr": { "$in": ["$_id", "$$argomenti"] } } },
                                { "$match": { "$expr": { "$eq": ["$validita", "true"] } } },
                                {
                                    "$lookup": {
                                        "from": moduli.collection.name,
                                        localField:"_id",
                                        foreignField: "argomenti.codArgomento",
                                        "as": "appuntiOk"
                                    }
                                }
                            ],
                            "as": "argomenti"
                        }
                    }
                ],
                as: "appuntiInteressati"
            }
        }
    ]).exec().then(results => {
        console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/elEventiCalendario", function (req, res) {
    utenti.aggregate([
        { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }},
        {
            $lookup:{
                from: lezioni.collection.name,
                "let": { "lezione": "$lezioni.codLez" },
                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$_id", "$$lezione"] } } },
                    { "$match": { "$expr": { "$eq": ["$validita", "true"] } } }
                ],
                as: "datiLezione"
            }
        }
    ]).exec().then(results => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/dettaglioEventoModuli", function (req, res) {
    moduli.aggregate([
        { $match: { "_id": parseInt(req.body.idEvento), "validita" : "true" } },
        {
            $lookup:
            {
                from: materie.collection.name,
                localField: "codMateria",
                foreignField: "_id",
                as: "materia"
            }
        },
        {
            $lookup:
            {
                from: tipiModuli.collection.name,
                localField: "codTipoModulo",
                foreignField: "_id",
                as: "tipoModulo"
            }
        },
        {
            $lookup:
            {
                from: utenti.collection.name,
                localField: "codAutore",
                foreignField: "_id",
                as: "autore"
            }
        }
    ]).exec().then(results =>{
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

// app.post("/api/dettaglioEventoEsame", function (req, res) {
//     esami.findOne({ "_id": parseInt(req.body.idEvento) }).exec().then(results => {
//         let token = createToken(req.payload);
//         writeCookie(res, token);
//         res.writeHead(200, { "Content-Type": "application/json" });
//         res.end(JSON.stringify(results));
//     }).catch(err => {
//         error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
//     });
// });

app.post("/api/dettaglioEventoEsame", function (req, res) {
    esami.aggregate([
        { $match: { "_id": parseInt(req.body.idEvento), "validita" : true } }, // controllare
        {
            $lookup:
            {
                from: moduli.collection.name,
                localField: "codModulo",
                foreignField: "_id",
                as: "detModuli"
            }
        }
    ]).exec().then(results => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/dettaglioEventoLezione", function (req, res) {
    lezioni.findOne({ "_id": parseInt(req.body.idEvento), "validita" : "true" }).exec().then(result => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/setNavBar", function (req, res) {
    console.log(req.payload);
    utenti.findOne({ "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }).exec().then(result => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});
//#endregion

//#region CORSI
app.post("/api/elTipiCorsi", function (req, res) {
    tipiModuli.find().select("_id descrizione").exec().then(results => {
        console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/cercaCorso", function (req, res) {
    let filtri = req.body.filtri;
    if (filtri.corsiDaCercare == "") { // controllo se i corsi da cercare sono tutti o solo quelli del gruppo
        let filtriFind;
        if (filtri.tipoCorso != "") // controllo se è stato specificato un tipo di corso
            filtriFind = { descrizione: new RegExp(req.body.valore, "i"), codTipoModulo: parseInt(filtri.tipoCorso), validita : "true" };
        else
            filtriFind = { descrizione: new RegExp(req.body.valore, "i"), validita: "true" };

        moduli.find(filtriFind).exec().then(results => {
            if (results.length > 0) {
                let modId = [];
                let tipiModId = [];
                results.forEach(ris => {
                    modId.push(ris._id);
                    tipiModId.push(ris.codTipoModulo);
                });

                tipiModuli.aggregate([
                    { "$match": { "$expr": { "$in": ["$_id", tipiModId] } } },
                    {
                        $lookup:
                        {
                            from: moduli.collection.name,
                            "let": { "tipomodulo": "$_id" },
                            "pipeline": [
                                { "$match": { "$expr": { "$eq": ["$codTipoModulo", "$$tipomodulo"] } } },
                                { "$match": { "$expr": { "$in": ["$_id", modId] } } },
                                {
                                    "$lookup": {
                                        "from": utenti.collection.name,
                                        "localField": "codAutore",
                                        "foreignField": "_id",
                                        "as": "autore"
                                    }
                                },
                                {
                                    "$lookup": {
                                        "from": materie.collection.name,
                                        "localField": "codMateria",
                                        "foreignField": "_id",
                                        "as": "materia"
                                    }
                                }
                            ],
                            as: "moduli"
                        }
                    }
                ]).exec().then(results => {
                    // console.log(results);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results));
                }).catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            }
            else {
                // console.log(results);
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    }
    else if(filtri.corsiDaCercare == "yourGroup") {
        // qui sono nel ramo in cui i corsi richiesti sono quelli del gruppo
        if (filtri.tipoCorso == "") { // controllo se il tipo di corso è stato specificato o no
            utenti.aggregate([
                { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
                {
                    $lookup:
                    {
                        from: moduli.collection.name,
                        // localField: "moduliGruppi.codModulo",
                        // foreignField: "_id",
                        "let": { "moduli": "$moduliGruppi.codModulo" },
                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$moduli"] } } },
                            { "$match": { "$expr": { "$eq": ["$validita", "true"] } } },
                        ],
                        as: "moduliTrovati"
                    }
                }
            ]).exec().then(results => {
                if (results[0].moduliTrovati.length > 0) {
                    let modId = [];
                    let tipiModId = [];
                    let chkDesc = new RegExp(req.body.valore, "i");
                    results[0].moduliTrovati.forEach(ris => {
                        if (chkDesc.test(ris.descrizione)) {
                            modId.push(ris._id);
                            tipiModId.push(ris.codTipoModulo);
                        }
                    });

                    tipiModuli.aggregate([
                        { "$match": { "$expr": { "$in": ["$_id", tipiModId] } } },
                        {
                            $lookup:
                            {
                                from: moduli.collection.name,
                                "let": { "tipomodulo": "$_id" },
                                "pipeline": [
                                    { "$match": { "$expr": { "$eq": ["$codTipoModulo", "$$tipomodulo"] } } },
                                    { "$match": { "$expr": { "$in": ["$_id", modId] } } },
                                    {
                                        "$lookup": {
                                            "from": utenti.collection.name,
                                            "localField": "codAutore",
                                            "foreignField": "_id",
                                            "as": "autore"
                                        }
                                    },
                                    {
                                        "$lookup": {
                                            "from": materie.collection.name,
                                            "localField": "codMateria",
                                            "foreignField": "_id",
                                            "as": "materia"
                                        }
                                    }
                                ],
                                as: "moduli"
                            }
                        }
                    ]).exec().then(results => {
                        // console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
                else {
                    // console.log(results[0].moduliTrovati);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results[0].moduliTrovati));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else {
            // qui sono nel ramo in cui sono stati richiesti i corsi del gruppo di un determinato tipo di corso
            let tipoCorso = parseInt(filtri.tipoCorso);
            utenti.aggregate([
                { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
                {
                    $lookup:
                    {
                        from: moduli.collection.name,
                        "let": { "moduli": "$moduliGruppi.codModulo" },
                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$moduli"] } } },
                            { "$match": { "$expr": { "$eq": ["$codTipoModulo", tipoCorso] } } },
                            { "$match": { "$expr": { "$eq": ["$validita", "true"] } } },
                        ],
                        as: "moduliTrovati"
                    }
                }
            ]).exec().then(results => {
                if (results[0].moduliTrovati.length > 0) {
                    let modId = [];
                    let tipiModId = [];
                    let chkDesc = new RegExp(req.body.valore, "i");
                    results[0].moduliTrovati.forEach(ris => {
                        if (chkDesc.test(ris.descrizione)) {
                            modId.push(ris._id);
                            tipiModId.push(ris.codTipoModulo);
                        }
                    });

                    tipiModuli.aggregate([
                        { "$match": { "$expr": { "$in": ["$_id", tipiModId] } } },
                        {
                            $lookup:
                            {
                                from: moduli.collection.name,
                                "let": { "tipomodulo": "$_id" },
                                "pipeline": [
                                    { "$match": { "$expr": { "$eq": ["$codTipoModulo", "$$tipomodulo"] } } },
                                    { "$match": { "$expr": { "$in": ["$_id", modId] } } },
                                    {
                                        "$lookup": {
                                            "from": utenti.collection.name,
                                            "localField": "codAutore",
                                            "foreignField": "_id",
                                            "as": "autore"
                                        }
                                    },
                                    {
                                        "$lookup": {
                                            "from": materie.collection.name,
                                            "localField": "codMateria",
                                            "foreignField": "_id",
                                            "as": "materia"
                                        }
                                    }
                                ],
                                as: "moduli"
                            }
                        }
                    ]).exec().then(results => {
                        // console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
                else {
                    //console.log(results[0].moduliTrovati);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results[0].moduliTrovati));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
    }
    else{
        // qui sono nel ramo in cui i corsi richiesti sono quelli a cui è iscritto
        if (filtri.tipoCorso == "") { // controllo se il tipo di corso è stato specificato o no
            utenti.aggregate([
                { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
                {
                    $lookup:
                    {
                        from: moduli.collection.name,
                        // localField: "moduliGruppi.codModulo",
                        // foreignField: "_id",
                        "let": { "moduli": "$moduli.codModulo" },
                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$moduli"] } } },
                            { "$match": { "$expr": { "$eq": ["$validita", "true"] } } },
                        ],
                        as: "moduliTrovati"
                    }
                }
            ]).exec().then(results => {
                if (results[0].moduliTrovati.length > 0) {
                    let modId = [];
                    let tipiModId = [];
                    let chkDesc = new RegExp(req.body.valore, "i");
                    results[0].moduliTrovati.forEach(ris => {
                        if (chkDesc.test(ris.descrizione)) {
                            modId.push(ris._id);
                            tipiModId.push(ris.codTipoModulo);
                        }
                    });

                    tipiModuli.aggregate([
                        { "$match": { "$expr": { "$in": ["$_id", tipiModId] } } },
                        {
                            $lookup:
                            {
                                from: moduli.collection.name,
                                "let": { "tipomodulo": "$_id" },
                                "pipeline": [
                                    { "$match": { "$expr": { "$eq": ["$codTipoModulo", "$$tipomodulo"] } } },
                                    { "$match": { "$expr": { "$in": ["$_id", modId] } } },
                                    {
                                        "$lookup": {
                                            "from": utenti.collection.name,
                                            "localField": "codAutore",
                                            "foreignField": "_id",
                                            "as": "autore"
                                        }
                                    },
                                    {
                                        "$lookup": {
                                            "from": materie.collection.name,
                                            "localField": "codMateria",
                                            "foreignField": "_id",
                                            "as": "materia"
                                        }
                                    }
                                ],
                                as: "moduli"
                            }
                        }
                    ]).exec().then(results => {
                        // console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
                else {
                    // console.log(results[0].moduliTrovati);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results[0].moduliTrovati));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else {
            // qui sono nel ramo in cui sono stati richiesti i corsi a cui è iscritto di un determinato tipo di corso
            let tipoCorso = parseInt(filtri.tipoCorso);
            utenti.aggregate([
                { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
                {
                    $lookup:
                    {
                        from: moduli.collection.name,
                        "let": { "moduli": "$moduli.codModulo" },
                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$moduli"] } } },
                            { "$match": { "$expr": { "$eq": ["$codTipoModulo", tipoCorso] } } },
                            { "$match": { "$expr": { "$eq": ["$validita", "true"] } } },
                        ],
                        as: "moduliTrovati"
                    }
                }
            ]).exec().then(results => {
                if (results[0].moduliTrovati.length > 0) {
                    let modId = [];
                    let tipiModId = [];
                    let chkDesc = new RegExp(req.body.valore, "i");
                    results[0].moduliTrovati.forEach(ris => {
                        if (chkDesc.test(ris.descrizione)) {
                            modId.push(ris._id);
                            tipiModId.push(ris.codTipoModulo);
                        }
                    });

                    tipiModuli.aggregate([
                        { "$match": { "$expr": { "$in": ["$_id", tipiModId] } } },
                        {
                            $lookup:
                            {
                                from: moduli.collection.name,
                                "let": { "tipomodulo": "$_id" },
                                "pipeline": [
                                    { "$match": { "$expr": { "$eq": ["$codTipoModulo", "$$tipomodulo"] } } },
                                    { "$match": { "$expr": { "$in": ["$_id", modId] } } },
                                    {
                                        "$lookup": {
                                            "from": utenti.collection.name,
                                            "localField": "codAutore",
                                            "foreignField": "_id",
                                            "as": "autore"
                                        }
                                    },
                                    {
                                        "$lookup": {
                                            "from": materie.collection.name,
                                            "localField": "codMateria",
                                            "foreignField": "_id",
                                            "as": "materia"
                                        }
                                    }
                                ],
                                as: "moduli"
                            }
                        }
                    ]).exec().then(results => {
                        // console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
                else {
                    //console.log(results[0].moduliTrovati);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results[0].moduliTrovati));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
    }
});

app.post("/api/datiCorsoById", function (req, res) {
    moduli.aggregate([
        { $match: { "_id": parseInt(req.body.idCorso) } },
        { $match: { "validita": "true" } },
        {
            $lookup:
            {
                from: utenti.collection.name,
                localField: "codAutore",
                foreignField: "_id",
                as: "autore"
            }
        },
        {
            $lookup: {
                from: materie.collection.name,
                localField: "codMateria",
                foreignField: "_id",
                as: "materia"
            }
        },
        {
            $lookup: {
                from: tipiModuli.collection.name,
                localField: "codTipoModulo",
                foreignField: "_id",
                as: "tipoModulo"
            }
        },
        {
            $lookup:
            {
                from: argomenti.collection.name,
                localField: "argomenti.codArgomento",
                foreignField: "_id",
                as: "argomentiModulo"
            }
        },
        {
            $lookup:
            {
                from: lezioni.collection.name,
                localField: "lezioni.codLezione",
                foreignField: "_id",
                as: "lezioniModulo"
            }
        }
    ]).exec().then(result => {
        console.log(result);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/elGruppiAdmin", function (req, res) {
    gruppi.find({ codAutore: parseInt(JSON.parse(JSON.stringify(req.payload))._id) }).select("_id nome").exec().then(results => {
        //console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/chkModCorso", function (req, res) {
    moduli.findById(parseInt(req.body.idCorso)).exec().then(result => {
        let risp = {};
        if (result.codAutore == parseInt(JSON.parse(JSON.stringify(req.payload))._id)) {
            risp = { "ris": "autore" };
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(risp));
        }
        else {
            utenti.aggregate([
                {
                    $match:
                    {
                        "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id),
                        $or: [
                            { $expr: { $in: [parseInt(req.body.idCorso), "$moduli.codModulo"] } },
                            { $expr: { $in: [parseInt(req.body.idCorso), "$moduliGruppi.codModulo"] } }
                        ]
                    }
                }
            ]).exec().then(results => {
                if (results.length == 0)
                    risp = { "ris": "noAutNoIsc" };
                else
                    risp = { "ris": "iscritto" };

                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(risp));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/iscriviUtenteCorso", function (req, res) {
    utenti.findOne({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id) }).select("moduli moduliGruppi").exec().then(result => {
        let add = true;
        result.moduli.forEach(modulo => {
            if (modulo.codModulo == parseInt(req.body.idCorso))
                add = false;
        });

        if (add) {
            result.moduliGruppi.forEach(modulo => {
                if (modulo.codModulo == parseInt(req.body.idCorso))
                    add = false;
            });

            if (add) {
                let now = new Date().toISOString();
                utenti.updateOne({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id), dataFine: null }, { $push: { moduli: { codModulo: parseInt(req.body.idCorso), dataInizio: now, scadenza: null, dataFine: null } } })
                    .exec()
                    .then(results => {
                        //console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    })
                    .catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
            }
            else {
                error(req, res, null, JSON.stringify(new ERRORS.USER_ALREADY_IN_COURSE({})));
            }
        }
        else {
            error(req, res, null, JSON.stringify(new ERRORS.USER_ALREADY_IN_COURSE({})));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/elGruppiIscrivibiliCorso", function (req, res) {
    gruppi.aggregate([
        { $match: { $expr: { $eq: ["$codAutore", parseInt(JSON.parse(JSON.stringify(req.payload))._id)] } } },
        {
            $lookup:
            {
                from: utenti.collection.name,
                localField: "codAutore",
                foreignField: "_id",
                as: "gruppiAutore"
            }
        },
        {
            $project:
            {
                _id: 1,
                "gruppiAutore.moduliGruppi": 1
            }
        }
    ]).exec().then(results => {
        let codModulo = parseInt(req.body.idCorso);
        let gruppiIscritti = [];
        results.forEach(gruppo => {
            if (gruppo.gruppiAutore[0].moduliGruppi.length > 0) {
                gruppo.gruppiAutore[0].moduliGruppi.forEach(modGr => {
                    if (modGr.codModulo == codModulo && (modGr.dataFine == null || modGr.dataFine == undefined))
                        gruppiIscritti.push(modGr.codGruppo);
                });
            }
        });
        console.log(gruppiIscritti);

        gruppi.find({ _id: { $nin: gruppiIscritti }, codAutore: parseInt(JSON.parse(JSON.stringify(req.payload))._id) }).select("nome").exec().then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/iscriviGruppoCorso", function (req, res) {
    let now = new Date().toISOString();
    utenti.updateMany({ "gruppo.codGruppo": parseInt(req.body.idGruppo), "gruppo.dataFine": null }, { $push: { moduliGruppi: { codGruppo: parseInt(req.body.idGruppo), codModulo: parseInt(req.body.idCorso), dataInizio: now, dataFine: null, scadenza: null } } })
        .exec()
        .then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        })
        .catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
});

app.post("/api/elSimpleMaterie", function (req, res) {
    //HO TOLTO IL SELECT select("descrizione")
    materie.find({"validita" : "true"}).exec().then(results => {
        //console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/modificaCorso", function (req, res) {
    moduli.updateOne({ _id: parseInt(req.body.idCorso) }, { $set: { descrizione: req.body.nome, /*descrizione: req.body.descrizione,*/ codTipoModulo: parseInt(req.body.tipoCorso), codMateria: parseInt(req.body.materia) } })
        .exec()
        .then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        })
        .catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
});

app.post("/api/removeArgCorso", function (req, res) {
    let now = new Date().toISOString();
    moduli.updateOne({ _id: parseInt(req.body.idCorso) }, { $pull: { "argomenti": { codArgomento: parseInt(req.body.idArgomento) } } })
        .exec()
        .then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        })
        .catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
});

app.post("/api/removeLezCorso", function (req, res) {
    let now = new Date().toISOString();
    moduli.updateOne({ _id: parseInt(req.body.idCorso) }, { $pull: { "lezioni": { codLezione: parseInt(req.body.idLezione) } } })
        .exec()
        .then(results => {
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        })
        .catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
});

app.post("/api/cercaArgAggiuntaCorso", function (req, res) {
    argomenti.find({ descrizione: new RegExp(req.body.valore, "i"), validita : "true" }).select("_id descrizione").exec().then(results => {
        //console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/insNuovoArgCorso", function (req, res) {
    moduli.findOne({ _id: parseInt(req.body.idCorso) }).exec().then(result => {
        let add = true;
        result.argomenti.forEach(argomento => {
            if (add && argomento.codArgomento == parseInt(req.body.idArg))
                add = false;
        });
        console.log("Aggiunta: " + add);

        if (add) {
            moduli.updateOne({ _id: parseInt(req.body.idCorso) }, { $push: { argomenti: { codArgomento: parseInt(req.body.idArg) } } })
                .exec()
                .then(results => {
                    //console.log(results);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results));
                })
                .catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
        }
        else {
            error(req, res, null, JSON.stringify(new ERRORS.ARG_ALREADY_IN_COURSE({})));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/cercaLezAggiuntaCorso", function (req, res) {
    lezioni.find({ titolo: new RegExp(req.body.valore, "i"), dataScadenza: { $exists: false }, validita: "true" }).select("_id titolo").exec().then(results => {
        //console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/insNuovaLezCorso", function (req, res) {
    moduli.findOne({ _id: parseInt(req.body.idCorso) }).exec().then(result => {
        let add = true;
        result.lezioni.forEach(lezione => {
            if (add && lezione.codLezione == parseInt(req.body.idLez))
                add = false;
        });
        console.log("Aggiunta: " + add);

        if (add) {
            let now = new Date().toISOString();
            moduli.updateOne({ _id: parseInt(req.body.idCorso) }, { $push: { lezioni: { codLezione: parseInt(req.body.idLez), dataAggiunta: now } } })
                .exec()
                .then(results => {
                    //console.log(results);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results));
                })
                .catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
        }
        else {
            error(req, res, null, JSON.stringify(new ERRORS.LEZ_ALREADY_IN_COURSE({})));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/rimuoviCorso", function (req, res) {
    moduli.updateOne({ _id: parseInt(req.body.idCorso) }, { $set: { validita: "false" } }).exec().then(results => {
        //console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/aggiungiCorso", function (req, res) {
    if (req.body.descrizione != "") {
        if (req.body.tipoCorso != "") {
            if (req.body.materia != "") {
                if (req.body.argomenti.length > 0) {
                    moduli.count({ $and: [{ "descrizione": req.body.descrizione }, { "codMateria": parseInt(req.body.materia) }, { "codTipoModulo": parseInt(req.body.tipoCorso) }] }).exec().then(nCorsi => {
                        if (nCorsi == 0) {
                            moduliTemp.count({ $and: [{ "descrizione": req.body.descrizione }, { "codMateria": parseInt(req.body.materia) }, { "codTipoModulo": parseInt(req.body.tipoCorso) }] }).exec().then(nCorsi => {
                                if (nCorsi == 0) {
                                    moduliTemp.find({}).sort({ _id: 1 }).exec().then(results => {
                                        let vet = JSON.parse(JSON.stringify(results));
                                        let vetArgomenti = new Array();
                                        for (let i = 0; i < req.body.argomenti.length; i++) {
                                            vetArgomenti[i] = { "codArgomento": parseInt(req.body.argomenti[i]) };
                                        }

                                        const aggCorso = new moduliTemp({
                                            _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                            descrizione: req.body.descrizione,
                                            dataCreazione: new Date(),
                                            codTipoModulo: parseInt(req.body.tipoCorso),
                                            codMateria: parseInt(req.body.materia),
                                            codAutore: parseInt(JSON.parse(JSON.stringify(req.payload))._id),
                                            argomenti: vetArgomenti,
                                            argomentiDaApprovare: vetArgomenti
                                        });
                                        aggCorso.save().then(results => { res.send(JSON.stringify("aggCorsoOk")); }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                                    }).catch(err => {
                                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                    });
                                } else {
                                    error(req, res, null, JSON.stringify(new ERRORS.EXISTING_COURSE({})));
                                }
                            }).catch(err => {
                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                            });
                        } else {
                            error(req, res, null, JSON.stringify(new ERRORS.EXISTING_COURSE({})));
                        }
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});
//#endregion

//#region GRUPPI
app.post("/api/elTipiGruppi", function (req, res) {
    tipiGruppi.find().select("_id descrizione").exec().then(results => {
        console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/cercaGruppo", function (req, res) {
    let filtri = req.body.filtri;
    if (filtri.gruppiDaCercare == "all") { // controllo se i gruppi da cercare sono tutti o solo quelli dell'utente
        if (filtri.tipoGruppo != "") { // controllo se è stato specificato un tipo di gruppo
            gruppi.aggregate([
                { $match: { nome: new RegExp(req.body.valore, "i") } },
                { $match: { tipoGruppo: parseInt(filtri.tipoGruppo) } },
                {
                    $lookup:
                    {
                        from: tipiGruppi.collection.name,
                        localField: "tipoGruppo",
                        foreignField: "_id",
                        as: "descTipoGruppo"
                    }
                }
            ]).exec().then(results => {
                //console.log(results);
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else {
            gruppi.aggregate([
                { $match: { nome: new RegExp(req.body.valore, "i") } },
                {
                    $lookup:
                    {
                        from: tipiGruppi.collection.name,
                        localField: "tipoGruppo",
                        foreignField: "_id",
                        as: "descTipoGruppo"
                    }
                }
            ]).exec().then(results => {
                //console.log(results);
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
    }
    else {
        // qui sono nel ramo in cui i gruppi richiesti sono quelli dell'utente
        if (filtri.tipoGruppo == "") { // controllo se il tipo di gruppo è stato specificato o no
            utenti.aggregate([
                { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
                {
                    $lookup:
                    {
                        from: gruppi.collection.name,
                        localField: "gruppo.codGruppo",
                        foreignField: "_id",
                        as: "gruppiTrovati"
                    }
                }
            ]).exec().then(results => {
                if (results[0].gruppiTrovati.length > 0) {
                    let idGrp = [];
                    results[0].gruppiTrovati.forEach(gruppo => {
                        idGrp.push(gruppo._id);
                    });

                    gruppi.aggregate([
                        { $match: { nome: new RegExp(req.body.valore, "i") } },
                        { $match: { $expr: { $in: ["$_id", idGrp] } } },
                        {
                            $lookup:
                            {
                                from: tipiGruppi.collection.name,
                                localField: "tipoGruppo",
                                foreignField: "_id",
                                as: "descTipoGruppo"
                            }
                        }
                    ]).exec().then(results => {
                        //console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
                else {
                    // console.log(results[0].gruppiTrovati);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results[0].gruppiTrovati));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else {
            // qui sono nel ramo in cui sono stati richiesti i gruppi dell'utente di un determinato tipo di gruppo
            let tipoGruppo = parseInt(filtri.tipoGruppo);
            utenti.aggregate([
                { $match: { "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) } },
                {
                    $lookup:
                    {
                        from: gruppi.collection.name,
                        "let": { "gruppi": "$gruppo.codGruppo" },
                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$gruppi"] } } },
                            { "$match": { "$expr": { "$eq": ["$tipoGruppo", tipoGruppo] } } }
                        ],
                        as: "gruppiTrovati"
                    }
                }
            ]).exec().then(results => {
                if (results[0].gruppiTrovati.length > 0) {
                    let idGrp = [];
                    results[0].gruppiTrovati.forEach(gruppo => {
                        idGrp.push(gruppo._id);
                    });

                    gruppi.aggregate([
                        { $match: { nome: new RegExp(req.body.valore, "i") } },
                        { $match: { $expr: { $in: ["$_id", idGrp] } } },
                        {
                            $lookup:
                            {
                                from: tipiGruppi.collection.name,
                                localField: "tipoGruppo",
                                foreignField: "_id",
                                as: "descTipoGruppo"
                            }
                        }
                    ]).exec().then(results => {
                        //console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
                else {
                    // console.log(results[0].gruppiTrovati);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results[0].gruppiTrovati));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
    }
});

app.post("/api/datiGruppoById", function (req, res) {
    gruppi.aggregate([
        { $match: { "_id": parseInt(req.body.idGruppo) } },
        {
            $lookup:
            {
                from: utenti.collection.name,
                "let": { "gruppo": "$_id" },
                "pipeline": [
                    { "$unwind" : "$gruppo" },
                    { "$match": { "$expr": { "$and": [{ "$eq": ["$$gruppo", "$gruppo.codGruppo"] }, { "$eq": [null, "$gruppo.dataFine"] }] } } }
					],
                as: "componenti"
            }
        },
        {
            $lookup:
            {
                from: utenti.collection.name,
                localField: "codAutore",
                foreignField: "_id",
                as: "autore"
            }
        },
        {
            $lookup: {
                from: tipiGruppi.collection.name,
                localField: "tipoGruppo",
                foreignField: "_id",
                as: "descTipoGruppo"
            }
        }
    ]).exec().then(result => {
        //console.log(result);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/chkModGruppo", function (req, res) {
    gruppi.findById(parseInt(req.body.idGruppo)).exec().then(result => {
        let risp = {};
        if (result.codAutore == parseInt(JSON.parse(JSON.stringify(req.payload))._id)) {
            risp = { "ris": "autore" };
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(risp));
        }
        else {
            utenti.aggregate([
                {
                    $match:
                    {
                        "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id),
                        $expr: { $in: [parseInt(req.body.idGruppo), "$gruppo.codGruppo"] }
                    }
                }
            ]).exec().then(results => {
                if (results.length == 0)
                    risp = { "ris": "noAutNoComp" };
                else
                    risp = { "ris": "componente" };
				
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(risp));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/cercaUtenteAggiuntaGruppo", function (req, res) {
    utenti.find(
        {
            $or: [
                { nome: new RegExp(req.body.valore, "i") },
                { cognome: new RegExp(req.body.valore, "i") },
                { user: new RegExp(req.body.valore, "i") }
            ]
        }
    ).select("_id cognome nome user gruppo").exec().then(results => {
        //console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/insNuovoMembroGruppo", function (req, res) {
    utenti.findOne({ _id : parseInt(req.body.idUtente) }).exec().then(result => {
        let add = true;
        result.gruppo.forEach(gruppo => {
            if(add && gruppo.codGruppo == parseInt(req.body.idGruppo))
                if(gruppo.dataFine == null)
                    add = false;
        });
        console.log("Aggiunta: " + add);

        if(add){
            let now = new Date().toISOString();
            utenti.updateOne({ _id: parseInt(req.body.idUtente) }, { $push: { gruppo: { codGruppo: parseInt(req.body.idGruppo), dataInizio : now , dataFine : null} } })
                .exec()
                .then(results => {
                    //console.log(results);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results));
                })
                .catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
        }
        else {
            error(req, res, null, JSON.stringify(new ERRORS.USER_ALREADY_IN_GROUP({})));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/modificaGruppo", function (req, res) {
    gruppi.updateOne({ _id: parseInt(req.body.idGruppo) }, { $set: { nome: req.body.nome, descrizione : req.body.descrizione, tipoGruppo: parseInt(req.body.tipoGruppo) }})
        .exec()
        .then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        })
        .catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
});

app.post("/api/elComponentiGruppo", function (req, res) {
    utenti.find(
        { "gruppo.codGruppo" : parseInt(req.body.idGruppo), "gruppo.dataFine" : null }
    ).exec().then(results => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/removeMembroGruppo", function (req, res) {
    if (parseInt(JSON.parse(JSON.stringify(req.payload))._id) == parseInt(req.body.idUtente)){
        error(req, res, null, JSON.stringify(new ERRORS.AUTH_NOT_REMOVED({})));
    }
    else{
        let now = new Date().toISOString();
        utenti.updateOne({ _id: parseInt(req.body.idUtente), "gruppo.codGruppo" : parseInt(req.body.idGruppo), "gruppo.dataFine" : null }, { $set: { "gruppo.$.dataFine" : now }})
            .exec()
            .then(results => {
                //console.log(results);
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            })
            .catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            }); 
    }
});

app.post("/api/rimuoviGruppo", function (req, res) {
    gruppi.findOneAndRemove({ _id: parseInt(req.body.idGruppo) }, (err, response) => {
        utenti.updateMany({}, { $pull: {
            "gruppo": { codGruppo: parseInt(req.body.idGruppo) },
            "esamiGruppi": { codGruppo: parseInt(req.body.idGruppo) },
            "moduliGruppi": { codGruppo: parseInt(req.body.idGruppo) }
        } }).exec().then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    }).exec().catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/aggiungiGruppo", function (req, res) {
    if (req.body.nome != "") {
        if (req.body.descrizione != "") {
            if (req.body.tipoGruppo != "") {
                gruppi.count({ $and: [{ "nome": req.body.nome }, { "descrizione": req.body.descrizione }, { "tipoGruppo": parseInt(req.body.tipoGruppo) }] }).exec().then(nGruppi => {
                    if (nGruppi == 0) {
                        gruppi.find({}).sort({ _id: 1 }).exec().then(results => {
                            let vet = JSON.parse(JSON.stringify(results));
                            const aggGruppo = new gruppi({
                                _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                nome: req.body.nome,
                                descrizione: req.body.descrizione,
                                tipoGruppo: parseInt(req.body.tipoGruppo),
                                codAutore: parseInt(JSON.parse(JSON.stringify(req.payload))._id)
                            });
                            aggGruppo.save().then(results => { res.send(JSON.stringify("aggGruppoOk")); }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                        }).catch(err => {
                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                        });
                    } else {
                        error(req, res, null, JSON.stringify(new ERRORS.EXISTING_GROUP({})));
                    }
                }).catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});
//#endregion

//#region APPUNTI
app.post("/api/ricercaAppunti", function (req, res) {
    let campo = "";

    if (req.body.tipo != "") {
        if (req.body.tipo.toUpperCase() == "DESCRIZIONE") {
            appunti.aggregate([
                { $match: { "descrizione": new RegExp(req.body.par, "i"), "validita" : "true" } },
                {
                    $lookup:
                    {
                        from: argomenti.collection.name,
                        "let": { "argomenti": "$argomenti.codArgomento" },
                        "pipeline": [
                            { "$match": { "$expr": { "$in": ["$_id", "$$argomenti"] } } }
                        ],
                        as: "detArgomenti"
                    }
                }
            ]).exec().then(results => {
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        } else if (req.body.tipo.toUpperCase() == "ARGOMENTO") {
            console.log(req.body.par);
            let aus = new RegExp(req.body.par, "i");
            appunti.aggregate([{ $match: { "validita" : "true" } },
            {
                $lookup:
                {
                    from: argomenti.collection.name,
                    "let": { "argomenti": "$argomenti.codArgomento" },
                    "pipeline": [
                        {
                            "$match": {
                                "descrizione": aus,
                                "$expr": { "$in": ["$_id", "$$argomenti"] }
                            }
                        }
                    ],
                    as: "detArgomenti"
                }
            }
            ]).exec().then(results => {
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else {
            error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
        }
    }else{
        gestErrorePar(req, res);
    }
    
});

app.post("/api/elencoArgomenti", function (req, res) {
    argomenti.find({validita:"true"}).exec().then(results => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    }); 
});

app.post("/api/aggiungiAppunti", uploadAllegati.array("allegati"), function (req, res) {
    if (req.body.descrizione != "") {
        if (req.body.nome != "") {
            if (req.body.cognome != "") {
                if (req.body.argomenti.length > 0) {
                    if (req.files.length > 0 || req.body.allegatiPresenti.length > 0) {
                        appunti.count({ $and: [{ "descrizione": req.body.descrizione }, { "nomeAutore": req.body.nome }, { "cognomeAutore": req.body.cognome }] }).exec().then(nAppunti =>{
                            if (nAppunti == 0) {
                                appuntiTemp.count({ $and: [{ "descrizione": req.body.descrizione }, { "nomeAutore": req.body.nome }, { "cognomeAutore": req.body.cognome }] }).exec().then(nAppuntiTemp=>{
                                    if (nAppuntiTemp == 0) {
                                        appuntiTemp.find({}).sort({ _id: 1 }).exec().then(results => {
                                            let vet = JSON.parse(JSON.stringify(results));
                                            let vetArgomenti = new Array();
                                            let vetAus = req.body.argomenti.split(',');
                                            let id = 0;
                                            if (vet.length > 0)
                                                id = parseInt(vet[vet.length - 1]["_id"]) + 1;
                                            for (let i = 0; i < vetAus.length; i++) {
                                                vetArgomenti[i] = { "codArgomento": parseInt(vetAus[i]), "dataAggiunta": new Date() };
                                            }
                                            addAllegato("Allegato associato all' appunto: " + req.body.descrizione, req, res).then(vetAllegati => {
                                                const aggAppunto = new appuntiTemp({
                                                    _id: id,
                                                    descrizione: req.body.descrizione,
                                                    dataCaricamento: new Date(),
                                                    nomeAutore: req.body.nome,
                                                    cognomeAutore: req.body.cognome,
                                                    codUtente: parseInt(JSON.parse(JSON.stringify(req.payload))._id),
                                                    argomenti: vetArgomenti,
                                                    argomentiDaApprovare: vetArgomenti,
                                                    allegati: vetAllegati
                                                });
                                                aggAppunto.save().then(results => { res.send(JSON.stringify("aggAppuntoOk")); }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                                            });
                                        }).catch(err => {
                                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                        });
                                    } else {
                                        error(req, res, null, JSON.stringify(new ERRORS.EXISTING_NOTE({})));
                                    }
                                }).catch(err=>{
                                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                });
                            }else{
                                error(req, res, null, JSON.stringify(new ERRORS.EXISTING_NOTE({})));
                            } 
                        }).catch(err => {
                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                        });
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    }else{
        gestErrorePar(req, res);
    }
});

function addAllegato(desc, req,res) {
    return new Promise((resolve, reject) =>{
        let vetAllegati = new Array();
        let vetCodici = new Array();
        let id, vet;
        allegati.find({}).sort({ _id: 1 }).exec().then(results => {
            console.log(req.files.length);
            for (let i = 0; i < req.files.length; i++) {
                if (results.length > 0) {
                    vet = JSON.parse(JSON.stringify(results));
                    id = parseInt(vet[vet.length - 1]["_id"]) + (i + 1);
                } else {
                    id = 1;
                }
                vetCodici[i] = { "codAllegato": id };
                vetAllegati[i] = new allegati({
                    _id: id,
                    descrizione: desc,
                    codUtente: parseInt(JSON.parse(JSON.stringify(req.payload))._id),
                    dataCaricamento: new Date(),
                    percorso: req.files[i].path
                });
            }

            if (req.body.allegatiPresenti != "null") {
                for (let k = 0; k < req.body.allegatiPresenti.split(',').length; k++) {
                    vetCodici.push({ "codAllegato": parseInt(req.body.allegatiPresenti.split(',')[k]) });
                }
            }
            
            allegati.insertMany(vetAllegati).then(results => { resolve(vetCodici) }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    });
}

app.post("/api/datiAppuntoById", function (req, res) {
    appunti.aggregate([
        { $match: { "_id": parseInt(req.body.idAppunto), "validita" : "true" } },
        {
            $lookup:
            {
                from: utenti.collection.name,
                localField: "codUtente",
                foreignField: "_id",
                as: "autoreCaricamento"
            }
        },
        {
            $lookup:
            {
                "from": argomenti.collection.name,
                "let": { "argomenti": "$argomenti.codArgomento" },
                "pipeline": [
                    {"$match": { "$expr": { "$in": ["$_id", "$$argomenti"] } }}
                ],
                "as": "detArgomenti"
            }
        },
        {
            $lookup:
            {
                "from": allegati.collection.name,
                "let": { "allegati": "$allegati.codAllegato" },
                "pipeline": [
                    { "$match": { "$expr": { "$in": ["$_id", "$$allegati"] } } }
                ],
                "as": "detAllegati"
            }
        }
    ]).exec().then(result => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/elencoAllegati", function (req, res) {
    allegati.aggregate([{$match:{}}, {
        $lookup: 
        {
            from: utenti.collection.name, 
            localField: "codUtente",
            foreignField: "_id",
            as: "autoreCaricamento"
        }
    }]).exec().then(results => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
    // allegati.find({}).exec().then(results => {
    //     let token = createToken(req.payload);
    //     writeCookie(res, token);
    //     res.writeHead(200, { "Content-Type": "application/json" });
    //     res.end(JSON.stringify(results));
    // }).catch(err => {
    //     error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    // });
});

app.post("/api/modificaAppunto", uploadAllegati.array("newAllegati"),function (req, res) {
    let codQuery = {};
    let aus;
    let i = 0;
    if (req.body.codAppunto != null) {
        if (req.body.descrizione != "") {
            if (req.body.nome != "") {
                if (req.body.cognome != "") {
                    if (req.body.argomentiOk == "true") {
                        if (req.body.allegatiOk == "true") {
                            appunti.count({ $and: [{ "_id": {$ne:parseInt(req.body.codAppunto)}},{ "descrizione": req.body.descrizione }, { "nomeAutore": req.body.nome }, { "cognomeAutore": req.body.cognome }] }).exec().then(nAppunti => {
                                if (nAppunti == 0) {
                                    codQuery["$set"] = {"descrizione":req.body.descrizione, "nomeAutore":req.body.nome, "cognomeAutore":req.body.cognome};
                                    appunti.updateOne({ "_id": parseInt(req.body.codAppunto) }, codQuery).exec().then(results => { 
                                        modificaRicorsiva(req, res, 1);
                                        addAllegato("Allegato associato all' appunto: " + req.body.descrizione, req, res).then(vetAllegati => {
                                            if (vetAllegati.length > 0) {
                                                aus = {};
                                                if (vetAllegati.length > 1) {
                                                    aus["allegati"] = new Array();
                                                    for (i = 0; i < vetAllegati.length; i++) {
                                                        aus["allegati"].push({ "codAllegato": parseInt(vetAllegati[i]) });
                                                    }
                                                } else {
                                                    aus["allegati"] = { "codAllegato": parseInt(vetAllegati[0]) };
                                                }
                                                codQuery["$push"] = aus;
                                                appunti.updateOne({ "_id": parseInt(req.body.codAppunto) }, codQuery).exec().then(results => {
                                                    let token = createToken(req.payload);
                                                    writeCookie(res, token);
                                                    res.writeHead(200, { "Content-Type": "application/json" });
                                                    res.end(JSON.stringify(results));
                                                }).catch(err => {
                                                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                });
                                            }else{
                                                let token = createToken(req.payload);
                                                writeCookie(res, token);
                                                res.writeHead(200, { "Content-Type": "application/json" });
                                                res.end(JSON.stringify(results));
                                            }
                                        });
                                    }).catch(err => { 
                                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); 
                                    });
                                } else {
                                    error(req, res, null, JSON.stringify(new ERRORS.EXISTING_NOTE({})));
                                }
                            }).catch(err => {
                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                            });
                        } else {
                            gestErrorePar(req, res);
                        }
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
    
});

function modificaRicorsiva(req, res, step) {
    if ((req.body.addArgomenti.length > 0) && (step == 1)) {
        gestModAddArgomenti(req, res).then(ris1 => { 
            modificaRicorsiva(req, res, step + 1);
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else if (step == 1){
        modificaRicorsiva(req, res, step + 1);
    }

    if ((req.body.removeArgomenti.length > 0) && (step == 2)) {
        gestModDelArgomenti(req, res).then(ris2 =>{
            modificaRicorsiva(req, res, step + 1);
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else if (step == 2){
        modificaRicorsiva(req, res, step + 1);
    }

    if ((req.body.addAllegati.length > 0) && (step == 3)) {
        gestModAddAllegati(req, res).then(ris2=>{
            modificaRicorsiva(req, res, step + 1);
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else if (step == 3){
        modificaRicorsiva(req, res, step + 1);
    }

    if ((req.body.removeAllegati.length > 0) && (step == 4)) {
        gestModDelAllegati(req, res).then(ris3=>{
            modificaRicorsiva(req, res, step + 1);
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else if (step == 4){
        return 0;
    }
}

function gestModAddArgomenti(req, res) {
    return new Promise((resolve, reject)=>{
        let aus = {}, codQuery = {};
        if (req.body.addArgomenti.length > 1) {
            aus["argomenti"] = new Array();
            let ausVet = req.body.addArgomenti.split(',');
            for (let i = 0; i < ausVet.length; i++) {
                aus["argomenti"].push({ "codArgomento": parseInt(ausVet[i]), "dataAggiunta": new Date() });
            }
        } else {
            aus["argomenti"] = { "codArgomento": parseInt(req.body.addArgomenti[0]), "dataAggiunta": new Date() };
        }
        codQuery["$push"] = aus;
        appunti.updateOne({ "_id": parseInt(req.body.codAppunto) }, codQuery).exec().then(results => { resolve() }).catch(err => { error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
    });
}

function gestModDelArgomenti(req, res) {
    return new Promise((resolve, reject)=>{
        let aus = {}, codQuery = {};
        if (req.body.removeArgomenti.length > 1) {
            aus["argomenti"] = {};
            let vetCond = new Array();
            let ausVet = req.body.removeArgomenti.split(',');
            for (let i = 0; i < ausVet.length; i++) {
                vetCond.push({ "codArgomento": parseInt(ausVet[i]) });
            }
            aus["argomenti"]["$or"] = JSON.parse(JSON.stringify(vetCond));
        } else {
            aus["argomenti"] = { "codArgomento": parseInt(req.body.removeArgomenti[0]) };
        }

        codQuery["$pull"] = aus;
        appunti.updateOne({ "_id": parseInt(req.body.codAppunto) }, codQuery).exec().then(results => { resolve() }).catch(err => { error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
    });
}

function gestModAddAllegati(req, res) {
    return new Promise((resolve, reject)=>{
        let aus = {}, codQuery = {};
        if (req.body.addAllegati.length > 1) {
            aus["allegati"] = new Array();
            let ausVet = req.body.addAllegati.split(',');
            for (let i = 0; i < ausVet.length; i++) {

                aus["allegati"].push({ "codAllegato": parseInt(ausVet[i]) });
            }
        } else {
            aus["allegati"] = { "codAllegato": parseInt(req.body.addAllegati[0]) };
        }
        codQuery["$push"] = aus;
        appunti.updateOne({ "_id": parseInt(req.body.codAppunto) }, codQuery).exec().then(results => { resolve() }).catch(err => { error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
    });
}

function gestModDelAllegati(req, res) {
    return new Promise((resolve, reject) =>{
        let aus = {}, codQuery = {};
        if (req.body.removeAllegati.length > 1) {
            aus["allegati"] = {};
            let vetCond = new Array();
            let ausVet = req.body.removeAllegati.split(',');
            for (let i = 0; i < ausVet.length; i++) {
                vetCond.push({ "codAllegato": parseInt(ausVet[i]) });
            }
            aus["allegati"]["$or"] = JSON.parse(JSON.stringify(vetCond));
        } else {
            aus["allegati"] = { "codAllegato": parseInt(req.body.removeAllegati[0]) };
        }
        codQuery["$pull"] = aus;
        appunti.updateOne({ "_id": parseInt(req.body.codAppunto) }, codQuery).exec().then(results => { resolve() }).catch(err => { error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
    });
}

app.post("/api/removeAppunto", function (req, res) {
    console.log(req.body.codAppunto);
    if (req.body.codAppunto != null) {
        appunti.updateOne({ "_id": parseInt(req.body.codAppunto) }, { $set : {"validita" : "false"}}).exec().then(resRem => {
            lezioni.updateMany({}, { $pull: { "appunti":{"codAppunto": parseInt(req.body.codAppunto) }} }).exec().then(results =>{
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/TTSVoices", function (req, res) {
    textToSpeech.listVoices().then(results=>{
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.TTS_NOT_AVAILABLE({})));
    });
});

app.post("/api/TTS", function (req, res) {
    if (req.body.elencoAllegati.length > 0) {
        if (req.body.voce != "") {
            eseguiTTS(req.body.elencoAllegati, res, req).then(ris => {
                return ris;
            }).then(audio => {
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(audio));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.TTS_ERROR({})));
            });
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});

function eseguiTTS(allegati, res, req) {
    return new Promise((resolve, reject) =>{
        let percorsiAudio = new Array();
        let I = 0;
        allegati.forEach(element => {
            getFilePath(element).then(file => {
                fileContentReader.readFilesHandler(file, res).then(contFile => {
                    const params = {
                        text: contFile,
                        voice: req.body.voce,
                        accept: 'audio/wav'
                    };
                    textToSpeech.synthesize(params).then(response => {
                        const audio = response.result;
                        return textToSpeech.repairWavHeaderStream(audio);
                    }).then(repairedFile => {
                        let percorso = 'static/audio/' + file.name.replace(/\.[^/.]+$/, "") + ".wav"; //Se esiste un file con stesso nome lo sovrascrive
                        fs.writeFileSync(percorso, repairedFile);
                        percorsiAudio.push(percorso);
                        if (I != allegati.length - 1) {
                            I++;
                        } else {
                            resolve(percorsiAudio);
                        }
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.TTS_NOT_AVAILABLE({})));
                    });
                }).catch(errFileReader => {
                    reject(errFileReader);
                });
            }).catch(errFilePath => {
                reject(errFilePath);
            });
        });
    });
    
}

function getFilePath(codFile) {
    return new Promise((resolve, reject) =>{
        allegati.findOne({ "_id": parseInt(codFile) }).exec().then(result => {
            let ret = {};
            //escludere \ da nome file
            ret["path"] = result.percorso;
            ret["name"] = result.percorso.split("\\")[result.percorso.split("\\").length - 1];
            resolve(ret);
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    });
}

app.get("/api/downloadAudioTTS", function (req, res) {
    if (req.query.allegato != undefined) {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.download(req.query.allegato, function (err) {
            if(err)
                error(req, res, err, JSON.stringify(new ERRORS.DOWNLOAD_FAILED({})));
            else
                fs.unlinkSync(req.query.allegato);
        });
    } else {
        gestErrorePar(req, res);
    }
});
//#endregion

//#region ALLEGATI
app.get("/api/downloadAllegato", function (req, res) {
    let ausVet = new Array();
   if (req.query.codAllegato != "") {
       allegati.findOne({ "_id": parseInt(req.query.codAllegato) }).exec().then(result=>{
           // controllo esistenza file
           if (fs.existsSync(result.percorso)) {
               ausVet = result.percorso.split('\\');
               ausVet = ausVet[ausVet.length - 1].split(/_(.+)/);
               let token = createToken(req.payload);
               writeCookie(res, token);
               res.download(result.percorso, ausVet[1]);
           }
           else {
               error(req, res, undefined, JSON.stringify(new ERRORS.DOWNLOAD_ATTACHMENT_ERROR({})));
           }
       }).catch(err => {
           error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
       });
   }else{
       gestErrorePar(req, res);
   }
});
//#endregion

//#region MODIFICA PROFILO
app.post("/api/getDatiProfilo", function (req, res) {
    if (JSON.parse(JSON.stringify(req.payload))._id) {
       utenti.findOne({ "_id": parseInt(req.payload._id) }).select({"_id":0,"nome":1,"cognome":1, "dataNascita":1, "mail":1, "telefono":1, "user":1}).exec().then(result =>{
           let token = createToken(req.payload);
           writeCookie(res, token);
           res.writeHead(200, { "Content-Type": "application/json" });
           res.end(JSON.stringify(result));
       }).catch(err => {
           error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
       })
   } else {
       gestErrorePar(req, res);
   }
});

app.post("/api/modificaProfilo", upload.single("foto"), function (req, res) {
    let objModifica = {};
    let path;

    if (JSON.parse(JSON.stringify(req.payload))._id) {
        if (req.body.nome != "") {
            if (req.body.cognome != "") {
                if (Date.parse(req.body.dataNascita)) {
                    if (chkEtaMinima(new Date(req.body.dataNascita)) >= 2920) {
                        if (validaEmail(req.body.email)) {
                            if (validaTelefono(req.body.telefono)) {
                                if (req.body.username != "") {
                                    if (req.fileValidationError != "fileNonValido") {
                                        utenti.findOne({ "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }).exec().then(result => {
                                            async.series([
                                                function (callback) {
                                                    if (result.mail != req.body.email) {
                                                        utenti.count({ "mail": req.body.email }).exec().then(nUtMail => {
                                                            if (nUtMail != 0)
                                                                callback(JSON.stringify(new ERRORS.EMAIL_USED({})), null);
                                                            else
                                                                callback(null, null);
                                                        }).catch(errMail => {
                                                            callback(JSON.stringify(new ERRORS.QUERY_EXECUTE({})), null);
                                                        });
                                                    } else
                                                        callback(null, null);
                                                },
                                                function (callback) {
                                                    if (result.telefono != req.body.telefono) {
                                                        utenti.count({ "telefono": req.body.telefono }).exec().then(nUtTel => {
                                                            if (nUtTel != 0)
                                                                callback(JSON.stringify(new ERRORS.TELEPHONE_USED({})), null);
                                                            else
                                                                callback(null, null);
                                                        }).catch(errTel => {
                                                            callback(JSON.stringify(new ERRORS.QUERY_EXECUTE({})), null);
                                                        });
                                                    } else
                                                        callback(null, null);
                                                },
                                                function (callback) {
                                                    if (result.user != req.body.username) {
                                                        utenti.count({ "user": req.body.username }).exec().then(nUtUser => {
                                                            if (nUtUser != 0)
                                                                callback(JSON.stringify(new ERRORS.USERNAME_USED({})), null);
                                                            else
                                                                callback(null, null);
                                                        }).catch(errUser => {
                                                            callback(JSON.stringify(new ERRORS.QUERY_EXECUTE({})), null);
                                                        });
                                                    } else
                                                        callback(null, null);
                                                }
                                            ], function (err, data) {
                                                if (!err) {
                                                    objModifica["$set"] = { "nome": req.body.nome, "cognome": req.body.cognome, "dataNascita": req.body.dataNascita, "mail": req.body.email, "telefono": req.body.telefono, "user": req.body.username};
                                                    console.log(req.body.foto);
                                                    if (req.body.foto != "noChange") {
                                                        if (req.file == undefined) {
                                                            path = "static\\images\\default.png";
                                                        } else {
                                                            path = req.file.path;
                                                        }
                                                        objModifica["$set"]["foto"] = path;
                                                    }
                                                    console.log(objModifica);
                                                    utenti.updateOne({ "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }, objModifica).exec().then(result => {
                                                        res.set("Set-Cookie", "token=;max-age=-1;Path=/;httponly=true");
                                                        res.send({ "ris": "modProfiloOk" });
                                                    }).catch(err => {
                                                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                    });
                                                } else {
                                                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                }
                                            });
                                        }).catch(errFindUt => {
                                            error(req, res, errFindUt, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                        });
                                    } else {
                                        error(req, res, null, JSON.stringify(new ERRORS.INVALID_ATTACHMENT_ERROR({})));
                                    }
                                } else {
                                    gestErrorePar(req, res);
                                }
                            } else {
                                gestErrorePar(req, res);
                            }
                        } else {
                            gestErrorePar(req, res);
                        }
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        }
        else {
            gestErrorePar(req, res);
        }
    }else{
        gestErrorePar(req, res);
    }
    
});

function chkEtaMinima(dataNascita) {
    let dataBase = new Date();
    let diffTime = Math.abs(dataBase - dataNascita);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
//#endregion

//#region LEZIONI
app.post("/api/datiLezioneById", function (req, res) {
    lezioni.aggregate([
        { $match: { "_id": parseInt(req.body.idLezione), "validita" : "true" } },
        {
            $lookup:
            {
                from: utenti.collection.name,
                localField: "autore",
                foreignField: "_id",
                as: "dettAutore"
            }
        },
        {
            $lookup: {
                from: appunti.collection.name,
                localField: "appunti.codAppunto",
                foreignField: "_id",
                as: "elencoAppunti"
            }
        }
    ]).exec().then(result => {
        //console.log(result);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/chkModLezione", function (req, res) {
    lezioni.findById(parseInt(req.body.idLez)).exec().then(result => {
        let risp = {};
        if (result.autore == parseInt(JSON.parse(JSON.stringify(req.payload))._id)) {
            risp = { "ris": "autore" };
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(risp));
        }
        else {
            utenti.aggregate([
                {
                    $match:
                    {
                        "_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id),
                        $expr: { $in: [parseInt(req.body.idLez), "$lezioni.codLez"] }
                    }
                }
            ]).exec().then(results => {
                if (results.length == 0)
                    risp = { "ris": "noAutNoIsc" };
                else
                    risp = { "ris": "iscritto" };

                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(risp));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/partecipaLezione", function (req, res) {
    utenti.findOne({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id) }).select("lezioni").exec().then(result => {
        let add = true;
        result.lezioni.forEach(lezione => {
            if (lezione.codLez == parseInt(req.body.idLez))
                add = false;
        });

        if (add) {
            lezioni.findById(parseInt(req.body.idLez)).exec().then(result => {
                let now = new Date().toISOString();
                utenti.updateOne({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id) }, {
                    $push:
                    {
                        lezioni: {
                            codLez: parseInt(req.body.idLez),
                            dataInizio: now,
                            dataFine: result.dataScadenza
                        }
                    }
                }).exec().then(results => {
                    //console.log(results);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results));
                })
                    .catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else {
            error(req, res, null, JSON.stringify(new ERRORS.USER_ALREADY_IN_LESSON({})));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/cercaAppuntoAggiuntaLez", function (req, res) {
    appunti.find({ descrizione: new RegExp(req.body.valore, "i"), "validita" : "true" }).select("_id descrizione nomeAutore cognomeAutore").exec().then(results => {
        //console.log(results);
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/insNuovoAppuntoLez", function (req, res) {
    lezioni.findOne({ _id: parseInt(req.body.idLez) }).exec().then(result => {
        let add = true;
        result.appunti.forEach(appunto => {
            if (add && appunto.codAppunto == parseInt(req.body.idAppunto))
                add = false;
        });
        console.log("Aggiunta: " + add);

        if (add) {
            let now = new Date().toISOString();
            appunti.findById(parseInt(req.body.idAppunto)).exec().then(result => {
                lezioni.updateOne({ _id: parseInt(req.body.idLez) }, { $push: { appunti: { codAppunto: result._id, codUtente: result.autore, dataAggiunta: now } } })
                    .exec()
                    .then(results => {
                        //console.log(results);
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify(results));
                    })
                    .catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else {
            error(req, res, null, JSON.stringify(new ERRORS.APP_ALREADY_IN_LESSON({})));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/modificaLezione", function (req, res) {
    let dataScad;
    if (req.body.dataScadenza == "")
        dataScad = null;
    else
        dataScad = new Date(req.body.dataScadenza).toISOString();

    lezioni.updateOne({ _id: parseInt(req.body.idLez) }, { $set: { titolo: req.body.titolo, dataScadenza: dataScad } })
        .exec()
        .then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        })
        .catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
});

app.post("/api/elAppuntiLez", function (req, res) {
    lezioni.aggregate([
        { $match: { "_id": parseInt(req.body.idLezione) } },
        {
            $lookup: {
                from: appunti.collection.name,
                localField: "appunti.codAppunto",
                foreignField: "_id",
                as: "elencoAppunti"
            }
        }
    ]).exec().then(results => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/removeAppuntoLez", function (req, res) {
    let now = new Date().toISOString();
    lezioni.updateOne({ _id: parseInt(req.body.idLez) }, { $pull: { "appunti": { codAppunto: parseInt(req.body.idAppunto) } } })
        .exec()
        .then(results => {
            //console.log(results);
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        })
        .catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
});

app.post("/api/rimuoviLezione", function (req, res) {
    lezioni.updateOne({ _id: parseInt(req.body.idLez) }, { $set : {"validita" : "false"}}).exec().then(result => { // controllare
        utenti.updateMany({}, {
            $pull: {
                "lezioni": { codLezione: parseInt(req.body.idLez) }
            }
        }).exec().then(results => {
            //console.log(results);
            if (results.ok == 1) {
                moduli.updateMany({}, {
                    $pull: {
                        "lezioni": { codLezione: parseInt(req.body.idLez) }
                    }
                }).exec().then(results => {
                    //console.log(results);
                    let token = createToken(req.payload);
                    writeCookie(res, token);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(results));
                }).catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            }
            else {
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});
//#endregion

//#region ESAMI
app.post("/api/esamiCorso", function (req, res) {
    esami.find({codModulo : parseInt(req.body.idCorso), validita : true}).exec().then(results => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/chkSvolgimentoEsame", function (req, res) {
    utenti.find({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id), $or: [{ "esami.codEsame": parseInt(req.body.idEsame) }, { "esamiGruppi.codEsame": parseInt(req.body.idEsame) }] }).select("esami esamiGruppi").exec().then(result => {
        let risEsami = new Array();
        if (result.length > 0){
            for (let i = 0; i < result[0].esami.length; i++){
                if(result[0].esami[i].codEsame == parseInt(req.body.idEsame)){
                    risEsami.push(result[0].esami[i]);
                }
            }

            for (let i = 0; i < result[0].esamiGruppi.length; i++) {
                if (result[0].esamiGruppi[i].codEsame == parseInt(req.body.idEsame)) {
                    risEsami.push(result[0].esamiGruppi[i]);
                }
            }

            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(risEsami));
        }
        else{
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify("nonDato"));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/aggiungiEsame", function (req, res) {
    if (req.body.idCorso != "") {
        if (req.body.descrizione != "") {
            if (req.body.durata != "") {
                if (req.body.dataScadenza != "") {
                    if(req.body.maxVoto != ""){
                        if (req.body.minVoto != "") {
                            if (req.body.domande.length > 0) {
                                esami.count({ $and: [{ "descrizione": req.body.descrizione }, { "dataScadenza": new Date(req.body.dataScadenza) }, { "codModulo": parseInt(req.body.idCorso) }] }).exec().then(nEsami => {
                                    if (nEsami == 0) {
                                        let dur = (parseInt(req.body.durata.split(':')[0]) * 3600) + (parseInt(req.body.durata.split(':')[1]) * 60);
                                        let elDomande = new Array();
                                        for(let i = 0; i < req.body.domande.length; i++){
                                            let dati = req.body.domande[i].split(';');
                                            let dom, risp, r;
                                            switch(dati[0]){
                                                case "trueFalse":
                                                    dom = new Object();
                                                    dom.testo = dati[1];
                                                    dom.tipoDomanda = dati[0];
                                                    dom.punteggio = dati[2];
        
                                                    risp = new Array();
                                                    r = new Object();
                                                    r.testo = "Vero";
                                                    r.corretta = (dati[3] == "Vero" ? true : false);
                                                    risp.push(r);
        
                                                    r = new Object();
                                                    r.testo = "Falso";
                                                    r.corretta = (dati[3] == "Falso" ? true : false);
                                                    risp.push(r);
        
                                                    dom.risposte = risp;
                                                    elDomande.push(dom);
                                                    break;
        
                                                case "multi":
                                                    dom = new Object();
                                                    dom.testo = dati[1];
                                                    dom.tipoDomanda = dati[0];
                                                    dom.punteggio = dati[2];
        
                                                    risp = new Array();
                                                    let risposte = dati[3].split('-')[0].trim(' ').split(',');
                                                    let rispGiuste = dati[3].split('-')[1].trim(' ').split(':')[1].trim(' ').split(',');
        
                                                    for(let k = 0; k < risposte.length; k++){
                                                        r = new Object();
                                                        r.testo = risposte[k];
                                                        for(let j = 0; j < rispGiuste.length; j++){
                                                            if(k+1 == parseInt(rispGiuste[j])){
                                                                r.corretta = true;
                                                                break;
                                                            }
                                                            else
                                                                r.corretta = false;
                                                        }
                                                        risp.push(r);
                                                    }
        
                                                    dom.risposte = risp;
                                                    elDomande.push(dom);
                                                    break;
        
                                                case "open": // da controllare ??!?!?!
                                                    dom = new Object();
                                                    dom.testo = dati[1];
                                                    dom.tipoDomanda = dati[0];
                                                    dom.punteggio = dati[2];
        
                                                    risp = new Array();
                                                    r = new Object();
                                                    r.testo = dati[3];
                                                    r.corretta = true;
                                                    risp.push(r);
        
                                                    dom.risposte = risp;
                                                    elDomande.push(dom);
                                                    break;
        
                                                case "close":
                                                    dom = new Object();
                                                    dom.testo = dati[1];
                                                    dom.tipoDomanda = dati[0];
                                                    dom.punteggio = dati[2];
        
                                                    risp = new Array();
                                                    r = new Object();
                                                    r.testo = dati[3];
                                                    r.corretta = true;
                                                    risp.push(r);
        
                                                    dom.risposte = risp;
                                                    elDomande.push(dom);
                                                    break;
                                            }
                                        }
                                        
                                        esami.find({}).sort({ _id: 1 }).exec().then(results => {
                                            let vet = JSON.parse(JSON.stringify(results));
                                            const aggEsame = new esami({
                                                _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                                descrizione: req.body.descrizione,
                                                dataCreazione: new Date(),
                                                dataScadenza: new Date(req.body.dataScadenza),
                                                durata: dur,
                                                numDomande: parseInt(req.body.domande.length),
                                                codModulo: parseInt(req.body.idCorso),
                                                codUtente: parseInt(JSON.parse(JSON.stringify(req.payload))._id),
                                                maxVoto: parseFloat(req.body.maxVoto),
                                                minVoto: parseFloat(req.body.minVoto),
                                                domande : elDomande
                                            });
                                            aggEsame.save().then(results => { res.send(JSON.stringify("aggEsameOk")); }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                                        }).catch(err => {
                                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                        });
                                    } else {
                                        error(req, res, null, JSON.stringify(new ERRORS.EXISTING_EXAM({})));
                                    }
                                }).catch(err => {
                                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                });
                            } else {
                                gestErrorePar(req, res);
                            }
                        } else {
                            gestErrorePar(req, res);
                        }
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/datiEsameById", function (req, res) {
    let par = {};
    if(req.body.idCorso != undefined)
        par = { _id: parseInt(req.body.idEsame), codModulo: parseInt(req.body.idCorso), validita: true };
    else
        par = { _id: parseInt(req.body.idEsame), validita: true };

    esami.count(par).exec().then(nEsami => {
        if(nEsami > 0){
            esami.findById(parseInt(req.body.idEsame)).exec().then(result => {
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(result));
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }
        else{
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify("esameNonValido"));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/modificaEsame", function (req, res) {
    if (req.body.idEsame != "") {
        if (req.body.idCorso != "") {
            if (req.body.descrizione != "") {
                if (req.body.durata != "") {
                    if (req.body.dataScadenza != "") {
                        if(req.body.maxVoto != ""){
                            if(req.body.minVoto != ""){
                                if (req.body.domande.length > 0) {
                                    esami.find({$and: [{ "descrizione": req.body.descrizione }, { "dataScadenza": new Date(req.body.dataScadenza) }, { "codModulo": parseInt(req.body.idCorso) }] }).exec().then(result => {
                                        if (result[0]._id == parseInt(req.body.idEsame)) {
                                            let dur = (parseInt(req.body.durata.split(':')[0]) * 3600) + (parseInt(req.body.durata.split(':')[1]) * 60);
                                            let elDomande = new Array();
                                            for (let i = 0; i < req.body.domande.length; i++) {
                                                let dati = req.body.domande[i].split(';');
                                                let dom, risp, r;
                                                switch (dati[0]) {
                                                    case "trueFalse":
                                                        dom = new Object();
                                                        dom.testo = dati[1];
                                                        dom.tipoDomanda = dati[0];
                                                        dom.punteggio = dati[2];
        
                                                        risp = new Array();
                                                        r = new Object();
                                                        r.testo = "Vero";
                                                        r.corretta = (dati[3] == "Vero" ? true : false);
                                                        risp.push(r);
        
                                                        r = new Object();
                                                        r.testo = "Falso";
                                                        r.corretta = (dati[3] == "Falso" ? true : false);
                                                        risp.push(r);
        
                                                        dom.risposte = risp;
                                                        elDomande.push(dom);
                                                        break;
        
                                                    case "multi":
                                                        dom = new Object();
                                                        dom.testo = dati[1];
                                                        dom.tipoDomanda = dati[0];
                                                        dom.punteggio = dati[2];
        
                                                        risp = new Array();
                                                        let risposte = dati[3].split('-')[0].trim(' ').split(',');
                                                        let rispGiuste = dati[3].split('-')[1].trim(' ').split(':')[1].trim(' ').split(',');
        
                                                        for (let k = 0; k < risposte.length; k++) {
                                                            r = new Object();
                                                            r.testo = risposte[k];
                                                            for (let j = 0; j < rispGiuste.length; j++) {
                                                                if (k + 1 == parseInt(rispGiuste[j])) {
                                                                    r.corretta = true;
                                                                    break;
                                                                }
                                                                else
                                                                    r.corretta = false;
                                                            }
                                                            risp.push(r);
                                                        }
        
                                                        dom.risposte = risp;
                                                        elDomande.push(dom);
                                                        break;
        
                                                    case "open": // da controllare ??!?!?!
                                                        dom = new Object();
                                                        dom.testo = dati[1];
                                                        dom.tipoDomanda = dati[0];
                                                        dom.punteggio = dati[2];
        
                                                        risp = new Array();
                                                        r = new Object();
                                                        r.testo = dati[3];
                                                        r.corretta = true;
                                                        risp.push(r);
        
                                                        dom.risposte = risp;
                                                        elDomande.push(dom);
                                                        break;
        
                                                    case "close":
                                                        dom = new Object();
                                                        dom.testo = dati[1];
                                                        dom.tipoDomanda = dati[0];
                                                        dom.punteggio = dati[2];
        
                                                        risp = new Array();
                                                        r = new Object();
                                                        r.testo = dati[3];
                                                        r.corretta = true;
                                                        risp.push(r);
        
                                                        dom.risposte = risp;
                                                        elDomande.push(dom);
                                                        break;
                                                }
                                            }
        
                                            esami.updateOne({_id : parseInt(req.body.idEsame)}, {
                                                $set: {
                                                    descrizione: req.body.descrizione,
                                                    dataScadenza: new Date(req.body.dataScadenza),
                                                    durata: dur,
                                                    numDomande: parseInt(req.body.domande.length),
                                                    maxVoto: parseFloat(req.body.maxVoto),
                                                    minVoto: parseFloat(req.body.minVoto),
                                                    domande: elDomande
                                                }
                                            }).exec().then(results=> {
                                                let token = createToken(req.payload);
                                                writeCookie(res, token);
                                                res.writeHead(200, { "Content-Type": "application/json" });
                                                res.end(JSON.stringify("modEsameOk")); 
                                            }).catch(err => {
                                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                            });
                                        } else {
                                            error(req, res, null, JSON.stringify(new ERRORS.EXISTING_EXAM({})));
                                        }
                                    }).catch(err => {
                                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                    });
                                } else {
                                    gestErrorePar(req, res);
                                }
                            } else {
                                gestErrorePar(req, res);
                            }
                        } else {
                            gestErrorePar(req, res);
                        }
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/rimuoviEsame", function (req, res) {
    esami.updateOne({ _id: parseInt(req.body.idEsame) }, { $set: { validita: false } }).exec().then(result => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify("rimEsameOk"));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/getDomandaEsame", function (req, res) {
    esami.findById(parseInt(req.body.idEsame)).exec().then(result => {
        if (parseInt(req.body.pos) >= 0 && parseInt(req.body.pos) < result.numDomande){
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result.domande[parseInt(req.body.pos)]));
        }
        else{
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify("domandaNonEsiste"));
        }
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/getDomandeCorrezioneEsame", function (req, res) {
    esami.findById(parseInt(req.body.idEsame)).exec().then(result => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.domande));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/getMaxMinVotoEsame", function(req, res){
    esami.findById(parseInt(req.body.idEsame)).select("maxVoto minVoto").exec().then(result => {
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.maxVoto + "-" + result.minVoto));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
});

app.post("/api/salvaRisultatoEsame", function (req, res) {
    if(req.body.idEsame != ""){
        if (req.body.idCorso != "") {
            if (req.body.voto != "") {
                if (req.body.dataEsame != "") {
                    if (req.body.risposte.length > 0) {
                        if (req.body.dataEsame != "") {
                            utenti.find({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id)}).select("moduli moduliGruppi").exec().then(result => {
                                let mod = "";
                                for(let i = 0; i < result[0].moduli.length; i++){
                                    console.log(result[0].moduli[i]);
                                    if (result[0].moduli[i].dataFine == undefined || result[0].moduli[i].dataFine == null || result[0].moduli[i].dataFine >= new Date()) {
                                        if (result[0].moduli[i].scadenza == undefined || result[0].moduli[i].scadenza == null || result[0].moduli[i].scadenza >= new Date()) {
                                            if(result[0].moduli[i].codModulo == parseInt(req.body.idCorso)){
                                                mod = "personale"; // modulo è individuale
                                                break;
                                            }
                                        }
                                    }
                                }
    
                                for (let i = 0; i < result[0].moduliGruppi.length; i++) {
                                    console.log(result[0].moduliGruppi[i]);
                                    if (result[0].moduliGruppi[i].dataFine == undefined || result[0].moduliGruppi[i].dataFine == null || result[0].moduliGruppi[i].dataFine >= new Date()){
                                        if (result[0].moduliGruppi[i].scadenza == undefined || result[0].moduliGruppi[i].scadenza == null || result[0].moduliGruppi[i].scadenza >= new Date()){
                                            if (result[0].moduliGruppi[i].codModulo == parseInt(req.body.idCorso)){
                                                mod = "gruppo"; // modulo è con gruppo
                                                break;
                                            }
                                        }
                                    }
                                }
                                console.log("Iscritto: " + mod);
                                
                                if(mod == "personale"){
                                    utenti.updateOne({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id)}, {$push : { esami : {codEsame : parseInt(req.body.idEsame), data : new Date(req.body.dataEsame), voto : parseFloat(req.body.voto), risposteDate: req.body.risposte}}})
                                        .exec()
                                        .then(result => {
                                            let token = createToken(req.payload);
                                            writeCookie(res, token);
                                            res.writeHead(200, { "Content-Type": "application/json" });
                                            res.end(JSON.stringify("salRisOk"));
                                        })
                                        .catch(err => {
                                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                        });
                                }
                                else if(mod == "gruppo"){
                                    utenti.updateOne({ _id: parseInt(JSON.parse(JSON.stringify(req.payload))._id) }, { $push: { esamiGruppi: { codModulo: parseInt(req.body.idCorso), codEsame: parseInt(req.body.idEsame), data: new Date(req.body.dataEsame), voto: parseFloat(req.body.voto), risposteDate: req.body.risposte } } })
                                        .exec()
                                        .then(result => {
                                            let token = createToken(req.payload);
                                            writeCookie(res, token);
                                            res.writeHead(200, { "Content-Type": "application/json" });
                                            res.end(JSON.stringify("salRisOk"));
                                        })
                                        .catch(err => {
                                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                        });
                                }
                            }).catch(err => {
                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                            });
                        } else {
                            gestErrorePar(req, res);
                        }
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});
//#endregion

//#region MODERAZIONE MATERIE
app.post("/api/elMatModerate", function (req, res) {
    if (JSON.parse(JSON.stringify(req.payload))._id) { 
        materie.find({ $and: [{ "moderatore": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }, {"validita":"true"}]}).exec().then(results => {
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    }else{
        gestErrorePar(req, res);
    }
});

app.post("/api/elArgomentiMatModerate", function (req, res) {
    if (JSON.parse(JSON.stringify(req.payload))._id) {
        materie.aggregate([
            { $match: { $and: [{ "moderatore": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }, { "validita": "true" }] } },
            {
                $lookup:
                {
                    from: argomentiTemp.collection.name,
                    localField: "_id",
                    foreignField: "codMateria",
                    as: "argMatModerate"
                }
            }
        ]).exec().then(results => {
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/inserisciMateria", function (req, res) {
    if (req.body.descMat != "") {
        materie.find({ "descrizione": req.body.descMat }).exec().then(results =>{
            if (results.length > 0) {
                error(req, res, null, JSON.stringify(new ERRORS.EXISTING_SUBJECT({})));
            }else{
                materie.find({}).exec().then(results =>{
                    let vet = JSON.parse(JSON.stringify(results));
                    const addMateria = new materie({
                        _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                        descrizione: req.body.descMat,
                        dataCreazione: new Date().toISOString(),
                        moderatore: parseInt(JSON.parse(JSON.stringify(req.payload))._id)
                    });
                    addMateria.save().then(results => {
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify("addMateriaOk")); 
                    }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                }).catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            }
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/eliminaMateria", function (req, res) {
    let vetArgs = new Array();
    if (req.body.codMateria) {
        materie.updateOne({ "_id": parseInt(req.body.codMateria) }, { $set: { validita: "false" } }).exec().then( ()=>{
            moduli.updateMany({ "codMateria": parseInt(req.body.codMateria) }, { $set: { validita: "false" } }).exec().then(()=>{
                argomenti.find({ "codMateria": parseInt(req.body.codMateria)}).select("_id").exec().then((elArgsMat)=>{
                    for (let I = 0; I < elArgsMat.length; I++) {
                        vetArgs.push(elArgsMat[I]);
                    }
                    eliminaArgomento(req, vetArgs).then(()=>{
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify("eliminazMatOk"));
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }).catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
   }else{
        gestErrorePar(req, res);
   }
});

app.post("/api/modificaMateria", function (req, res) {
    if (req.body.desc != "") {
        if (Date.parse(req.body.data)) {
            materie.find({ "descrizione": req.body.desc }).exec().then(results => {
                if (results.length > 0) {
                    error(req, res, null, JSON.stringify(new ERRORS.EXISTING_SUBJECT({})));
                } else {
                    materie.updateOne({ "descrizione": req.body.desc, "dataCreazione": req.body.data}).exec().then(results => { 
                        let token = createToken(req.payload);
                        writeCookie(res, token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify("modMateriaOk")); 
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        } else {
            gestErrorePar(req, res);
        }
    }else{
        gestErrorePar(req, res);
    }
});

app.post("/api/approvaArgomento", function (req, res) { // da notificare cambiamento a Giacca
    if (req.body.codArgomento) {
        argomentiTemp.findOne({ "_id": parseInt(req.body.codArgomento) }).exec().then(resultsArgTemp =>{
            if (resultsArgTemp) {
                argomenti.count({ $and: [{ "descrizione": resultsArgTemp.descrizione }, { "codMateria": parseInt(resultsArgTemp.codMateria) }] }).exec().then(nArgs=>{
                    if (nArgs == 0) {
                        argomenti.find({}).exec().then(results => {
                            let vet = JSON.parse(JSON.stringify(results));
                            const addArgomento = new argomenti({
                                _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                descrizione: resultsArgTemp.descrizione,
                                codMateria: parseInt(resultsArgTemp.codMateria),
                                codModeratore: parseInt(resultsArgTemp.codModeratore)
                            });
                            addArgomento.save().then(results => {
                                argomentiTemp.remove({ "_id": parseInt(req.body.codArgomento) }).exec().then(result => {
                                    let token = createToken(req.payload);
                                    writeCookie(res, token);
                                    res.writeHead(200, { "Content-Type": "application/json" });
                                    res.end(JSON.stringify("approvazArgOk"));
                                }).catch(err => {
                                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                });
                            }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                        }).catch(err => {
                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                        });
                    }else{
                        error(req, res, null, JSON.stringify(new ERRORS.EXISTING_ARGUMENT({})));
                    }
                }).catch(err => {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
                
            }else{
                error(req, res, null, JSON.stringify(new ERRORS.MISSING_ARGUMENT({})));
            }
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/rifiutoArgomento", function (req, res) {
    if (req.body.codArgomento) {
        argomentiTemp.deleteOne({ "_id": parseInt(req.body.codArgomento) }).exec().then(result=>{
            if (result.n == 1) {
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify("rifiutoArgOk"));
            }else{
                error(req, res, null, JSON.stringify(new ERRORS.MISSING_ARGUMENT({}))); 
            }
            
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        })
    } else {
        gestErrorePar(req, res);
    }
});
//#endregion

//#region MODERAZIONE ARGOMENTI
app.post("/api/elArgomentiModerati", function (req, res) {
    if (JSON.parse(JSON.stringify(req.payload))._id) {
        argomenti.aggregate([
            { $match: { $and: [{ "codModeratore": parseInt(JSON.parse(JSON.stringify(req.payload))._id)}, {validita:"true"}]} },
            {
                $lookup:
                {
                    from: materie.collection.name,
                    localField: "codMateria",
                    foreignField: "_id",
                    as: "matArgomento"
                }
            }
        ]).exec().then(results => {
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/inserisciArgomento", function (req, res) {
    if (req.body.descArgomento != "") {
        if (req.body.codMateria != "") {
            argomentiTemp.find({ $and: [{ "descrizione": req.body.descArgomento }, {"codMateria": parseInt(req.body.codMateria) }]}).exec().then(results => {
                if (results.length > 0) {
                    error(req, res, null, JSON.stringify(new ERRORS.EXISTING_ARGUMENT({})));
                } else {
                    argomentiTemp.find({}).exec().then(results => {
                        let vet = JSON.parse(JSON.stringify(results));
                        let id = 1;
                        if (vet[vet.length - 1]) {
                            id = parseInt(vet[vet.length - 1]["_id"]) + 1
                        }
                        const addArgometo = new argomentiTemp({
                            _id: id,
                            descrizione: req.body.descArgomento,
                            codMateria: parseInt(req.body.codMateria),
                            codModeratore: parseInt(JSON.parse(JSON.stringify(req.payload))._id)
                        });
                        addArgometo.save().then(results => {
                            let token = createToken(req.payload);
                            writeCookie(res, token);
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify("addArgomentoOk"));
                        }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/elAppuntiArgsModerati", function (req, res) {
    if (JSON.parse(JSON.stringify(req.payload))._id) {
        argomenti.aggregate([
            { $match: { $and: [{ "codModeratore": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }, { validita: "true" }] }},
            {
                $lookup: {
                    from: appuntiTemp.collection.name,
                    localField: "_id",
                    foreignField: "argomentiDaApprovare.codArgomento",
                    as: "argomentiDaApprovare"
                }
            }
        ]).exec().then(results => {
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/approvaAllegato", function (req, res) {
    if (req.body.codAppunto) {
        if (req.body.idArgomento) {
            appuntiTemp.findOne({ "_id": parseInt(req.body.codAppunto) }).exec().then(resultsAppuntiTemp => {
                if (resultsAppuntiTemp) {
                    appuntiTemp.updateOne({ "_id": parseInt(req.body.codAppunto) }, { "$pull": { "argomentiDaApprovare": { "codArgomento": parseInt(req.body.idArgomento) } } }).exec().then(ris => {
                        if ((resultsAppuntiTemp.argomentiDaApprovare.length - 1) == 0) {
                            appunti.count({ $and: [{ "descrizione": req.body.descrizione }, { "nomeAutore": req.body.nome }, { "cognomeAutore": req.body.cognome }] }).exec().then(risChkEsistenza=>{
                                if (risChkEsistenza == 0) {
                                    appunti.find({}).exec().then(results => {
                                        let vet = JSON.parse(JSON.stringify(results));
                                        const addAppunto = new appunti({
                                            _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                            descrizione: resultsAppuntiTemp.descrizione,
                                            dataCaricamento: resultsAppuntiTemp.dataCaricamento,
                                            nomeAutore: resultsAppuntiTemp.nomeAutore,
                                            cognomeAutore: resultsAppuntiTemp.cognomeAutore,
                                            codUtente: resultsAppuntiTemp.codUtente,
                                            argomenti: resultsAppuntiTemp.argomenti,
                                            allegati: resultsAppuntiTemp.allegati
                                        });
                                        addAppunto.save().then(results => {
                                            appuntiTemp.remove({ "_id": parseInt(req.body.codAppunto) }).exec().then(result => {
                                                let token = createToken(req.payload);
                                                writeCookie(res, token);
                                                res.writeHead(200, { "Content-Type": "application/json" });
                                                res.end(JSON.stringify("approvazAppuntoOk"));
                                            }).catch(err => {
                                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                            });
                                        }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                                    }).catch(err => {
                                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                    });
                                }else{
                                    error(req, res, null, JSON.stringify(new ERRORS.EXISTING_NOTE({})));
                                }
                            }).catch(err => {
                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                            });
                            
                        } else {
                            let token = createToken(req.payload);
                            writeCookie(res, token);
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify("approvazAppuntoOk"));
                        }
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    }); 
                    
                } else {
                    error(req, res, null, JSON.stringify(new ERRORS.MISSING_NOTE({})));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/rifiutoAppunto", function (req, res) {
     if (req.body.codAppunto) {
         appuntiTemp.deleteOne({ "_id": parseInt(req.body.codAppunto) }).exec().then(result => {
             if (result.n == 1) {
                 let token = createToken(req.payload);
                 writeCookie(res, token);
                 res.writeHead(200, { "Content-Type": "application/json" });
                 res.end(JSON.stringify("rifiutoAppuntoOk"));
             } else {
                 error(req, res, null, JSON.stringify(new ERRORS.MISSING_NOTE({})));
             }

         }).catch(err => {
             error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
         });
     } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/eliminaArgomento", function (req, res) {
       if (req.body.codArgomento) {
           eliminaArgomento(req, [parseInt(req.body.codArgomento)]).then(()=>{
               let token = createToken(req.payload);
               writeCookie(res, token);
               res.writeHead(200, { "Content-Type": "application/json" });
               res.end(JSON.stringify("eliminazArgOk"));
           }).catch(err=>{
               error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
           });
       } else {
           gestErrorePar(req, res);
      }
});

function eliminaArgomento(req, codArg) {
    return new Promise((resolve, reject)=>{
        Promise.all([gestAppuntiCollegati(req, codArg), gestModuliCollegati(req, codArg)]).then(ausRes => {
            argomenti.updateOne({ _id: { $in: codArg } }, { $set: { validita: "false" } }).then(() => {
                resolve();
            }).catch(err => {
                reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }).catch(err => {
            reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    });
}

function gestAppuntiCollegati(req, codArg) {
    return new Promise((resolve, reject) => {
        appunti.find({ "argomenti.codArgomento": { $in: codArg} }).exec().then(results => {
            appunti.updateMany({}, { $pull: { argomenti: { codArgomento: { $in: codArg } } } }).exec().then(resUp => {
                appunti.updateMany({ argomenti: { $size: 0 } }, { $set: { validita: "false" } }).exec().then(aus => {
                    resolve();
                }).catch(err => {
                    reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            }).catch(err => {
                reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }).catch(err => {
            reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });

    });
}

// function gestLezioni(results) {
//     return new Promise((resolve, reject)=>{
//         if (results.length > 0) {
//             let vetIdAppunti = new Array();
//             for (let i = 0; i < results.length; i++) {
//                 vetIdAppunti.push(parseInt(results[i]._id));
//             }
//             lezioni.updateMany({}, { $pull: { appunti: { codAppunto: { $in: vetIdAppunti } } } }).exec().then(resLezioni => {
//                 lezioni.updateMany({ appunti: { $size: 0 } }, { $set: { validita: "false" } }).exec().then(aus=>{
//                     resolve();
//                 }).catch(err => {
//                     reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
//                 });
//             }).catch(err => {
//                 reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
//             });
//         }else{
//             resolve();
//         }
//     });
// }

function gestModuliCollegati(req, codArg) {
    return new Promise((resolve, reject) => {
        moduli.find({ "argomenti.codArgomento": { $in: codArg } }).exec().then(resValModuli => {
            moduli.updateMany({}, { $pull: { argomenti: { codArgomento: { $in: codArg } } } }).exec().then(resPullModuli => {
                moduli.updateMany({ argomenti: { $size: 0 } }, { $set: { validita: "false" } }).exec().then(results => {
                    resolve();
                }).catch(err => {
                    reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                });
            }).catch(err => {
                reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        }).catch(err => {
            reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });

    });
}

// function gestEsami(resValModuli) {
//     return new Promise((resolve, reject) =>{
//         if (resValModuli.length > 0) {
//             let vetIdModuli = new Array();
//             for (let i = 0; i < resValModuli.length; i++) {
//                 vetIdModuli.push(parseInt(resValModuli[i]._id));
//             }
//             esami.updateMany({ codModulo: { $in: vetIdModuli } }, { $set: { validita: "false" } }).exec().then(aus=>{
//                 resolve();
//             }).catch(err => {
//                 reject(err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
//             });
//         }else{
//             resolve();
//         }
//     });
// }

app.post("/api/elModuliArgomenti", function (req, res) {
    if (JSON.parse(JSON.stringify(req.payload))._id) {
        argomenti.aggregate([
            { $match: { $and: [{ "codModeratore": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }, { validita: "true" }] } },
            {
                $lookup: {
                    from: moduliTemp.collection.name,
                    localField: "_id",
                    foreignField: "argomentiDaApprovare.codArgomento",
                    as: "argomentiDaApprovare"
                }
            }
        ]).exec().then(results => {
            let token = createToken(req.payload);
            writeCookie(res, token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/approvaModulo", function (req, res) {
    if (req.body.codModulo) {
        if (req.body.idArgomento) {
            moduliTemp.findOne({ "_id": parseInt(req.body.codModulo) }).exec().then(resultsModuliTemp => {
                if (resultsModuliTemp) {
                    moduliTemp.updateOne({ "_id": parseInt(req.body.codModulo) }, { "$pull": { "argomentiDaApprovare": { "codArgomento": parseInt(req.body.idArgomento) } } }).exec().then(ris => {
                        if ((resultsModuliTemp.argomentiDaApprovare.length - 1) == 0) {
                            moduli.count({ $and: [{ "descrizione": resultsModuliTemp.descrizione }, { "codMateria": parseInt(resultsModuliTemp.codMateria) }, { "codTipoModulo": parseInt(resultsModuliTemp.codTipoModulo) }] }).exec().then(risChkEsistenza => {
                                if (risChkEsistenza == 0) {
                                    moduli.find({}).exec().then(results => {
                                        let vet = JSON.parse(JSON.stringify(results));
                                        let vetDati = {
                                            _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                            descrizione: resultsModuliTemp.descrizione,
                                            dataCreazione: resultsModuliTemp.dataCreazione,
                                            codTipoModulo: resultsModuliTemp.codTipoModulo,
                                            codMateria: resultsModuliTemp.codMateria,
                                            codAutore: resultsModuliTemp.codAutore,
                                            argomenti: resultsModuliTemp.argomenti,
                                            lezioni: resultsModuliTemp.lezioni,
                                            validita: true
                                        };
                                        if (resultsModuliTemp.dataScadenza) {
                                            vetDati["dataScadenza"] = resultsModuliTemp.dataScadenza
                                        }
                                        const addModulo = new moduli(vetDati);
                                        
                                        addModulo.save().then(results => {
                                            moduliTemp.remove({ "_id": parseInt(req.body.codModulo) }).exec().then(result => {
                                                let token = createToken(req.payload);
                                                writeCookie(res, token);
                                                res.writeHead(200, { "Content-Type": "application/json" });
                                                res.end(JSON.stringify("approvazModuloOk"));
                                            }).catch(err => {
                                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                            });
                                        }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                                    }).catch(err => {
                                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                    });
                                } else {
                                    error(req, res, null, JSON.stringify(new ERRORS.EXISTING_COURSE({})));
                                }
                            }).catch(err => {
                                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                            });

                        } else {
                            let token = createToken(req.payload);
                            writeCookie(res, token);
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify("approvazAppuntoOk"));
                        }
                    }).catch(err => {
                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    });

                } else {
                    error(req, res, null, JSON.stringify(new ERRORS.MISSING_COURSE({})));
                }
            }).catch(err => {
                error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
            });
        } else {
            gestErrorePar(req, res);
        }
    } else {
        gestErrorePar(req, res);
    }
});

app.post("/api/rifiutaModulo", function (req, res) {
    if (req.body.codModulo) {
        moduliTemp.deleteOne({ "_id": parseInt(req.body.codModulo) }).exec().then(result => {
            if (result.n == 1) {
                let token = createToken(req.payload);
                writeCookie(res, token);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify("rifiutoModuloOk"));
            } else {
                error(req, res, null, JSON.stringify(new ERRORS.MISSING_COURSE({})));
            }

        }).catch(err => {
            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
        });
    } else {
        gestErrorePar(req, res);
    }
});
//#endregion

app.post("/api/registraAdmin", function (req, res) {
    if (req.body.nome != "") {
        if (req.body.cognome != "") {
            if (Date.parse(req.body.dataNascita)) {
                if (chkEtaMinima(new Date(req.body.dataNascita)) >= 6570) {
                    if (validaEmail(req.body.email)) {
                        if (validaTelefono(req.body.telefono)) {
                            if (req.body.username != "") {
                                if (validaPwdReg(req.body.password)) {
                                    utenti.count({ "mail": req.body.email }).exec().then(nUtMail => {
                                        if (nUtMail == 0) {
                                            utenti.count({ "telefono": req.body.telefono }).exec().then(nUtTel => {
                                                if (nUtTel == 0) {
                                                    utenti.count({ "user": req.body.username }).exec().then(nUtUser => {
                                                        if (nUtUser == 0) {
                                                            bcrypt.hash(req.body.password, saltRounds, function (errUtPwd, hashUtPwd) {
                                                                if (errUtPwd) {
                                                                    error(req, res, errUtPwd, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                                } else {
                                                                    utenti.find().sort({ _id: 1 }).exec().then(results => {
                                                                        let vet = JSON.parse(JSON.stringify(results));

                                                                        const utInsert = new utenti({
                                                                            _id: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                                                            nome: req.body.nome,
                                                                            cognome: req.body.cognome,
                                                                            dataNascita: req.body.dataNascita,
                                                                            mail: req.body.email,
                                                                            telefono: req.body.telefono,
                                                                            user: req.body.username,
                                                                            pwd: hashUtPwd,
                                                                            foto: "static\\images\\default.png",
                                                                            amministratore: true
                                                                        });
                                                                        utInsert.save().then(results => { res.send(JSON.stringify("regOk")); }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });

                                                                        /* Poi da rimuovere in Deploy */
                                                                        const utPwdColl = new pwdInChiaro({
                                                                            _id: new mongoose.Types.ObjectId(),
                                                                            idUt: parseInt(vet[vet.length - 1]["_id"]) + 1,
                                                                            user: req.body.username,
                                                                            pwd: req.body.password
                                                                        });
                                                                        utPwdColl.save().then(results => { console.log("Pwd salvata su Collection in chiaro") }).catch(errSave => { console.log("Errore salvataggio Pwd in chiaro; err: " + errSave) });
                                                                    }).catch(err => {
                                                                        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            error(req, res, null, JSON.stringify(new ERRORS.USERNAME_USED({})));
                                                        }
                                                    }).catch(errUser => {
                                                        error(req, res, errUser, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                    });
                                                } else {
                                                    error(req, res, null, JSON.stringify(new ERRORS.TELEPHONE_USED({})));
                                                }
                                            }).catch(errTel => {
                                                error(req, res, errTel, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                            });
                                        } else {
                                            error(req, res, null, JSON.stringify(new ERRORS.EMAIL_USED({})));
                                        }
                                    }).catch(errMail => {
                                        error(req, res, errMail, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                    });
                                } else {
                                    gestErrorePar(req, res);
                                }
                            } else {
                                gestErrorePar(req, res);
                            }
                        } else {
                            gestErrorePar(req, res);
                        }
                    } else {
                        gestErrorePar(req, res);
                    }
                } else {
                    gestErrorePar(req, res);
                }
            } else {
                gestErrorePar(req, res);
            }
        } else {
            gestErrorePar(req, res);
        }
    }
    else {
        gestErrorePar(req, res);
    }
});

/* createToken si aspetta un generico json contenente i campi indicati.
   iat e exp se non esistono vengono automaticamente creati          */
function createToken(obj, username, amministratore) {
    let token = jwt.sign({
        '_id': obj._id,
        'username': obj.username,
        'amministratore': obj.amministratore,
        'iat': obj.iat || Math.floor(Date.now() / 1000),
        'exp': obj.exp || Math.floor(Date.now() / 1000 + TIMEOUT)
    },
        privateKey
    );
    console.log("Creato Nuovo token");
    console.log(token);
    return token;
}

function writeCookie(res, token) {
    res.set("Set-Cookie", "token=" + token + ";max-age=" + TIMEOUT + ";Path=/;httponly=true;secure=true");
}

/* ************************************************************* */

// gestione degli errori
function error(req, res, err, httpError) {
    console.log("httpError: " + httpError);
    if (err)
        console.log(err.message);

    res.status(JSON.parse(httpError).code);
    console.log("URI: " + req.originalUrl);
    if (req.originalUrl.startsWith("/api"))
        res.send(httpError);
    else
        // L'unico errore su una richiesta di pagina può essere il token non valido 
        //  (oppure il successivo 404 not found)
        res.sendFile('login.html', { root: './static' })
}

// default route finale
app.use('/', function (req, res, next) {
    res.status(404)
    if (req.originalUrl.startsWith("/api")) {
        res.send(JSON.stringify(new ERRORS.PAGE_NOT_FOUND({})));
    } else {
        res.send(pageNotFound);
    }
});