"use strict";
let lezioni = [];
let scaduto = false;

// Routine Principale
$(document).ready(function () {
    loadPagina();
});

// Caricamento Pagina
function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET
    if (par[0] == "corso" && !isNaN(parseInt(par[1]))) {
        let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', { "idCorso": par[1] });
        chkToken.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, "#msgDetCorso");
        });
        chkToken.done(function (data) {
            caricamentoDatiCorso(data);
            chkModeratore(parseInt(par[1]));
        });
    }
    else {
        $("#msgDetCorso").text("Errore nel passaggio dei parametri").addClass("alert alert-danger");
        //window.location.href = "corsi.html";
    }
}

// Funzione che carica i dati del corso dinamicamente
function caricamentoDatiCorso(modulo) {
    $("#contCorso").html("");
    let codHtml = "";

    if (modulo == undefined || modulo.length == 0) {
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 col-xs-12 col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Il corso richiesto non è disponibile</h2>';
        codHtml += '<p><a href="corsi.html">Torna ai corsi</a></p>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contCorso").parent().html(codHtml);
    }
    else {
        codHtml += '<div class="col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xl-8 course_details_left">';
        codHtml += '<div class="content_wrapper">';
        codHtml += '<h4 class="title_top" style="text-align:center;" id="descCorso" idCorso="' + modulo[0]._id + '">' + modulo[0]["descrizione"] + '</h4>';
        codHtml += '<h4 class="title">Argomenti del Corso</h4>';
        codHtml += '<div class="content">';
        codHtml += '<ul class="course_list">';

        if (modulo[0]["argomentiModulo"] != undefined && modulo[0]["argomentiModulo"].length > 0) {
            modulo[0]["argomentiModulo"].forEach(argomento => {
                codHtml += '<li class="justify-content-between align-items-center d-flex">';
                codHtml += '<p>' + argomento.descrizione + '</p>';
                codHtml += '</li>';
            });
        }
        else {
            codHtml += '<li class="justify-content-between align-items-center d-flex">';
            codHtml += '<p>Al momento non ci sono ancora degli argomenti relativi al corso</p>';
            codHtml += '</li>';
        }

        codHtml += '</ul>';
        codHtml += '</div>';

        lezioni = modulo[0];

        codHtml += '</div >';
        codHtml += '</div >';

        codHtml += '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 right-contents">';
        codHtml += '<div class="sidebar_top">';
        codHtml += '<ul>';
        codHtml += '<li>';
        codHtml += '<a class="justify-content-between d-flex" href="#">';
        codHtml += '<p>Autore del Corso</p>';
        codHtml += '<span class="color">' + modulo[0]["autore"][0].cognome + ' ' + modulo[0]["autore"][0].nome + '</span>';
        codHtml += '</a>';
        codHtml += '</li>';
        codHtml += '<li>';
        codHtml += '<a class="justify-content-between d-flex" href="#">';
        codHtml += '<p>Tipo di Corso</p>';
        codHtml += '<span class="color">' + modulo[0]["tipoModulo"][0].descrizione + '</span>';
        codHtml += '</a>';
        codHtml += '</li>';
        codHtml += '<li>';
        codHtml += '<a class="justify-content-between d-flex" href="#">';
        codHtml += '<p>Materia</p>';
        codHtml += '<span class="color">' + modulo[0]["materia"][0].descrizione + '</span>';
        codHtml += '</a>';
        codHtml += '</li>';
        codHtml += '</ul>';
        if (modulo[0]["dataScadenza"] != undefined && modulo[0]["dataScadenza"] != null && new Date() <= new Date(modulo[0]["dataScadenza"])) {
            codHtml += '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">';
            codHtml += '<button id="btnIscrivitiCorso" class="genric-btn success radius">Iscriviti al Corso</button>';
            codHtml += '</div>';

            let chkToken = inviaRichiesta('/api/elGruppiAdmin', 'POST', {});
            chkToken.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgDetCorso");
            });
            chkToken.done(function (data) {
                if (data.length > 0) {
                    codHtml += '<div style="margin-top:5px" class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-center">';
                    codHtml += '<button id="btnIscriviGruppoCorso" data-toggle="modal" data-target="#dettCorsoMod" class="genric-btn success radius">Iscrivi un tuo Gruppo al Corso</button>';
                    codHtml += '</div>';
                }
                codHtml += '</div>';
                codHtml += '</div>';

                $("#contCorso").html(codHtml);

                $("#btnIscrivitiCorso").on("click", function () {
                    let chkToken = inviaRichiesta('/api/iscriviUtenteCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        if (jqXHR.status == 611)  // utente già presente in corso
                            $("#msgDetCorso").text(JSON.parse(jqXHR.responseText)["message"]).addClass("alert alert-danger");
                        else
                            printErrors(jqXHR, "#msgDetCorso");
                    });
                    chkToken.done(function (data) {
                        if (data == "iscUtOk") {
                            $("#msgDetCorso").text("Iscrizione al corso effettuata correttamente!").removeClass("alert alert-danger").addClass("alert alert-success"); // cambiare con modal
                            loadPagina(); // vedere se va bene
                        }
                        else
                            $("#msgDetCorso").text("Si è verificato un errore durante l'iscrizione al corso").addClass("alert alert-danger");
                    });
                });

                if (data.length > 0) {
                    $("#btnIscriviGruppoCorso").on("click", function () {
                        $("#dettCorsoMod .modal-title").html("Iscrizione Gruppo");
                        $("#dettCorsoMod .modal-body").children().remove();
                        $("#btnSalvaModifiche").show().html("Aggiungi");

                        let chkToken = inviaRichiesta('/api/elGruppiIscrivibiliCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
                        chkToken.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, "#msgModalCorso");
                        });
                        chkToken.done(function (gruppi) {
                            if (gruppi.length > 0) {
                                let cod = '<div class="row">';
                                cod += '<div class="col-lg-12 text-center container">';
                                cod += '<div class="form-select row" id="default-select">';
                                cod += '<form>'
                                cod += '<div class="form-group row">';
                                cod += '<label for="iscriviGruppo" class="col-sm-6 col-form-label">Scegli il Gruppo da Iscrivere</label>';
                                cod += '<div class="col-sm-6">';
                                cod += '<select name="iscriviGruppo" id="iscriviGruppo" title="Scegli il Gruppo" data-live-search="true" data-live-search-placeholder="Cerca Gruppo">';
                                data.forEach(gruppo => {
                                    cod += "<option value='" + gruppo._id + "'>" + gruppo.nome + "</option>";
                                });
                                cod += '</select>';
                                cod += '</div>';
                                cod += '</div>';
                                cod += '</form>'
                                cod += '</div>';
                                cod += '</div>';

                                $("#dettCorsoMod .modal-body").append(cod);
                                $('#iscriviGruppo').selectpicker('refresh');

                                $("#btnSalvaModifiche").on("click", function () {
                                    if ($(this).html() == "Aggiungi") {
                                        let chkToken = inviaRichiesta('/api/iscriviGruppoCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idGruppo": $("#iscriviGruppo option:selected").val() });
                                        chkToken.fail(function (jqXHR, test_status, str_error) {
                                            printErrors(jqXHR, "#msgModalCorso");
                                        });
                                        chkToken.done(function (data) {
                                            if (data == "iscGrpOk") {
                                                $("#msgDetCorso").text("Iscrizione del gruppo al corso effettuata correttamente!").removeClass("alert alert-danger").addClass("alert alert-success");
                                                $("#dettCorsoMod").modal('hide');
                                                loadPagina();
                                            }
                                            else
                                                $("#msgModalCorso").text("Si è verificato un errore durante l'iscrizione al corso").addClass("alert alert-danger");
                                        });
                                    }
                                });
                            }
                            else {
                                // non ci sono gruppi iscrivibili
                                $("#dettCorsoMod .modal-body").append("<p>Non ci sono gruppi che possono essere iscritti a questo corso</p>");
                                $("#btnSalvaModifiche").hide();
                            }
                        });
                    });
                }
            });
        }
        else {
            scaduto = true;
            codHtml += '</div>';
            codHtml += '</div>';
            $("#contCorso").html(codHtml);
        }
    }
}

