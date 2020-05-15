"use strict";
let codUt = -1;
let idEsame = -1;
let idCorso = -1;
let numDomande = -1;
let tipoDom = "";
let timer;
let start = 0;

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
            idCorso = data.codModulo;

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
                    cod += '<div><button class="btnDomanda btnDomandaSelected" onclick="getDomanda(' + i + ', \'exec\')">' + (i + 1) + '</button></div>';
                else
                    cod += '<div><button class="btnDomanda" onclick="getDomanda(' + i + ', \'exec\')">' + (i + 1) + '</button></div>';
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
            cod += '<div class="row">';
            cod += '<div class="col-sm-6 col-md-6 col-lg-6 mx-auto">';
            cod += '<div class="timer" id="timer"></div>'
            cod += '</div>';
            cod += '</div>';
            cod += '<div class="row">';
            cod += '<div style="margin-top:10px" class="col-sm-10 col-md-10 col-lg-10 mx-auto">';
            cod += '<button class="genric-btn success radius" id="btnTerminaEsame" onclick="confFineEsame()">Termina Esame</button>';
            cod += '</div>';
            cod += '</div>';
            cod += '</div>';
            
            cod += '<div class="col-sm-9 col-md-9 col-lg-9 descDomanda">';
            cod += '<div class="row">';
            cod += '<div class="col-sm-6 col-md-6 col-lg-6">';
            cod += '<h5 style="margin-left:10px" id="testoDomanda"></h5>';
            cod += '</div>';
            cod += '</div>';
            cod += '<div class="row">';
            cod += '<div id="risposteDomanda" style="padding:5px" class="col-sm-8 col-md-8 col-lg-8">';
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

            if (sessionStorage.getItem("pos") != null)
                getDomanda(parseInt(sessionStorage.getItem("pos")), "load");
            else
                getDomanda(0, "load");

            start = data.durata;
            if (sessionStorage.getItem("timer") != null)
                start = parseInt(sessionStorage.getItem("timer"));

            timer = setInterval(function(){
                $("#timer").html(calcolaDurata(start));
                
                start--;
                sessionStorage.setItem("timer", start);

                if (start < 0) {
                    clearInterval(timer);
                    $("#timer").html("Tempo scaduto");
                    $("#dettEsame .modal-title").html("Tempo Scaduto");
                    $("#dettEsame .modal-body").children().remove();
                    $("#btnSalvaModifiche").show().html("Consegna");
                    $("#btnAnnulla").hide();

                    let cod = "";
                    cod += '<div class="row">';
                    cod += '<div class="col-lg-12 text-center">';
                    cod += '<p>Il tempo è scaduto. È l\'ora di consegnare</p>';
                    cod += '</div>';
                    cod += '</div>';

                    $("#dettEsame .modal-body").append(cod);
                    $("#dettEsame").modal('show');
                    clickSalvaModifiche();
                    $("#dettEsame").on("hidden.bs.modal", function () {
                        if ($("#btnSalvaModifiche").html() == "Consegna")
                            fineEsame();
                    });
                    // fineEsame(); funzione per concludere esame (prima mettere alert con modal del tipo "è ora di consegnare")
                }
            }, 1000);

        });
    }
    else{
        $("#dettEsame .modal-title").html("Errore");
        $("#dettEsame .modal-body").children().remove();
        $("#btnSalvaModifiche").show().html("Chiudi");
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

function getDomanda(posDomanda, when){
    if(when != "load")
        salvaRisposta();

    sessionStorage.setItem("pos", posDomanda);
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

        let risp = sessionStorage.getItem("rispDomanda_" + (posDomanda + 1));
        if(risp != null){
            switch(tipoDom){
                case "trueFalse":
                    if(risp == "true")
                        $($("#risposteDomanda input[type='radio']")[0]).prop("checked", "checked");
                    else if(risp == "false")
                        $($("#risposteDomanda input[type='radio']")[1]).prop("checked", "checked");
                    break;

                case "multi":
                    if(risp != ""){
                        let inputField = "";
                        if ($("#risposteDomanda input[type='checkbox']").length != 0)
                            inputField = "checkbox";
                        else
                            inputField = "radio";

                        let rispCheck = risp.split(';');
                        for(let i = 0; i < rispCheck.length; i++)
                            $($("#risposteDomanda input[type='" + inputField + "']")[rispCheck[i]]).prop("checked", "checked");
                    }
                    break;

                case "open":
                    $("#risposta").val(risp);
                    break;

                case "close":
                    $("#risposta").val(risp);
                    break;
            }
        }
    });
}

function precDomanda(){
    let posDom = parseInt($("#numDomanda").html().split(' ')[2])-1;
    if (posDom > 0)
        getDomanda(--posDom, "exec");
}

function succDomanda(){
    let posDom = parseInt($("#numDomanda").html().split(' ')[2])-1;
    if (posDom < numDomande-1)
        getDomanda(++posDom, "exec");
}

