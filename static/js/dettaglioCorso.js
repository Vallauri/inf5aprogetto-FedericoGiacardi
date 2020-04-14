"use strict";
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
        codHtml += '<h4 class="title_top">' + modulo[0]["descrizione"] +'</h4>';
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

        codHtml += '<h4 class="title">Lezioni del Corso</h4>';
        codHtml += '<div class="content">';
        codHtml += '<ul class="course_list">';

        if (modulo[0]["lezioniModulo"] != undefined && modulo[0]["lezioniModulo"].length > 0) {
            for (let i = 0; i < modulo[0]["lezioniModulo"].length; i++) {
                codHtml += '<li class="justify-content-between align-items-center d-flex">';
                codHtml += '<p>' + modulo[0]["lezioniModulo"][i].titolo + '</p>';
                codHtml += '<p>Data aggiunta: ' + new Date(modulo[0]["lezioni"][i].dataAggiunta).toLocaleDateString() + '</p>';
                //codHtml += '<a class="btn_2 text-uppercase" href="dettaglioArgomento.html?lezione=' + lezione._id + '">View Details</a>'; // vedere se metterlo o no il dettaglio dell'lezione
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
        codHtml += '<button id="btnIscrivitiCorso" class="genric-btn success radius">Iscriviti al Corso</button>'; // da gestire
        codHtml += '</div>';

        let chkToken = inviaRichiesta('/api/elGruppiAdmin', 'POST', { });
        chkToken.fail(function (jqXHR, test_status, str_error) {
            console.log(jqXHR);
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            if(data.length > 0){
                codHtml += '<div style="margin-top:5px" class="col-lg-12 text-center">';
                codHtml += '<button id="btnIscriviGruppoCorso" class="genric-btn success radius">Iscrivi un tuo Gruppo al Corso</button>'; // da gestire
                codHtml += '</div>';
            }
            codHtml += '</div>';
            codHtml += '</div>';

            $("#contCorso").html(codHtml);
        });
    }
}

function chkModeratore(idCorso) {
    // da cambiare tutto!!!
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
            codHtml += '<h4>Gestione Gruppo</h4>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnAddMember">Aggiungi Membro/i</button>';
            codHtml += '<button class="genric-btn success radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnModGroup">Modifica Gruppo</button>';
            codHtml += '<button class="genric-btn danger radius" data-toggle="modal" data-target="#dettGruppoMod" style="margin:2px;" id="btnRemGroup">Elimina Gruppo</button>';
            codHtml += '</div>';
            codHtml += '</div>';
            $(".right-contents").append(codHtml);
            $("#btnIscrivitiGruppo").hide();

            $("#btnSalvaModifiche").on("click", function () {
                /*if($(this).html() == "Salva Aggiunte"){
                    window.location.reload();
                }
                else */
                if ($(this).html() == "Salva Modifiche") {
                    if (chkCorrettezzaDati()) {
                        let chkToken = inviaRichiesta('/api/modificaGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo"), "nome": $("#nome").val().trim(), "descrizione": $("#descrizione").val().trim(), "tipoGruppo": $("#tipoGruppo option:selected").val() });
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
                    let chkToken = inviaRichiesta('/api/rimuoviGruppo', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo") });
                    chkToken.fail(function (jqXHR, test_status, str_error) {
                        printErrors(jqXHR, ".modal-body .msg");
                    });
                    chkToken.done(function (data) {
                        if (data.ok == 1)
                            window.location.href = "gruppi.html";
                        else
                            $(".modal-body .msg").text("Si è verificato un errore durante la rimozione del gruppo. Riprovare");
                    });
                }
            });

            $("#btnAddMember").on("click", function () {
                console.log("Aggiunta membro");
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
                cod += '<p class="msg" style="margin-top:5px"></p>';
                // cod += '<span id="elUtAdd" idUt=""></span>'; // serve per add diversa da quella gestita ora
                cod += '</div>';
                cod += '</div>';
                cod += '</div>';

                $("#dettGruppoMod .modal-body").append(cod);

                $("#btnRicerca").on("click", function () {
                    $(".modal-body .msg").text("");

                    if ($("#txtRicerca").val() != "") {
                        let ricerca = inviaRichiesta('/api/cercaUtenteAggiuntaGruppo', 'POST', { "valore": $("#txtRicerca").val() });
                        ricerca.fail(function (jqXHR, test_status, str_error) {
                            printErrors(jqXHR, ".modal-body .msg");
                        });
                        ricerca.done(function (data) {
                            console.log(data);
                            dettaglioUtente(data);
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
                console.log("Modifica gruppo");
                $("#dettGruppoMod .modal-title").html("Modifica del Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Salva Modifiche");

                let chkToken = inviaRichiesta('/api/datiGruppoById', 'POST', { "idGruppo": $("#descGruppo").attr("idGruppo") });
                chkToken.fail(function (jqXHR, test_status, str_error) {
                    printErrors(jqXHR, ".modal-body .msg");
                });
                chkToken.done(function (data) {
                    console.log(data);
                    modificaGruppo(data);
                });
            });

            $("#btnRemGroup").on("click", function () {
                console.log("Elimina gruppo");
                $("#dettGruppoMod .modal-title").html("Rimozione del Gruppo");
                $("#dettGruppoMod .modal-body").children().remove();
                $("#btnSalvaModifiche").show().html("Conferma Rimozione");

                let cod = "";
                cod += '<div class="row">';
                cod += '<div class="col-lg-12 text-center">';
                cod += '<p>Sei sicuro di voler rimuovere il gruppo? Tutti i dati ad esso collegati verranno rimossi</p>';
                cod += '<p class="msg"></p>';
                cod += '</div>';
                cod += '</div>';

                $("#dettGruppoMod .modal-body").append(cod);
            });
        }
        else if (data.ris == "componente")
            $("#btnIscrivitiGruppo").hide();
    });
}