// Carcamento Combobox Appunti per Inserimento Lezione
function loadAppunti() {
    let elArgomenti = inviaRichiesta('/api/elencoAppuntiAddLez', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgInsNewLez");
    });
    elArgomenti.done(function (data) {
        let codHtml = '';
        data.forEach(appunto => {
            codHtml += '<option value="' + appunto._id + '">' + appunto.descrizione + '</option>';
        });
        $("#appuntiLezione").html(codHtml);
        document.getElementById("appuntiLezione").selectedIndex = -1;
        $('#appuntiLezione').selectpicker('refresh');
    });
}

// Controllo privilegi utente
function chkModeratore(idCorso) {
    // Solo se utente loggato = moderatore gruppo
    let chkToken = inviaRichiesta('/api/chkModCorso', 'POST', { "idCorso": idCorso });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgDetCorso");
    });
    chkToken.done(function (data) {
        if (data.ris == "autore") {
            aggiungiDettagliIscritto();

            let codHtml = "";
            codHtml += '<div class="sidebar_top">';
            codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
            codHtml += '<h4>Gestione Corso</h4>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnAddArgomento">Aggiungi Argomento</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnAddLezione">Aggiungi Lezione</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnModCorso">Modifica Corso</button>';
            codHtml += '<button class="genric-btn danger radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnRemCorso">Elimina Corso</button>';
            codHtml += '</div>';
            codHtml += '</div>';
            $(".right-contents").append(codHtml);
            $("#btnIscrivitiCorso").hide();

            codHtml = "";
            codHtml += '<div class="container-fluid">';
            codHtml += '<div class="section_tittle text-center">';
            codHtml += '<h2>Inserimento Lezione</h2>';
            codHtml += '</div>';
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-9 col-md-5 col-lg-5 mx-auto">';
            codHtml += '<div class="card card-signin my-5">';
            codHtml += '<div class="card-body">';
            codHtml += '<form id="formInsLezione" class="form-contact">';
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-6 col-md-7 col-lg-6 mx-auto">';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<span class="input-group-text">';
            codHtml += '<i class="fas fa-tag"> </i>';
            codHtml += '</span>';
            codHtml += '<input type="text" id="titoloLez" name="titoloLez" placeholder="Titolo"';
            codHtml += 'onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');"';
            codHtml += 'onblur="this.placeholder = \'Titolo\'" required class="single-input">';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<span class="input-group-text">';
            codHtml += '<i class="fa fa-calendar" aria-hidden="true"></i>';
            codHtml += '</span>';
            codHtml += '<input type="date" id="dataScadLez" name="dataScadLez"';
            codHtml += 'placeholder="Data Scadenza"';
            codHtml += 'onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');"';
            codHtml += 'onblur="this.placeholder = \'Data Scadenza\'" class="single-input">';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<span class="input-group-text">';
            codHtml += '<i class="fas fa-list"> </i>';
            codHtml += '</span>';
            codHtml += '<div>';
            codHtml += '<select id="appuntiLezione" multiple required';
            codHtml += 'title="Scegli gli appunti" data-live-search="true"';
            codHtml += 'data-live-search-placeholder="Cerca appunti" multiple="true"';
            codHtml += 'data-multiple-separator=", ">';
            codHtml += '</select>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-12 col-md-7 col-lg-7 mx-auto">';
            codHtml += '<div id="msgInsNewLez" role="alert" style="text-align: center;"> </div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-6 col-md-12 col-lg-6 mx-auto">';
            codHtml += '<div class="form-group">';
            codHtml += '<a id="btnInviaLezione" class="genric-btn primary circle btn-block"><i';
            codHtml += 'class="fas fa-plus"></i> Invia</a>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</form>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            $("#sezInsLez").append(codHtml);

            loadAppunti();

            $("#btnInviaLezione").on("click", function () {
                $("#titoloLez").removeClass("alert-danger");
                $("#dataScadLez").removeClass("alert-danger");
                $("#appuntiLezione").removeClass("alert-danger");
                $("#msgInsNewLez").removeClass("alert alert-danger").text("");

                //Controllo dati di input
                if ($("#titoloLez").val() != "") {
                    if ($("#dataScadLez").val() != "") {
                        if (new Date($("#dataScadLez").val()) > new Date()) {
                            if (document.getElementById("appuntiLezione").selectedIndex != -1) {
                                let formData = {
                                    'idCorso': idCorso,
                                    'titolo': $("#titoloLez").val(),
                                    'dataScadenza': $("#dataScadLez").val(),
                                    'appuntiLezione': $("#appuntiLezione").val()
                                };

                                let aggLez = inviaRichiesta('/api/inserisciNuovaLez', 'POST', formData);
                                aggLez.fail(function (jqXHR, test_status, str_error) {
                                    if (jqXHR.status == 603) {
                                        $("#msgInsNewLez").text("Parametri Errati o Mancanti").addClass("alert alert-danger");
                                    }
                                    else {
                                        printErrors(jqXHR, "#msgInsNewLez");
                                    }
                                });
                                aggLez.done(function (data) {
                                    if (data == "aggLezInsCorsoOk") {
                                        $("#msgDetCorso").text("Lezione aggiunta con successo").removeClass("alert alert-danger").addClass("alert alert-success");
                                        loadPagina();
                                    }
                                    else
                                        $("#msgInsNewLez").text("Errore durante l'aggiunta della lezione").addClass("alert alert-danger");
                                });
                            } else {
                                gestErrori("Selezionare almeno un appunto", $("#appuntiLezione"), "#msgInsNewLez");
                            }
                        } else {
                            gestErrori("La Data di Scadenza della Lezione deve essere successiva a quella odierna", $("#dataScadLez"), "#msgInsNewLez");
                        }
                    } else {
                        gestErrori("Devi inserire la Data di Scadenza della Lezione", $("#dataScadLez"), "#msgInsNewLez");
                    }
                } else {
                    gestErrori("Inserire il Titolo della Lezione", $("#titoloLez"), "#msgInsNewLez");
                }
            });

            $("#btnSalvaModifiche").on("click", function () {
                if ($(this).html() == "Salva Modifiche") {
                    if (chkCorrettezzaDati()) {
                        let chkToken = inviaRichiesta('/api/modificaCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "nome": $("#nome").val().trim(), /*"descrizione": $("#descrizione").val().trim(),*/ "dataScadenza": $("#dataScadenza").val(), "tipoCorso": $("#tipiCorsi option:selected").val(), "materia": $("#materie option:selected").val() });
                        chkToken.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, "#msgModCorso");
                        });
                        chkToken.done(function (data) {
                            if (data == "modCorsoOk") {
                                $("#msgDetCorso").text("Modifica del corso effettuata correttamente!").removeClass("alert alert-danger").addClass("alert alert-success");
                                loadPagina();
                            }
                            else
                                $("#msgModCorso").text("Si è verificato un errore durante l'aggiornamento dei dati. Riprovare").addClass("alert alert-danger");
                        });
                    }
                }
                else if ($(this).html() == "Conferma Rimozione") {
                    let chkToken = inviaRichiesta('/api/rimuoviCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        printErrors(jqXHR, "#msgRemCorso");
                    });
                    chkToken.done(function (data) {
                        if (data == "rimCorsoOk")
                            window.location.href = "corsi.html";
                        else
                            $("#msgRemCorso").text("Si è verificato un errore durante la rimozione del corso. Riprovare").addClass("alert alert-danger");
                    });
                }
            });

            $("#btnAddArgomento").on("click", function () {
                $("#dettCorsoMod .modal-title").html("Aggiunta Argomento al Corso");
                $("#dettCorsoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").hide();

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
                cod += '<label for="txtRicerca">Cerca Argomento:</label>';
                cod += '</div>';
                cod += '<div class="col-lg-11 text-center">';
                cod += '<div class="row">';
                cod += '<div class="col-lg-10">';
                cod += '<input type="text" class="form-control" name="txtRicerca" id="txtRicerca" placeholder="Digita qui la tua ricerca...">';
                cod += '</div>';
                cod += '<div class="col-lg-2">';
                cod += '<button class="genric-btn success circle" id="btnRicerca"><i class="fa fa-search" aria-hidden="true"></i></button>';
                cod += '</div>';
                cod += '</div>';
                cod += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgCercaArg" role="alert" style="text-align: center;"></div></div></div>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettCorsoMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $("#msgCercaArg").text("").removeClass("alert alert-dialog");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaArgAggiuntaCorso', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, "#msgCercaArg");
                        });
                        ricerca.done(function (data) {
                            dettArgomento(data);
                        });
                    }
                    else {
                        $("#msgCercaArg").text("Inserire un valore per la ricerca").addClass("alert alert-dialog");
                        $("#txtRicerca").focus();
                    }
                });

                $('#txtRicerca').autocomplete({
                    source: function (req, res) {
                        $.ajax({
                            url: "/api/cercaArgAggiuntaCorso",
                            dataType: "json",
                            type: "POST",
                            data: {
                                valore: req.term
                            },
                            success: function (data) {
                                dettArgomento(data);
                            },
                            error: function (xhr) {
                                alert(xhr.status + ' : ' + xhr.statusText);
                            }
                        });
                    },
                    select: function (event, ui) {

                    }
                });
            });

            $("#btnAddLezione").on("click", function () {
                $("#dettCorsoMod .modal-title").html("Aggiunta Lezione al Corso");
                $("#dettCorsoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").hide();

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
                cod += '<label for="txtRicerca">Cerca Lezione:</label>';
                cod += '</div>';
                cod += '<div class="col-lg-11 text-center">';
                cod += '<div class="row">';
                cod += '<div class="col-lg-10">';
                cod += '<input type="text" class="form-control" name="txtRicerca" id="txtRicerca" placeholder="Digita qui la tua ricerca...">';
                cod += '</div>';
                cod += '<div class="col-lg-2">';
                cod += '<button class="genric-btn success circle" id="btnRicerca"><i class="fa fa-search" aria-hidden="true"></i></button>';
                cod += '</div>';
                cod += '</div>';
                cod += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgCercaLez" role="alert" style="text-align: center;"></div></div></div>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettCorsoMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $("#msgCercaLez").text("").removeClass("alert alert-danger");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaLezAggiuntaCorso', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, "#msgCercaLez");
                        });
                        ricerca.done(function (data) {
                            dettLezione(data);
                        });
                    }
                    else {
                        $("#msgCercaLez").text("Inserire un valore per la ricerca").addClass("alert alert-danger");
                        $("#txtRicerca").focus();
                    }
                });

                $('#txtRicerca').autocomplete({
                    source: function (req, res) {
                        $.ajax({
                            url: "/api/cercaLezAggiuntaCorso",
                            dataType: "json",
                            type: "POST",
                            data: {
                                valore: req.term
                            },
                            success: function (data) {
                                dettLezione(data);
                            },
                            error: function (xhr) {
                                alert(xhr.status + ' : ' + xhr.statusText);
                            }
                        });
                    },
                    select: function (event, ui) {

                    }
                });
            });

            $("#btnModCorso").on("click", function () {
                $("#dettCorsoMod .modal-title").html("Modifica del Corso");
                $("#dettCorsoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Salva Modifiche");

                let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
                chkToken.fail(function (jqXHR, test_status, str_error) {
                    printErrors(jqXHR, "#msgModCorso");
                });
                chkToken.done(function (data) {
                    modificaCorso(data);
                });
            });

            $("#btnRemCorso").on("click", function () {
                $("#dettCorsoMod .modal-title").html("Rimozione del Corso");
                $("#dettCorsoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Conferma Rimozione");

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
                cod += '<p>Sei sicuro di voler rimuovere il corso? Tutti i dati ad esso collegati verranno rimossi</p>';
                cod += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgRemCorso" role="alert" style="text-align: center;"></div></div></div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettCorsoMod .modal-body").append(cod);
            });

        }
        else if (data.ris == "iscritto") {
            $("#btnIscrivitiCorso").hide();
            //$("#btnIscriviGruppoCorso").hide(); // da controllare il caso in cui un'utente è iscritto ed è mod di un gruppo (bisogna dargli la possibilità di iscrivere il gruppo)

            aggiungiDettagliIscritto();
        }
        lezioni = [];
    });
}

