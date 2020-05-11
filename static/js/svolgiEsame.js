"use strict";
let codUt = -1;
let idEsame = -1;
let numDomande = -1;

$(document).ready(function () {
    if (window.opener != null && window.opener.location.href.substring(23, 45) == "svolgimentoEsame.html?"){
        let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            window.opener.location.href = "login.html";
            close();
        });
        chkToken.done(function (data) {
            codUt = data.id;
            loadPagina();
        });
    }
    else{
        // La pagina è stata richiamata da una parte non autorizzata - capire cosa fare ?!?!?!
        // window.open("about:blank", "_parent", "").close(); // cosi non si può fare, trovare altro modo...
        window.document.write("Errore 403: Accesso negato");
    }
});

function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET (controllare se hanno senso o no ??)
    if (par[0] == "esame" && !isNaN(parseInt(par[1]))){
        let chkToken = inviaRichiesta('/api/datiEsameById', 'POST', { "idEsame": par[1] });
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, "#msgGenEsame");
        });
        chkToken.done(function (data) {
            console.log(data);
            let cod = '';
            numDomande = data.numDomande;
            idEsame = par[1];

            cod += '<div class="col-sm-3 col-md-3 col-lg-3 elDomande">';
            cod += '<div class="row">';
            cod += '<div class="col-sm-10 col-md-10 col-lg-10 mx-auto">';
            cod += '<h4 id="numDomanda">Domanda n. 1</h4>';
            cod += '</div>';
            cod += '</div>';
            cod += '<div class="row" id="elencoDomande">'
            cod += '<div class="col-sm-6 col-md-6 col-lg-6 mx-auto">';
            
            for(let i = 0; i < numDomande; i++){
                if(i == 0)
                    cod += '<div class="row">';
                
                cod += '<div class="col-sm-3 col-md-3 col-lg-3">';
                if(i == 0)
                    cod += '<div><button class="btnDomanda btnDomandaSelected" onclick="getDomanda(' + i + ')">' + (i + 1) + '</button></div>';
                else
                    cod += '<div><button class="btnDomanda" onclick="getDomanda(' + i + ')">' + (i + 1) + '</button></div>';
                cod += '</div>';
                
                if((i+1) % 4 == 0){
                    cod += '</div>';
                    if(i != numDomande-1)
                        cod += '<div class="row">';
                }
            }

            if(numDomande % 4 != 0){
                let numEccedenze = 4 - (numDomande % 4);
                cod += '<div class="col-sm-' + (3 * numEccedenze) + ' col-md-' + (3 * numEccedenze) + ' col-lg-' + (3 * numEccedenze) + '"></div>';
                cod += '</div>';
            }

            cod += '</div>';
            cod += '</div>';
            cod += '</div>';
            
            cod += '<div class="col-sm-9 col-md-9 col-lg-9 descDomanda">';
            cod += '<div class="row">';
            cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
            cod += '<h5 id="testoDomanda"></h5>';
            cod += '</div>';
            cod += '</div>';
            cod += '<div class="row">';
            cod += '<div id="risposteDomanda" class="col-sm-12 col-md-12 col-lg-12">';
            cod += '</div>';
            cod += '</div>';
            cod += '<div class="row">';
            cod += '<div class="col-sm-3 col-md-3 col-lg-3">';
            cod += '<button class="genric-btn disable radius" id="btnPrecDom" onclick="precDomanda()">Domanda precedente</button>';
            cod += '</div>';
            cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
            cod += '</div>';
            cod += '<div class="col-sm-3 col-md-3 col-lg-3">';
            cod += '<button class="genric-btn success radius" id="btnSuccDom" onclick="succDomanda()">Domanda successiva</button>';
            cod += '</div>';
            cod += '</div>';
            cod += '</div>';

            $("#contDomande").html(cod);

            // questo va fatto al cambio domanda
            let domande = inviaRichiesta('/api/getDomandaEsame', 'POST', {"idEsame" : idEsame, "pos" : 0});
            domande.fail(function (jqXHR, test_status, str_error) {
                console.log(jqXHR);
                printErrors(jqXHR, "#msgGenEsame");
            });
            domande.done(function (data) {
                console.log(data);
                caricamentoDomandaEsame(data);
                //chkModeratore(parseInt(par[1]));
            });
        });
    }
    else{
        $("#dettEsame .modal-title").html("Errore");
        $("#dettEsame .modal-body").children().remove();
        $("#btnSalvaModifiche").show().html("Torna Indietro");
        $("#btnAnnulla").hide();

        let cod = "";
        cod += '<div class="row">';
        cod += '<div class="col-lg-12 text-center">';
        cod += '<p>Errore nel passaggio dei parametri</p>';
        cod += '</div>';
        cod += '</div>';

        $("#dettEsame .modal-body").append(cod);
        $("#dettEsame").modal('show');
        clickSalvaModifiche();
    }
}

function getDomanda(posDomanda){
    $("#numDomanda").html("Domanda n. " + (posDomanda + 1));
    $(".btnDomandaSelected").removeClass("btnDomandaSelected");
    $($("#elencoDomande button")[posDomanda]).addClass("btnDomandaSelected");

    if (posDomanda > 0 && $("#btnPrecDom").hasClass("disable"))
        $("#btnPrecDom").removeClass("disable").addClass("success");
    else if(posDomanda == 0)
        $("#btnPrecDom").removeClass("success").addClass("disable");
    
    if (posDomanda < numDomande - 1 && $("#btnSuccDom").hasClass("disable"))
        $("#btnSuccDom").removeClass("disable").addClass("success");
    else if (posDomanda == numDomande - 1)
        $("#btnSuccDom").removeClass("success").addClass("disable");

    let domande = inviaRichiesta('/api/getDomandaEsame', 'POST', { "idEsame": idEsame, "pos": posDomanda });
    domande.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, "#msgGenEsame");
    });
    domande.done(function (data) {
        console.log(data);
        caricamentoDomandaEsame(data);
        //chkModeratore(parseInt(par[1])); 
        // manca che al reload della pagina non mi deve ritornare alla prima domanda ma a quella a cui sono rimasto (o non permetto reload pagina)
        // poi devo fare il salvataggio di una domanda appena l'utente la inserisce (potrei fare con sessionStorage) e manca il calcolo del risultato (più salvataggio esito su DB)
    });
}