function caricamentoDomandaEsame(domanda) {
    if (domanda != "domandaNonEsiste"){
        $("#risposteDomanda").html("");
        $("#testoDomanda").html(domanda.testo);
        let cod = '';
        cod += '<form>';
        tipoDom = domanda.tipoDomanda;

        switch (tipoDom) {
            case "trueFalse":
                cod += '<div class="row" style="margin-bottom:10px">';
                cod += '<div class="col-lg-2">'
                cod += '</div>';
                cod += '<div class="col-lg-8">'
                cod += '<input type="radio" value="true" name="risposta">';
                cod += '<span style="margin-left:10px">Vero</span>'
                cod += '</div>';
                cod += '<div class="col-lg-2">'
                cod += '</div>';
                cod += '</div>';
                cod += '<div class="row" style="margin-bottom:10px">';
                cod += '<div class="col-lg-2">'
                cod += '</div>';
                cod += '<div class="col-lg-8">'
                cod += '<input type="radio" value="false" name="risposta">';
                cod += '<span style="margin-left:10px">Falso</span>'
                cod += '</div>';
                cod += '<div class="col-lg-2">'
                cod += '</div>';
                cod += '</div>';
                break;

            case "multi":
                let nRispGiuste = 0;
                for(let i = 0; i < domanda.risposte.length; i++)
                    if(domanda.risposte[i].corretta)
                        nRispGiuste++;
                
                let tipoInput = "";
                if(nRispGiuste == 1)
                    tipoInput = "radio";
                else
                    tipoInput = "checkbox";

                for (let i = 0; i < domanda.risposte.length; i++) {
                    cod += '<div class="row" style="margin-bottom:10px">';
                    cod += '<div class="col-lg-2">';
                    cod += '</div>';
                    cod += '<div class="col-lg-8">';
                    cod += '<input type="' + tipoInput + '" name="risposte" value="' + i + '">';
                    cod += '<span style="margin-left:10px">' + domanda.risposte[i].testo + '</span>';
                    cod += '</div>';
                    cod += '<div class="col-lg-2">';
                    cod += '</div>';
                    cod += '</div>';
                }
                break;

            case "open":
                cod += '<div class="row" style="margin-bottom:10px">';
                cod += '<div class="col-lg-2">';
                cod += '</div>';
                cod += '<div class="col-lg-8">';
                cod += '<input type="textarea" id="risposta" name="risposta" placeholder="Inserisci qui la risposta" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Inserisci qui la risposta\'" class="single-input">';
                cod += '</div>';
                cod += '<div class="col-lg-2">';
                cod += '</div>';
                cod += '</div>';
                break;

            case "close":
                cod += '<div class="row" style="margin-bottom:10px">';
                cod += '<div class="col-lg-2">';
                cod += '</div>';
                cod += '<div class="col-lg-8">';
                cod += '<input type="textarea" id="risposta" name="risposta" placeholder="Inserisci qui la risposta" onfocus="this.placeholder = \'\'; this.classList.remove(\'alert-danger\');" onblur="this.placeholder = \'Inserisci qui la risposta\'" class="single-input">';
                cod += '</div>';
                cod += '<div class="col-lg-2">';
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

function salvaRisposta() {
    let posDom = parseInt($("#numDomanda").html().split(' ')[2]);
    let risp = "";

    switch(tipoDom){
        case "trueFalse":
            if ($("#risposteDomanda input[type='radio']:checked").length != 0)    
                risp = $("#risposteDomanda input[type='radio']:checked").val();
            break;
        case "multi":
            if ($("#risposteDomanda input[type='checkbox']:checked").length != 0){
                let rispo = new Array();
                for (let i = 0; i < $("#risposteDomanda input[type='checkbox']:checked").length; i++)
                    rispo.push($($("#risposteDomanda input[type='checkbox']:checked")[i]).val());
                risp = rispo.join(';');
            }
            else if ($("#risposteDomanda input[type='radio']:checked").length != 0) {
                risp = $("#risposteDomanda input[type='radio']:checked").val();
            }
            break;

        case "open":
            risp = $("#risposta").val();
            break;

        case "close":
            risp = $("#risposta").val();
            break;
    }

    sessionStorage.setItem("rispDomanda_" + posDom, risp);
}

function calcolaDurata(s){
    let measuredTime = new Date(null);
    measuredTime.setSeconds(s); 
    return measuredTime.toISOString().substr(11, 8);
}

function confFineEsame(){
    $("#dettEsame .modal-title").html("Fine Esame");
    $("#dettEsame .modal-body").children().remove();
    $("#btnSalvaModifiche").show().html("Concludi Tentativo");

    let cod = "";
    cod += '<div class="row">';
    cod += '<div class="col-lg-12 text-center">';
    cod += '<p>Sei sicuro di voler terminare il tentativo?</p>';
    cod += '</div>';
    cod += '</div>';

    $("#dettEsame .modal-body").append(cod);
    $("#dettEsame").modal('show');
    clickSalvaModifiche();
}

function fineEsame(){
    console.log("Fine Esame");
    clearInterval(timer);
    salvaRisposta();

    let risposte = new Array();
    for(let i = 1; i <=  numDomande; i++)
        risposte.push(sessionStorage.getItem("rispDomanda_" + i));

    console.log(risposte);

    let domande = inviaRichiesta('/api/getDomandeCorrezioneEsame', 'POST', { "idEsame": idEsame });
    domande.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, "#msgGenEsame");
    });
    domande.done(function (elDom) {
        console.log(elDom);
        let voto = 0;
        for(let i = 0; i < elDom.length; i++){
            let corretta = false;
            let risp = risposte[i];
            switch(elDom[i].tipoDomanda){
                case "trueFalse":
                    if(risp == "true"){
                        if(elDom[i].risposte[0].corretta)
                            corretta = true;
                    }
                    else if(risp == "false"){
                        if (elDom[i].risposte[1].corretta)
                            corretta = true;
                    }
                    break;

                case "multi":
                    if(risp != ""){
                        let numRispGiusteDom = 0;
                        let contRispDateGiuste = 0;
                        for(let j = 0; j < elDom[i].risposte.length; j++){
                            if (elDom[i].risposte[j].corretta)
                                numRispGiusteDom++;
                        }

                        if(numRispGiusteDom == 1){
                            // risposta singola giusta
                            if (elDom[i].risposte[parseInt(risp)].corretta)
                                corretta = true;
                        }
                        else if(numRispGiusteDom > 1){
                            // risposta multipla giusta
                            let rs = risp.split(';');
                            
                            // conto il numero di risposte inserite giuste
                            rs.forEach(risposta => {
                                if (elDom[i].risposte[parseInt(risposta)].corretta)
                                    contRispDateGiuste++;
                            });

                            if(contRispDateGiuste == numRispGiusteDom){
                                corretta = true; // tutte le risposte inserite sono giuste
                            }
                            else{
                                // non tutte le risposte date sono giuste
                                voto += (parseFloat(elDom[i].punteggio) / elDom[i].risposte.length * contRispDateGiuste); // aggiungo il corrispondente di quelle giuste
                                voto -= (parseFloat(elDom[i].punteggio) / elDom[i].risposte.length * (rs.length-contRispDateGiuste)); // rimuovo il corrispondente di quelle sbagliate
                                // Ad esempio se le domande totali sono 5 e solo 2 sono giuste, come risposte l'utente mette tutte e 5:
                                // io aggiungo al voto le 2 giuste (perché non ha inserito il numero giusto di risposte (+ o -))
                                // però poi tolgo il valore delle 3 sbagliate 
                            }
                        }
                    }
                    break;

                case "open":
                    if(risp.toUpperCase() == elDom[i].risposte[0].testo.toUpperCase())
                        corretta = true;
                    break;

                case "close":
                    if (risp.toUpperCase() == elDom[i].risposte[0].testo.toUpperCase())
                        corretta = true;
                    break;
            }

            if(corretta)
                voto += parseFloat(elDom[i].punteggio);
        }
        
        let datiRisultatoEsame = new Object();
        datiRisultatoEsame.idEsame = idEsame;
        datiRisultatoEsame.idCorso = idCorso;
        datiRisultatoEsame.voto = voto;
        datiRisultatoEsame.dataEsame = new Date();
        datiRisultatoEsame.risposte = risposte;

        let getMaxMin = inviaRichiesta('/api/getMaxMinVotoEsame', 'POST', {"idEsame" : idEsame});
        getMaxMin.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, "#msgGenEsame");
        });
        getMaxMin.done(function (data) {
            let maxVotoPoss = parseFloat(data.split('-')[0]);
            let minVotoPoss = parseFloat(data.split('-')[1]);

            if (datiRisultatoEsame.voto < minVotoPoss)
                datiRisultatoEsame.voto = minVotoPoss;
            else if(datiRisultatoEsame.voto > maxVotoPoss)
                datiRisultatoEsame.voto = maxVotoPoss;
            
            let salvaRisultati = inviaRichiesta('/api/salvaRisultatoEsame', 'POST', datiRisultatoEsame);
            salvaRisultati.fail(function (jqXHR, test_status, str_error) {
                console.log(jqXHR);
                printErrors(jqXHR, "#msgGenEsame");
            });
            salvaRisultati.done(function (data) {
                if (data == "salRisOk") {
                    window.opener.location.href = window.opener.location.href;
                    close();
                }
            });
        });
    });
    // da qui devo fare calcolo risultato, salvataggio voto e salvataggio risposte date
}

function clickSalvaModifiche(){
    $("#btnSalvaModifiche").on("click", function () {
        if ($(this).html() == "Consegna") {
            $("#dettEsame").modal('hide');
        }
        else if ($(this).html() == "Concludi Tentativo"){
            $("#dettEsame").modal('hide');
            fineEsame();
        }
        else if($(this).html() == "Chiudi"){
            close();
        }
    });
}