// Pulizia Campi di input per inserimento lezione
function clearInputFields() {
    $("#titoloLez").val("");
    $("#dataScadLez").val("");
    document.getElementById("appuntiLezione").selectedIndex = -1;
    $('#appuntiLezione').selectpicker('refresh');
}

// Funzione per aggiunta dati se utente è iscitto o autore
function aggiungiDettagliIscritto() {
    // Aggiunta lezioni
    let codHtml = "";
    codHtml += '<h4 class="title">Lezioni del Corso</h4>';
    codHtml += '<div class="content">';
    codHtml += '<ul class="course_list">';

    if (lezioni["lezioniModulo"] != undefined && lezioni["lezioniModulo"].length > 0) {
        for (let i = 0; i < lezioni["lezioniModulo"].length; i++) {
            codHtml += '<li class="justify-content-between align-items-center d-flex">';
            codHtml += '<p>' + lezioni["lezioniModulo"][i].titolo + '</p>';
            codHtml += '<p>Data aggiunta: ' + new Date(lezioni["lezioni"][i].dataAggiunta).toLocaleDateString() + '</p>';
            codHtml += '<a class="btn_2 text-uppercase" href="dettaglioLezione.html?lezione=' + lezioni["lezioniModulo"][i]._id + '&corso=' + lezioni._id + '">Visualizza Dettaglio</a>'; // vedere se metterlo o no il dettaglio della lezione
            codHtml += '</li>';
        }
    }
    else {
        codHtml += '<li class="justify-content-between align-items-center d-flex">';
        codHtml += '<p>Al momento non ci sono ancora delle lezioni relative al corso</p>';
        codHtml += '</li>';
    }

    codHtml += '</ul>';
    codHtml += '</div>';

    $(".course_details_left").append(codHtml);

    // Aggiunta Button Esami
    codHtml = "";
    codHtml += '<div class="sidebar_top">';
    codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
    codHtml += '<button class="genric-btn success radius" style="margin:2px;" id="btnVisEsami">Visualizza Esami</button>';
    codHtml += '</div>';
    codHtml += '</div>';
    $(".right-contents").append(codHtml);
    $("#btnVisEsami").on("click", function () {
        window.location.href = "esami.html?corso=" + $("#descCorso").attr("idCorso");
    });
}

