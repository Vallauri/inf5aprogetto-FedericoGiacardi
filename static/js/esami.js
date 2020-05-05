"use strict";
let esamiPerTabella = [];

$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET (controllare se hanno senso o no ??)
    if(par[0] == "corso" && !isNaN(parseInt(par[1]))){
        let chkToken = inviaRichiesta('/api/esamiCorso', 'POST', {"idCorso" : par[1]});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            console.log(data);
            caricamentoDatiEsami(data);
            chkModeratore(parseInt(par[1]));
        });
    }
    else{
        alert("Errore nel passaggio dei parametri");
        window.location.href = "corsi.html";
    }
}

function caricamentoDatiEsami(esami) {
    $("#contEsami").html("");
    let codHtml = "";
    let aus;
    
    if (esami == undefined || esami.length == 0){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Non ci sono esami per questo corso</h2>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contEsami").parent().html(codHtml);
        // $("#contEsami").hide();
    }
    else{
        codHtml += '<div class="row col-md-12 col-lg-12 mx-auto justify-content-center">';
        codHtml += '<h4 class="title_top">Elenco Esami</h4>';
        codHtml += '<div class="col-sm-8 col-md-12 col-lg-12 col-xs-8 mx-auto table-responsive">';
        codHtml += '<table class="table table-hover table-striped table-bordered">';
        codHtml += '<thead class="thead-inverse">';
        codHtml += '<tr>';
        codHtml += '<th>Descrizione</th>';
        codHtml += '<th>Data Creazione</th>';
        codHtml += '<th>Data Termine</th>';
        codHtml += '<th>Durata(hh:mm:ss)</th>';
        codHtml += '<th>Stato</th>'; // in corso / terminato
        codHtml += '<th>Azioni</th>'; // qui metto btn effettua se non terminato e se non dato / se admin corso (codUtente dell'esame) metto anche modifica e rimuovi
        codHtml += '</tr>';
        codHtml += '</thead>';
        codHtml += '<tbody id="bodyTabEsame">';
        esamiPerTabella = esami;
        codHtml += '</tbody>';
        codHtml += '</table>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contEsami").html(codHtml);
    }
}

function calcolaDurata(s){
    let measuredTime = new Date(null);
    measuredTime.setSeconds(s); 
    return measuredTime.toISOString().substr(11, 8);
}

function vaiAEsame(idEsame){
    let chkToken = inviaRichiesta('/api/chkSvolgimentoEsame', 'POST', { "idEsame": idEsame }); // gli esami non vanno eliminati completamente dal DB, vanno solo resi nulli altrimenti gli id si sfanculano (pensa a storia esami svolti utenti) ?
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        if (data.ris == "nonDato")
            alert("Manca vai a esame"); // metto collegamento a pagina di somministrazione esame
        else
            alert("Hai già sostenuto l'esame");
    });
}

// function popolaTabEsami(utente){
//     let codHtml = "";
//     esamiPerTabella.forEach(esame => {
//         codHtml += '<tr>';
//         codHtml += '<td scope="row">' + esame.descrizione + '</td>';
//         codHtml += '<td>' + new Date(esame.dataCreazione).toLocaleDateString() + '</td>';
//         codHtml += '<td>' + new Date(esame.dataScadenza).toLocaleDateString() + '</td>';
//         codHtml += '<td>' + calcolaDurata(parseInt(esame.durata)) + '</td>';
//         codHtml += '<td>' + (new Date(esame.dataScadenza) >= new Date() ? "In corso" : "Terminato") + '</td>';
//         codHtml += '<td>';
//         codHtml += (new Date(esame.dataScadenza) >= new Date() ? '<button class="genric-btn info circle" onclick="vaiAEsame(' + esame._id + ')"><i class="fas fa-arrow-right"></i></button>' : '');
//         if(utente == "autore"){
//             codHtml += '<button class="genric-btn info circle" onclick="modificaEsame(' + esame._id + ')"><i class="fas fa-edit"></i></button>';
//             codHtml += '<button class="genric-btn danger circle" onclick="rimuoviEsame(' + esame._id + ')"><i class="fas fa-trash-alt"></i></button>';
//         }
//         codHtml += '</td>';
//         codHtml += '</tr>';
//     });
//     $("#bodyTabEsame").html(codHtml);
//     esamiPerTabella = [];
// }

