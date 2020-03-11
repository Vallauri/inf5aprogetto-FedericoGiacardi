"use strict";
$(document).ready(function () {
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
                    } else
                        error(jqXHR, test_status, str_error)
                });
                loginRQ.done(function (data) {
                    window.location.href = "about.html"
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