// Funzione per visualizzazione dati argomenti in aggiunta argomenti a corso
function dettArgomento(argomenti) {
    let codHtml = "";
    $("#msgCercaArg").html("").removeClass("alert alert-danger");
    $("#risultato").remove();

    if (argomenti.length > 0) {
        codHtml += '<div class="row" id="risultato">';
        codHtml += '<table class="table">';
        codHtml += "<tr>";
        codHtml += '<th>Descrizione</th>';
        codHtml += '<th>Azione</th>';
        codHtml += '</tr>';

        argomenti.forEach(argomento => {
            codHtml += '<tr id="riga_' + argomento._id + '">';
            codHtml += '<td>' + argomento.descrizione + '</td>';
            codHtml += '<td><button class="genric-btn success circle" onclick="addArgCorso(' + argomento._id + ')"><i class="fa fa-plus" aria-hidden="true"></i></button></td>';
            codHtml += '</tr>';
        });

        codHtml += '</table>';
        codHtml += '</div>';
    }
    else {
        $("#msgCercaArg").text("Nessun argomento trovato").addClass("alert alert-danger");
        $("#risultato").remove();
    }

    $("#dettCorsoMod .modal-body").append(codHtml);
}

// Funzione per aggiunta argomento a corso
function addArgCorso(idArg) {
    $("#msgCercaArg").text("").removeClass("alert alert-danger");

    let chkToken = inviaRichiesta('/api/insNuovoArgCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idArg": idArg });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 612)  // argomento già presente in corso
            $("#msgCercaArg").show().text(JSON.parse(jqXHR.responseText)["message"]).addClass("alert alert-danger");
        else
            printErrors(jqXHR, "#msgCercaArg");
    });
    chkToken.done(function (data) {
        if (data == "insArgCorsoOk")
            window.location.reload();
        else
            $("#msgCercaArg").text("Si è verificato un errore durante l'aggiunta dell'argomento al corso").addClass("alert alert-danger");
    });
}

