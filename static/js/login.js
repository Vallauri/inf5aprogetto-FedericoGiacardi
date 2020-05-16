"use strict";
//Routine Inziale
$(document).ready(function () {
    //Controllo del token: se non è valido l'utente non è autenticato, quindi creo la pagina
    //altrimenti indirizzo all'area personale
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR + " " + test_status + " " + str_error);
    });
    chkToken.done(function (data) {
        window.location.href = "areaPersonale.html"
    });

    //Gestione tentativo di login
    $("#btnLogin").on("click", function () {
        $("#usernameLogin").removeClass("alert-danger");
        $("#pwdLogin").removeClass("alert-danger");
        $("msgLogin").text("").removeClass("alert alert-danger");

        //Controllo campi di input
        if ($("#usernameLogin").val() != "") {
            if ($("#pwdLogin").val() != "") {
                let loginRQ = inviaRichiesta('/api/login', 'POST', { "username": $("#usernameLogin").val(), "password": $("#pwdLogin").val() });
                loginRQ.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 401) {
                        $("#msgLogin").text("Credenziali non Valide").addClass("alert alert-danger");
                    } else if (jqXHR.status == 603){ 
                        $("#msgLogin").text("Credenziali Errate o Mancanti").addClass("alert alert-danger");
                    }
                     else
                        printErrors(jqXHR, "#msgLogin");
                });
                loginRQ.done(function (data) {
                   window.location.href = "areaPersonale.html"
                });
            }else{
                gestErrori("Inserire la Password", $("#pwdLogin"), "#msgLogin");
            }
        }
        else{
            gestErrori("Inserire uno Username", $("#usernameLogin"), "#msgLogin");
        }
    });
});


function gestErrori(msg, controllo) {
    $("#msgLogin").html(msg).addClass("alert alert-danger");
    controllo.addClass("alert-danger");
}