function chkModeratore(idCorso) {
    let chkToken = inviaRichiesta('/api/chkModCorso', 'POST', { "idCorso": idCorso });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        let codHtml = "";
        esamiPerTabella.forEach(esame => {
            codHtml += '<tr>';
            codHtml += '<td scope="row">' + esame.descrizione + '</td>';
            codHtml += '<td>' + new Date(esame.dataCreazione).toLocaleDateString() + '</td>';
            codHtml += '<td>' + new Date(esame.dataScadenza).toLocaleDateString() + '</td>';
            codHtml += '<td>' + calcolaDurata(parseInt(esame.durata)) + '</td>';
            codHtml += '<td>' + (new Date(esame.dataScadenza) >= new Date() ? "In corso" : "Terminato") + '</td>';
            codHtml += '<td>';
            codHtml += (new Date(esame.dataScadenza) >= new Date() ? '<button class="genric-btn info circle" onclick="vaiAEsame(' + esame._id + ')"><i class="fas fa-arrow-right"></i></button>' : '');
            if (data.ris == "autore") {
                codHtml += '<button class="genric-btn info circle" onclick="modificaEsame(' + esame._id + ')"><i class="fas fa-edit"></i></button>';
                codHtml += '<button class="genric-btn danger circle" onclick="rimuoviEsame(' + esame._id + ')"><i class="fas fa-trash-alt"></i></button>';
            }
            codHtml += '</td>';
            codHtml += '</tr>';
        });
        $("#bodyTabEsame").html(codHtml);
        esamiPerTabella = [];

        if (data.ris == "autore") {
            // devo mettere anche la parte per l'inserimento di un nuovo esame
            codHtml = "";
            codHtml += '<div class="col-md-12 col-lg-12 mx-auto text-center">';
            codHtml += '<h4 class="title_top">Nuovo Esame</h4>';
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-9 col-md-7 col-lg-5 mx-auto">';
            codHtml += '<div class="card card-signin my-5">';
            codHtml += '<div class="card-body">';
            codHtml += '<form id="formInsEsame" class="form-contact">';
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-8 col-md-8 col-lg-6 mx-auto">';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<span class="input-group-text">';
            codHtml += '<i class="fas fa-user-circle"> </i>';
            codHtml += '</span>';
            codHtml += '<input type="text" id="descEsame" name="descEsame" placeholder="Descrizione" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Descrizione\'" required class="single-input">';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<span class="input-group-text">';
            codHtml += '<i class="far fa-clock"></i>';
            codHtml += '</span>';
            codHtml += '<input type="time" id="durata" name="durata" aria-describedby="helpDur" required class="single-input">'; // se trovo il modo faccio selezionare anche i secondi, se no va beh
            codHtml += '<small id="helpDur" class="form-text text-muted">Durata (hh:mm)</small>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<span class="input-group-text">';
            codHtml += '<i class="fas fa-hourglass-end"></i>';
            codHtml += '</span>';
            codHtml += '<input type="date" id="dataScadenza" name="dataScadenza" aria-describedby="helpScad" required class="single-input">';
            codHtml += '<small id="helpScad" class="form-text text-muted">Data Scadenza Esame</small>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<span class="input-group-text">';
            codHtml += '<i class="far fa-clock"></i>';
            codHtml += '</span>';
            codHtml += '<input type="time" id="oraFineEsame" name="oraFineEsame" aria-describedby="helpScadTime" required class="single-input">';
            codHtml += '<small id="helpScadTime" class="form-text text-muted">Ora Scadenza Esame</small>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="input-group form-group">';
            codHtml += '<div class="input-group-prepend">';
            codHtml += '<a class="genric-btn info circle btn-block" data-toggle="modal" data-target="#insNuovaDomanda" style="margin:2px; color: #fff!important;" id="btnAddDomanda">Aggiungi Domanda</a>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="row text-center">';
            codHtml += '<div class="col-lg-12 mx-auto">';
            codHtml += '<div id="msgAddEsame" class="msg"></div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="row">'
            codHtml += '<div id="listaDomandeEsame" class="col-sm-12 col-md-12 col-lg-12 col-xs-12 mx-auto table-responsive">';
            codHtml += '<table class="table table-hover table-striped table-bordered">';
            codHtml += '<thead class="thead-inverse">';
            codHtml += '<tr>';
            codHtml += '<th>Domanda</th>';
            codHtml += '<th>Risposta/e</th>';
            codHtml += '<th>Azione</th>';
            codHtml += '</tr>';
            codHtml += '</thead>';
            codHtml += '<tbody id="bdTabDomEsame">';
            codHtml += '</tbody>';
            codHtml += '</table>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '<div class="row">'
            codHtml += '<div class="col-sm-6 col-md-12 col-lg-6 mx-auto">';
            codHtml += '<div class="form-group">';
            codHtml += '<a id="btnInviaAppunto" class="genric-btn primary circle btn-block" style="color: #fff!important;">Invia</a>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</form>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            $("#contEsami").append(codHtml);
            $("#listaDomandeEsame").hide();

            $("#btnAddDomanda").on("click", function () {
                drawModaleDomande();
            });
            
            $("#btnInviaAppunto").on("click", function () {
                $("#descEsame").removeClass("alert-danger");
                $("#durata").removeClass("alert-danger");
                $("#dataScadenza").removeClass("alert-danger");
                $("#oraFineEsame").removeClass("alert-danger");
                $("#msgAddEsame").html("");

                if ($("#descEsame").val().trim() != ""){
                    if ($("#durata").val().trim() != ""){
                        if ($("#dataScadenza").val().trim() != ""){
                            if ($("#oraFineEsame").val().trim() != ""){
                                // controllo su data e ora scadenza esame
                                let dataLetta = $("#dataScadenza").val();
                                let ora = $("#oraFineEsame").val();
                                let scadEsame = new Date(dataLetta + "T" + ora);

                                // controllo data > o = a quella odierna
                                if(new Date(dataLetta) >= new Date(new Date().toISOString().split('T')[0])){
                                    // controllo ora successiva a quella attuale ( + durata esame oppure no ?)
                                    if(scadEsame > new Date()){
                                        if ($("#bdTabDomEsame").children().length != 0) {
                                            console.log("Esame Ok");
                                            // -- fare inserimento su db e pulizia campi (basta reload pagina)
                                        }
                                        else {
                                            gestErrori("Devi inserire almeno una domanda", "", "#msgAddEsame");
                                        }
                                    }
                                    else {
                                        gestErrori("Devi inserire un'ora di scadenza esame successiva a quella attuale", $("#oraFineEsame"), "#msgAddEsame");
                                    }
                                }
                                else {
                                    gestErrori("Devi inserire una data di scadenza successiva o uguale a quella odierna", $("#dataScadenza"), "#msgAddEsame");
                                }
                            }
                            else {
                                gestErrori("Devi inserire l'ora di scadenza dell'esame", $("#oraFineEsame"), "#msgAddEsame");
                            }
                        }
                        else {
                            gestErrori("Devi inserire la data di scadenza dell'esame", $("#dataScadenza"), "#msgAddEsame");
                        }
                    }
                    else{
                        gestErrori("Devi inserire la durata dell'esame", $("#durata"), "#msgAddEsame");
                    }
                }
                else{
                    gestErrori("Devi inserire la descrizione dell'esame", $("#descEsame"), "#msgAddEsame");
                }
            });

            // codHtml += '<div class="sidebar_top">';
            // codHtml += '<div class="col-lg-12 text-center">';
            // codHtml += '<h4>Gestione Corso</h4>';
            // codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnAddArgomento">Aggiungi Argomento</button>';
            // codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnAddLezione">Aggiungi Lezione</button>';
            // codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnModCorso">Modifica Corso</button>';
            // codHtml += '<button class="genric-btn danger radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnRemCorso">Elimina Corso</button>';
            // codHtml += '</div>';
            // codHtml += '</div>';
            // $(".right-contents").append(codHtml);
            // $("#btnIscrivitiCorso").hide();
            // //$("#btnIscriviGruppoCorso").hide(); // da controllare il caso in cui un'utente è iscritto ed è mod di un gruppo (bisogna dargli la possibilità di iscrivere il gruppo)

            // $("#btnSalvaModifiche").on("click", function () {
            //     /*if($(this).html() == "Salva Aggiunte"){
            //         window.location.reload();
            //     }
            //     else */
            //     if ($(this).html() == "Salva Modifiche") {
            //         if (chkCorrettezzaDati()) {
            //             let chkToken = inviaRichiesta('/api/modificaCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "nome": $("#nome").val().trim(), /*"descrizione": $("#descrizione").val().trim(),*/ "tipoCorso": $("#tipiCorsi option:selected").val(), "materia": $("#materie option:selected").val() });
            //             chkToken.fail(function (jqXHR, test_status, str_error) {
            //                 printErrors(jqXHR, ".modal-body .msg");
            //             });
            //             chkToken.done(function (data) {
            //                 if (data.ok == 1)
            //                     window.location.reload();
            //                 else
            //                     $(".modal-body .msg").text("Si è verificato un errore durante l'aggiornamento dei dati. Riprovare");
            //             });
            //         }
            //     }
            //     else if ($(this).html() == "Conferma Rimozione") {
            //         let chkToken = inviaRichiesta('/api/rimuoviCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
            //         chkToken.fail(function (jqXHR, test_status, str_error) {
            //             printErrors(jqXHR, ".modal-body .msg");
            //         });
            //         chkToken.done(function (data) {
            //             if (data.ok == 1)
            //                 window.location.href = "corsi.html";
            //             else
            //                 $(".modal-body .msg").text("Si è verificato un errore durante la rimozione del corso. Riprovare");
            //         });
            //     }
            // });

            // $("#btnAddArgomento").on("click", function(){
            //     $("#dettCorsoMod .modal-title").html("Aggiunta Argomento al Corso");
            //     $("#dettCorsoMod .modal-body").children().remove();
            //     $("#btnSalvaModifiche").hide();

            //     let cod = "";
            //     cod += '<div class="row">';
            //     cod += '<div class="col-lg-12 text-center">';
            //     cod += '<label for="txtRicerca">Cerca Argomento:</label>';
            //     cod += '</div>';
            //     cod += '<div class="col-lg-11 text-center">';
            //     cod += '<div class="row">';
            //     cod += '<div class="col-lg-10">';
            //     cod += '<input type="text" class="form-control" name="txtRicerca" id="txtRicerca" placeholder="Digita qui la tua ricerca...">';
            //     cod += '</div>';
            //     cod += '<div class="col-lg-2">';
            //     cod += '<button class="genric-btn success circle" id="btnRicerca"><i class="fa fa-search" aria-hidden="true"></i></button>';
            //     cod += '</div>';
            //     cod += '</div>';
            //     cod += '<p class="msg" style="margin-top:5px"></p>';
            //     cod += '</div>';
            //     cod += '</div>';
            //     cod += '</div>';

            //     $("#dettCorsoMod .modal-body").append(cod);

            //     $("#btnRicerca").on("click", function () {
            //         $(".modal-body .msg").text("");

            //         if ($("#txtRicerca").val() != "") {
            //             let ricerca = inviaRichiesta('/api/cercaArgAggiuntaCorso', 'POST', { "valore": $("#txtRicerca").val() });
            //             ricerca.fail(function (jqXHR, test_status, str_error) {
            //                 printErrors(jqXHR, ".modal-body .msg");
            //             });
            //             ricerca.done(function (data) {
            //                 dettArgomento(data);
            //             });
            //         }
            //         else {
            //             $(".modal-body .msg").text("Inserire un valore per la ricerca");
            //             $("#txtRicerca").focus();
            //         }
            //     });

            //     $('#txtRicerca').autocomplete({
            //         source: function (req, res) {
            //             $.ajax({
            //                 url: "/api/cercaArgAggiuntaCorso",
            //                 dataType: "json",
            //                 type: "POST",
            //                 data: {
            //                     valore: req.term
            //                 },
            //                 success: function (data) {
            //                     dettArgomento(data);
            //                 },
            //                 error: function (xhr) {
            //                     alert(xhr.status + ' : ' + xhr.statusText);
            //                 }
            //             });
            //         },
            //         select: function (event, ui) {

            //         }
            //     });
            // });

            // $("#btnAddLezione").on("click", function () {
            //     $("#dettCorsoMod .modal-title").html("Aggiunta Lezione al Corso");
            //     $("#dettCorsoMod .modal-body").children().remove();
            //     $("#btnSalvaModifiche").hide();

            //     let cod = "";
            //     cod += '<div class="row">';
            //     cod += '<div class="col-lg-12 text-center">';
            //     cod += '<label for="txtRicerca">Cerca Lezione:</label>';
            //     cod += '</div>';
            //     cod += '<div class="col-lg-11 text-center">';
            //     cod += '<div class="row">';
            //     cod += '<div class="col-lg-10">';
            //     cod += '<input type="text" class="form-control" name="txtRicerca" id="txtRicerca" placeholder="Digita qui la tua ricerca...">';
            //     cod += '</div>';
            //     cod += '<div class="col-lg-2">';
            //     cod += '<button class="genric-btn success circle" id="btnRicerca"><i class="fa fa-search" aria-hidden="true"></i></button>';
            //     cod += '</div>';
            //     cod += '</div>';
            //     cod += '<p class="msg" style="margin-top:5px"></p>';
            //     cod += '</div>';
            //     cod += '</div>';
            //     cod += '</div>';

            //     $("#dettCorsoMod .modal-body").append(cod);

            //     $("#btnRicerca").on("click", function () {
            //         $(".modal-body .msg").text("");

            //         if ($("#txtRicerca").val() != "") {
            //             let ricerca = inviaRichiesta('/api/cercaLezAggiuntaCorso', 'POST', { "valore": $("#txtRicerca").val() });
            //             ricerca.fail(function (jqXHR, test_status, str_error) {
            //                 printErrors(jqXHR, ".modal-body .msg");
            //             });
            //             ricerca.done(function (data) {
            //                 dettLezione(data);
            //             });
            //         }
            //         else {
            //             $(".modal-body .msg").text("Inserire un valore per la ricerca");
            //             $("#txtRicerca").focus();
            //         }
            //     });

            //     $('#txtRicerca').autocomplete({
            //         source: function (req, res) {
            //             $.ajax({
            //                 url: "/api/cercaLezAggiuntaCorso",
            //                 dataType: "json",
            //                 type: "POST",
            //                 data: {
            //                     valore: req.term
            //                 },
            //                 success: function (data) {
            //                     dettLezione(data);
            //                 },
            //                 error: function (xhr) {
            //                     alert(xhr.status + ' : ' + xhr.statusText);
            //                 }
            //             });
            //         },
            //         select: function (event, ui) {

            //         }
            //     });
            // });

            // $("#btnModCorso").on("click", function () {
            //     $("#dettCorsoMod .modal-title").html("Modifica del Corso");
            //     $("#dettCorsoMod .modal-body").children().remove();
            //     $("#btnSalvaModifiche").show().html("Salva Modifiche");

            //     let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
            //     chkToken.fail(function (jqXHR, test_status, str_error) {
            //         printErrors(jqXHR, ".modal-body .msg");
            //     });
            //     chkToken.done(function (data) {
            //         console.log(data);
            //         modificaCorso(data);
            //     });
            // });

            // $("#btnRemCorso").on("click", function () {
            //     $("#dettCorsoMod .modal-title").html("Rimozione del Corso");
            //     $("#dettCorsoMod .modal-body").children().remove();
            //     $("#btnSalvaModifiche").show().html("Conferma Rimozione");

            //     let cod = "";
            //     cod += '<div class="row">';
            //     cod += '<div class="col-lg-12 text-center">';
            //     cod += '<p>Sei sicuro di voler rimuovere il corso? Tutti i dati ad esso collegati verranno rimossi</p>';
            //     cod += '<p class="msg"></p>';
            //     cod += '</div>';
            //     cod += '</div>';

            //     $("#dettCorsoMod .modal-body").append(cod);
            // });

            // aggiungiLezioni();
        }
    });
}

