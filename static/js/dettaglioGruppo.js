"use strict";
$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET (controllare se hanno senso o no ??)
    if(par[0] == "gruppo" && !isNaN(parseInt(par[1]))){
        let chkToken = inviaRichiesta('/api/datiGruppoById', 'POST', {"idGruppo" : par[1]});
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            caricamentoDatiGruppo(data);
            chkModeratore(parseInt(par[1]));
        });
    }
    else{
        alert("Errore nel passaggio dei parametri");
        window.location.href = "gruppi.html";
    }
}

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
        // codHtml += '<div class="main_image">';
        // codHtml += '<img class="img-fluid" src="img/single_cource.png" alt="">'; // immagine del gruppo non presente su db
        // codHtml += '</div>';
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
                codHtml += '<td>' + new Date(utente.gruppo[0].dataInizio).toLocaleDateString() + '</td>';
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
        codHtml += '<div class="col-lg-12 text-center">';
        codHtml += '<button id="btnIscrivitiGruppo" class="genric-btn success radius">Iscriviti al Gruppo</button>'; // da vedere
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        
        $("#contGruppo").html(codHtml);
    }
}

function chkModeratore(idGruppo) {
    // Solo se utente loggato = moderatore gruppo
    let chkToken = inviaRichiesta('/api/chkModGruppo', 'POST', { "idGruppo": idGruppo });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR);
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        if (data.ris == "autore") {
            let codHtml = "";
            codHtml += '<div class="sidebar_top">';
            codHtml += '<div class="col-lg-12 text-center">';
            codHtml += '<h4>Gestione Gruppo</h4>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnAddMember">Aggiungi Membro/i</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnModGroup">Modifica Gruppo</button>';
            // da fare --> codHtml += '<button class="genric-btn danger radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnRemGroup">Elimina Gruppo</button>';
            codHtml += '</div>';
            codHtml += '</div>';
            $(".right-contents").append(codHtml);
            $("#btnIscrivitiGruppo").hide();

            $("#btnSalvaModifiche").on("click", function () {
                if($(this).html() == "Salva Aggiunte")
                    window.location.reload();
                else if ($(this).html() == "Salva Modifiche"){
                    if(chkCorrettezzaDati()){
                        let chkToken = inviaRichiesta('/api/modificaGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo"), "nome": $("#nome").val().trim(), "descrizione": $("#descrizione").val().trim(), "tipoGruppo": $("#tipoGruppo option:selected").val() });
                        chkToken.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, ".msg");
                        });
                        chkToken.done(function (data) {
                            console.log("Modifica");
                            console.log(data);
                            if (data.ok == 1)
                                window.location.reload();
                            else
                                $(".msg").text("Si è verificato un errore durante l'aggiornamento dei dati. Riprovare");
                        });
                    }
                }
            });

            $("#btnAddMember").on("click", function () {
                console.log("Aggiunta membro");
                $("#dettGruppoMod .modal-title").html("Aggiunta Membro al Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").html("Salva Aggiunte"); // da cambiare gestione!!!!!!!

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
                cod += '<p class="msg" style="margin-top:5px"></p>';
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettGruppoMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $(".msg").text("");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaUtente', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, ".msg");
                        });
                        ricerca.done(function (data) {
                            console.log(data);
                            dettaglioUtente(data);
                        });
                    }
                    else {
                        $(".msg").text("Inserire un valore per la ricerca");
                        $("#txtRicerca").focus();
                    }
                });

                $('#txtRicerca').autocomplete({
                    source: function (req, res) {
                        $.ajax({
                            url: "/api/cercaUtente",
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
                console.log("Modifica gruppo");
                $("#dettGruppoMod .modal-title").html("Modifica del Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").html("Salva Modifiche");

                let chkToken = inviaRichiesta('/api/datiGruppoById', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo") });
                chkToken.fail(function (jqXHR, test_status, str_error) {
                    printErrors(jqXHR, ".msg");
                });
                chkToken.done(function (data) {
                    console.log(data);
                    modificaGruppo(data);
                });
            });

            /* DA FARE
            $("#btnRemGroup").on("click", function () {
                console.log("Elimina gruppo");
                $("#dettGruppoMod .modal-title").html("Rimozione del Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
            });*/
        }
        else if (data.ris == "componente")
            $("#btnIscrivitiGruppo").hide();
    });
}

function dettaglioUtente(utenti) {
    console.log(utenti);
    let codHtml = "";
    $(".msg").html("");
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
            let gruppi = [];
            utente.gruppo.forEach(gruppo => {
                gruppi.push(gruppo.codGruppo);
            })

            codHtml += '<tr id="riga_' + utente._id + '" idGruppi="' + gruppi.join(',') + '">';
            codHtml += '<td scope="row">' + utente.cognome + ' ' + utente.nome + '</td>';
            codHtml += '<td>' + utente.user + '</td>';
            codHtml += '<td><button class="genric-btn success circle" onclick="addIscrittoGruppo(' + utente._id + ')"><i class="fa fa-plus" aria-hidden="true"></i></button></td>';
            codHtml += '</tr>';
        });

        codHtml += '</table>';
        codHtml += '</div>';
    }
    else {
        $(".msg").text("Nessun utente trovato");
        $("#risultato").remove();
    }

    $("#dettGruppoMod .modal-body").append(codHtml);
}