// Funzione per visualizzazione dati lezioni in aggiunta lezioni a corso
function dettLezione(lezioni) {
    let codHtml = "";
    $("#msgCercaLez").html("").removeClass("alert alert-danger");
    $("#risultato").remove();

    if (lezioni.length > 0) {
        codHtml += '<div class="row" id="risultato">';
        codHtml += '<table class="table">';
        codHtml += "<tr>";
        codHtml += '<th>Titolo</th>';
        codHtml += '<th>Azione</th>';
        codHtml += '</tr>';

        lezioni.forEach(lezione => {
            codHtml += '<tr id="riga_' + lezione._id + '">';
            codHtml += '<td>' + lezione.titolo + '</td>';
            codHtml += '<td><button class="genric-btn success circle" onclick="addLezCorso(' + lezione._id + ')"><i class="fa fa-plus" aria-hidden="true"></i></button></td>';
            codHtml += '</tr>';
        });

        codHtml += '</table>';
        codHtml += '</div>';
    }
    else {
        $("#msgCercaLez").text("Nessuna lezione trovata").addClass("alert alert-danger");
        $("#risultato").remove();
    }

    $("#dettCorsoMod .modal-body").append(codHtml);
}

// Funzione per aggiunta lezione a corso
function addLezCorso(idLez) {
    $("#msgCercaLez").text("").removeClass("alert alert-danger");

    let chkToken = inviaRichiesta('/api/insNuovaLezCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idLez": idLez });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 613)  // lezione già presente in corso
            $("#msgCercaLez").show().text(JSON.parse(jqXHR.responseText)["message"]).addClass("alert alert-danger");
        else
            printErrors(jqXHR, "#msgCercaLez");
    });
    chkToken.done(function (data) {
        if (data == "insLezCorsoOk")
            window.location.reload();
        else
            $("#msgCercaLez").text("Si è verificato un errore durante l'aggiunta della lezione al corso").addClass("alert alert-danger");
    });
}