function gestErrori(msg, controllo, target) {
    $(target).html(msg);
    controllo.addClass("alert-danger");
}

function drawModaleDomande(){
    let codHtml = '';
    codHtml += '<div class="modal fade" style="margin-top: 80px;" id="insNuovaDomanda" tabindex="1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">';
    codHtml += '<div class="modal-dialog" role="document">';
    codHtml += '<div class="modal-content">';
    codHtml += '<div class="modal-header">';
    codHtml += '<h5 class="modal-title">Inserisci Nuova domanda</h5>';
    codHtml += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
    codHtml += '<span aria-hidden="true">&times;</span>';
    codHtml += '</button>';
    codHtml += '</div>';
    codHtml += '<div class="modal-body">';
    codHtml += '<div class="row">';
    codHtml += '<div class="col-sm-8 col-md-8 col-lg-8 col-xs-8 mx-auto text-center">';
    codHtml += '<select id="tipoDomanda" title="Scegli il tipo di domanda" data-live-search="false">';
    codHtml += '<option value="trueFalse">Vero o Falso</option>';
    codHtml += '<option value="multi">Domanda a Risposte Multiple</option>';
    codHtml += '<option value="open">Domanda Aperta</option>';
    codHtml += '<option value="close">Domanda Chiusa</option>';
    codHtml += '</select>';
    codHtml += '<div style="margin-top:15px" class="row" id="dettDomanda"></div>';
    codHtml += '<p id="msgInsDomanda" class="msg"></p>';
    codHtml += '</div>';
    //codHtml += '<div style="margin-top:15px">';
    //codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '<div class="modal-footer">';
    codHtml += '<button type="button" id="btnSalvaDomanda" class="genric-btn success radius">Inserisci</button>';
    codHtml += '<button type="button" class="genric-btn danger radius" data-dismiss="modal">Annulla</button>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '</div>';
    $("#contModDomdande").html(codHtml);

    $('#tipoDomanda').selectpicker('refresh');
    document.getElementById("tipoDomanda").selectedIndex = -1;
    $("#tipoDomanda").on("change", function () {
        $("#msgInsDomanda").html("");
        let cod = '';
        cod += '<div class="col-lg-10 mx-auto">';
        cod += '<form>';
        cod += '<div class="input-group form-group">';
        cod += '<div class="input-group-prepend">';
        cod += '<span class="input-group-text">';
        cod += '<i class="fas fa-user-circle"> </i>';
        cod += '</span>';
        cod += '<input type="text" id="domanda" name="domanda" placeholder="Domanda" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Domanda\'" required class="single-input">';
        cod += '</div>';
        cod += '</div>';

        switch ($("option:selected", this).val()) {
            case "trueFalse":
                cod += '<div class="form-group">';
                cod += '<label for="domanda">Risposta:</label>';
                cod += '<br/>';
                cod += '<div class="col-lg-4 mx-auto">'
                cod += '<div class="row">'
                cod += '<div class="col-lg-2">'
                cod += '<input type="radio" value="true" name="risposta">';
                cod += '</div>';
                cod += '<div class="col-lg-2">'
                cod += '<span>Vero</span>'
                cod += '</div>';
                cod += '</div>';
                cod += '<div class="row">'
                cod += '<div class="col-lg-2">'
                cod += '<input type="radio" value="false" name="risposta">';
                cod += '</div>';
                cod += '<div class="col-lg-2">'
                cod += '<span>Falso</span>'
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';
                break;

            case "multi":
                cod += '<div class="form-group">';
                cod += '<label for="numRisp">Scegli il numero di risposte:</label>';
                cod += '<br/>';
                cod += '<div class="col-lg-8 mx-auto">';
                cod += '<input type="number" min="2" max="10" id="numRisp" name="numRisp" onkeypress="allowNumbersOnly(event)" maxlength="2" value="2" class="single-input">';
                cod += '</div>';
                cod += '</div>';
                cod += '<div id="contRisposte" class="col-lg-12 mx-auto">';
                for (let i = 0; i < 2; i++) {
                    cod += '<div class="row" style="margin-bottom:10px">';
                    cod += '<div class="col-lg-5" style="margin-top:10px">';
                    cod += '<span>Risposta ' + (i + 1) + ':</span>';
                    cod += '</div>';
                    cod += '<div class="col-lg-7">';
                    cod += '<input type="text" id="risp' + (i + 1) + '" name="risposte" required class="single-input">';
                    cod += '</div>';
                    cod += '</div>';
                }
                cod += '<div class="row" style="margin-bottom:10px">';
                cod += '<div class="col-lg-8 mx-auto"><h5>Risposta Corretta</h5></div>';
                cod += '</div>';
                cod += '<div class="row" style="margin-bottom:10px">';
                for(let i = 0; i < 2; i++){
                    cod += '<div class="col-lg-6">';
                    cod += (i+1) + ' <input type="checkbox" id="giusta_' + (i + 1) + '" name="giusta_' + (i + 1) + '" class="single-input">';
                    cod += '</div>';
                }
                cod += '</div>';
                cod += '</div>';
                break;

            case "open": // da controllare ?!?!!??!?!
                cod += '<div class="input-group form-group">';
                cod += '<div class="input-group-prepend">';
                cod += '<span class="input-group-text">';
                cod += '<i class="fas fa-user-circle"> </i>';
                cod += '</span>';  // non so se ha senso fargli mettere la risposta alla domanda aperta ?!?!?!?!
                cod += '<input type="textarea" id="risposta" name="risposta" placeholder="Risposta" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Risposta\'" required class="single-input">';
                cod += '</div>';
                cod += '</div>';
                break;

            case "close":
                cod += '<div class="input-group form-group">';
                cod += '<div class="input-group-prepend">';
                cod += '<span class="input-group-text">';
                cod += '<i class="fas fa-user-circle"> </i>';
                cod += '</span>';
                cod += '<input type="text" id="risposta" name="risposta" placeholder="Risposta" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Risposta\'" required class="single-input">';
                cod += '</div>';
                cod += '</div>';
                break;
        }
        cod += '</form>';
        cod += '</div>';
        $("#dettDomanda").html(cod);

        if ($("option:selected", this).val() == "multi") {
            $("#numRisp").on('change', function () {
                $("#msgInsDomanda").html("");
                if ($(this).val().trim() != "") {
                    if (parseInt($(this).val()) < 2 || parseInt($(this).val()) > 10)
                        $("#msgInsDomanda").html("Devi scegliere un numero di risposte compreso tra 2 e 10");
                    else {
                        cod = '';
                        let nRisp = parseInt($(this).val());
                        for (let i = 0; i < nRisp; i++) {
                            cod += '<div class="row" style="margin-bottom:10px">';
                            cod += '<div class="col-lg-5" style="margin-top:10px">';
                            cod += '<span>Risposta ' + (i + 1) + ':</span>';
                            cod += '</div>';
                            cod += '<div class="col-lg-7">';
                            cod += '<input type="text" id="risp' + (i + 1) + '" name="risposte" required class="single-input">';
                            cod += '</div>';
                            cod += '</div>';
                        }
                        cod += '<div class="row" style="margin-bottom:10px">';
                        cod += '<div class="col-lg-8 mx-auto"><h5>Risposta Corretta</h5></div>';
                        cod += '</div>';
                        cod += '<div class="row" style="margin-bottom:10px">';
                        for (let i = 0; i < nRisp; i++) {
                            cod += '<div class="col-lg-' + Math.floor(12/nRisp) + '">';
                            cod += (i + 1) + ' <input type="checkbox" id="giusta_' + (i + 1) + '" name="giusta_' + (i + 1) + '" class="single-input">';
                            cod += '</div>';
                        }
                        cod += '</div>';
                        $("#contRisposte").html(cod);
                    }
                }
                else
                    $("#msgInsDomanda").html("Devi inserire un numero di risposte (compreso tra 2 e 10)");
            });
        }
    });

    $("#btnSalvaDomanda").on("click", function () {
        $("#msgInsDomanda").html("");
        if ($("#tipoDomanda option:selected").val() != undefined) {
            // let formData = new FormData();
            let invia = false;
            let cod = '';
            switch ($("#tipoDomanda option:selected").val()) {
                case "trueFalse":
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda");
                    else if ($("input[name='risposta']:checked").val() == undefined)
                        $("#msgInsDomanda").html("Devi scegliere la risposta alla domanda");
                    else{
                        cod += '<tr>';
                        cod += '<td>' + $("#domanda").val().trim() + '</td>';
                        cod += '<td>' + ($("input[name='risposta']:checked").val() ? "Vero" : "Falso") + '</td>';
                        cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(' + $("#bdTabDomEsame").children().length + ')"><i class="fas fa-trash-alt"></i></a></td>';
                        cod += '</tr>';
                        // formData.append('testo', $("#domanda").val());
                        // formData.append('risposta', $("input[name='risposta']:checked").val());
                        invia = true
                    }
                    break;

                case "multi":
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda");
                    else if ($("#contRisposte input[type='checkbox']:checked").length == 0)
                        $("#msgInsDomanda").html("Devi specificare quali risposte sono quelle giuste");
                    else{
                        let corretto = true;
                        // formData.append("testo", $("#domanda").val().trim());
                        let ris = new Array();
                        let risposte = $('#contRisposte input[type="text"]');
                        for(let i = 0; i < risposte.length; i++){
                            if($(risposte[i]).val().trim() == ""){
                                $("#msgInsDomanda").html("Devi inserire la risposta " + (i+1) +" alla domanda");
                                // domanda = new FormData();
                                corretto = false;
                                break;
                            }
                            else{
                                ris.push($(risposte[i]).val().trim());
                                // formData.append("risp_" + (i + 1), $(risposte[i]).val().trim());
                            }
                        }

                        if(corretto){
                            let rispGiuste = $("#contRisposte input[type='checkbox']:checked");
                            let id = new Array();
                            for(let i = 0; i < rispGiuste.length; i++)
                                id.push($(rispGiuste[i]).attr("id").split('_')[1]);
                            
                            // formData.append("corrette", id);
                            invia = true

                            cod += '<tr>';
                            cod += '<td>' + $("#domanda").val().trim() + '</td>';
                            cod += '<td>' + (ris.join(',')) + ' - Giuste: ' + (id.join(',')) + '</td>';
                            cod += '<td><button class="genric-btn danger circle" onclick="rimuoviDomandaEsame(' + $("#bdTabDomEsame").children().length + ')"><i class="fas fa-trash-alt"></i></button></td>';
                            cod += '</tr>';
                        }
                    }
                    break;

                case "open": // da controllare ?!?!!??!?!
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda");
                    else if ($("#risposta").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire la risposta alla domanda"); // non so se ha senso fargli mettere la risposta alla domanda aperta ?!?!?!?!
                    else {
                        cod += '<tr>';
                        cod += '<td>' + $("#domanda").val().trim() + '</td>';
                        cod += '<td>' + $("#risposta").val().trim() + '</td>';
                        cod += '<td><button class="genric-btn danger circle" onclick="rimuoviDomandaEsame(' + $("#bdTabDomEsame").children().length + ')"><i class="fas fa-trash-alt"></i></button></td>';
                        cod += '</tr>';
                        // formData.append("testo", $("#domanda").val().trim());
                        // formData.append("risposta", $("#risposta").val().trim());
                        invia = true
                    }
                    break;

                case "close":
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda");
                    else if ($("#risposta").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire la risposta alla domanda");
                    else {
                        cod += '<tr>';
                        cod += '<td>' + $("#domanda").val().trim() + '</td>';
                        cod += '<td>' + $("#risposta").val().trim() + '</td>';
                        cod += '<td><button class="genric-btn danger circle" onclick="rimuoviDomandaEsame(' + $("#bdTabDomEsame").children().length + ')"><i class="fas fa-trash-alt"></i></button></td>';
                        cod += '</tr>';
                        // formData.append("testo", $("#domanda").val().trim());
                        // formData.append("risposta", $("#risposta").val().trim());
                        invia = true
                    }
                    break;
            }
            // console.log(formData.values());
            // console.log(formData); // una volta visti tutti i casi devo aggiungere alla domanda nel form di inserimento
            if(invia){
                if ($("#bdTabDomEsame").children().length == 0)
                    $("#listaDomandeEsame").show();
                $("#bdTabDomEsame").append(cod);
                $("#insNuovaDomanda").modal('hide');
            }
        }
        else {
            $("#msgInsDomanda").html("Devi scegliere il tipo di domanda");
        }
    });
}

function rimuoviDomandaEsame(numDomanda){
    let domande = $("#bdTabDomEsame").children();
    $(domande[numDomanda]).remove();
    if ($("#bdTabDomEsame").children().length == 0)
        $("#listaDomandeEsame").hide();
}

function allowNumbersOnly(e) {
    var code = (e.which) ? e.which : e.keyCode;
    if (code > 31 && (code < 48 || code > 57)) {
        e.preventDefault();
    }
}

function aggiungiDettagliIscritto(){
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
    codHtml += '<div class="col-lg-12 text-center">';
    codHtml += '<button class="genric-btn success radius" style="margin:2px;" id="btnVisEsami">Visualizza Esami</button>';
    codHtml += '</div>';
    codHtml += '</div>';
    $(".right-contents").append(codHtml);
    $("#btnVisEsami").on("click", function(){
        window.location.href = "esami.html?corso=" + $("#descCorso").attr("idCorso");
    });
}

function dettArgomento(argomenti){
    console.log(argomenti);
    let codHtml = "";
    $(".modal-body .msg").html("");
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
        $(".modal-body .msg").text("Nessun argomento trovato");
        $("#risultato").remove();
    }

    $("#dettCorsoMod .modal-body").append(codHtml);
}

function addArgCorso(idArg){
    console.log("Argomento: " + idArg);
    $(".modal-body .msg").text("").css("color", "red");

    let chkToken = inviaRichiesta('/api/insNuovoArgCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idArg": idArg });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 612)  // argomento già presente in corso
            $(".modal-body .msg").show().text(JSON.parse(jqXHR.responseText)["message"]);
        else
            printErrors(jqXHR, ".modal-body .msg");
    });
    chkToken.done(function (data) {
        if (data.nModified == 1)
            window.location.reload();
        else
            $(".modal-body .msg").text("Si è verificato un errore durante l'aggiunta dell'argomento al corso");
    });
}

