"use strict";
$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let par = window.location.search.substring(1).split('&');
    let lez = par[0].split('=');
    let corso = par[1].split('='); // da cambiate in caso la lezione non venga aperta da un corso

    // Controllo sui parametri in GET (controllare se hanno senso o no ??)
    if(lez[0] == "lezione" && !isNaN(parseInt(lez[1]))){
        let chkToken = inviaRichiesta('/api/datiLezioneById', 'POST', {"idLezione" : lez[1]});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            caricamentoDatiLezione(data);
            chkModeratore(parseInt(lez[1]));
        });
    }
    else{
        alert("Errore nel passaggio dei parametri");
        window.location.href = "dettaglioCorso.html?corso=" + corso[1];
    }
}

function caricamentoDatiLezione(lezione) {
    $("#contLezione").html("");
    let codHtml = "";
    let aus;
    
    console.log(lezione);
    
    if (lezione == undefined || lezione.length == 0){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>La lezione richiesta non è disponibile</h2>';
        codHtml += '<p><a href="dettaglioCorso.html?corso=' + window.location.search.substring(1).split('&')[1].split('=')[1] + '">Torna al corso</a></p>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contLezione").parent().html(codHtml);
        $("#contLezione").hide();
    }
    else{
        codHtml += '<div class="col-lg-8 course_details_left">';
        codHtml += '<div class="content_wrapper">';
        codHtml += '<h4 class="title_top">' + lezione[0]["titolo"] +'</h4>';
        codHtml += '<div class="content" id="descLezione" idLez="' + lezione[0]._id + '">';
        codHtml += '<p> Data Creazione: ' + new Date(lezione[0]["dataCreazione"]).toLocaleDateString() + '</p>';
        if (lezione[0]["dataScadenza"] != null && lezione[0]["dataScadenza"] != undefined)
            codHtml += '<p> Data Scadenza: ' + new Date(lezione[0]["dataScadenza"]).toLocaleDateString() + '</p>';
        codHtml += '</div>';

        codHtml += '<h4 class="title">Appunti della Lezione</h4>';
        codHtml += '<div class="content">';
        
        let chkToken = inviaRichiesta('/api/chkModLezione', 'POST', { "idLez": lezione[0]._id });
        chkToken.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            if (lezione[0]["elencoAppunti"] != undefined && lezione[0]["elencoAppunti"].length > 0) {
                codHtml += '<table class="table">';
                codHtml += "<tr>";
                codHtml += '<th>Descrizione</th>';
                codHtml += '<th>Autore</th>';
                codHtml += '<th>Data Caricamento</th>';
                if (data.ris == "iscritto" || data.ris == "autore")
                    codHtml += '<th>Azione</th>';
                codHtml += '</tr>';
                lezione[0]["elencoAppunti"].forEach(appunto => {
                    codHtml += '<tr>';
                    codHtml += '<td scope="row">' + appunto.descrizione + '</td>';
                    codHtml += '<td>' + appunto.cognomeAutore + ' ' + appunto.nomeAutore + '</td>';
                    codHtml += '<td>' + new Date(appunto.dataCaricamento).toLocaleDateString() + '</td>';
                    if (data.ris == "iscritto" || data.ris == "autore")
                        codHtml += '<td><a class="btn_2 text-uppercase" href="dettaglioAppunto.html?appunto=' + appunto._id + '">Visualizza Dettaglio</a></td>';
                    codHtml += '</tr>';
                });
                codHtml += '</table>';
            }
            else {
                codHtml += '<ul class="course_list">';
                codHtml += '<li class="justify-content-between align-items-center d-flex">';
                codHtml += '<p>Al momento non ci sono ancora degli appunti nella lezione</p>';
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
            codHtml += '<p>Autore della Lezione</p>';
            codHtml += '<span class="color">' + lezione[0]["dettAutore"][0].cognome + ' ' + lezione[0]["dettAutore"][0].nome + '</span>';
            codHtml += '</a>';
            codHtml += '</li>';
            codHtml += '</ul>';
            if (lezione[0]["dataScadenza"] == null && lezione[0]["dataScadenza"] == undefined && data.ris != "iscritto" && data.ris != "autore"){
                codHtml += '<div class="col-lg-12 text-center">';
                codHtml += '<button id="btnPartecipaLezione" class="genric-btn success radius">Partecipa alla Lezione</button>';
                codHtml += '</div>';
            }
            codHtml += '</div>';
            codHtml += '</div>';

            $("#contLezione").html(codHtml);

            if (lezione[0]["dataScadenza"] == null && lezione[0]["dataScadenza"] == undefined && data.ris != "iscritto" && data.ris != "autore") {
                $("#btnPartecipaLezione").on("click", function () {
                    let chkToken = inviaRichiesta('/api/partecipaLezione', 'POST', { "idLez": $("#descLezione").attr("idLez") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        if (jqXHR.status == 615)  // utente già partecipante
                            $(".msg").show().text(JSON.parse(jqXHR.responseText)["message"]);
                        else
                            printErrors(jqXHR, ".msg");
                    });
                    chkToken.done(function (data) {
                        if (data.nModified == 1) {
                            alert("Ora partecipi alla lezione!");
                            window.location.reload();
                        }
                        else
                            $(".msg").text("Si è verificato un errore durante l'iscrizione al corso");
                    });
                });
            }
        });
    }
}

