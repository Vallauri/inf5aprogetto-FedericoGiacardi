$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        loadPagina();
    });
});

function loadPagina() {
    document.getElementById("gestFotoModProfilo").selectedIndex = -1;
    $('#gestFotoModProfilo').selectpicker('refresh');
    $("#contFotoModProfilo").css("display", "none");
    $("#gestFotoModProfilo").on("change", gestFotoProfilo);
    let rqDatiProfilo = inviaRichiesta('/api/getDatiProfilo', 'POST', {});
    rqDatiProfilo.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModProfilo");
    });
    rqDatiProfilo.done(function (data) {
        caricaDatiProfilo(data);
    });
}

function caricaDatiProfilo(utente) {
    $("#nomeModProfilo").val(utente.nome);
    $("#cognomeModProfilo").val(utente.cognome);
    $("#dataNascitaModProfilo").val(formattazioneData(new Date(utente.dataNascita).toDateString()));
    $("#mailModProfilo").val(utente.mail);
    $("#gestFotoModProfilo").val("attuale");
    $('#gestFotoModProfilo').selectpicker('refresh');
    $("#telModProfilo").val(utente.telefono);
    $("#usernameModProfilo").val(utente.user);
    $("#btnModProfilo").on("click", gestModifica);
}

function formattazioneData(data) {
    let d = new Date(data);
    let mese = '' + (d.getMonth() + 1);
    let giorno = '' + d.getDate();
    let anno = d.getFullYear();

    if (mese.length < 2)
        mese = '0' + mese;
    if (giorno.length < 2)
        giorno = '0' + giorno;

    return [anno, mese, giorno].join('-');
}

function gestFotoProfilo() {
    if ($("#gestFotoModProfilo").val() == "nuova") {
        $("#contFotoModProfilo").css("display", "unset");
    }else{
        $("#contFotoModProfilo").css("display", "none");
    }
}

function gestModifica() {
    let foto = "";
    let errore = false;

    $("#nomeModProfilo").removeClass("alert-danger");
    $("#cognomeModProfilo").removeClass("alert-danger");
    $("#dataNascitaModProfilo").removeClass("alert-danger");
    $("#mailModProfilo").removeClass("alert-danger");
    $("#gestFotoModProfilo").removeClass("alert-danger");
    $("#fotoModProfilo").removeClass("alert-danger");
    $("#telModProfilo").removeClass("alert-danger");
    $("#usernameModProfilo").removeClass("alert-danger");
    $("#msgModProfilo").text("");

    if ($("#nomeModProfilo").val() != "") {
        if ($("#cognomeModProfilo").val() != "") {
            if (Date.parse($("#dataNascitaModProfilo").val())) {
                if (chkEtaMinima(new Date($("#dataNascitaModProfilo").val())) >= 2920) {
                    if (validaEmail($("#mailModProfilo").val())) {
                        if (validaTelefono($("#telModProfilo").val())) {
                            if ($("#usernameModProfilo").val() != "") {
                                if (($("#gestFotoModProfilo").val() == "nuova") && ($('#fotoModProfilo').prop('files')[0] != "")) {
                                    foto = $('#fotoModProfilo').prop('files')[0];
                                    if ($('#fotoModProfilo').prop('files')[0].type.includes("image/")) {
                                        foto = $('#fotoModProfilo').prop('files')[0];
                                    } else {
                                        gestErrori("La foto inserita non è valida", $("#fotoModProfilo"));
                                        return;
                                    }
                                } else if ($("#gestFotoModProfilo").val() != "nuova"){
                                    if ($("#gestFotoModProfilo").val() == "nonImpostata")
                                        foto = "unset";
                                    else
                                        foto = "noChange"; 
                                }else {
                                    gestErrori("Devi selezionare una nuova foto profilo", $("#fotoModProfilo"));
                                    errore = true;
                                }

                                if (!errore) {
                                    let formData = new FormData();
                                    formData.append('nome', $("#nomeModProfilo").val());
                                    formData.append('cognome', $("#cognomeModProfilo").val());
                                    formData.append('dataNascita', $("#dataNascitaModProfilo").val());
                                    formData.append('telefono', $("#telModProfilo").val());
                                    formData.append('email', $("#mailModProfilo").val());
                                    formData.append('username', $("#usernameModProfilo").val());
                                    formData.append('foto', foto);

                                    let rqModProfilo = inviaRichiestaMultipart('/api/modificaProfilo', 'POST', formData);
                                    rqModProfilo.fail(function (jqXHR, test_status, str_error) {
                                        if (jqXHR.status == 603) {
                                            $("#msgModProfilo").text("Credenziali Errate o Mancanti");
                                        }
                                        else {
                                            printErrors(jqXHR, "#msgModProfilo");
                                        }
                                    });
                                    rqModProfilo.done(function (data) {
                                        window.location.href = "login.html"
                                    });
                                }
                            } else {
                                gestErrori("Inserire uno Username", $("#usernameModProfilo"));
                            }
                        } else {
                            gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telModProfilo"));
                        }
                    } else {
                        gestErrori("Inserire una Email valida", $("#mailModProfilo"));
                    }
                } else {
                    gestErrori("Occorre avere almeno 8 anni", $("#dataNascitaModProfilo"));
                }
                
            } else {
                gestErrori("Inserire una Data di Nascita valida", $("#dataNascitaModProfilo"));
            }
        } else {
            gestErrori("Inserire il Cognome", $("#cognomeModProfilo"));
        }
    }
    else {
        gestErrori("Inserire il Nome", $("#nomeModProfilo"));
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

function chkEtaMinima(dataNascita) {
    let dataBase = new Date('1/1/'+(new Date().getFullYear() - 8));
    let diffTime = Math.abs(dataNascita - dataBase);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}