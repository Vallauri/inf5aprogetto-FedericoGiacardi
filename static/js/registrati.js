"use strict";

$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR + " " + test_status + " " + str_error);
    });
    chkToken.done(function (data) {
        window.location.href = "about.html"
    });
    $("#btnInviaReg").click(gestReg);
    setMinDate();
});

function setMinDate() {
    let aus = new Date();
    aus.setDate = aus.getDate();
    aus.setFullYear(aus.getFullYear() - 8); //imposto come data di nascita massima 8 anni fa
    let data = aus.toISOString().split('T')[0];
    $("#dataNascitaReg").attr("max", data);
}

function gestReg() {
    $("#nomeReg").removeClass("alert-danger");
    $("#cognomeReg").removeClass("alert-danger");
    $("#dataNascitaReg").removeClass("alert-danger");
    $("#mailReg").removeClass("alert-danger");
    $("#telReg").removeClass("alert-danger");
    $("#usernameReg").removeClass("alert-danger");
    $("#pwdReg").removeClass("alert-danger");
    $(".msg").text("");

    if ($("#nomeReg").val() != "") {
        if ($("#cognomeReg").val() != "") {
            if (Date.parse($("#dataNascitaReg").val())) {
                if (validaEmail($("#mailReg").val())) {
                    if (validaTelefono($("#telReg").val())) {
                        if ($("#usernameReg").val() != "") {
                            if (validaPwdReg($("#pwdReg").val())) {
                                // let dataNascita = $("#dataNascitaReg").val().split('-')[2] + "/" + $("#dataNascitaReg").val().split('-')[1] + "/" + $("#dataNascitaReg").val().split('-')[0];
                                let par = {
                                    "nome": $("#nomeReg").val(),
                                    "cognome": $("#nomeReg").val(),
                                    "dataNascita": $("#dataNascitaReg").val(),
                                    "email": $("#mailReg").val(),
                                    "telefono": $("#telReg").val(),
                                    "username": $("#usernameReg").val(),
                                    "password": $("#pwdReg").val()
                                };

                                let registratiRQ = inviaRichiesta('/api/registrati', 'POST', par);
                                registratiRQ.fail(function (jqXHR, test_status, str_error) {
                                    if (jqXHR.status == 603) {
                                        $(".msg").text("Credenziali Errate o Mancanti");
                                    }
                                    else
                                        printErrors(jqXHR, ".msg");
                                });
                                registratiRQ.done(function (data) {
                                    window.location.href = "login.html"
                                });
                            } else {
                                gestErrori("Inserire una Password valida", $("#pwdReg"));
                            }
                        } else {
                            gestErrori("Inserire uno Username", $("#usernameReg"));
                        }
                    } else {
                        gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telReg"));
                    }
                } else {
                    gestErrori("Inserire una Email valida", $("#mailReg"));
                }
            } else {
                gestErrori("Inserire una Data di Nascita valida", $("#dataNascitaReg"));
            }
        }else{
            gestErrori("Inserire il Cognome", $("#cognomeReg"));
        }
    }
    else {
        gestErrori("Inserire il Nome", $("#nomeReg"));
    }
}

function gestErrori(msg, controllo) {
    $(".msg").html(msg);
    controllo.addClass("alert-danger");
}

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