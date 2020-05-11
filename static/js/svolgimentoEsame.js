"use strict";
let codUt = -1;

$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        codUt = data.id;
        loadPagina();
    });
});

function loadPagina() {
    let par = window.location.search.substring(1).split('&');
    let esame = par[0].split('=');
    let corso = par[1].split('=');
    // Controllo sui parametri in GET (controllare se hanno senso o no ??)
    if (esame[0] == "esame" && !isNaN(parseInt(esame[1])) && corso[0] == "corso" && !isNaN(parseInt(corso[1]))){
        let chkToken = inviaRichiesta('/api/datiEsameById', 'POST', {"idEsame" : esame[1], "idCorso" : corso[1]});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, "#msgGenEsame");
        });
        chkToken.done(function (data) {
            console.log(data);
            caricamentoDatiEsame(data);
            //chkModeratore(parseInt(par[1]));
        });
    }
    else{
        $("#dettEsameMod .modal-title").html("Errore");
        $("#dettEsameMod .modal-body").children().remove();
        $("#btnSalvaModifiche").show().html("Torna Indietro");
        $("#btnAnnulla").hide();

        let cod = "";
        cod += '<div class="row">';
        cod += '<div class="col-lg-12 text-center">';
        cod += '<p>Errore nel passaggio dei parametri</p>';
        cod += '</div>';
        cod += '</div>';

        $("#dettEsameMod .modal-body").append(cod);
        $("#dettEsameMod").modal('show');
        clickSalvaModifiche();
    }
}

function caricamentoDatiEsame(esame) {
    $("#contEsami").html("");
    let codHtml = "";
    let aus;
    
    if (esame == undefined){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center" style="margin-top:25px;">';
        codHtml += '<h2>Si è verificato un errore durante il caricamento dei dati dell\'esame</h2>';
        codHtml += '<div><a href="esami.html?corso=' + window.location.search.substring(1).split("&")[1].split("=")[1] + '">Torna all\'elenco degli esami del corso</a></div>'; // non so a cosa fare il redirect ?!?!?!?!?
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contEsami").parent().html(codHtml);
        // $("#contEsami").hide();
    }
    else if(esame == "esameNonValido"){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center" style="margin-top:25px;">';
        codHtml += '<h2>L\'esame non è disponibile</h2>';
        codHtml += '<div><a href="esami.html?corso=' + window.location.search.substring(1).split("&")[1].split("=")[1] + '">Torna all\'elenco degli esami del corso</a></div>'; // non so a cosa fare il redirect !?!?!?!?!?
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contEsami").parent().html(codHtml);
    }
    else {
        codHtml += '<div class="col-sm-6 col-md-12 col-lg-6 mx-auto">';
        codHtml += '<div class="content_wrapper">';
        codHtml += '<h4 class="title_top">Descrizione</h4>';
        codHtml += '<div id="descEsame" idEsame="' + esame._id + '" class="content">';
        codHtml += esame.descrizione;
        codHtml += '</div>';
        codHtml += '<h4 class="title">Data Creazione</h4>';
        codHtml += '<div class="content">';
        codHtml += new Date(esame.dataCreazione).toLocaleDateString();
        codHtml += '</div>';
        codHtml += '<h4 class="title">Data Scadenza</h4>';
        codHtml += '<div class="content">';
        codHtml += new Date(esame.dataScadenza).toLocaleDateString() + ' - ' + new Date(esame.dataScadenza).toLocaleTimeString().substring(0, 5);
        codHtml += '</div>';
        // codHtml += '<h4 class="title">Autore Esame</h4>'; // Vedere se metterlo, se si devo cambiare la query dell'api datiEsameById (serve aggregate, modificare anche pagina esami)
        // codHtml += '<div id="nomeCognomeAutoreAppunto" class="content">';
        // codHtml += appunto[0]["nomeAutore"] + " " + appunto[0]["cognomeAutore"];
        // codHtml += '</div>';
        codHtml += '<h4 class="title">Numero Domande</h4>';
        codHtml += '<div class="content">';
        codHtml += esame.numDomande;
        codHtml += '</div>';
        codHtml += '<h4 class="title">Durata (hh:mm:ss)</h4>';
        codHtml += '<div class="content">';
        codHtml += calcolaDurata(parseInt(esame.durata));
        codHtml += '</div>';
        codHtml += '<h4 class="title">Svolgi Esame</h4>';
        codHtml += '<div class="content">';
        if (new Date(esame.dataScadenza) >= new Date()){
            codHtml += '<button class="genric-btn info circle" onclick="eseguiEsame(' + esame._id + ')">Svolgi Esame</button>';
        }
        else{
            codHtml += '<h4>L\'esame è terminato, non puoi più sostenerlo</h4>';
            codHtml += '<a href="esami.html?corso=' + esame.codModulo + '">Torna all\'elenco degli esami</a>';
        }
        codHtml += '</div>';
        
        $("#contEsami").html(codHtml);
    }
}

function calcolaDurata(s){
    let measuredTime = new Date(null);
    measuredTime.setSeconds(s); 
    return measuredTime.toISOString().substr(11, 8);
}

function eseguiEsame(idEsame){
    // parte per finestra esame
    let myWin = window.open("https://localhost:8888/svolgiEsame.html?esame=" + idEsame, "windowTakeExam", "width=" + screen.width + ",height=" + screen.height + ",menubar=no,scrollbars=yes,status=no,toolbar=no,titlebar=no");
}