// Funzione per l'adattamento della data per campo input date
function parsificaData(data) {
    let d = new Date(data).toLocaleDateString().split('/');
    let aus = d[0];
    d[0] = d[2];
    d[2] = aus;
    if (parseInt(d[1]) < 10)
        d[1] = "0" + d[1];
    if (parseInt(d[2]) < 10)
        d[2] = "0" + d[2];
    return d.join('-');
}

// Funzione per gestione modifica del corso
function modificaCorso(dettCorso) {
    let codHtml = "";
    codHtml += '<div class="row">';
    codHtml += '<div class="col-sm-8 col-md-8 col-lg-8 mx-auto text-center container">';
    codHtml += '<h4>Dettagli del Corso</h4>';
    codHtml += '<form>';
    codHtml += '<div class="form-group row">';
    codHtml += '<label for="nome" class="col-sm-3 col-form-label">Nome Corso</label>';
    codHtml += '<div class="col-sm-9">';
    codHtml += '<input type="text" class="form-control" name="nome" id="nome" value="' + dettCorso[0].descrizione + '" placeholder="Inserisci qui il nome del corso...">';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '<div class="form-group row">';
    codHtml += '<label for="dataScadenza" class="col-sm-3 col-form-label">Data Scadenza Corso</label>';
    codHtml += '<div class="col-sm-9">';
    if (dettCorso[0].dataScadenza != undefined && dettCorso[0].dataScadenza != null)
        codHtml += '<input type="date" id="dataScadenza" name="dataScadenza" value="' + parsificaData(dettCorso[0].dataScadenza) + '" class="form-control">';
    else
        codHtml += '<input type="date" id="dataScadenza" name="dataScadenza" class="form-control">';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '<div class="form-group row">';
    codHtml += '<label for="tipiCorsi" class="col-sm-3 col-form-label">Tipo di Corso</label>';
    codHtml += '<div class="col-sm-9">';
    codHtml += '<select name="tipiCorsi" id="tipiCorsi" title="Scegli il Tipo di Corso" data-live-search="true" data-live-search-placeholder="Cerca Tipo Corso">';
    codHtml += '</select>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '<div class="form-group row">';
    codHtml += '<label for="materie" class="col-sm-3 col-form-label">Materia</label>';
    codHtml += '<div class="col-sm-9">';
    codHtml += '<select name="materie" id="materie" title="Scegli la Materia" data-live-search="true" data-live-search-placeholder="Cerca Materia">';
    codHtml += '</select>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '</form>';

    codHtml += '<br>';
    codHtml += '<h4>Argomenti del Corso</h4>';
    codHtml += '<div class="content" id="contArgMod">';

    // Tabella per argomenti del corso
    if (dettCorso[0]["argomentiModulo"] != undefined && dettCorso[0]["argomentiModulo"].length > 0) {
        codHtml += '<div class="row">';
        codHtml += '<div class="col-lg-12 text-center" id="tabArgCorso">';
        codHtml += '<table class="table">';
        codHtml += "<tr>";
        codHtml += '<th>Descrizione</th>';
        codHtml += '<th>Azione</th>';
        codHtml += '</tr>';

        dettCorso[0]["argomentiModulo"].forEach(argomento => {
            codHtml += '<tr>';
            codHtml += '<td scope="row">' + argomento.descrizione + '</td>';
            codHtml += '<td><button class="genric-btn danger circle" onclick="removeArgCorso(' + argomento._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
            codHtml += '</tr>';
        });

        codHtml += '</table>';
        codHtml += '</div>';
        codHtml += '</div>';
    }
    else {
        codHtml += '<p>Al momento non ci sono ancora degli argomenti relativi al corso</p>';
    }

    codHtml += '</div>';
    codHtml += '<br>';
    codHtml += '<h4>Lezioni del Corso</h4>';
    codHtml += '<div class="content" id="contLezMod">';

    // Tabella per lezioni del corso
    if (dettCorso[0]["lezioniModulo"] != undefined && dettCorso[0]["lezioniModulo"].length > 0) {
        codHtml += '<div class="row">';
        codHtml += '<div class="col-lg-12 text-center" id="tabLezCorso">';
        codHtml += '<table class="table">';
        codHtml += "<tr>";
        codHtml += '<th>Titolo</th>';
        codHtml += '<th>Data Aggiunta</th>';
        codHtml += '<th>Azione</th>';
        codHtml += '</tr>';

        for (let i = 0; i < dettCorso[0]["lezioniModulo"].length; i++) {
            codHtml += '<tr>';
            codHtml += '<td>' + dettCorso[0]["lezioniModulo"][i].titolo + '</td>';
            codHtml += '<td>' + new Date(dettCorso[0]["lezioni"][i].dataAggiunta).toLocaleDateString() + '</td>';
            codHtml += '<td><button class="genric-btn danger circle" onclick="removeLezCorso(' + dettCorso[0]["lezioniModulo"][i]._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
            codHtml += '</tr>';
        };

        codHtml += '</table>';
        codHtml += '</div>';
        codHtml += '</div>';
    }
    else {
        codHtml += '<p>Al momento non ci sono ancora delle lezioni relative al corso</p>';
    }

    codHtml += '</div>';

    codHtml += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgModCorso" role="alert" style="text-align: center;"></div></div></div>';
    codHtml += '</div>';
    codHtml += '</div>';
    $("#dettCorsoMod .modal-body").append(codHtml);

    // Recupero tipi di corso
    let tipiCorsi = inviaRichiesta('/api/elTipiCorsi', 'POST', {});
    tipiCorsi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModCorso");
    });
    tipiCorsi.done(function (data) {
        data.forEach(tipocorso => {
            $("#tipiCorsi").append("<option value='" + tipocorso._id + "' " + (tipocorso._id == dettCorso[0].codTipoModulo ? "selected" : "") + ">" + tipocorso.descrizione + "</option>");
        });
        $('#tipiCorsi').selectpicker('refresh');
    });

    // Recupero materie
    let materie = inviaRichiesta('/api/elSimpleMaterie', 'POST', {});
    materie.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModCorso");
    });
    materie.done(function (data) {
        data.forEach(materia => {
            $("#materie").append("<option value='" + materia._id + "' " + (materia._id == dettCorso[0].codMateria ? "selected" : "") + ">" + materia.descrizione + "</option>");
        });
        $('#materie').selectpicker('refresh');
    });
}