function chkModeratore(idLez) {
    // Solo se utente loggato = moderatore lezione
    let chkToken = inviaRichiesta('/api/chkModLezione', 'POST', { "idLez": idLez });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        if (data.ris == "autore") {
            let codHtml = "";
            codHtml += '<div class="sidebar_top">';
            codHtml += '<div class="col-lg-12 text-center">';
            codHtml += '<h4>Gestione Lezione</h4>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettLezioneMod" style="margin:2px;" id="btnAddAppunto">Aggiungi Appunto</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettLezioneMod" style="margin:2px;" id="btnModLezione">Modifica Lezione</button>';
            codHtml += '<button class="genric-btn danger radius" data-toggle="modal" data-target="#dettLezioneMod" style="margin:2px;" id="btnRemLezione">Elimina Lezione</button>';
            codHtml += '</div>';
            codHtml += '</div>';
            $(".right-contents").append(codHtml);

            $("#btnSalvaModifiche").on("click", function () {
                /*if($(this).html() == "Salva Aggiunte"){
                    window.location.reload();
                }
                else */
                if ($(this).html() == "Salva Modifiche"){
                    if(chkCorrettezzaDati()){
                        let chkToken = inviaRichiesta('/api/modificaLezione', 'POST', { "idLez": $("#descLezione").attr("idLez"), "titolo": $("#titolo").val().trim(), "dataScadenza": $("#dataScadenza").val().trim() });
                        chkToken.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, ".modal-body .msg");
                        });
                        chkToken.done(function (data) {
                            if (data.ok == 1)
                                window.location.reload();
                            else
                                $(".modal-body .msg").text("Si è verificato un errore durante l'aggiornamento dei dati. Riprovare");
                        });
                    }
                }
                else if ($(this).html() == "Conferma Rimozione"){
                    let chkToken = inviaRichiesta('/api/rimuoviLezione', 'POST', { "idLez": $("#descLezione").attr("idLez") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        printErrors(jqXHR, ".modal-body .msg");
                    });
                    chkToken.done(function (data) {
                        if (data.ok == 1)
                            window.location.href = "dettaglioCorso.html?corso=" + window.location.search.substring(1).split('&')[1].split('=')[1]; // controllare se giusto
                        else
                            $(".modal-body .msg").text("Si è verificato un errore durante la rimozione della lezione. Riprovare");
                    });
                }
            });

            $("#btnAddAppunto").on("click", function () {
                console.log("Aggiunta appunto");
                $("#dettLezioneMod .modal-title").html("Aggiunta Appunto alla Lezione");
                $("#dettLezioneMod .modal-body").children().remove();
                $("#btnSalvaModifiche").hide();

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-lg-12 text-center">';
                cod += '<label for="txtRicerca">Cerca Appunto:</label>'; // vedere se aggiungere anche filtri di ricerca per argomento
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
                cod += '<p class="msg" style="margin-top:5px"></p>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettLezioneMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $(".modal-body .msg").text("");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaAppuntoAggiuntaLez', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, ".modal-body .msg");
                        });
                        ricerca.done(function (data) {
                            console.log(data);
                            dettaglioAppunto(data);
                        });
                    }
                    else {
                        $(".modal-body .msg").text("Inserire un valore per la ricerca");
                        $("#txtRicerca").focus();
                    }
                });

                $('#txtRicerca').autocomplete({
                    source: function (req, res) {
                        $.ajax({
                            url: "/api/cercaAppuntoAggiuntaLez",
                            dataType: "json",
                            type: "POST",
                            data: {
                                valore: req.term
                            },
                            success: function (data) {
                                dettaglioAppunto(data);
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

            $("#btnModLezione").on("click", function () {
                console.log("Modifica Lezione");
                $("#dettLezioneMod .modal-title").html("Modifica della Lezione");
                $("#dettLezioneMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Salva Modifiche");

                let chkToken = inviaRichiesta('/api/datiLezioneById', 'POST', { "idLezione": $("#descLezione").attr("idLez") });
                chkToken.fail(function (jqXHR, test_status, str_error) {
                    printErrors(jqXHR, ".modal-body .msg");
                });
                chkToken.done(function (data) {
                    console.log(data);
                    modificaLezione(data);
                });
            });
            
            $("#btnRemLezione").on("click", function () {
                console.log("Elimina Lezione");
                $("#dettLezioneMod .modal-title").html("Rimozione della Lezione");
                $("#dettLezioneMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Conferma Rimozione");

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-lg-12 text-center">';
                cod += '<p>Sei sicuro di voler rimuovere la lezione? Tutti i dati ad essa collegati verranno rimossi</p>';
                cod += '<p class="msg"></p>';
                cod += '</div>';
                cod += '</div>';

                $("#dettLezioneMod .modal-body").append(cod);
            });
        }
        // else if (data.ris == "iscritto")
        //     $("#btnIscrivitiGruppo").hide();
    });
}

function dettaglioAppunto(appunti) {
    console.log(appunti);
    let codHtml = "";
    $(".modal-body .msg").html("");
    $("#risultato").remove();

    if (appunti.length > 0) {
        codHtml += '<div class="row" id="risultato">';
        codHtml += '<table class="table">';
        codHtml += "<tr>";
        codHtml += '<th>Descrizione</th>';
        codHtml += '<th>Autore</th>';
        codHtml += '<th>Azione</th>';
        codHtml += '</tr>';

        appunti.forEach(appunto => {
            codHtml += '<tr id="riga_' + appunto._id + '">';
            codHtml += '<td scope="row">' + appunto.descrizione + '</td>';
            codHtml += '<td>' + appunto.cognomeAutore + ' ' + appunto.nomeAutore + '</td>';
            codHtml += '<td><button class="genric-btn success circle" onclick="addAppuntoLez(' + appunto._id + ')"><i class="fa fa-plus" aria-hidden="true"></i></button></td>';
            codHtml += '</tr>';
        });

        codHtml += '</table>';
        codHtml += '</div>';
    }
    else {
        $(".modal-body .msg").text("Nessun appunto trovato");
        $("#risultato").remove();
    }

    $("#dettLezioneMod .modal-body").append(codHtml);
}

function addAppuntoLez(idAppunto) {
    $(".modal-body .msg").text("").css("color", "red");

    let chkToken = inviaRichiesta('/api/insNuovoAppuntoLez', 'POST', { "idLez": $("#descLezione").attr("idLez"), "idAppunto" : idAppunto });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 616)  // appunto già presente in lezione
            $(".modal-body .msg").show().text(JSON.parse(jqXHR.responseText)["message"]);
        else
            printErrors(jqXHR, ".modal-body .msg");
    });
    chkToken.done(function (data) {
        if(data.nModified == 1)
            window.location.reload();
        else
            $(".modal-body .msg").text("Si è verificato un errore durante l'aggiunta alla lezione");
    });
}

