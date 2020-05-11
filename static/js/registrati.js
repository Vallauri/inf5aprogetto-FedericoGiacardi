"use strict";

// Routine Iniziale
$(document).ready(function () {
    //Controllo validità token autenticazione: se è già loggato lo indirizzo alla dashboard utente
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR + " " + test_status + " " + str_error);
    });
    chkToken.done(function (data) {
        window.location.href = "areaPersonale.html"
    });
    $("#btnInviaReg").click(gestReg);
    setMinDate();
});

//Imposto come data di nascita massima 8 anni fa
function setMinDate() {
    let aus = new Date();
    aus.setDate = aus.getDate();
    aus.setFullYear(aus.getFullYear() - 8); 
    let data = aus.toISOString().split('T')[0];
    $("#dataNascitaReg").attr("max", data);
}

//Gestione Registrazione
function gestReg() {
    //Pulisco i campi di input
    $("#nomeReg").removeClass("alert-danger");
    $("#cognomeReg").removeClass("alert-danger");
    $("#dataNascitaReg").removeClass("alert-danger");
    $("#mailReg").removeClass("alert-danger");
    $("#telReg").removeClass("alert-danger");
    $("#usernameReg").removeClass("alert-danger");
    $("#pwdReg").removeClass("alert-danger");
    $("#msgErrRegistrati").text("");

    //Controllo validità dati di input
    if ($("#nomeReg").val() != "") {
        if ($("#cognomeReg").val() != "") {
            if (Date.parse($("#dataNascitaReg").val())) {
                if (chkEtaMinima(new Date($("#dataNascitaReg").val())) >= 2920) {
                    if (validaEmail($("#mailReg").val())) {
                        if (validaTelefono($("#telReg").val())) {
                            if ($("#usernameReg").val() != "") {
                                if (validaPwdReg($("#pwdReg").val())) {
                                    //Preparo il formdata da inviare al server
                                    //con i dati di input
                                    let formData = new FormData();
                                    formData.append('nome', $("#nomeReg").val());
                                    formData.append('cognome', $("#cognomeReg").val());
                                    formData.append('dataNascita', $("#dataNascitaReg").val());
                                    formData.append('telefono', $("#telReg").val());
                                    formData.append('email', $("#mailReg").val());
                                    formData.append('username', $("#usernameReg").val());
                                    formData.append('password', $("#pwdReg").val());

                                    //Gestione foto: se non è specificata viene messa quella di default
                                    let foto = "unset";
                                    if ($('#fotoReg').prop('files')[0] != undefined) {
                                        foto = $('#fotoReg').prop('files')[0];
                                        if ($('#fotoReg').prop('files')[0].type.includes("image/")) {
                                            foto = $('#fotoReg').prop('files')[0];
                                        } else {
                                            gestErrori("La foto inserita non è valida", $("#fotoReg"));
                                            return;
                                        }
                                    }
                                    formData.append('foto', foto);
                                    //Gestione richiesta registrazione
                                    let registratiRQ = inviaRichiestaMultipart('/api/registrati', 'POST', formData);
                                    registratiRQ.fail(function (jqXHR, test_status, str_error) {
                                        if (jqXHR.status == 603) {
                                            $("#msgErrRegistrati").text("Credenziali Errate o Mancanti").addClass("alert alert-danger");
                                        }
                                        else {
                                            printErrors(jqXHR, "#msgErrRegistrati");
                                        }
                                    });
                                    registratiRQ.done(function (data) {
                                        window.location.href = "login.html";
                                    });
                                } else {
                                    gestErrori("Inserire una Password valida", $("#pwdReg"), "#msgErrRegistrati");
                                }
                            } else {
                                gestErrori("Inserire uno Username", $("#usernameReg"), "#msgErrRegistrati");
                            }
                        } else {
                            gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telReg"), "#msgErrRegistrati");
                        }
                    } else {
                        gestErrori("Inserire una Email valida", $("#mailReg"), "#msgErrRegistrati");
                    }
                } else {
                    gestErrori("Occorre avere almeno 8 anni", $("#dataNascitaReg"), "#msgErrRegistrati");
                }
                
            } else {
                gestErrori("Inserire una Data di Nascita valida", $("#dataNascitaReg"), "#msgErrRegistrati");
            }
        }else{
            gestErrori("Inserire il Cognome", $("#cognomeReg"), "#msgErrRegistrati");
        }
    }
    else {
        gestErrori("Inserire il Nome", $("#nomeReg"), "#msgErrRegistrati");
    }
}

//Validazione Email tramite regex
function validaEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

//Validazione Telefono tramite regex
function validaTelefono(telefono) {
    let re = /^[0-9]{10,10}$/;
    return re.test(telefono);
}

//Validazione Password tramite regex
function validaPwdReg(pwdReg) {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    return re.test(pwdReg);
}

//Calcola la differenza tra la data attuale e quella in input
//e restituisce il valore in giorni
function chkEtaMinima(dataNascita) {
    let dataBase = new Date();
    let diffTime = Math.abs(dataBase - dataNascita);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}