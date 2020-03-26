"use strict";
$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR + " " + test_status + " " + str_error);
    });
    chkToken.done(function (data) {
        window.location.href = "areaPersonale.html"
    });

    $("#btnLogin").on("click", function () {
        $("#usernameLogin").removeClass("alert-danger");
        $("#pwdLogin").removeClass("alert-danger");
        $(".msg").text("");

        if ($("#usernameLogin").val() != "") {
            if ($("#pwdLogin").val() != "") {
                let loginRQ = inviaRichiesta('/api/login', 'POST', { "username": $("#usernameLogin").val(), "password": $("#pwdLogin").val() });
                loginRQ.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 401) { // unauthorized
                        $(".msg").text("Credenziali non Valide");
                    } else if (jqXHR.status == 603){
                        $(".msg").text("Credenziali Errate o Mancanti");
                    }
                     else
                        printErrors(jqXHR, ".msg");
                });
                loginRQ.done(function (data) {
                   window.location.href = "areaPersonale.html"
                });
            }else{
                gestErrori("Inserire la Password", $("#pwdLogin"));
            }
        }
        else{
            gestErrori("Inserire uno Username", $("#usernameLogin"));
        }
    });
});

function gestErrori(msg, controllo) {
    $(".msg").html(msg);
    controllo.addClass("alert-danger");
}