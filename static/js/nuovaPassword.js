"use strict";

/*In questa pagina l'utente intenzionato a reimpostare la password immette tre informazioni riconducibili al suo account*/
/*Ricevento una mail con un token valido per 30 minuti per completare la reimpostazione */

//Routine principale
$(document).ready(function () {
    //Controllo validità token autenticazione: se è già loggato lo indirizzo alla dashboard utente
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR + " " + test_status + " " + str_error);
    });
    chkToken.done(function (data) {
        window.location.href = "areaPersonale.html"
    });
    $("#btnReimpPwd").click(gestReimpPwd);
    $("#mexEmailReimpPwd").hide();
});

//Gestione reimpostazione Password
function gestReimpPwd() {
    //Pulizia campi di inpur
    $("#usernameReimpPwd").removeClass("alert-danger");
    $("#mailReimpPwd").removeClass("alert-danger");
    $("#telReimpPwd").removeClass("alert-danger");
    $("#mexEmailReimpPwd").html("");

    //Controllo campi di input
    if ($("#usernameReimpPwd").val() != "") {
        if (validaEmail($("#mailReimpPwd").val())) {
            if (validaTelefono($("#telReimpPwd").val())) {
                let par = {
                    "email": $("#mailReimpPwd").val(),
                    "telefono": $("#telReimpPwd").val(),
                    "username": $("#usernameReimpPwd").val()
                };

                //Invio richiesta reimpostazione passoword
                let reimpostaPwdRQ = inviaRichiesta('/api/invioMailReimpostaPwd', 'POST', par);
                reimpostaPwdRQ.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 603) {
                        $("#mexEmailReimpPwd").text("Credenziali Errate o Mancanti").addClass("alert alert-danger");
                    }
                    else {
                        printErrors(jqXHR, "#mexEmailReimpPwd");
                    }
                });
                reimpostaPwdRQ.done(function (data) {
                    if (data["tipo"] == "ok") {
                        $("#mexEmailReimpPwd").addClass("alert alert-success");
                    }else{
                        $("#mexEmailReimpPwd").addClass("alert alert-danger");
                    }
                    $("#mexEmailReimpPwd").html(data["mes"]).show();
                });
            } else {
                gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telReimpPwd"), "#mexEmailReimpPwd");
            }
        } else {
            gestErrori("Inserire una Email valida", $("#mailReimpPwd"), "#mexEmailReimpPwd");
        }
    }
    else {
        gestErrori("Inserire uno Username", $("#usernameReimpPwd"), "#mexEmailReimpPwd");
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
function validaPwd(pwdReg) {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    return re.test(pwdReg);
}