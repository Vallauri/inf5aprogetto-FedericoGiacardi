$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        if (!data.amministratore) {
            window.location.href = "areaPersonale.html";
        } else {
            loadPagina();
        }
    });
});

function loadPagina() {
    $("#sezRegMod").css("visibility", "visible");
    setMinDate();
    $("#btnInviaRegMod").on("click", validaDatiRegistrazione);
}

function setMinDate() {
    let aus = new Date();
    aus.setDate = aus.getDate();
    aus.setFullYear(aus.getFullYear() - 18); //imposto come data di nascita massima 18 anni fa
    let data = aus.toISOString().split('T')[0];
    $("#dataNascitaRegMod").attr("max", data);
}

function validaDatiRegistrazione() {
    $("#nomeRegMod").removeClass("alert-danger");
    $("#cognomeRegMod").removeClass("alert-danger");
    $("#dataNascitaRegMod").removeClass("alert-danger");
    $("#mailRegMod").removeClass("alert-danger");
    $("#telRegMod").removeClass("alert-danger");
    $("#usernameRegMod").removeClass("alert-danger");
    $("#pwdRegMod").removeClass("alert-danger");
    $("#msgRegMod").text("");

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
                                            $("#msgRegMod").text("Credenziali Errate o Mancanti");
                                        }
                                        else {
                                            printErrors(jqXHR, "#msgRegMod");
                                        }
                                    });
                                    registratiRQ.done(function (data) {
                                        $("#msgRegMod").html("Registrazione completata con successo").addClass("alert alert-success");
                                    });
                                    
                                } else {
                                    gestErrori("Inserire una Password valida", $("#pwdRegMod"));
                                }
                            } else {
                                gestErrori("Inserire uno Username", $("#usernameRegMod"));
                            }
                        } else {
                            gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telRegMod"));
                        }
                    } else {
                        gestErrori("Inserire una Email valida", $("#mailRegMod"));
                    }
                } else {
                    gestErrori("Occorre avere almeno 18 anni", $("#dataNascitaRegMod"));
                }

            } else {
                gestErrori("Inserire una Data di Nascita valida", $("#dataNascitaRegMod"));
            }
        } else {
            gestErrori("Inserire il Cognome", $("#cognomeRegMod"));
        }
    }
    else {
        gestErrori("Inserire il Nome", $("#nomeRegMod"));
    }
}

function gestErrori(msg, controllo) {
    $("#msgRegMod").html(msg);
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); //numero di giorni di differenza tra le due date
}