function dettLezione(lezioni) {
    console.log(lezioni);
    let codHtml = "";
    $(".modal-body .msg").html("");
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
        $(".modal-body .msg").text("Nessuna lezione trovata");
        $("#risultato").remove();
    }

    $("#dettCorsoMod .modal-body").append(codHtml);
}

function addLezCorso(idLez) {
    console.log("Lezione: " + idLez);
    $(".modal-body .msg").text("").css("color", "red");

    let chkToken = inviaRichiesta('/api/insNuovaLezCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idLez": idLez });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 613)  // lezione già presente in corso
            $(".modal-body .msg").show().text(JSON.parse(jqXHR.responseText)["message"]);
        else
            printErrors(jqXHR, ".modal-body .msg");
    });
    chkToken.done(function (data) {
        if (data.nModified == 1)
            window.location.reload();
        else
            $(".modal-body .msg").text("Si è verificato un errore durante l'aggiunta della lezione al corso");
    });
}

function modificaCorso(dettCorso) {
    /*
        nome
        descrizione
        foto (?)
        tipo di gruppo
        ...
    */
    let codHtml = "";
    codHtml += '<div class="row">';
    codHtml += '<div class="col-lg-12 text-center container">';
    codHtml += '<h4>Dettagli del Corso</h4>';
    codHtml += '<form>';
    codHtml += '<div class="form-group row">';
    codHtml += '<label for="nome" class="col-sm-3 col-form-label">Nome Corso</label>';
    codHtml += '<div class="col-sm-9">';
    codHtml += '<input type="text" class="form-control" name="nome" id="nome" value="' + dettCorso[0].descrizione + '" placeholder="Inserisci qui il nome del corso...">';
    codHtml += '</div>';
    codHtml += '</div>';
    // codHtml += '<div class="form-group row">';
    // codHtml += '<label for="descrizione" class="col-sm-3 col-form-label">Descrizione Corso</label>'; // Non c'è la desc su DB, la mettiamo ??
    // codHtml += '<div class="col-sm-9">';
    // codHtml += '<input type="text" class="form-control" name="descrizione" id="descrizione" value="' + dettCorso[0].descrizione + '" placeholder="Inserisci qui la descrizione del corso...">';
    // codHtml += '</div>';
    // codHtml += '</div>';
    // codHtml += '<div class="form-group row">'; // foto da gestire...
    // codHtml += '<label for="nome" class="col-sm-3 col-form-label">Foto del Corso</label>';
    // codHtml += '<div class="col-sm-9">';
    // codHtml += '<input type="text" class="form-control" name="nome" id="nome" placeholder="Inserisci qui il nome del gruppo...">';
    // codHtml += '</div>';
    // codHtml += '</div>';
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

    codHtml += '<p class="msg" style="margin-top:5px"></p>';
    codHtml += '</div>';
    codHtml += '</div>';
    $("#dettCorsoMod .modal-body").append(codHtml);

    let tipiCorsi = inviaRichiesta('/api/elTipiCorsi', 'POST', {});
    tipiCorsi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg"); // capire come visualizzarlo perché così lo visualizza sulla pagina, non sul modal
    });
    tipiCorsi.done(function (data) {
        data.forEach(tipocorso => {
            $("#tipiCorsi").append("<option value='" + tipocorso._id + "' " + (tipocorso._id == dettCorso[0].codTipoModulo ? "selected" : "") + ">" + tipocorso.descrizione + "</option>");
            //$("#default-select-1 .list").append("<li data-value='" + tipocorso._id + "' class='option'>" + tipocorso.descrizione + "</li>");
        });
        $('#tipiCorsi').selectpicker('refresh');
    });

    let materie = inviaRichiesta('/api/elSimpleMaterie', 'POST', {});
    materie.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg"); // capire come visualizzarlo perché così lo visualizza sulla pagina, non sul modal
    });
    materie.done(function (data) {
        data.forEach(materia => {
            $("#materie").append("<option value='" + materia._id + "' " + (materia._id == dettCorso[0].codMateria ? "selected" : "") + ">" + materia.descrizione + "</option>");
            //$("#default-select-1 .list").append("<li data-value='" + materia._id + "' class='option'>" + materia.descrizione + "</li>");
        });
        $('#materie').selectpicker('refresh');
    });
}

