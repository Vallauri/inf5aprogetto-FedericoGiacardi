"use strict";

// Routine principale
$(document).ready(function () {
    loadPagina();
});

// Caricamento Pagina
function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET
    if(par[0] == "gruppo" && !isNaN(parseInt(par[1]))){
        let chkToken = inviaRichiesta('/api/datiGruppoById', 'POST', {"idGruppo" : par[1]});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, "#msgDetGruppo");
        });
        chkToken.done(function (data) {
            caricamentoDatiGruppo(data);
            chkModeratore(parseInt(par[1]));
        });
    }
    else{
        $("#msgDetGruppo").text("Errore nel passaggio dei parametri").addClass("alert alert-danger");
        window.location.href = "gruppi.html";
    }
}

// Funzione che carica i dati del gruppo dinamicamente
function caricamentoDatiGruppo(gruppo) {
    $("#contGruppo").html("");
    let codHtml = "";
    let aus;
    
    if (gruppo == undefined || gruppo.length == 0){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Il gruppo richiesto non è disponibile</h2>';
        codHtml += '<p><a href="gruppi.html">Torna ai gruppi</a></p>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contGruppo").parent().html(codHtml);
        $("#contGruppo").hide();
    }
    else{
        codHtml += '<div class="col-lg-8 course_details_left">';
        codHtml += '<div class="content_wrapper">';
        codHtml += '<h4 class="title_top">' + gruppo[0]["nome"] +'</h4>';
        codHtml += '<div class="content" id="descGruppo" idGruppo="' + gruppo[0]._id + '">' + gruppo[0]["descrizione"] + '</div>';

        codHtml += '<h4 class="title">Componenti del Gruppo</h4>';
        codHtml += '<div class="content">';
        
        if (gruppo[0]["componenti"] != undefined && gruppo[0]["componenti"].length > 0){
            codHtml += '<table class="table">';
            codHtml += "<tr>";
            codHtml += '<th>Cognome Nome</th>';
            codHtml += '<th>Username</th>';
            codHtml += '<th>Data iscrizione al gruppo</th>';
            codHtml += '</tr>';
            gruppo[0]["componenti"].forEach(utente => {
                codHtml += '<tr>';
                codHtml += '<td scope="row">' + utente.cognome + ' ' + utente.nome + '</td>';
                codHtml += '<td>' + utente.user + '</td>';
                codHtml += '<td>' + new Date(utente.gruppo.dataInizio).toLocaleDateString() + '</td>';
                codHtml += '</tr>';
            });
            codHtml += '</table>';
        }
        else{
            codHtml += '<ul class="course_list">';
            codHtml += '<li class="justify-content-between align-items-center d-flex">';
            codHtml += '<p>Al momento non ci sono ancora degli utenti nel gruppo</p>';
            codHtml += '</li>';
            codHtml += '</ul>';
        }
        
        codHtml += '</div>';
        codHtml += '</div >';
        codHtml += '</div >';

        codHtml += '<div class="col-lg-4 right-contents">';
        codHtml += '<div class="sidebar_top">';
        codHtml += '<ul>';
        codHtml += '<li>';
        codHtml += '<a class="justify-content-between d-flex" href="#">';
        codHtml += '<p>Autore del Gruppo</p>';
        codHtml += '<span class="color">' + gruppo[0]["autore"][0].cognome + ' ' + gruppo[0]["autore"][0].nome + '</span>';
        codHtml += '</a>';
        codHtml += '</li>';
        codHtml += '<li>';
        codHtml += '<a class="justify-content-between d-flex" href="#">';
        codHtml += '<p>Tipo di Gruppo</p>';
        codHtml += '<span class="color">' + gruppo[0]["descTipoGruppo"][0].descrizione + '</span>';
        codHtml += '</a>';
        codHtml += '</li>';
        codHtml += '</ul>'; 
        codHtml += '</div>';
        codHtml += '</div>';
        
        $("#contGruppo").html(codHtml);
    }
}

