"use strict";

$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.done(function (data) {
        window.location.href = "areaPersonale.html"
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
                if (chkEtaMinima(new Date($("#dataNascitaReg").val())) >= 2920) {
                    if (validaEmail($("#mailReg").val())) {
                        if (validaTelefono($("#telReg").val())) {
                            if ($("#usernameReg").val() != "") {
                                if (validaPwdReg($("#pwdReg").val())) {
                                    let formData = new FormData();
                                    formData.append('nome', $("#nomeReg").val());
                                    formData.append('cognome', $("#cognomeReg").val());
                                    formData.append('dataNascita', $("#dataNascitaReg").val());
                                    formData.append('telefono', $("#telReg").val());
                                    formData.append('email', $("#mailReg").val());
                                    formData.append('username', $("#usernameReg").val());
                                    formData.append('password', $("#pwdReg").val());

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
                                    let registratiRQ = inviaRichiestaMultipart('/api/registrati', 'POST', formData);
                                    registratiRQ.fail(function (jqXHR, test_status, str_error) {
                                        if (jqXHR.status == 603) {
                                            $(".msg").text("Credenziali Errate o Mancanti");
                                        }
                                        else {
                                            printErrors(jqXHR, ".msg");
                                        }
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
                    gestErrori("Occorre avere almeno 8 anni", $("#dataNascitaReg"));
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

function chkEtaMinima(dataNascita) {
    let dataBase = new Date();
    let diffTime = Math.abs(dataBase - dataNascita);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}