function addIscrittoGruppo(idUtente) {
    $(".msg").text("").css("color", "red");
    let gruppi = $("#riga_" + idUtente).attr("idGruppi");
    
    if (gruppi.includes($("#descGruppo").attr("idGruppo")))
        $(".msg").text("L'utente selezionato fa già parte di questo gruppo");
    else{
        let chkToken = inviaRichiesta('/api/insNuovoMembroGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo"), "idUtente" : idUtente });
        chkToken.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            console.log(data);
            if(data.nModified == 1)
                $(".msg").css("color", "green").text("Utente aggiunto al gruppo");
            else
                $(".msg").text("Si è verificato un errore durante l'aggiunta al gruppo");
        });
    }
}

function modificaGruppo(dettGruppo){
    /*
        nome
        descrizione
        foto (?)
        tipo di gruppo
        ...
    */
    let cod = "";
    cod += '<div class="row">';
    cod += '<div class="col-lg-12 text-center container">';
    cod += '<form>';
    cod += '<div class="form-group row">';
    cod += '<label for="nome" class="col-sm-1-12 col-form-label">Nome Gruppo</label>';
    cod += '<div class="col-sm-1-12">';
    cod += '<input type="text" class="form-control" name="nome" id="nome" value="' + dettGruppo[0].nome + '" placeholder="Inserisci qui il nome del gruppo...">';
    cod += '</div>';
    cod += '</div>';
    cod += '<div class="form-group row">';
    cod += '<label for="descrizione" class="col-sm-1-12 col-form-label">Descrizione Gruppo</label>';
    cod += '<div class="col-sm-1-12">';
    cod += '<input type="text" class="form-control" name="descrizione" id="descrizione" value="' + dettGruppo[0].descrizione + '" placeholder="Inserisci qui la descrizione del gruppo...">';
    cod += '</div>';
    cod += '</div>';
    // cod += '<div class="form-group row">'; // foto da gestire...
    // cod += '<label for="nome" class="col-sm-1-12 col-form-label">Foto del Gruppo</label>';
    // cod += '<div class="col-sm-1-12">';
    // cod += '<input type="text" class="form-control" name="nome" id="nome" placeholder="Inserisci qui il nome del gruppo...">';
    // cod += '</div>';
    // cod += '</div>';
    //cod += '<div class="form-group row">';
    let tipiGruppi = inviaRichiesta('/api/elTipiGruppi', 'POST', {});
    tipiGruppi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    tipiGruppi.done(function (data) {
        cod += '<div class="form-select row" id="default-select-1">';
        cod += '<label for="tipoGruppo">Tipo di Gruppo</label>';
        cod += '<select name="tipoGruppo" id="tipoGruppo">';
        data.forEach(tipogruppo => {
            cod += "<option value='" + tipogruppo._id + "' " + (tipogruppo._id == dettGruppo[0].tipoGruppo ?  "selected" : "") + ">" + tipogruppo.descrizione + "</option>";
            //$("#default-select-1 .list").append("<li data-value='" + tipogruppo._id + "' class='option'>" + tipogruppo.descrizione + "</li>");
        });
        cod += '</select>';
        cod += '</div>';
        //cod += '</div>';
        cod += '</form>';
        cod += '<p class="msg" style="margin-top:5px"></p>';
        cod += '</div>';
        cod += '</div>';
        
        let compGruppo = inviaRichiesta('/api/elComponentiGruppo', 'POST', {"idGruppo" : dettGruppo[0]._id});
        compGruppo.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, ".msg");
        });
        compGruppo.done(function (componenti) {
            if(componenti != null && componenti.length > 0){
                cod += '<div class="row">';
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
        });
    });
}

function chkCorrettezzaDati() {
    $(".msg").text("").css("color", "red");

    if($("#nome").val().trim() == ""){
        $(".msg").text("Devi inserire il nome del gruppo");
    }
    else if ($("#descrizione").val().trim() == "") {
        $(".msg").text("Devi inserire la descrizione del gruppo");
    }
    else{
        return true;
    }
    return false;
}

function removeIscrittoGruppo(idUtente) {
    $(".msg").text("").css("color", "red");

    let chkToken = inviaRichiesta('/api/removeMembroGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo"), "idUtente": idUtente });
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        console.log("Rimozione");
        console.log(data);
        if (data.ris == "noRemoveAut")
            $(".msg").text("Non puoi rimuovere l'autore del gruppo");
        else if (data.nModified == 1){
            $(".msg").css("color", "green").text("Utente rimosso dal gruppo");
            $("#tabCompGruppoRem").children().remove();
            let compGruppo = inviaRichiesta('/api/elComponentiGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo") });
            compGruppo.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, ".msg");
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
            $(".msg").text("Si è verificato un errore durante la rimozione dal gruppo");
    });
}