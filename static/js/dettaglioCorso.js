"use strict";
let lezioni = [];

$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET (controllare se hanno senso o no ??)
    if(par[0] == "corso" && !isNaN(parseInt(par[1]))){
        let chkToken = inviaRichiesta('/api/datiCorsoById', 'POST', {"idCorso" : par[1]});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            caricamentoDatiCorso(data);
            chkModeratore(parseInt(par[1]));
        });
    }
    else{
        alert("Errore nel passaggio dei parametri");
        window.location.href = "corsi.html";
    }
}

function caricamentoDatiCorso(modulo) {
    $("#contCorso").html("");
    let codHtml = "";
    let aus;
    
    if (modulo == undefined || modulo.length == 0){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Il corso richiesto non è disponibile</h2>';
        codHtml += '<p><a href="corsi.html">Torna ai corsi</a></p>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contCorso").parent().html(codHtml);
        // $("#contCorso").hide();
    }
    else{
        codHtml += '<div class="col-lg-8 course_details_left">';
        codHtml += '<div class="main_image">';
        codHtml += '<img class="img-fluid" src="img/single_cource.png" alt="">'; // immagine del corso non presente su db
        codHtml += '</div>';
        codHtml += '<div class="content_wrapper">';
        codHtml += '<h4 class="title_top" id="descCorso" idCorso="' + modulo[0]._id + '">' + modulo[0]["descrizione"] +'</h4>';
        codHtml += '<div class="content">';
        codHtml += 'Breve descrizione del modulo'; // la mettiamo o no ??
        codHtml += '</div>';

        codHtml += '<h4 class="title">Argomenti del Corso</h4>';
        codHtml += '<div class="content">';
        codHtml += '<ul class="course_list">';

        if (modulo[0]["argomentiModulo"] != undefined && modulo[0]["argomentiModulo"].length > 0){
            modulo[0]["argomentiModulo"].forEach(argomento => {
                codHtml += '<li class="justify-content-between align-items-center d-flex">';
                codHtml += '<p>' + argomento.descrizione + '</p>';
                //codHtml += '<a class="btn_2 text-uppercase" href="dettaglioArgomento.html?argomento=' + argomento._id + '">View Details</a>'; // vedere se metterlo o no il dettaglio dell'argomento
                codHtml += '</li>';
            });
        }
        else{
            codHtml += '<li class="justify-content-between align-items-center d-flex">';
            codHtml += '<p>Al momento non ci sono ancora degli argomenti relativi al corso</p>';
            codHtml += '</li>';
        }
                   
        codHtml += '</ul>';
        codHtml += '</div>';

        lezioni = modulo[0];

        codHtml += '</div >';
        codHtml += '</div >';

        codHtml += '<div class="col-lg-4 right-contents">';
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
        codHtml += '<div class="col-lg-12 text-center">';
        codHtml += '<button id="btnIscrivitiCorso" class="genric-btn success radius">Iscriviti al Corso</button>';
        codHtml += '</div>';

        let chkToken = inviaRichiesta('/api/elGruppiAdmin', 'POST', { });
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            if(data.length > 0){
                codHtml += '<div style="margin-top:5px" class="col-lg-12 text-center">';
                codHtml += '<button id="btnIscriviGruppoCorso" data-toggle="modal" data-target="#dettCorsoMod" class="genric-btn success radius">Iscrivi un tuo Gruppo al Corso</button>';
                codHtml += '</div>';
            }
            codHtml += '</div>';
            codHtml += '</div>';

            $("#contCorso").html(codHtml);
           
            $("#btnIscrivitiCorso").on("click", function () {
                let chkToken = inviaRichiesta('/api/iscriviUtenteCorso', 'POST', {"idCorso" : $("#descCorso").attr("idCorso")});
                chkToken.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 611)  // utente già presente in corso
                        $(".msg").show().text(JSON.parse(jqXHR.responseText)["message"]);
                    else
                        printErrors(jqXHR, ".msg");
                });
                chkToken.done(function (data) {
                    if (data.nModified == 1){
                        alert("Iscrizione al corso effettuata correttamente!");
                        window.location.reload();
                    }
                    else
                        $(".msg").text("Si è verificato un errore durante l'iscrizione al corso");
                });
            });

            if(data.length > 0){
                $("#btnIscriviGruppoCorso").on("click", function () {
                    $("#dettCorsoMod .modal-title").html("Iscrizione Gruppo");
                    $("#dettCorsoMod .modal-body").children().remove();
                    $("#btnSalvaModifiche").show().html("Aggiungi");

                    let chkToken = inviaRichiesta('/api/elGruppiIscrivibiliCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        console.log(jqXHR);
                        printErrors(jqXHR, ".msg");
                    });
                    chkToken.done(function (gruppi) {
                        if(gruppi.length > 0){
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
                                //$("#default-select-1 .list").append("<li data-value='" + gruppo._id + "' class='option'>" + gruppo.nome + "</li>");
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
                                    console.log("Gruppo da iscrivere: " + $("#iscriviGruppo option:selected").val());
                                    let chkToken = inviaRichiesta('/api/iscriviGruppoCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "idGruppo" : $("#iscriviGruppo option:selected").val() });
                                    chkToken.fail(function (jqXHR, test_status, str_error) {
                                        console.log(jqXHR);
                                        printErrors(jqXHR, ".msg");
                                    });
                                    chkToken.done(function (data) {
                                        if (data.ok == 1 && data.nModified > 0) {
                                            alert("Iscrizione del gruppo al corso effettuata correttamente!");
                                            window.location.reload();
                                        }
                                        else
                                            $(".msg").text("Si è verificato un errore durante l'iscrizione al corso");
                                    });
                                }
                            });
                        }
                        else{
                            // non ci sono gruppi iscrivibili
                            $("#dettCorsoMod .modal-body").append("<p>Non ci sono gruppi che possono essere iscritti a questo corso</p>");
                            $("#btnSalvaModifiche").hide();
                        }
                    });
                });
            }
        });
    }
}

