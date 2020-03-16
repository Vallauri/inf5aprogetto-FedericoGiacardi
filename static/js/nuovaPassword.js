"use strict";
$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR + " " + test_status + " " + str_error);
    });
    chkToken.done(function (data) {
        window.location.href = "about.html"
    });
    $("#btnReimpPwd").click(gestReimpPwd);
    $("#mexEmailReimpPwd").hide();
});

function gestReimpPwd() {
    $("#usernameReimpPwd").removeClass("alert-danger");
    $("#mailReimpPwd").removeClass("alert-danger");
    $("#telReimpPwd").removeClass("alert-danger");
    // $("#pwdReimpPwd").removeClass("alert-danger");

    if ($("#usernameReimpPwd").val() != "") {
        if (validaEmail($("#mailReimpPwd").val())) {
            if (validaTelefono($("#telReimpPwd").val())) {
                let par = {
                    "email": $("#mailReimpPwd").val(),
                    "telefono": $("#telReimpPwd").val(),
                    "username": $("#usernameReimpPwd").val()
                    // "password": $("#pwdReimpPwd").val()
                };

                let reimpostaPwdRQ = inviaRichiesta('/api/invioMailReimpostaPwd', 'POST', par);
                reimpostaPwdRQ.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 603) {
                        $(".msg").text("Credenziali Errate o Mancanti");
                    }
                    else {
                        printErrors(jqXHR, ".msg");
                    }
                });
                reimpostaPwdRQ.done(function (data) {
                    if (data["tipo"] == "ok") {
                        $("#mexEmailReimpPwd").addClass("alert alert-success");
                    }else{
                        $("#mexEmailReimpPwd").addClass("alert alert-danger");
                    }
                    $("#mexEmailReimpPwd").html(data["mes"]).css("display","unset");
                });
                // if (validaPwd($("#pwdReimpPwd").val())) {
                    
                // } else {
                //     gestErrori("Inserire una Password valida", $("#pwdReimpPwd"));
                // }
            } else {
                gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telReimpPwd"));
            }
        } else {
            gestErrori("Inserire una Email valida", $("#mailReimpPwd"));
        }
    }
    else {
        gestErrori("Inserire uno Username", $("#usernameReimpPwd"));
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

function validaPwd(pwdReg) {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    return re.test(pwdReg);
}