// Controllo privilegi utente
function chkModeratore(idGruppo) {
    // Solo se utente loggato = moderatore gruppo
    let chkToken = inviaRichiesta('/api/chkModGruppo', 'POST', { "idGruppo": idGruppo });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgDetGruppo");
    });
    chkToken.done(function (data) {
        if (data.ris == "autore") {
            let codHtml = "";
            codHtml += '<div class="sidebar_top">';
            codHtml += '<div class="col-lg-12 text-center">';
            codHtml += '<h4>Gestione Gruppo</h4>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnAddMember">Aggiungi Membro/i</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnModGroup">Modifica Gruppo</button>';
            codHtml += '<button class="genric-btn danger radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnRemGroup">Elimina Gruppo</button>';
            codHtml += '</div>';
            codHtml += '</div>';
            $(".right-contents").append(codHtml);
            $("#btnIscrivitiGruppo").hide();

            $("#btnSalvaModifiche").on("click", function () {
                if ($(this).html() == "Salva Modifiche"){
                    if(chkCorrettezzaDati()){
                        let chkToken = inviaRichiesta('/api/modificaGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo"), "nome": $("#nome").val().trim(), "descrizione": $("#descrizione").val().trim(), "tipoGruppo": $("#tipoGruppo option:selected").val() });
                        chkToken.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, "#msgModGruppo");
                        });
                        chkToken.done(function (data) {
                            if (data == "modGrpOk"){
                                $("#msgDetGruppo").text("Modifica del gruppo effettuata correttamente").removeClass("alert alert-danger").addClass("alert alert-success");
                                loadPagina();
                            }
                            else
                                $("#msgModGruppo").text("Si è verificato un errore durante l'aggiornamento dei dati. Riprovare").addClass("alert alert-danger");
                        });
                    }
                }
                else if ($(this).html() == "Conferma Rimozione"){
                    let chkToken = inviaRichiesta('/api/rimuoviGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        printErrors(jqXHR, "#msgRemGruppo");
                    });
                    chkToken.done(function (data) {
                        if (data.ok == 1)
                            window.location.href = "gruppi.html";
                        else
                            $("#msgRemGruppo").text("Si è verificato un errore durante la rimozione del gruppo. Riprovare").addClass("alert alert-danger");
                    });
                }
            });

            $("#btnAddMember").on("click", function () {
                $("#dettGruppoMod .modal-title").html("Aggiunta Membro al Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").hide();

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-lg-12 text-center">';
                cod += '<label for="txtRicerca">Cerca Utente:</label>';
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
                cod += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgCercaUt" role="alert" style="text-align: center;"></div></div></div>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettGruppoMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $("#msgCercaUt").text("").removeClass("alert alert-danger");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaUtenteAggiuntaGruppo', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, "#msgCercaUt");
                        });
                        ricerca.done(function (data) {
                            dettaglioUtente(data);
                        });
                    }
                    else {
                        $("#msgCercaUt").text("Inserire un valore per la ricerca").addClass("alert alert-danger");
                        $("#txtRicerca").focus();
                    }
                });

                $('#txtRicerca').autocomplete({
                    source: function (req, res) {
                        $.ajax({
                            url: "/api/cercaUtenteAggiuntaGruppo",
                            dataType: "json",
                            type: "POST",
                            data: {
                                valore: req.term
                            },
                            success: function (data) {
                                dettaglioUtente(data);
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

            $("#btnModGroup").on("click", function () {
                $("#dettGruppoMod .modal-title").html("Modifica del Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Salva Modifiche");

                let chkToken = inviaRichiesta('/api/datiGruppoById', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo") });
                chkToken.fail(function (jqXHR, test_status, str_error) {
                    printErrors(jqXHR, "#msgModGruppo");
                });
                chkToken.done(function (data) {
                    modificaGruppo(data);
                });
            });
            
            $("#btnRemGroup").on("click", function () {
                $("#dettGruppoMod .modal-title").html("Rimozione del Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Conferma Rimozione");

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-lg-12 text-center">';
                cod += '<p>Sei sicuro di voler rimuovere il gruppo? Tutti i dati ad esso collegati verranno rimossi</p>';
                cod += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgRemGruppo" role="alert" style="text-align: center;"></div></div></div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettGruppoMod .modal-body").append(cod);
            });
        }
        else if (data.ris == "componente")
            $("#btnIscrivitiGruppo").hide();
    });
}

// Funzione di visualizzazione dei risultati della ricerca in aggiunta di utente al gruppo
function dettaglioUtente(utenti) {
    let codHtml = "";
    $("#msgCercaUt").html("").removeClass("alert alert-danger");
    $("#risultato").remove();

    if (utenti.length > 0) {
        codHtml += '<div class="row" id="risultato">';
        codHtml += '<table class="table">';
        codHtml += "<tr>";
        codHtml += '<th>Cognome Nome</th>';
        codHtml += '<th>Username</th>';
        codHtml += '<th>Azione</th>';
        codHtml += '</tr>';

        utenti.forEach(utente => {
            codHtml += '<tr id="riga_' + utente._id + '">';
            codHtml += '<td scope="row">' + utente.cognome + ' ' + utente.nome + '</td>';
            codHtml += '<td>' + utente.user + '</td>';
            codHtml += '<td><button class="genric-btn success circle" onclick="addIscrittoGruppo(' + utente._id + ')"><i class="fa fa-plus" aria-hidden="true"></i></button></td>';
            codHtml += '</tr>';
        });

        codHtml += '</table>';
        codHtml += '</div>';
    }
    else {
        $("#msgCercaUt").text("Nessun utente trovato").addClass("alert alert-danger");
        $("#risultato").remove();
    }

    $("#dettGruppoMod .modal-body").append(codHtml);
}

// Funzione per aggiungere un utente al gruppo
function addIscrittoGruppo(idUtente) {
    $("#msgCercaUt").text("").removeClass("alert alert-danger");

    let chkToken = inviaRichiesta('/api/insNuovoMembroGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo"), "idUtente" : idUtente });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 610)  // utente già presente in gruppo
            $("#msgCercaUt").show().text(JSON.parse(jqXHR.responseText)["message"]).addClass("alert alert-danger");
        else
            printErrors(jqXHR, "#msgCercaUt");
    });
    chkToken.done(function (data) {
        if(data.nModified == 1)
            window.location.reload();
        else
            $("#msgCercaUt").text("Si è verificato un errore durante l'aggiunta al gruppo").addClass("alert alert-danger");
    });
}

// Funzione per gestione modifica del gruppo
function modificaGruppo(dettGruppo){
    let cod = "";
    cod += '<div class="row">';
    cod += '<div class="col-lg-12 text-center container">';
    cod += '<form>';
    cod += '<div class="form-group row">';
    cod += '<label for="nome" class="col-sm-3 col-form-label">Nome Gruppo</label>';
    cod += '<div class="col-sm-9">';
    cod += '<input type="text" class="form-control" name="nome" id="nome" value="' + dettGruppo[0].nome + '" placeholder="Inserisci qui il nome del gruppo...">';
    cod += '</div>';
    cod += '</div>';
    cod += '<div class="form-group row">';
    cod += '<label for="descrizione" class="col-sm-3 col-form-label">Descrizione Gruppo</label>';
    cod += '<div class="col-sm-9">';
    cod += '<input type="text" class="form-control" name="descrizione" id="descrizione" value="' + dettGruppo[0].descrizione + '" placeholder="Inserisci qui la descrizione del gruppo...">';
    cod += '</div>';
    cod += '</div>';
    let tipiGruppi = inviaRichiesta('/api/elTipiGruppi', 'POST', {});
    tipiGruppi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgDetGruppo");
        $("#dettGruppoMod").modal('hide');
    });
    tipiGruppi.done(function (data) {
        cod += '<div class="form-select row" id="default-select">';
        cod += '<label for="tipoGruppo" class="col-sm-3 col-form-label">Tipo di Gruppo</label>';
        cod += '<div class="col-sm-9">';
        cod += '<select name="tipoGruppo" id="tipoGruppo" title="Scegli il Tipo di Gruppo" data-live-search="true" data-live-search-placeholder="Cerca Tipo Gruppo">';
        data.forEach(tipogruppo => {
            cod += "<option value='" + tipogruppo._id + "' " + (tipogruppo._id == dettGruppo[0].tipoGruppo ?  "selected" : "") + ">" + tipogruppo.descrizione + "</option>";
        });
        cod += '</select>';
        cod += '</div>';
        cod += '</div>';
        cod += '</form>';
        cod += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgModGruppo" role="alert" style="text-align: center;"></div></div></div>';
        cod += '</div>';
        cod += '</div>';
        
        let compGruppo = inviaRichiesta('/api/elComponentiGruppo', 'POST', {"idGruppo" : dettGruppo[0]._id});
        compGruppo.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, "#msgDetGruppo");
            $("#dettGruppoMod").modal('hide');
        });
        compGruppo.done(function (componenti) {
            if(componenti != null && componenti.length > 0){
                cod += '<div class="row" style="margin-top: 10px">';
                cod += '<div class="col-lg-12 text-center" id="tabCompGruppoRem">';
                cod += '<table class="table">';
                cod += "<tr>";
                cod += '<th>Cognome Nome</th>';
                cod += '<th>Username</th>';
                cod += '<th>Data iscrizione al gruppo</th>';
                cod += '<th>Azione</th>';
                cod += '</tr>';

                componenti.forEach(utente => {
                    cod += '<tr>';
                    cod += '<td scope="row">' + utente.cognome + ' ' + utente.nome + '</td>';
                    cod += '<td>' + utente.user + '</td>';
                    cod += '<td>' + new Date(utente.gruppo[0].dataInizio).toLocaleDateString() + '</td>';
                    cod += '<td><button class="genric-btn danger circle" onclick="removeIscrittoGruppo(' + utente._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
                    cod += '</tr>';
                });

                cod += '</table>';
                cod += '</div>';
                cod += '</div>';

            }
            $("#dettGruppoMod .modal-body").append(cod);
            $('#tipoGruppo').selectpicker('refresh');
        });
    });
}