function modificaLezione(dettLezione){
    let cod = "";
    cod += '<div class="row">';
    cod += '<div class="col-lg-12 text-center container">';
    cod += '<form>';
    cod += '<div class="form-group row">';
    cod += '<label for="titolo" class="col-sm-1-12 col-form-label">Titolo Lezione</label>';
    cod += '<div class="col-sm-1-12">';
    cod += '<input type="text" class="form-control" name="titolo" id="titolo" value="' + dettLezione[0].titolo + '" placeholder="Inserisci qui il titolo della lezione...">';
    cod += '</div>';
    cod += '</div>';
    cod += '<div class="form-group row">';
    cod += '<label for="dataScadenza" class="col-sm-1-12 col-form-label">Data di Scadenza della Lezione</label>';
    cod += '<div class="col-sm-1-12">';
    if (dettLezione[0].dataScadenza != null && dettLezione[0].dataScadenza != undefined) {
        let d = new Date(dettLezione[0].dataScadenza);
        let data = d.getFullYear() + "-" + (d.getMonth() > 8 ? (d.getMonth() + 1) : "0" + (d.getMonth() + 1)) + "-" + d.getDate();
        cod += '<input type="date" class="form-control" name="dataScadenza" id="dataScadenza" value="' + data + '">';
    }
    else
        cod += '<input type="date" class="form-control" name="dataScadenza" id="dataScadenza">';
    cod += '</div>';
    cod += '</div>';
    // cod += '<div class="form-group row">'; // foto da gestire...
    // cod += '<label for="nome" class="col-sm-1-12 col-form-label">Foto del Gruppo</label>';
    // cod += '<div class="col-sm-1-12">';
    // cod += '<input type="text" class="form-control" name="nome" id="nome" placeholder="Inserisci qui il nome del gruppo...">';
    // cod += '</div>';
    // cod += '</div>';
    //cod += '<div class="form-group row">';
    
    cod += '</form>';
    cod += '<p class="msg" style="margin-top:5px"></p>';
    cod += '</div>';
    cod += '</div>';
    
    let appLezione = inviaRichiesta('/api/elAppuntiLez', 'POST', {"idLezione" : dettLezione[0]._id});
    appLezione.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg"); // capire come visualizzarlo perché così lo visualizza sulla pagina, non sul modal
    });
    appLezione.done(function (dettLez) {
        cod += '<div class="row">';
        cod += '<div class="col-lg-12 text-center" id="tabAppuntiLez">';
        if (dettLez[0].elencoAppunti != null && dettLez[0].elencoAppunti.length > 0){
            cod += '<table class="table">';
            cod += "<tr>";
            cod += '<th>Descrizione</th>';
            cod += '<th>Autore</th>';
            cod += '<th>Azione</th>';
            cod += '</tr>';

            dettLez[0].elencoAppunti.forEach(appunto => {
                cod += '<tr>';
                cod += '<td scope="row">' + appunto.descrizione + '</td>';
                cod += '<td>' + appunto.cognomeAutore + ' ' + appunto.nomeAutore + '</td>';
                cod += '<td><button class="genric-btn success circle" onclick="removeAppuntoLezione(' + appunto._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
                cod += '</tr>';
            });

            cod += '</table>';
        }
        else
            cod = "<p>Non ci sono appunti nella lezione</p>";
        cod += '</div>';
        cod += '</div>';

        $("#dettLezioneMod .modal-body").append(cod);
    });
}