function chkCorrettezzaDati() {
    $(".modal-body .msg").text("").css("color", "red");

    if ($("#nome").val().trim() == "") {
        $(".modal-body .msg").text("Devi inserire il nome del corso");
    }
    /*else if ($("#descrizione").val().trim() == "") {
        $(".modal-body .msg").text("Devi inserire la descrizione del gruppo");
    }*/
    else {
        return true;
    }
    return false;
}

function removeArgCorso(idArgomento) {
    $(".modal-body .msg").text("").css("color", "red");

    let chkToken = inviaRichiesta('/api/removeArgCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idArgomento": idArgomento });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".modal-body .msg");
    });
    chkToken.done(function (data) {
        if (data.nModified == 1) {
            $(".modal-body .msg").css("color", "green").text("Argomento rimosso dal corso");
            let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
            chkToken.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, ".modal-body .msg");
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
            $(".modal-body .msg").text("Si è verificato un errore durante la rimozione dell'argomento dal corso");
    });
}

function removeLezCorso(idLezione) {
    $(".modal-body .msg").text("").css("color", "red");

    let chkToken = inviaRichiesta('/api/removeLezCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idLezione": idLezione });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".modal-body .msg");
    });
    chkToken.done(function (data) {
        if (data.nModified == 1) {
            $(".modal-body .msg").css("color", "green").text("Lezione rimossa dal corso");
            let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
            chkToken.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, ".modal-body .msg");
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
            $(".modal-body .msg").text("Si è verificato un errore durante la rimozione della lezione dal corso");
    });
}