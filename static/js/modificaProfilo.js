"use strict";

// Routine Iniziale
$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        loadPagina();
    });
});

//Caricamento Pagina
function loadPagina() {
    setMinDate();
    document.getElementById("gestFotoModProfilo").selectedIndex = -1;
    $('#gestFotoModProfilo').selectpicker('refresh');
    $("#contFotoModProfilo").css("display", "none");
    $("#gestFotoModProfilo").on("change", gestFotoProfilo);
    //Recupero i dati del profilo utente
    let rqDatiProfilo = inviaRichiesta('/api/getDatiProfilo', 'POST', {});
    rqDatiProfilo.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModProfilo");
    });
    rqDatiProfilo.done(function (data) {
        caricaDatiProfilo(data);
    });
}

//Imposto come data di nascita massima 8 anni fa
function setMinDate() {
    let aus = new Date();
    aus.setDate = aus.getDate();
    aus.setFullYear(aus.getFullYear() - 8); //imposto come data di nascita massima 8 anni fa
    let data = aus.toISOString().split('T')[0];
    $("#dataNascitaModProfilo").attr("max", data);
}

//Caricamento dati profilo utente
//in form di modifica
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

//Converto la data dal formato MongoDB
//al formato accettato dall'input date (che usa - come separatore)
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

//Gestione Opzioni foto profilo
function gestFotoProfilo() {
    //Mostro il campo per il carimento della foto
    //solo se si è scelto di caricarne una nuova
    if ($("#gestFotoModProfilo").val() == "nuova") {
        $("#contFotoModProfilo").css("display", "unset");
    }else{
        $("#contFotoModProfilo").css("display", "none");
    }
}

//Gestione modifica Profilo Utente
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
    $("#msgModProfilo").text("").removeClass("alert alert-danger");

    //Controllo validità dati di input
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
                                            $("#msgModProfilo").text("Credenziali Errate o Mancanti").addClass("alert alert-danger");
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
                                gestErrori("Inserire uno Username", $("#usernameModProfilo"), "#msgModProfilo");
                            }
                        } else {
                            gestErrori("Il numero di Telefono deve contenere 10 numeri", $("#telModProfilo"), "#msgModProfilo");
                        }
                    } else {
                        gestErrori("Inserire una Email valida", $("#mailModProfilo"), "#msgModProfilo");
                    }
                } else {
                    gestErrori("Occorre avere almeno 8 anni", $("#dataNascitaModProfilo"), "#msgModProfilo");
                }
                
            } else {
                gestErrori("Inserire una Data di Nascita valida", $("#dataNascitaModProfilo"), "#msgModProfilo");
            }
        } else {
            gestErrori("Inserire il Cognome", $("#cognomeModProfilo"), "#msgModProfilo");
        }
    }
    else {
        gestErrori("Inserire il Nome", $("#nomeModProfilo"), "#msgModProfilo");
    }
}

//Funzione di stampa errori
function gestErrori(msg, controllo, target) {
    $(target).html(msg).addClass("alert alert-danger");
    controllo.addClass("alert-danger");
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

//Calcola la differenza tra la data attuale e quella in input
//e restituisce il valore in giorni
function chkEtaMinima(dataNascita) {
    let dataBase = new Date();
    let diffTime = Math.abs(dataBase - dataNascita);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}