function chkModeratore(idCorso) {
    let chkToken = inviaRichiesta('/api/chkModCorso', 'POST', { "idCorso": idCorso });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, "#msgGenEsame");
    });
    chkToken.done(function (data) {
        let codHtml = "";
        esamiPerTabella.forEach(esame => {
            codHtml += '<tr>';
            codHtml += '<td scope="row">' + esame.descrizione + '</td>';
            codHtml += '<td>' + new Date(esame.dataCreazione).toLocaleDateString() + '</td>';
            codHtml += '<td>' + new Date(esame.dataScadenza).toLocaleDateString() + ' - ' + new Date(esame.dataScadenza).toLocaleTimeString().substring(0,5) + '</td>';
            codHtml += '<td>' + esame.numDomande + '</td>';
            codHtml += '<td>' + calcolaDurata(parseInt(esame.durata)) + '</td>';
            codHtml += '<td>' + (new Date(esame.dataScadenza) >= new Date() ? "In corso" : "Terminato") + '</td>';
            codHtml += '<td>';
            codHtml += (new Date(esame.dataScadenza) >= new Date() ? '<button class="genric-btn info circle" onclick="vaiAEsame(' + esame._id + ')"><i class="fas fa-arrow-right"></i></button>' : '');
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
            codHtml += '<div class="col-sm-6 col-md-12 col-lg-6 mx-auto">';
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
                                if (new Date(dataLetta) >= new Date(new Date().toISOString().split('T')[0])) {// controllo le singole date, confronto la data inserita con quella attuale con time 0 (altrimenti mi dava problemi)
                                    // c'è un momento in cui non va, non ho ancora capito quando (ad esempio modifico esame verso le 10 di sera e metto data di scadenza il giorno dopo a mezzanotte (?) e non va)
                                    // controllo ora successiva a quella attuale ( + durata esame oppure no ?)
                                    if(scadEsame > new Date()){
                                        if ($("#bdTabDomEsame").children().length != 0) {

                                            let dati = new Object();
                                            dati.idCorso = idCorso;
                                            dati.descrizione = $("#descEsame").val().trim();
                                            dati.durata = $("#durata").val().trim();
                                            dati.dataScadenza = scadEsame.toJSON();
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

                                            console.log(dati);
                                            let chkToken = inviaRichiesta('/api/aggiungiEsame', 'POST', dati);
                                            chkToken.fail(function (jqXHR, test_status, str_error) {
                                                console.log(jqXHR);
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
                                                    cod += '<div class="col-lg-12 text-center">';
                                                    cod += '<p>Esame inserito con successo</p>';
                                                    cod += '</div>';
                                                    cod += '</div>';

                                                    $("#dettEsameMod .modal-body").append(cod);
                                                    $("#dettEsameMod").modal('show');
                                                    clickSalvaModifiche();
                                                }
                                                else
                                                    $("#msgAddEsame").text("Si è verificato un errore durante l'inserimento dell\'esame. Riprovare");
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
        }
    });
}

function closeModalOnModify(){
    $("#insNuovaDomanda").modal('hide');
    $("#dettEsameMod").modal('show');
}

function allowNumbersOnly(e) {
    var code = (e.which) ? e.which : e.keyCode;
    if (code > 31 && (code < 48 || code > 57)) {
        e.preventDefault();
    }
}

function clickSalvaModifiche(){
    $("#btnSalvaModifiche").on("click", function () {
        if ($(this).html() == "Salva Modifiche") {
            $("#descrizione").removeClass("alert-danger");
            $("#durataMod").removeClass("alert-danger");
            $("#dataScadenzaMod").removeClass("alert-danger");
            $("#oraFineEsameMod").removeClass("alert-danger");
            $("#msgModEsame").html("");

            if ($("#descrizione").val().trim() != "") {
                if ($("#durataMod").val().trim() != "") {
                    if ($("#dataScadenzaMod").val().trim() != "") {
                        if ($("#oraFineEsameMod").val().trim() != "") {
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

                                console.log(dati);
                                let chkToken = inviaRichiesta('/api/modificaEsame', 'POST', dati);
                                chkToken.fail(function (jqXHR, test_status, str_error) {
                                    console.log(jqXHR);
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
                                        cod += '<div class="col-lg-12 text-center">';
                                        cod += '<p>Esame modificato correttamente</p>';
                                        cod += '</div>';
                                        cod += '</div>';

                                        $("#dettEsameMod .modal-body").append(cod);
                                    }
                                    else
                                        $("#msgModEsame").text("Si è verificato un errore durante la modifica dell\'esame. Riprovare");
                                });
                            }
                            else {
                                gestErrori("Devi inserire almeno una domanda", null, "#msgModEsame");
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
                    cod += '<div class="col-lg-12 text-center">';
                    cod += '<p>Esame rimosso correttamente</p>';
                    cod += '</div>';
                    cod += '</div>';
                    
                    $("#dettEsameMod .modal-body").append(cod);
                }
                else
                    $("#msgRimEsame").text("Si è verificato un errore durante la rimozione dell\'esame. Riprovare");
            });
        }
        else if($(this).html() == "Chiudi"){
            window.location.reload();
        }
        else if($(this).html() == "Torna Indietro"){
            window.location.href = "esami.html?corso=" + window.location.search.substring(1).split('&')[1].split('=')[1];
        }
    });
}