// Funzione per controllo dei campi di input
function chkCorrettezzaDati() {
    $("#msgModGruppo").text("").removeClass("alert alert-danger");

    if($("#nome").val().trim() == ""){
        $("#msgModGruppo").text("Devi inserire il nome del gruppo").addClass("alert alert-danger");
    }
    else if ($("#descrizione").val().trim() == "") {
        $("#msgModGruppo").text("Devi inserire la descrizione del gruppo").addClass("alert alert-danger");
    }
    else{
        return true;
    }
    return false;
}

// Funzione per rimozione dell'utente dal gruppo
function removeIscrittoGruppo(idUtente) {
    $("#msgModGruppo").text("").removeClass("alert alert-danger");

    let chkToken = inviaRichiesta('/api/removeMembroGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo"), "idUtente": idUtente });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 609)  // l'autore del gruppo non può essere rimosso
            $("#msgModGruppo").show().text(JSON.parse(jqXHR.responseText)["message"]).addClass("alert alert-dialog");
        else
            printErrors(jqXHR, "#msgModGruppo");
    });
    chkToken.done(function (data) {
        if (data.nModified == 1){
            $("#msgModGruppo").text("Utente rimosso dal gruppo").addClass("alert alert-success");
            $("#tabCompGruppoRem").children().remove();
            let compGruppo = inviaRichiesta('/api/elComponentiGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo") });
            compGruppo.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgModGruppo");
            });
            compGruppo.done(function (componenti) {
                let cod = "";
                if (componenti != null && componenti.length > 0) {
                    cod += '<table class="table">';
                    cod += "<tr>";
                    cod += '<th>Cognome Nome</th>';
                    cod += '<th>Username</th>';
                    cod += '<th>Data iscrizione al gruppo</th>';
                    cod += '<th>Azione</th>';
                    cod += '</tr>';

                    componenti.forEach(utente => {
                        cod += '<tr>';
                        cod += '<td scope="row">' + utente.cognome + ' ' + utente.nome + '</td>';
                        cod += '<td>' + utente.user + '</td>';
                        cod += '<td>' + new Date(utente.gruppo[0].dataInizio).toLocaleDateString() + '</td>';
                        cod += '<td><button class="genric-btn danger circle" onclick="removeIscrittoGruppo(' + utente._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
                        cod += '</tr>';
                    });
                    cod += '</table>';
                }
                else
                    cod = "<p>Non ci sono componenti nel gruppo</p>";
                $("#tabCompGruppoRem").append(cod);
            });
        }
        else
            $("#msgModGruppo").text("Si è verificato un errore durante la rimozione dal gruppo").addClass("alert alert-danger");
    });
}