// Funzione per controllo dei campi di input
function chkCorrettezzaDati() {
    $("#msgModCorso").text("").removeClass("alert alert-danger");

    if ($("#nome").val().trim() == "") {
        $("#msgModCorso").text("Devi inserire il nome del corso").addClass("alert alert-danger");
    }
    else if ($("#dataScadCorso").val() == "") {
        $("#msgModCorso").text("Devi inserire la data di scadenza del corso").addClass("alert alert-danger");
    }
    else if (new Date($("#dataScadenza").val()) <= new Date()) {
        $("#msgModCorso").text("La data di scadenza deve essere successiva a quella odierna").addClass("alert alert-danger");
    }
    else {
        return true;
    }
    return false;
}

// Funzione per rimozione argomento da corso
function removeArgCorso(idArgomento) {
    $("#msgModCorso").text("").removeClass("alert alert-danger");

    let chkToken = inviaRichiesta('/api/removeArgCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idArgomento": idArgomento });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModCorso");
    });
    chkToken.done(function (data) {
        if (data == "remArgCorsoOk") {
            $("#msgModCorso").text("Argomento rimosso dal corso").removeClass("alert alert-danger").addClass("alert alert-success");
            let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
            chkToken.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgModCorso");
            });
            chkToken.done(function (dettCorso) {
                if (dettCorso[0]["argomentiModulo"] != undefined && dettCorso[0]["argomentiModulo"].length > 0) {
                    $("#tabArgCorso").children().remove();
                    let codHtml = '<table class="table">';
                    codHtml += "<tr>";
                    codHtml += '<th>Descrizione</th>';
                    codHtml += '<th>Azione</th>';
                    codHtml += '</tr>';

                    dettCorso[0]["argomentiModulo"].forEach(argomento => {
                        codHtml += '<tr>';
                        codHtml += '<td scope="row">' + argomento.descrizione + '</td>';
                        codHtml += '<td><button class="genric-btn danger circle" onclick="removeArgCorso(' + argomento._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
                        codHtml += '</tr>';
                    });

                    codHtml += '</table>';
                    $("#tabArgCorso").append(codHtml);
                }
                else {
                    $("#contArgMod").children().remove();
                    $("#contArgMod").append('<p>Al momento non ci sono ancora degli argomenti relativi al corso</p>');
                }
            });
        }
        else
            $("#msgModCorso").text("Si è verificato un errore durante la rimozione dell'argomento dal corso").addClass("alert alert-danger");
    });
}

