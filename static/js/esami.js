"use strict";
let esamiPerTabella = [];

// Routine principale
$(document).ready(function () {
    loadPagina();
});

// Caricamento pagina
function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET
    if(par[0] == "corso" && !isNaN(parseInt(par[1]))){
        let chkToken = inviaRichiesta('/api/esamiCorso', 'POST', {"idCorso" : par[1]});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, "#msgGenEsame");
        });
        chkToken.done(function (data) {
            caricamentoDatiEsami(data);
            chkModeratore(parseInt(par[1]));
        });
    }
    else{
        $("#dettEsameMod .modal-title").html("Errore");
        $("#dettEsameMod .modal-body").children().remove();
        $("#btnSalvaModifiche").show().html("Torna Indietro");
        $("#btnAnnulla").hide();

        let cod = "";
        cod += '<div class="row">';
        cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
        cod += '<p>Errore nel passaggio dei parametri</p>';
        cod += '</div>';
        cod += '</div>';

        $("#dettEsameMod .modal-body").append(cod);
        $("#dettEsameMod").modal('show');
        clickSalvaModifiche();
    }
}

// Funzione che carica i dati dell'esame dinamicamente
function caricamentoDatiEsami(esami) {
    $("#contEsami").html("");
    let codHtml = "";
    let aus;
    
    if (esami == undefined || esami.length == 0){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Non ci sono esami per questo corso</h2>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contEsami").parent().html(codHtml);
        // $("#contEsami").hide();
    }
    else{
        codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 mx-auto justify-content-center">';
        codHtml += '<div class="row">';
        codHtml += '<div class="col-sm-6 col-md-6 col-lg-6 text-center mx-auto">';
        codHtml += '<h4 class="title_top">Elenco Esami</h4>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '<div class="row">';
        codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 col-xs-12 mx-auto table-responsive">';
        codHtml += '<table class="table table-hover table-striped table-bordered">';
        codHtml += '<thead class="thead-inverse">';
        codHtml += '<tr>';
        codHtml += '<th>Descrizione</th>';
        codHtml += '<th>Data Creazione</th>';
        codHtml += '<th>Data e Ora Termine</th>';
        codHtml += '<th>Numero Domande</th>';
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

// Funzione per la conversione dei millisecondi nel formato hh:mm:ss
function calcolaDurata(s){
    let measuredTime = new Date(null);
    measuredTime.setSeconds(s); 
    return measuredTime.toISOString().substr(11, 8);
}

// Funzione per il passaggio alla pagina di svolgimento dell'esame
function vaiAEsame(idEsame, idCorso){
    window.location.href = "svolgimentoEsame.html?esame=" + idEsame + "&corso=" + idCorso;
}

// Controllo privilegi utente
function chkModeratore(idCorso) {
    let chkToken = inviaRichiesta('/api/chkModCorso', 'POST', { "idCorso": idCorso });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgGenEsame");
    });
    chkToken.done(function (data) {
        if(data.ris != "noAutNoIsc"){
            let codHtml = "";
            esamiPerTabella.forEach(esame => {
                codHtml += '<tr>';
                codHtml += '<td scope="row">' + esame.descrizione + '</td>';
                codHtml += '<td>' + new Date(esame.dataCreazione).toLocaleDateString() + '</td>';
                codHtml += '<td>' + new Date(esame.dataScadenza).toLocaleDateString() + ' - ' + new Date(esame.dataScadenza).toLocaleTimeString().substring(0, 5) + '</td>';
                codHtml += '<td>' + esame.numDomande + '</td>';
                codHtml += '<td>' + calcolaDurata(parseInt(esame.durata)) + '</td>';
                codHtml += '<td>' + (new Date(esame.dataScadenza) >= new Date() ? "In corso" : "Terminato") + '</td>';
                codHtml += '<td>';
                codHtml += (new Date(esame.dataScadenza) >= new Date() ? '<button class="genric-btn info circle" onclick="vaiAEsame(' + esame._id + ',' + esame.codModulo + ')"><i class="fas fa-arrow-right"></i></button>' : '');
                if (data.ris == "autore") {
                    codHtml += '<button class="genric-btn info circle" data-toggle="modal" data-target="#dettEsameMod" onclick="modificaEsame(' + esame._id + ')"><i class="fas fa-edit"></i></button>';
                    codHtml += '<button class="genric-btn danger circle" data-toggle="modal" data-target="#dettEsameMod" onclick="rimuoviEsame(' + esame._id + ')"><i class="fas fa-trash-alt"></i></button>';
                }
                codHtml += '</td>';
                codHtml += '</tr>';
            });
            $("#bodyTabEsame").html(codHtml);
            esamiPerTabella = [];

            if (data.ris == "autore") {
                codHtml = "";
                codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 mx-auto text-center">';
                codHtml += '<h4 class="title_top">Nuovo Esame</h4>';
                codHtml += '<div class="row">';
                codHtml += '<div class="col-sm-10 col-md-7 col-lg-7 mx-auto">';
                codHtml += '<div class="card card-signin my-5">';
                codHtml += '<div class="card-body">';
                codHtml += '<form id="formInsEsame" class="form-contact">';
                codHtml += '<div class="row">';
                codHtml += '<div class="col-sm-8 col-md-8 col-lg-6 col-xl-4 mx-auto">';
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
                codHtml += '<span class="input-group-text">';
                codHtml += '<i class="fas fa-sort-numeric-up-alt"> </i>';
                codHtml += '</span>';
                codHtml += '<input type="number" step="0.01" value="0.01" min="0.01" max="10.00" aria-describedby="helpMaxVoto" id="maxVoto" name="maxVoto" required class="single-input">';
                codHtml += '<small id="helpMaxVoto" class="form-text text-muted">Voto massimo esame</small>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '<div class="input-group form-group">';
                codHtml += '<div class="input-group-prepend">';
                codHtml += '<span class="input-group-text">';
                codHtml += '<i class="fas fa-sort-numeric-up-alt"> </i>';
                codHtml += '</span>';
                codHtml += '<input type="number" step="0.01" value="0.01" min="0.01" max="10.00" aria-describedby="helpMinVoto" id="minVoto" name="minVoto" required class="single-input">';
                codHtml += '<small id="helpMinVoto" class="form-text text-muted">Voto minimo esame</small>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '<div class="row">'
                codHtml += '<div class="col-sm-10 col-md-10 col-lg-10 mx-auto">';
                codHtml += '<div class="form-group">';
                codHtml += '<a class="genric-btn info circle btn-block" data-toggle="modal" data-target="#insNuovaDomanda" style="margin:2px; color: #fff!important;" id="btnAddDomanda">Aggiungi Domanda</a>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '<div class="row">';
                codHtml += '<div class="col-sm-12 col-md-7 col-lg-7 mx-auto">';
                codHtml += '<div id="msgAddEsame" role="alert" style="text-align: center;"></div>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '<div class="row">'
                codHtml += '<div id="listaDomandeEsame" class="col-sm-12 col-md-12 col-lg-12 col-xs-12 mx-auto table-responsive">';
                codHtml += '<table class="table table-hover table-striped table-bordered">';
                codHtml += '<thead class="thead-inverse">';
                codHtml += '<tr>';
                codHtml += '<th>Domanda</th>';
                codHtml += '<th>Punteggio</th>';
                codHtml += '<th>Risposta/e</th>';
                codHtml += '<th>Tipo Domanda</th>';
                codHtml += '<th>Azione</th>';
                codHtml += '</tr>';
                codHtml += '</thead>';
                codHtml += '<tbody id="bdTabDomEsame">';
                codHtml += '</tbody>';
                codHtml += '</table>';
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '<div class="row">'
                codHtml += '<div class="col-sm-6 col-md-6 col-lg-6 mx-auto">';
                codHtml += '<div class="form-group">';
                codHtml += '<a id="btnInsEsame" class="genric-btn primary circle btn-block" style="color: #fff!important;">Invia</a>';
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
                    drawModaleDomande("ins");
                });

                $("#btnInsEsame").on("click", function () {
                    $("#descEsame").removeClass("alert-danger");
                    $("#durata").removeClass("alert-danger");
                    $("#dataScadenza").removeClass("alert-danger");
                    $("#oraFineEsame").removeClass("alert-danger");
                    $("#maxVoto").removeClass("alert-danger");
                    $("#minVoto").removeClass("alert-danger");
                    $("#msgAddEsame").html("").removeClass("alert alert-danger");

                    if ($("#descEsame").val().trim() != "") {
                        if ($("#durata").val().trim() != "") {
                            if ($("#dataScadenza").val().trim() != "") {
                                if ($("#oraFineEsame").val().trim() != "") {
                                    if (!isNaN($("#maxVoto").val().trim())){
                                        if (parseFloat($("#maxVoto").val().trim()) >= 0.01 && parseFloat($("#maxVoto").val().trim()) <= 10.00) {
                                            if (!isNaN($("#minVoto").val().trim())){
                                                if (parseFloat($("#minVoto").val().trim()) >= 0.01 && parseFloat($("#minVoto").val().trim()) <= 10.00) {
                                                    if (parseFloat($("#maxVoto").val().trim()) > parseFloat($("#minVoto").val().trim())){
                                                        // controllo su data e ora scadenza esame
                                                        let dataLetta = $("#dataScadenza").val();
                                                        let ora = $("#oraFineEsame").val();
                                                        let scadEsame = new Date(dataLetta + "T" + ora);
            
                                                        // controllo data > o = a quella odierna
                                                        if (new Date(dataLetta) >= new Date(new Date().toISOString().split('T')[0])) {// controllo le singole date, confronto la data inserita con quella attuale con time 0 (altrimenti mi dava problemi)
                                                            // c'è un momento in cui non va, non ho ancora capito quando (ad esempio modifico esame verso le 10 di sera e metto data di scadenza il giorno dopo a mezzanotte (?) e non va)
                                                            // controllo ora successiva a quella attuale ( + durata esame oppure no ?)
                                                            if (scadEsame > new Date()) {
                                                                if ($("#bdTabDomEsame").children().length != 0) {
            
                                                                    let dati = new Object();
                                                                    dati.idCorso = idCorso;
                                                                    dati.descrizione = $("#descEsame").val().trim();
                                                                    dati.durata = $("#durata").val().trim();
                                                                    dati.dataScadenza = scadEsame.toJSON();
                                                                    dati.maxVoto = parseFloat($("#maxVoto").val().trim());
                                                                    dati.minVoto = parseFloat($("#minVoto").val().trim());
                                                                    let domande = $("#bdTabDomEsame").children();
                                                                    dati.domande = new Array();
            
                                                                    for (let i = 0; i < domande.length; i++) {
                                                                        let vet = new Array();
                                                                        let campi = $(domande[i]).children();
                                                                        vet.push($(domande[i]).attr('tipoDom'));
                                                                        for (let j = 0; j < campi.length - 2; j++)
                                                                            vet.push($(campi[j]).html());
            
                                                                        dati.domande.push(vet.join(';'));
                                                                    }
            
                                                                    let chkToken = inviaRichiesta('/api/aggiungiEsame', 'POST', dati);
                                                                    chkToken.fail(function (jqXHR, test_status, str_error) {
                                                                        printErrors(jqXHR, "#msgAddEsame");
                                                                    });
                                                                    chkToken.done(function (data) {
                                                                        if (data == "aggEsameOk") {
                                                                            $("#dettEsameMod .modal-title").html("Risultato Operazione");
                                                                            $("#dettEsameMod .modal-body").children().remove();
                                                                            $("#btnSalvaModifiche").show().html("Chiudi");
                                                                            $("#btnAnnulla").hide();
            
                                                                            let cod = "";
                                                                            cod += '<div class="row">';
                                                                            cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
                                                                            cod += '<p>Esame inserito con successo</p>';
                                                                            cod += '</div>';
                                                                            cod += '</div>';
            
                                                                            $("#dettEsameMod .modal-body").append(cod);
                                                                            $("#dettEsameMod").modal('show');
                                                                            clickSalvaModifiche();
                                                                        }
                                                                        else
                                                                            $("#msgAddEsame").text("Si è verificato un errore durante l'inserimento dell\'esame. Riprovare").removeClass("alert alert-danger");
                                                                    });
                                                                }
                                                                else {
                                                                    gestErrori("Devi inserire almeno una domanda", null, "#msgAddEsame");
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
                                                        gestErrori("Il voto massimo dell'esame deve essere maggiore del voto minimo", $("#maxVoto"), "#msgAddEsame");
                                                    }
                                                }
                                                else {
                                                    gestErrori("Devi inserire un voto compreso tra 0.01 e 10.00 come voto minimo dell'esame", $("#minVoto"), "#msgAddEsame");
                                                }
                                            }
                                            else {
                                                gestErrori("Devi inserire un numero come voto minimo dell'esame", $("#minVoto"), "#msgAddEsame");
                                            }
                                        }
                                        else {
                                            gestErrori("Devi inserire un voto compreso tra 0.01 e 10.00 come voto massimo dell'esame", $("#maxVoto"), "#msgAddEsame");
                                        }
                                    }
                                    else {
                                        gestErrori("Devi inserire un numero come voto massimo dell'esame", $("#maxVoto"), "#msgAddEsame");
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
                        else {
                            gestErrori("Devi inserire la durata dell'esame", $("#durata"), "#msgAddEsame");
                        }
                    }
                    else {
                        gestErrori("Devi inserire la descrizione dell'esame", $("#descEsame"), "#msgAddEsame");
                    }
                });
            }
        }
        else if (data.ris == "noAutNoIsc"){
            window.location.href = "corsi.html"; // vedere se segnalare all'utente o no
        }
    });
}

// Funzione di stampa errori
function gestErrori(msg, controllo, target) {
    $(target).html(msg).addClass("alert alert-danger");
    if(controllo != null)
        controllo.addClass("alert-danger");
}

// Funzione di gestione della modale delle domande dell'esame
function drawModaleDomande(prov){
    let codHtml = '';
    codHtml += '<div class="modal fade" id="insNuovaDomanda" tabindex="1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">';
    codHtml += '<div class="modal-dialog modal-lg" style="overflow-y: scroll; max-height:85%; margin-top: 100px; margin-bottom:50px;">';
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
    codHtml += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgInsDomanda" role="alert" style="text-align: center;"></div></div></div>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '<div class="modal-footer">';
    codHtml += '<button type="button" id="btnSalvaDomanda" class="genric-btn success radius">Inserisci</button>';
    if(prov == "mod")
        codHtml += '<button type="button" class="genric-btn danger radius" onclick="closeModalOnModify()">Annulla</button>';
    else
        codHtml += '<button type="button" class="genric-btn danger radius" data-dismiss="modal">Annulla</button>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '</div>';
    codHtml += '</div>';
    $("#contModDomande").html(codHtml);

    $('#tipoDomanda').selectpicker('refresh');
    document.getElementById("tipoDomanda").selectedIndex = -1;
    $("#tipoDomanda").on("change", function () {
        $("#msgInsDomanda").html("").removeClass("alert alert-danger");
        let cod = '';
        cod += '<div class="col-sm-10 col-md-10 col-lg-10 mx-auto">';
        cod += '<form>';
        cod += '<div class="input-group form-group">';
        cod += '<div class="input-group-prepend">';
        cod += '<span class="input-group-text">';
        cod += '<i class="fas fa-user-circle"> </i>';
        cod += '</span>';
        cod += '<input type="text" id="domanda" name="domanda" placeholder="Domanda" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Domanda\'" required class="single-input">';
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="input-group form-group">';
        cod += '<div class="input-group-prepend">';
        cod += '<span class="input-group-text">';
        cod += '<i class="fas fa-sort-numeric-up-alt"> </i>';
        cod += '</span>';
        cod += '<input type="number" step="0.01" value="0.01" min="0.01" max="10.00" id="punteggioDom" name="punteggioDom" required class="single-input">';
        cod += '</div>';
        cod += '</div>';

        switch ($("option:selected", this).val()) {
            case "trueFalse":
                cod += '<div class="form-group">';
                cod += '<label for="risposta">Risposta:</label>';
                cod += '<br/>';
                cod += '<div class="col-sm-4 col-md-4 col-lg-4 mx-auto">'
                cod += '<div class="row">'
                cod += '<div class="col-sm-2 col-md-2 col-lg-2">'
                cod += '<input type="radio" value="true" name="risposta">';
                cod += '</div>';
                cod += '<div class="col-sm-2 col-md-2 col-lg-2">'
                cod += '<span>Vero</span>'
                cod += '</div>';
                cod += '</div>';
                cod += '<div class="row">'
                cod += '<div class="col-sm-2 col-md-2 col-lg-2">'
                cod += '<input type="radio" value="false" name="risposta">';
                cod += '</div>';
                cod += '<div class="col-sm-2 col-md-2 col-lg-2">'
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
                cod += '<div class="col-sm-8 col-md-8 col-lg-8 mx-auto">';
                cod += '<input type="number" min="2" max="10" id="numRisp" name="numRisp" onkeypress="allowNumbersOnly(event)" maxlength="2" value="2" class="single-input">';
                cod += '</div>';
                cod += '</div>';
                cod += '<div id="contRisposte" class="col-sm-12 col-md-12 col-lg-12 mx-auto">';
                for (let i = 0; i < 2; i++) {
                    cod += '<div class="row" style="margin-bottom:10px">';
                    cod += '<div class="col-sm-5 col-md-5 col-lg-5" style="margin-top:10px">';
                    cod += '<span>Risposta ' + (i + 1) + ':</span>';
                    cod += '</div>';
                    cod += '<div class="col-sm-7 col-md-7 col-lg-7">';
                    cod += '<input type="text" id="risp' + (i + 1) + '" name="risposte" required class="single-input">';
                    cod += '</div>';
                    cod += '</div>';
                }
                cod += '<div class="row" style="margin-bottom:10px">';
                cod += '<div class="col-sm-8 col-md-8 col-lg-8 mx-auto"><h5>Risposta Corretta</h5></div>';
                cod += '</div>';
                cod += '<div class="row" style="margin-bottom:10px">';
                for(let i = 0; i < 2; i++){
                    cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
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
                $("#msgInsDomanda").html("").removeClass("alert alert-danger");
                if ($(this).val().trim() != "") {
                    if (parseInt($(this).val()) < 2 || parseInt($(this).val()) > 10)
                        $("#msgInsDomanda").html("Devi scegliere un numero di risposte compreso tra 2 e 10").addClass("alert alert-danger");
                    else {
                        cod = '';
                        let nRisp = parseInt($(this).val());
                        for (let i = 0; i < nRisp; i++) {
                            cod += '<div class="row" style="margin-bottom:10px">';
                            cod += '<div class="col-sm-5 col-md-5 col-lg-5" style="margin-top:10px">';
                            cod += '<span>Risposta ' + (i + 1) + ':</span>';
                            cod += '</div>';
                            cod += '<div class="col-sm-7 col-md-7 col-lg-7">';
                            cod += '<input type="text" id="risp' + (i + 1) + '" name="risposte" required class="single-input">';
                            cod += '</div>';
                            cod += '</div>';
                        }
                        cod += '<div class="row" style="margin-bottom:10px">';
                        cod += '<div class="col-sm-8 col-md-8 col-lg-8 mx-auto"><h5>Risposta Corretta</h5></div>';
                        cod += '</div>';
                        cod += '<div class="row" style="margin-bottom:10px">';
                        for (let i = 0; i < nRisp; i++) {
                            cod += '<div class="col-sm-' + Math.floor(12 / nRisp) + ' col-md-' + Math.floor(12 / nRisp) + ' col-lg-' + Math.floor(12/nRisp) + '">';
                            cod += (i + 1) + ' <input type="checkbox" id="giusta_' + (i + 1) + '" name="giusta_' + (i + 1) + '" class="single-input">';
                            cod += '</div>';
                        }
                        cod += '</div>';
                        $("#contRisposte").html(cod);
                    }
                }
                else
                    $("#msgInsDomanda").html("Devi inserire un numero di risposte (compreso tra 2 e 10)").addClass("alert alert-danger");
            });
        }
    });

    $("#btnSalvaDomanda").on("click", function () {
        $("#msgInsDomanda").html("").removeClass("alert alert-danger");
        if ($("#tipoDomanda option:selected").val() != undefined) {
            let invia = false;
            let cod = '';
            let idNewRow = getNewId(prov);
            switch ($("#tipoDomanda option:selected").val()) {
                case "trueFalse":
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda").addClass("alert alert-danger");
                    else if ($("#punteggioDom").val().trim() == "" || isNaN($("#punteggioDom").val().trim()))
                        $("#msgInsDomanda").html("Devi inserire un numero come punteggio").addClass("alert alert-danger");
                    else if (parseFloat($("#punteggioDom").val().trim()) < 0.01 || parseFloat($("#punteggioDom").val().trim()) > 10.00)
                        $("#msgInsDomanda").html("Il punteggio deve essere compreso tra 0.01 e 10.00").addClass("alert alert-danger");
                    else if ($("input[name='risposta']:checked").val() == undefined)
                        $("#msgInsDomanda").html("Devi scegliere la risposta alla domanda").addClass("alert alert-danger");
                    else{
                        cod += '<tr id="dom_' + idNewRow + '" tipoDom="' + $("#tipoDomanda option:selected").val() + '">';
                        cod += '<td>' + $("#domanda").val().trim() + '</td>';
                        cod += '<td>' + parseFloat($("#punteggioDom").val().trim()) + '</td>';
                        cod += '<td>' + ($("input[name='risposta']:checked").val() ? "Vero" : "Falso") + '</td>';
                        cod += '<td>Vero o Falso</td>';
                        cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + idNewRow + '\', \'' + prov + '\')"><i class="fas fa-trash-alt"></i></a></td>';
                        cod += '</tr>';
                        invia = true
                    }
                    break;

                case "multi":
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda").addClass("alert alert-danger");
                    else if ($("#punteggioDom").val().trim() == "" || isNaN($("#punteggioDom").val().trim()))
                        $("#msgInsDomanda").html("Devi inserire un numero come punteggio").addClass("alert alert-danger");
                    else if (parseFloat($("#punteggioDom").val().trim()) < 0.01 || parseFloat($("#punteggioDom").val().trim()) > 10.00)
                        $("#msgInsDomanda").html("Il punteggio deve essere compreso tra 0.01 e 10.00").addClass("alert alert-danger");
                    else if ($("#contRisposte input[type='checkbox']:checked").length == 0)
                        $("#msgInsDomanda").html("Devi specificare quali risposte sono quelle giuste").addClass("alert alert-danger");
                    else{
                        let corretto = true;
                        let ris = new Array();
                        let risposte = $('#contRisposte input[type="text"]');
                        for(let i = 0; i < risposte.length; i++){
                            if($(risposte[i]).val().trim() == ""){
                                $("#msgInsDomanda").html("Devi inserire la risposta " + (i + 1) + " alla domanda").addClass("alert alert-danger");
                                corretto = false;
                                break;
                            }
                            else{
                                ris.push($(risposte[i]).val().trim());
                            }
                        }

                        if(corretto){
                            let rispGiuste = $("#contRisposte input[type='checkbox']:checked");
                            let id = new Array();
                            for(let i = 0; i < rispGiuste.length; i++)
                                id.push($(rispGiuste[i]).attr("id").split('_')[1]);
                            
                            invia = true

                            cod += '<tr id="dom_' + idNewRow + '" tipoDom="' + $("#tipoDomanda option:selected").val() + '">';
                            cod += '<td>' + $("#domanda").val().trim() + '</td>';
                            cod += '<td>' + parseFloat($("#punteggioDom").val().trim()) + '</td>';
                            cod += '<td>' + (ris.join(',')) + ' - Giuste: ' + (id.join(',')) + '</td>';
                            cod += '<td>Domanda a Risposta Multipla</td>';
                            cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + idNewRow + '\', \'' + prov + '\')"><i class="fas fa-trash-alt"></i></a></td>';
                            cod += '</tr>';
                        }
                    }
                    break;

                case "open": // da controllare ?!?!!??!?!
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda").addClass("alert alert-danger");
                    else if ($("#punteggioDom").val().trim() == "" || isNaN($("#punteggioDom").val().trim()))
                        $("#msgInsDomanda").html("Devi inserire un numero come punteggio").addClass("alert alert-danger");
                    else if (parseFloat($("#punteggioDom").val().trim()) < 0.01 || parseFloat($("#punteggioDom").val().trim()) > 10.00)
                        $("#msgInsDomanda").html("Il punteggio deve essere compreso tra 0.01 e 10.00").addClass("alert alert-danger");
                    else if ($("#risposta").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire la risposta alla domanda").addClass("alert alert-danger"); // non so se ha senso fargli mettere la risposta alla domanda aperta ?!?!?!?!
                    else {
                        cod += '<tr id="dom_' + idNewRow + '" tipoDom="' + $("#tipoDomanda option:selected").val() + '">';
                        cod += '<td>' + $("#domanda").val().trim() + '</td>';
                        cod += '<td>' + parseFloat($("#punteggioDom").val().trim()) + '</td>';
                        cod += '<td>' + $("#risposta").val().trim() + '</td>';
                        cod += '<td>Domanda Aperta</td>';
                        cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + idNewRow + '\', \'' + prov + '\')"><i class="fas fa-trash-alt"></i></a></td>';
                        cod += '</tr>';
                        invia = true
                    }
                    break;

                case "close":
                    if ($("#domanda").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire il testo della domanda").addClass("alert alert-danger");
                    else if ($("#punteggioDom").val().trim() == "" || isNaN($("#punteggioDom").val().trim()))
                        $("#msgInsDomanda").html("Devi inserire un numero come punteggio").addClass("alert alert-danger");
                    else if (parseFloat($("#punteggioDom").val().trim()) < 0.01 || parseFloat($("#punteggioDom").val().trim()) > 10.00)
                        $("#msgInsDomanda").html("Il punteggio deve essere compreso tra 0.01 e 10.00").addClass("alert alert-danger");
                    else if ($("#risposta").val().trim() == "")
                        $("#msgInsDomanda").html("Devi inserire la risposta alla domanda").addClass("alert alert-danger");
                    else {
                        cod += '<tr id="dom_' + idNewRow + '" tipoDom="' + $("#tipoDomanda option:selected").val() + '">';
                        cod += '<td>' + $("#domanda").val().trim() + '</td>';
                        cod += '<td>' + parseFloat($("#punteggioDom").val().trim()) + '</td>';
                        cod += '<td>' + $("#risposta").val().trim() + '</td>';
                        cod += '<td>Domanda Chiusa</td>';
                        cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + idNewRow + '\', \'' + prov + '\')"><i class="fas fa-trash-alt"></i></a></td>';
                        cod += '</tr>';
                        invia = true
                    }
                    break;
            }

            if(invia){
                if(prov == "ins"){
                    if ($("#bdTabDomEsame").children().length == 0)
                        $("#listaDomandeEsame").show();
                    $("#bdTabDomEsame").append(cod);
                    $("#insNuovaDomanda").modal('hide');
                }
                else{
                    if ($("#bdTabDomEsameMod").children().length == 0)
                        $("#listaDomandeEsameMod").show();
                    $("#bdTabDomEsameMod").append(cod);
                    $("#insNuovaDomanda").modal('hide');
                    $("#dettEsameMod").modal('show');
                }
            }
        }
        else {
            $("#msgInsDomanda").html("Devi scegliere il tipo di domanda").addClass("alert alert-danger");
        }
    });
}

// Funzione che restituisce un numero per la generazione delle domande
function getNewId(prov){
    let domande;
    let num;
    if(prov == "ins")
        domande = $("#bdTabDomEsame").children();
    else
        domande = $("#bdTabDomEsameMod").children();

    if(domande.length > 0){
        let idDati = new Array();
        for(let i = 0; i < domande.length; i++){
            idDati.push(parseInt($(domande[i]).attr("id").split('_')[1])); // recupero valori già inseriti
        }
        
        num = Math.floor(Math.random() * 1001);
        while(!jQuery.inArray(num, idDati))
           num = Math.floor(Math.random() * 1001);
    }
    else
        num = Math.floor(Math.random() * 1001);

    return num;
}

// Funzione per la gestione della chiusura della modale delle domande
function closeModalOnModify(){
    $("#insNuovaDomanda").modal('hide');
    $("#dettEsameMod").modal('show');
}

// Funzione per la rimozione di una domanda dall'esame
function rimuoviDomandaEsame(dom, prov){
    $("#" + dom).remove();
    
    if(prov == "ins"){
        if ($("#bdTabDomEsame").children().length == 0)
            $("#listaDomandeEsame").hide();
    }
    else{
        if ($("#bdTabDomEsameMod").children().length == 0)
            $("#listaDomandeEsameMod").hide();
    }
}

// Funzione per il controllo del campo di input che sia numerico
function allowNumbersOnly(e) {
    var code = (e.which) ? e.which : e.keyCode;
    if (code > 31 && (code < 48 || code > 57)) {
        e.preventDefault();
    }
}

// Funzione di gestione della modifica dell'esame
function modificaEsame(idEsame){
    $("#dettEsameMod .modal-title").html("Modifica dell'Esame");
    $("#dettEsameMod .modal-body").children().remove();
    $("#btnSalvaModifiche").show().html("Salva Modifiche");
    let chkToken = inviaRichiesta('/api/datiEsameById', 'POST', {"idEsame" : idEsame});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgGenEsame");
    });
    chkToken.done(function (dettEsame) {
        let cod = "";
        cod += '<div class="row">';
        cod += '<div class="col-sm-8 col-md-8 col-lg-8 text-center container">';
        cod += '<form>';
        cod += '<div class="form-group row">';
        cod += '<label for="descrizione" class="col-sm-3 col-md-3 col-lg-3 col-form-label">Descrizione Esame</label>';
        cod += '<div class="col-sm-9 col-md-9 col-lg-9">';
        cod += '<input type="text" class="form-control" name="descrizione" id="descrizione" value="' + dettEsame.descrizione + '" placeholder="Inserisci qui la descrizione dell\'esame...">';
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="form-group row">';
        cod += '<label for="durataMod" class="col-sm-6 col-md-6 col-lg-6 col-form-label">Durata dell\'Esame (hh:mm)</label>';
        cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
        cod += '<input type="time" id="durataMod" name="durataMod" class="form-control" value="' + calcolaDurata(parseInt(dettEsame.durata)).substring(0,5) + '">'; // non so se va...
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="form-group row">';
        cod += '<label for="dataScadenzaMod" class="col-sm-6 col-md-6 col-lg-6 col-form-label">Data di Scadenza di Iscrizione all\'Esame</label>';
        cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
        cod += '<input type="date" class="form-control" name="dataScadenzaMod" id="dataScadenzaMod" value="' + parsificaData(dettEsame.dataScadenza) + '">';
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="form-group row">';
        cod += '<label for="oraFineEsameMod" class="col-sm-6 col-md-6 col-lg-6 col-form-label">Ora di Scadenza di Iscrizione all\'Esame</label>';
        cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
        cod += '<input type="time" id="oraFineEsameMod" name="oraFineEsameMod" class="form-control" value="' + new Date(dettEsame.dataScadenza).toLocaleTimeString().substring(0,5) + '">'; // da controllare
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="form-group row">';
        cod += '<label for="maxVoto" class="col-sm-6 col-md-6 col-lg-6 col-form-label">Voto massimo dell\'Esame</label>';
        cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
        cod += '<input type="number" step="0.01" min="0.01" max="10.00" id="votoMaxEsame" name="votoMaxEsame" class="form-control" value="' + parseFloat(dettEsame.maxVoto) + '">'
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="form-group row">';
        cod += '<label for="maxVoto" class="col-sm-6 col-md-6 col-lg-6 col-form-label">Voto minimo dell\'Esame</label>';
        cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
        cod += '<input type="number" step="0.01" min="0.01" max="10.00" id="votoMinEsame" name="votoMinEsame" class="form-control" value="' + parseFloat(dettEsame.minVoto) + '">'
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="row">';
        cod += '<div class="col-sm-12 col-md-7 col-lg-7 mx-auto">';
        cod += '<div id="msgModEsame" role="alert" style="text-align: center;"></div>';
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="row">'
        cod += '<div id="listaDomandeEsameMod" idEsame="' + dettEsame._id + '" class="col-sm-12 col-md-12 col-lg-12 col-xs-12 mx-auto table-responsive">';
        cod += '<table class="table table-hover table-striped table-bordered">';
        cod += '<thead class="thead-inverse">';
        cod += '<tr>';
        cod += '<th>Domanda</th>';
        cod += '<th>Punteggio</th>';
        cod += '<th>Risposta/e</th>';
        cod += '<th>Tipo Domanda</th>';
        cod += '<th>Azione</th>';
        cod += '</tr>';
        cod += '</thead>';
        cod += '<tbody id="bdTabDomEsameMod">';
        cod += '</tbody>';
        cod += '</table>';
        cod += '</div>';
        cod += '</div>';
        cod += '<div class="row">'
        cod += '<div class="col-sm-6 col-md-12 col-lg-6 mx-auto">';
        cod += '<div class="form-group">';
        cod += '<a class="genric-btn info circle btn-block" data-toggle="modal" data-target="#insNuovaDomanda" style="margin:2px; color: #fff!important;" id="btnAddDomandaMod">Aggiungi Domanda</a>';
        cod += '</div>';
        cod += '</div>';
        $("#dettEsameMod .modal-body").append(cod);
        if(dettEsame.domande.length == 0)
            $("#listaDomandeEsameMod").hide();
        
        $("#btnAddDomandaMod").on("click", function () {
            $("#dettEsameMod").modal('hide');
            drawModaleDomande("mod");
        });

       clickSalvaModifiche();

        cod = '';
        for(let i = 0; i < dettEsame.domande.length; i++){
            switch(dettEsame.domande[i].tipoDomanda){
                case "trueFalse":
                    cod += '<tr id="dom_' + i + '" tipoDom="' + dettEsame.domande[i].tipoDomanda + '">';
                    cod += '<td>' + dettEsame.domande[i].testo + '</td>';
                    cod += '<td>' + dettEsame.domande[i].punteggio + '</td>';
                    cod += '<td>' + (dettEsame.domande[i].risposte[0].corretta ? dettEsame.domande[i].risposte[0].testo : dettEsame.domande[i].risposte[1].testo) + '</td>';
                    cod += '<td>Vero o Falso</td>';
                    cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + i + '\', \'mod\')"><i class="fas fa-trash-alt"></i></a></td>';
                    cod += '</tr>';
                    break;

                case "multi":
                    let risposte = new Array();
                    let rispGiuste = new Array();
                    for (let j = 0; j < dettEsame.domande[i].risposte.length; j++){
                        risposte.push(dettEsame.domande[i].risposte[j].testo);
                        
                        if (dettEsame.domande[i].risposte[j].corretta)
                            rispGiuste.push((j+1));
                    }

                    cod += '<tr id="dom_' + i + '" tipoDom="' + dettEsame.domande[i].tipoDomanda + '">';
                    cod += '<td>' + dettEsame.domande[i].testo + '</td>';
                    cod += '<td>' + dettEsame.domande[i].punteggio + '</td>';
                    cod += '<td>' + (risposte.join(',')) + ' - Giuste: ' + (rispGiuste.join(',')) + '</td>';
                    cod += '<td>Domanda a Risposta Multipla</td>';
                    cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + i + '\', \'mod\')"><i class="fas fa-trash-alt"></i></a></td>';
                    cod += '</tr>';
                    break;

                case "open":
                    cod += '<tr id="dom_' + i + '" tipoDom="' + dettEsame.domande[i].tipoDomanda + '">';
                    cod += '<td>' + dettEsame.domande[i].testo + '</td>';
                    cod += '<td>' + dettEsame.domande[i].punteggio + '</td>';
                    cod += '<td>' + dettEsame.domande[i].risposte[0].testo + '</td>';
                    cod += '<td>Domanda Aperta</td>';
                    cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + i + '\', \'mod\')"><i class="fas fa-trash-alt"></i></a></td>';
                    cod += '</tr>';
                    break;

                case "close":
                    cod += '<tr id="dom_' + i + '" tipoDom="' + dettEsame.domande[i].tipoDomanda + '">';
                    cod += '<td>' + dettEsame.domande[i].testo + '</td>';
                    cod += '<td>' + dettEsame.domande[i].punteggio + '</td>';
                    cod += '<td>' + dettEsame.domande[i].risposte[0].testo + '</td>';
                    cod += '<td>Domanda Chiusa</td>';
                    cod += '<td><a class="genric-btn danger circle" onclick="rimuoviDomandaEsame(\'dom_' + i + '\', \'mod\')"><i class="fas fa-trash-alt"></i></a></td>';
                    cod += '</tr>';
                    break;
            }
        }
        $("#bdTabDomEsameMod").append(cod);
    });
}

// Funzione per l'adattamento della data per campo input date
function parsificaData(data){
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

// Funzione per la gestione del pulsante di salvataggio della modale
function clickSalvaModifiche(){
    $("#btnSalvaModifiche").on("click", function () {
        if ($(this).html() == "Salva Modifiche") {
            $("#descrizione").removeClass("alert-danger");
            $("#durataMod").removeClass("alert-danger");
            $("#dataScadenzaMod").removeClass("alert-danger");
            $("#oraFineEsameMod").removeClass("alert-danger");
            $("#votoMaxEsame").removeClass("alert-danger");
            $("#votoMinEsame").removeClass("alert-danger");
            $("#msgModEsame").html("").removeClass("alert alert-danger");

            if ($("#descrizione").val().trim() != "") {
                if ($("#durataMod").val().trim() != "") {
                    if ($("#dataScadenzaMod").val().trim() != "") {
                        if ($("#oraFineEsameMod").val().trim() != "") {
                            if (!isNaN($("#votoMaxEsame").val().trim())) {
                                if (parseFloat($("#votoMaxEsame").val().trim()) >= 0.01 && parseFloat($("#votoMaxEsame").val().trim()) <= 10.00) {
                                    if (!isNaN($("#votoMinEsame").val().trim())) {
                                        if (parseFloat($("#votoMinEsame").val().trim()) >= 0.01 && parseFloat($("#votoMinEsame").val().trim()) <= 10.00) {
                                            if (parseFloat($("#votoMaxEsame").val().trim()) > parseFloat($("#votoMinEsame").val().trim())) {
                                                // controllo su data e ora scadenza esame
                                                let dataLetta = $("#dataScadenzaMod").val();
                                                let ora = $("#oraFineEsameMod").val();
                                                let scadEsame = new Date(dataLetta + "T" + ora);

                                                if ($("#bdTabDomEsameMod").children().length != 0) {

                                                    let dati = new Object();
                                                    dati.idEsame = $("#listaDomandeEsameMod").attr("idEsame");
                                                    dati.idCorso = window.location.search.substring(1).split('=')[1];
                                                    dati.descrizione = $("#descrizione").val().trim();
                                                    dati.durata = $("#durataMod").val().trim();
                                                    dati.dataScadenza = scadEsame.toJSON();
                                                    dati.maxVoto = parseFloat($("#votoMaxEsame").val().trim());
                                                    dati.minVoto = parseFloat($("#votoMinEsame").val().trim());
                                                    let domande = $("#bdTabDomEsameMod").children();
                                                    dati.domande = new Array();

                                                    for (let i = 0; i < domande.length; i++) {
                                                        let vet = new Array();
                                                        let campi = $(domande[i]).children();
                                                        vet.push($(domande[i]).attr('tipoDom'));
                                                        for (let j = 0; j < campi.length - 2; j++)
                                                            vet.push($(campi[j]).html());

                                                        dati.domande.push(vet.join(';'));
                                                    }

                                                    let chkToken = inviaRichiesta('/api/modificaEsame', 'POST', dati);
                                                    chkToken.fail(function (jqXHR, test_status, str_error) {
                                                        printErrors(jqXHR, "#msgModEsame");
                                                    });
                                                    chkToken.done(function (data) {
                                                        if (data == "modEsameOk") {
                                                            $("#dettEsameMod .modal-title").html("Risultato Operazione");
                                                            $("#dettEsameMod .modal-body").children().remove();
                                                            $("#btnSalvaModifiche").show().html("Chiudi");
                                                            $("#btnAnnulla").hide();

                                                            let cod = "";
                                                            cod += '<div class="row">';
                                                            cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
                                                            cod += '<p>Esame modificato correttamente</p>';
                                                            cod += '</div>';
                                                            cod += '</div>';

                                                            $("#dettEsameMod .modal-body").append(cod);
                                                        }
                                                        else
                                                            $("#msgModEsame").text("Si è verificato un errore durante la modifica dell\'esame. Riprovare").addClass("alert alert-danger");
                                                    });
                                                }
                                                else {
                                                    gestErrori("Devi inserire almeno una domanda", null, "#msgModEsame");
                                                }
                                            }
                                            else {
                                                gestErrori("Il voto massimo dell'esame deve essere maggiore del voto minimo", $("#votoMaxEsame"), "#msgModEsame");
                                            }
                                        }
                                        else {
                                            gestErrori("Devi inserire un voto compreso tra 0.01 e 10.00 come voto minimo dell'esame", $("#votoMinEsame"), "#msgModEsame");
                                        }
                                    }
                                    else {
                                        gestErrori("Devi inserire un numero come voto minimo dell'esame", $("#votoMinEsame"), "#msgModEsame");
                                    }
                                }
                                else {
                                    gestErrori("Devi inserire un voto compreso tra 0.01 e 10.00 come voto massimo dell'esame", $("#votoMaxEsame"), "#msgModEsame");
                                }
                            }
                            else {
                                gestErrori("Devi inserire un numero come voto massimo dell'esame", $("#votoMaxEsame"), "#msgModEsame");
                            }
                        }
                        else {
                            gestErrori("Devi inserire l'ora di scadenza dell'esame", $("#oraFineEsameMod"), "#msgModEsame");
                        }
                    }
                    else {
                        gestErrori("Devi inserire la data di scadenza dell'esame", $("#dataScadenzaMod"), "#msgModEsame");
                    }
                }
                else {
                    gestErrori("Devi inserire la durata dell'esame", $("#durataMod"), "#msgModEsame");
                }
            }
            else {
                gestErrori("Devi inserire la descrizione dell'esame", $("#descrizione"), "#msgModEsame");
            }
        }
        else if ($(this).html() == "Conferma Rimozione"){
            let chkToken = inviaRichiesta('/api/rimuoviEsame', 'POST', { "idEsame": $("#msgRimEsame").attr("idEsame") });
            chkToken.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgRimEsame");
            });
            chkToken.done(function (data) {
                if (data == "rimEsameOk"){
                    $("#dettEsameMod .modal-title").html("Risultato Operazione");
                    $("#dettEsameMod .modal-body").children().remove();
                    $("#btnSalvaModifiche").show().html("Chiudi");
                    $("#btnAnnulla").hide();

                    let cod = "";
                    cod += '<div class="row">';
                    cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
                    cod += '<p>Esame rimosso correttamente</p>';
                    cod += '</div>';
                    cod += '</div>';
                    
                    $("#dettEsameMod .modal-body").append(cod);
                }
                else
                    $("#msgRimEsame").text("Si è verificato un errore durante la rimozione dell\'esame. Riprovare").addClass("alert-danger");
            });
        }
        else if($(this).html() == "Chiudi"){
            window.location.reload();
        }
        else if ($(this).html() == "Torna Indietro") {
            window.location.href = "dettaglioCorso.html?corso=" + window.location.search.substring(1).split('=')[1];
        }
    });
}

// Funzione per la rimozione dell'esame
function rimuoviEsame(idEsame){
    $("#dettEsameMod .modal-title").html("Eliminazione dell'Esame");
    $("#dettEsameMod .modal-body").children().remove();
    $("#btnSalvaModifiche").show().html("Conferma Rimozione");
    
    clickSalvaModifiche();

    let cod = "";
    cod += '<div class="row">';
    cod += '<div class="col-sm-12 col-md-12 col-lg-12 text-center">';
    cod += '<p>Sei sicuro di voler rimuovere l\'esame? Tutti i dati ad esso collegati verranno rimossi</p>';

    cod += '<div class="row"><div class="col-sm-12 col-md-7 col-lg-7 mx-auto"><div id="msgRimEsame" idEsame="' + idEsame + '" role="alert" style="text-align: center;"></div></div></div>';
    cod += '</div>';
    cod += '</div>';

    $("#dettEsameMod .modal-body").append(cod);
}