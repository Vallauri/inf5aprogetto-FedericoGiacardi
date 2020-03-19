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
const port = process.env.PORT || 8888;

const multer = require("multer"); // Modulo per salvataggio immagini su server
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

const fileFilter = (req, file, cb) =>{
    if (!file.originalname.includes("unset")) {
        cb(null, true);
    }else{
        cb(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter:fileFilter });

/* CONNESSIONE AL DATABASE */
// let userDB = "dbUser";
// let pwdDB = "djNDIPkNP6skFZEP";
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS +"@learnonthenet-rqmxj.mongodb.net/progetto?retryWrites=true&w=majority", {useNewUrlParser:true, useUnifiedTopology:true});
console.log("Everything seems ok...");

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

const HTTPS = require('https');


// express
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

//Mongoose
let utenti = require("./models/Utenti.js");
let argomenti = require("./models/Argomenti.js");
let appunti = require("./models/Appunti.js");
let esami = require("./models/Esami.js");
let gruppi = require("./models/Gruppi.js");


// Online RSA Key Generator
const privateKey = fs.readFileSync("keys/private.key", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = { "key": privateKey, "cert": certificate };

/* ************************************************************ */

// avvio server
const TIMEOUT = 30; // 60 SEC
let pageNotFound;

var httpsServer = HTTPS.createServer(credentials, app);
httpsServer.listen(port, '127.0.0.1', function () {
    fs.readFile("./static/error.html", function (err, content) {
        if (err)
            content = "<h1>Risorsa non trovata</h1>"
        pageNotFound = content.toString();
    });
    console.log("Server in ascolto https://127.0.0.1: " + this.address().port);
});

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
    res.send({ "id": JSON.parse(JSON.stringify(req.payload))._id});
});

function controllaToken(req, res, next) {
    if (req.originalUrl == '/api/login' || req.originalUrl == '/api/logout' || req.originalUrl == '/api/registrati' || req.originalUrl == '/api/reimpostaPwd' || req.originalUrl == '/api/loadCounter' || req.originalUrl == '/api/elRecensioni' || req.originalUrl == '/api/invioMailReimpostaPwd') 
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
                    payload = { ...payload, 'exp': exp }
                    token = createToken(payload)
                    writeCookie(res, token)
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

app.post("/api/registrati", upload.single("foto"),function (req, res) {
    let path = "";
    if (req.body.nome != "") {
        if (req.body.cognome != "") {
            //FARE CONTROLLO ETA MINIMA 8 ANNI
            if (Date.parse(req.body.dataNascita)) {
                if (validaEmail(req.body.email)) {
                    if (validaTelefono(req.body.telefono)) {
                        if (req.body.username != "") {
                            if (validaPwdReg(req.body.password)) {
                                utenti.count({ "mail": req.body.email}).exec().then(nUtMail =>{
                                    if (nUtMail == 0) {
                                        utenti.count({ "telefono": req.body.telefono }).exec().then(nUtTel => {
                                            if (nUtTel == 0) {
                                                utenti.count({ "user": req.body.username }).exec().then(nUtUser => {
                                                    if (nUtUser == 0) {
                                                        //ATTENZIONE!!! PER ORA NON FUNGE. Bisogna scorrere il recordset con un foreach e per ogni record fare il bcrypt.compare
                                                        bcrypt.hash(req.body.password, saltRounds, function (errUtPwd, hashUtPwd) {
                                                            if (errUtPwd) {
                                                                error(req, res, errUtPwd, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                            }else{
                                                                utenti.count({ "pwd": hashUtPwd }).exec().then(nPwdUser => {
                                                                    if (nPwdUser == 0) {
                                                                        utenti.find().sort({ _id: 1 }).exec().then(results => {
                                                                            let vet = JSON.parse(JSON.stringify(results));
                                                                            if (req.file == undefined) {
                                                                                path = "static\\images\\default.png";
                                                                            }else{
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
                                                                                foto:path
                                                                            });
                                                                            utInsert.save().then(results => { res.send(JSON.stringify("regOk")); }).catch(errSave => { error(req, res, errSave, JSON.stringify(new ERRORS.QUERY_EXECUTE({}))); });
                                                                        }).catch(err => {
                                                                            error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                                                                        });
                                                                    } else {
                                                                        error(req, res, null, JSON.stringify(new ERRORS.PWD_USED({})));
                                                                    }
                                                                }).catch(errPwdUser => {
                                                                    error(req, res, errPwdUser, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
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
                                    }else{
                                        error(req, res, null, JSON.stringify(new ERRORS.EMAIL_USED({})));
                                    }
                                }).catch(errMail =>{
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
                    pass: 'S8Fh!lU?y8'//process.env.PWD_GMAIL
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
                                        text: "Gentile Utente, le scriviamo per notificarle il cambiamento della Password del suo account sulla Piattaform Learn On The Net.\n La preghiamo di contattare l'amministratore all'indirizzo: learnonthenet7@gmail.com in caso di problemi."
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

app.post("/api/elGruppi", function (req, res) {
    console.log(gruppi.collection.name);
    utenti.aggregate([
        { $match:{"_id": parseInt(JSON.parse(JSON.stringify(req.payload))._id) }},
        {
            $lookup:
            {
                from: gruppi.collection.name,
                localField: "gruppo.codGruppo",
                foreignField: "_id",
                as: "gruppi"
            }
        }
    ]).exec().then(results => {
        
        let token = createToken(req.payload);
        writeCookie(res, token);
        res.writeHead(200, { "Content-Type": "application/json" });
        console.log(results);
        res.end(JSON.stringify(results));
    }).catch(err => {
        error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
    });
})

/* createToken si aspetta un generico json contenente i campi indicati.
   iat e exp se non esistono vengono automaticamente creati          */
function createToken(obj) {
    let token = jwt.sign({
        '_id': obj._id,
        'username': obj.username,
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

app.post('/api/logout', function (req, res, next) {
    res.set("Set-Cookie", "token=;max-age=-1;Path=/;httponly=true");
    res.send({ "ris": "LogOutOk" });
});

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
        res.send('Risorsa non trovata');
    } else {
        res.send(pageNotFound);
    }
});