function precDomanda(){
    let posDom = parseInt($("#numDomanda").html().split(' ')[2])-1;
    if (posDom > 0)
        getDomanda(--posDom);
}

function succDomanda(){
    let posDom = parseInt($("#numDomanda").html().split(' ')[2])-1;
    if (posDom < numDomande-1)
        getDomanda(++posDom);
}

function caricamentoDomandaEsame(esame) {
    if (esame != "domandaNonEsiste"){
        $("#risposteDomanda").html("");
        $("#testoDomanda").html(esame.testo);
        let cod = '';
        cod += '<form>';

        switch (esame.tipoDomanda) {
            case "trueFalse":
                cod += '<div class="form-group">';
                cod += '<label for="risposta">Risposta:</label>';
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

            case "multi": // da finire
                /*cod += '<div class="form-group">';
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
                for (let i = 0; i < 2; i++) {
                    cod += '<div class="col-lg-6">';
                    cod += (i + 1) + ' <input type="checkbox" id="giusta_' + (i + 1) + '" name="giusta_' + (i + 1) + '" class="single-input">';
                    cod += '</div>';
                }
                cod += '</div>';
                cod += '</div>';*/
                break;

            case "open": // da controllare ?!?!!??!?!
                cod += '<div class="input-group form-group">';
                cod += '<div class="input-group-prepend">';
                cod += '<span class="input-group-text">';
                cod += '<i class="fas fa-user-circle"> </i>';
                cod += '</span>';
                cod += '<input type="textarea" id="risposta" name="risposta" placeholder="Inserisci qui la risposta" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Inserisci qui la risposta\'" required class="single-input">';
                cod += '</div>';
                cod += '</div>';
                break;

            case "close":
                cod += '<div class="input-group form-group">';
                cod += '<div class="input-group-prepend">';
                cod += '<span class="input-group-text">';
                cod += '<i class="fas fa-user-circle"> </i>';
                cod += '</span>';
                cod += '<input type="textarea" id="risposta" name="risposta" placeholder="Inserisci qui la risposta" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Inserisci qui la risposta\'" required class="single-input">';
                cod += '</div>';
                cod += '</div>';
                break;
        }
        cod += '</form>';
        cod += '</div>';
        $("#risposteDomanda").html(cod);
    }
    else {
        $("#msgGenEsame").html("La domanda richiesta non esiste");
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
    myWin.document.write(myWin.opener.location.href);
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
                codHtml += '<button class="genric-btn info circle" data-toggle="modal" data-target="#dettEsame" onclick="modificaEsame(' + esame._id + ')"><i class="fas fa-edit"></i></button>';
                codHtml += '<button class="genric-btn danger circle" data-toggle="modal" data-target="#dettEsame" onclick="rimuoviEsame(' + esame._id + ')"><i class="fas fa-trash-alt"></i></button>';
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
            $("#contDomande").append(codHtml);
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
                                                    $("#dettEsame .modal-title").html("Risultato Operazione");
                                                    $("#dettEsame .modal-body").children().remove();
                                                    $("#btnSalvaModifiche").show().html("Chiudi");
                                                    $("#btnAnnulla").hide();

                                                    let cod = "";
                                                    cod += '<div class="row">';
                                                    cod += '<div class="col-lg-12 text-center">';
                                                    cod += '<p>Esame inserito con successo</p>';
                                                    cod += '</div>';
                                                    cod += '</div>';

                                                    $("#dettEsame .modal-body").append(cod);
                                                    $("#dettEsame").modal('show');
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
    $("#dettEsame").modal('show');
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
                                        $("#dettEsame .modal-title").html("Risultato Operazione");
                                        $("#dettEsame .modal-body").children().remove();
                                        $("#btnSalvaModifiche").show().html("Chiudi");
                                        $("#btnAnnulla").hide();

                                        let cod = "";
                                        cod += '<div class="row">';
                                        cod += '<div class="col-lg-12 text-center">';
                                        cod += '<p>Esame modificato correttamente</p>';
                                        cod += '</div>';
                                        cod += '</div>';

                                        $("#dettEsame .modal-body").append(cod);
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
                    $("#dettEsame .modal-title").html("Risultato Operazione");
                    $("#dettEsame .modal-body").children().remove();
                    $("#btnSalvaModifiche").show().html("Chiudi");
                    $("#btnAnnulla").hide();

                    let cod = "";
                    cod += '<div class="row">';
                    cod += '<div class="col-lg-12 text-center">';
                    cod += '<p>Esame rimosso correttamente</p>';
                    cod += '</div>';
                    cod += '</div>';
                    
                    $("#dettEsame .modal-body").append(cod);
                }
                else
                    $("#msgRimEsame").text("Si è verificato un errore durante la rimozione dell\'esame. Riprovare");
            });
        }
        else if($(this).html() == "Chiudi"){
            window.location.reload();
        }
        else if($(this).html() == "Torna Indietro"){
            close();
        }
    });
}