// Funzione per rimozione lezione da corso
function removeLezCorso(idLezione) {
    $("#msgModCorso").text("").addClass("alert alert-danger");

    let chkToken = inviaRichiesta('/api/removeLezCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idLezione": idLezione });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModCorso");
    });
    chkToken.done(function (data) {
        if (data == "remLezCorsoOk") {
            $("#msgModCorso").text("Lezione rimossa dal corso").removeClass("alert alert-danger").addClass("alert alert-success");
            let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
            chkToken.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgModCorso");
            });
            chkToken.done(function (dettCorso) {
                if (dettCorso[0]["lezioniModulo"] != undefined && dettCorso[0]["lezioniModulo"].length > 0) {
                    $("#tabLezCorso").children().remove();
                    let codHtml = '<table class="table">';
                    codHtml += "<tr>";
                    codHtml += '<th>Titolo</th>';
                    codHtml += '<th>Data Aggiunta</th>';
                    codHtml += '</tr>';

                    for (let i = 0; i < dettCorso[0]["lezioniModulo"].length; i++) {
                        codHtml += '<tr>';
                        codHtml += '<td>' + dettCorso[0]["lezioniModulo"][i].titolo + '</td>';
                        codHtml += '<td>' + new Date(dettCorso[0]["lezioni"][i].dataAggiunta).toLocaleDateString() + '</td>';
                        codHtml += '<td><button class="genric-btn danger circle" onclick="removeLezCorso(' + dettCorso[0]["lezioniModulo"][i]._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
                        codHtml += '</tr>';
                    };

                    codHtml += '</table>';
                    $("#tabLezCorso").append(codHtml);
                }
                else {
                    $("#contLezMod").children().remove();
                    $("#contLezMod").append('<p>Al momento non ci sono ancora delle lezioni relative al corso</p>');
                }
            });
        }
        else
            $("#msgModCorso").text("Si è verificato un errore durante la rimozione della lezione dal corso").addClass("alert alert-danger");
    });
}