function chkModeratore(idCorso) {
    // Solo se utente loggato = moderatore gruppo
    let chkToken = inviaRichiesta('/api/chkModCorso', 'POST', { "idCorso": idCorso });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        if (data.ris == "autore") {
            let codHtml = "";
            codHtml += '<div class="sidebar_top">';
            codHtml += '<div class="col-lg-12 text-center">';
            codHtml += '<h4>Gestione Corso</h4>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnAddArgomento">Aggiungi Argomento</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnAddLezione">Aggiungi Lezione</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnModCorso">Modifica Corso</button>';
            codHtml += '<button class="genric-btn danger radius" data-toggle="modal" data-target="#dettCorsoMod" style="margin:2px;" id="btnRemCorso">Elimina Corso</button>';
            codHtml += '</div>';
            codHtml += '</div>';
            $(".right-contents").append(codHtml);
            $("#btnIscrivitiCorso").hide();
            //$("#btnIscriviGruppoCorso").hide(); // da controllare il caso in cui un'utente è iscritto ed è mod di un gruppo (bisogna dargli la possibilità di iscrivere il gruppo)

            $("#btnSalvaModifiche").on("click", function () {
                /*if($(this).html() == "Salva Aggiunte"){
                    window.location.reload();
                }
                else */
                if ($(this).html() == "Salva Modifiche") {
                    if (chkCorrettezzaDati()) {
                        let chkToken = inviaRichiesta('/api/modificaCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso"), "nome": $("#nome").val().trim(), /*"descrizione": $("#descrizione").val().trim(),*/ "tipoCorso": $("#tipiCorsi option:selected").val(), "materia": $("#materie option:selected").val() });
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
                else if ($(this).html() == "Conferma Rimozione") {
                    let chkToken = inviaRichiesta('/api/rimuoviCorso', 'POST', { "idCorso": $("#descCorso").attr("idCorso") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        printErrors(jqXHR, ".modal-body .msg");
                    });
                    chkToken.done(function (data) {
                        if (data.ok == 1)
                            window.location.href = "corsi.html";
                        else
                            $(".modal-body .msg").text("Si è verificato un errore durante la rimozione del corso. Riprovare");
                    });
                }
            });

            $("#btnAddArgomento").on("click", function(){
                $("#dettCorsoMod .modal-title").html("Aggiunta Argomento al Corso");
                $("#dettCorsoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").hide();

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-lg-12 text-center">';
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
                cod += '<p class="msg" style="margin-top:5px"></p>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettCorsoMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $(".modal-body .msg").text("");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaArgAggiuntaCorso', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, ".modal-body .msg");
                        });
                        ricerca.done(function (data) {
                            dettArgomento(data);
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
                cod += '<div class="col-lg-12 text-center">';
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
                cod += '<p class="msg" style="margin-top:5px"></p>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettCorsoMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $(".modal-body .msg").text("");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaLezAggiuntaCorso', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, ".modal-body .msg");
                        });
                        ricerca.done(function (data) {
                            dettLezione(data);
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
                    printErrors(jqXHR, ".modal-body .msg");
                });
                chkToken.done(function (data) {
                    console.log(data);
                    modificaCorso(data);
                });
            });

            $("#btnRemCorso").on("click", function () {
                $("#dettCorsoMod .modal-title").html("Rimozione del Corso");
                $("#dettCorsoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Conferma Rimozione");

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-lg-12 text-center">';
                cod += '<p>Sei sicuro di voler rimuovere il corso? Tutti i dati ad esso collegati verranno rimossi</p>';
                cod += '<p class="msg"></p>';
                cod += '</div>';
                cod += '</div>';

                $("#dettCorsoMod .modal-body").append(cod);
            });

            // Aggiunta lezioni
            codHtml = "";
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
        }
        else if (data.ris == "iscritto"){
            $("#btnIscrivitiCorso").hide();
            //$("#btnIscriviGruppoCorso").hide(); // da controllare il caso in cui un'utente è iscritto ed è mod di un gruppo (bisogna dargli la possibilità di iscrivere il gruppo)

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
        }
        lezioni = [];
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