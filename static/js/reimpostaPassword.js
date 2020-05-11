"use strict";
//Routine Principale
$(document).ready(function () {
    //Recupero parametri da query string
    let url = new URL(window.location.href);
    let token = url.searchParams.get("token");
    window.sessionStorage.setItem("token", token);
    $("#btnReimpPwd").click(gestPwd);
});

//Gestione Reimpostazione Password
function gestPwd() {
    //Pulizia campi di input
    $("#pwdReimpPwd").removeClass("alert-danger");
    $("#pwdReimpRipetiPwd").removeClass("alert-danger");
    $("#mexEmailReimpPwd").html("");

    //Controllo dati di input
    if (validaPwd($("#pwdReimpPwd").val())) {
        if (validaPwd($("#pwdReimpRipetiPwd").val())) {
            if ($("#pwdReimpPwd").val() == $("#pwdReimpRipetiPwd").val()) {
                let par = {
                    "password": $("#pwdReimpPwd").val(),
                    "ripetiPassword": $("#pwdReimpRipetiPwd").val(),
                    "token":window.sessionStorage.getItem("token")
                };
                //Invio richiesta reimpotazione password
                let reimpostaPwdRQ = inviaRichiesta('/api/reimpostaPwd', 'POST', par);
                reimpostaPwdRQ.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 603) {
                        $("#mexEmailReimpPwd").text("Credenziali Errate o Mancanti").addClass("alert alert-danger");
                    }
                    else {
                        printErrors(jqXHR, "#mexEmailReimpPwd");
                    }
                });
                reimpostaPwdRQ.done(function (data) {
                    if (data["tipo"] == "errore") {
                        $("#mexEmailReimpPwd").html(data["mes"]).addClass("alert alert-danger").show();
                    } else {
                        window.sessionStorage.removeItem("token");
                        window.location = "login.html";
                    }
                });
            }else{
                gestErrori("Le due Password non corrispondono", undefined, "#mexEmailReimpPwd");
            }
        } else {
            gestErrori("Inserire una Password valida", $("#pwdReimpRipetiPwd"), "#mexEmailReimpPwd");
        }
    } else {
        gestErrori("Inserire una Password valida", $("#pwdReimpPwd"), "#mexEmailReimpPwd");
    }
}


//Validazione Password tramite regex
function validaPwd(pwdReg) {
    let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    return re.test(pwdReg);
}