function chkCorrettezzaDati() {
    $(".modal-body .msg").text("").css("color", "red");

    if($("#titolo").val().trim() == ""){
        $(".modal-body .msg").text("Devi inserire il titolo della lezione");
    }
    else if ($("#dataScadenza").val().trim() != "" && new Date($("#dataScadenza").val()) < new Date()) {
        $(".modal-body .msg").text("Devi scegliere una data di scadenza della lezione successiva a quella odierna");
    }
    else{
        return true;
    }
    return false;
}

function removeAppuntoLezione(idAppunto) {
    $(".modal-body .msg").text("").css("color", "red");

    let chkToken = inviaRichiesta('/api/removeAppuntoLez', 'POST', { "idLez": $("#descLezione").attr("idLez"), "idAppunto": idAppunto });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".modal-body .msg");
    });
    chkToken.done(function (data) {
        if (data.nModified == 1){
            $(".modal-body .msg").css("color", "green").text("Appunto rimosso dalla lezione");
            $("#tabAppuntiLez").children().remove();

            let appLezione = inviaRichiesta('/api/elAppuntiLez', 'POST', { "idLezione": $("#descLezione").attr("idLez") });
            appLezione.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, ".msg"); // capire come visualizzarlo perché così lo visualizza sulla pagina, non sul modal
            });
            appLezione.done(function (dettLez) {
                let cod = "";
                if (dettLez[0].elencoAppunti != null && dettLez[0].elencoAppunti.length > 0) {
                    cod += '<table class="table">';
                    cod += "<tr>";
                    cod += '<th>Descrizione</th>';
                    cod += '<th>Autore</th>';
                    cod += '<th>Azione</th>';
                    cod += '</tr>';

                    dettLez[0].elencoAppunti.forEach(appunto => {
                        cod += '<tr>';
                        cod += '<td scope="row">' + appunto.descrizione + '</td>';
                        cod += '<td>' + appunto.cognomeAutore + ' ' + appunto.nomeAutore + '</td>';
                        cod += '<td><button class="genric-btn success circle" onclick="removeAppuntoLezione(' + appunto._id + ')"><i class="fa fa-minus" aria-hidden="true"></i></button></td>';
                        cod += '</tr>';
                    });

                    cod += '</table>';
                }
                else
                    cod = "<p>Non ci sono appunti nella lezione</p>";

                $("#tabAppuntiLez").append(cod);
            });
        }
        else
            $(".modal-body .msg").text("Si è verificato un errore durante la rimozione dal gruppo");
    });
}