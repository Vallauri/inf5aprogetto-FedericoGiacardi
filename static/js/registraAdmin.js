"use strict";

// Routine Iniziale
$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        //Funzionalità disponibile solo per l'amministratore
        if (!data.amministratore) {
            window.location.href = "areaPersonale.html";
        } else {
            loadPagina();
        }
    });
    $("#voceRegAdmin").addClass("active");
});

//Caricamento Pagina
function loadPagina() {
    $("#sezRegMod").css("visibility", "visible");
    setMinDate();
    $("#btnInviaRegMod").on("click", validaDatiRegistrazione);
}

//Imposto come data di nascita massima 8 anni fa
function setMinDate() {
    let aus = new Date();
    aus.setDate = aus.getDate();
    aus.setFullYear(aus.getFullYear() - 18); //imposto come data di nascita massima 18 anni fa
    let data = aus.toISOString().split('T')[0];
    $("#dataNascitaRegMod").attr("max", data);
}

//Gestione Registrazione
function validaDatiRegistrazione() {
    $("#nomeRegMod").removeClass("alert-danger");
    $("#cognomeRegMod").removeClass("alert-danger");
    $("#dataNascitaRegMod").removeClass("alert-danger");
    $("#mailRegMod").removeClass("alert-danger");
    $("#telRegMod").removeClass("alert-danger");
    $("#usernameRegMod").removeClass("alert-danger");
    $("#pwdRegMod").removeClass("alert-danger");
    $("#msgRegMod").text("").removeClass("alert alert-danger");

    //Controllo validità dati di input
    if ($("#nomeRegMod").val() != "") {
        if ($("#cognomeRegMod").val() != "") {
            if (Date.parse($("#dataNascitaRegMod").val())) {
                if (chkEtaMinima(new Date($("#dataNascitaRegMod").val())) >= 6570) {
                    if (validaEmail($("#mailRegMod").val())) {
                        if (validaTelefono($("#telRegMod").val())) {
                            if ($("#usernameRegMod").val() != "") {
                                if (validaPwdReg($("#pwdRegMod").val())) {
                                    let vetDatiReg ={
                                        "nome": $("#nomeRegMod").val(),
                                        "cognome": $("#cognomeRegMod").val(),
                                        "dataNascita": $("#dataNascitaRegMod").val(),
                                        "telefono": $("#telRegMod").val(),
                                        "email": $("#mailRegMod").val(),
                                        "username": $("#usernameRegMod").val(),
                                        "password": $("#pwdRegMod").val()
                                    }
                                    let registratiRQ = inviaRichiesta('/api/registraAdmin', 'POST', vetDatiReg);
                                    registratiRQ.fail(function (jqXHR, test_status, str_error) {
                                        if (jqXHR.status == 603) {
                                            $("#msgRegMod").text("Credenziali Errate o Mancanti").addClass("alert alert-danger");
                                        }
                                        else {
                                            printErrors(jqXHR, "#msgRegMod");
                                        }
                                    });
                                    registratiRQ.done(function (data) {
                                        $("#msgRegMod").html("Registrazione completata con successo").removeClass("alert alert-danger").addClass("alert alert-success");
                                    });
                                    
                                } else {
                                    gestErrori("Inserire una Password valida", $("#pwdRegMod"), "#msgRegMod");
                                }
                            } else {
                                gestErrori("Inserire uno Username", $("#usernameRegMod"), "#msgRegMod");
                            }
                        } else {
                            gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telRegMod"), "#msgRegMod");
                        }
                    } else {
                        gestErrori("Inserire una Email valida", $("#mailRegMod"), "#msgRegMod");
                    }
                } else {
                    gestErrori("Occorre avere almeno 18 anni", $("#dataNascitaRegMod"), "#msgRegMod");
                }

            } else {
                gestErrori("Inserire una Data di Nascita valida", $("#dataNascitaRegMod"), "#msgRegMod");
            }
        } else {
            gestErrori("Inserire il Cognome", $("#cognomeRegMod"), "#msgRegMod");
        }
    }
    else {
        gestErrori("Inserire il Nome", $("#nomeRegMod"), "#msgRegMod");
    }
}

//Funzione di stampa errori
function gestErrori(msg, controllo, target) {
    $(target).html(msg).addClass("alert alert-danger");
    controllo.addClass("alert-danger");
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); //numero di giorni di differenza tra le due date
}