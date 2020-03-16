"use strict";
$(document).ready(function () {
    let url = new URL(window.location.href);
    let token = url.searchParams.get("token");
    window.sessionStorage.setItem("token", token);
    $("#btnReimpPwd").click(gestPwd);
});

function gestPwd() {
    $("#pwdReimpPwd").removeClass("alert-danger");
    $("#pwdReimpRipetiPwd").removeClass("alert-danger");

    if (validaPwd($("#pwdReimpPwd").val())) {
        if (validaPwd($("#pwdReimpRipetiPwd").val())) {
            if ($("#pwdReimpPwd").val() == $("#pwdReimpRipetiPwd").val()) {
                let par = {
                    "password": $("#pwdReimpPwd").val(),
                    "ripetiPassword": $("#pwdReimpRipetiPwd").val(),
                    "token":window.sessionStorage.getItem("token")
                };

                let reimpostaPwdRQ = inviaRichiesta('/api/reimpostaPwd', 'POST', par);
                reimpostaPwdRQ.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 603) {
                        $(".msg").text("Credenziali Errate o Mancanti");
                    }
                    else {
                        printErrors(jqXHR, ".msg");
                    }
                });
                reimpostaPwdRQ.done(function (data) {
                    if (data["tipo"] == "errore") {
                        $("#mexEmailReimpPwd").html(data["mes"]).addClass("alert alert-danger").css("display", "unset");
                    } else {
                        window.sessionStorage.removeItem("token");
                        window.location = "login.html";
                    }
                });
            }else{
                gestErrori("Le due Password non corrispondono");
            }
        } else {
            gestErrori("Inserire una Password valida", $("#pwdReimpRipetiPwd"));
        }
    } else {
        gestErrori("Inserire una Password valida", $("#pwdReimpPwd"));
    }
}

function validaPwd(pwdReg) {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    return re.test(pwdReg);
}

function gestErrori(msg, controllo) {
    $(".msg").html(msg);
    if (controllo != undefined) {
        controllo.addClass("alert-danger");
    }
}