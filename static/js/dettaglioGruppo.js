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
        codHtml += '<div class="content">' + gruppo[0]["descrizione"] + '</div>';

        codHtml += '<h4 class="title">Componenti del Gruppo</h4>';
        codHtml += '<div class="content">';
        //codHtml += '<ul class="course_list">';
        
        // codHtml += '<li class="justify-content-between align-items-center d-flex">';
        // codHtml += '<p>Cognome Nome</p>';
        // codHtml += '<p>Username</p>';
        // codHtml += '<p>Data iscrizione al gruppo</p>';
        // //codHtml += '<a class="btn_2 text-uppercase" href="dettaglioArgomento.html?utente=' + utente._id + '">View Details</a>'; // vedere se metterlo o no il dettaglio dell'utente
        // codHtml += '</li>';
        if (gruppo[0]["componenti"] != undefined && gruppo[0]["componenti"].length > 0){
            codHtml += '<table class="table">';
            codHtml += "<tr>";
            codHtml += '<th>Cognome Nome</th>';
            codHtml += '<th>Username</th>';
            codHtml += '<th>Data iscrizione al gruppo</th>';
            codHtml += '</tr>';
            gruppo[0]["componenti"].forEach(utente => {
                // codHtml += '<li class="justify-content-between align-items-center d-flex">';
                // codHtml += '<p>' + utente.cognome + ' ' + utente.nome + '</p>';
                // codHtml += '<p>' + utente.user + '</p>';
                // codHtml += '<p>' + new Date(utente.gruppo.dataInizio).toLocaleDateString() + '</p>';
                // //codHtml += '<a class="btn_2 text-uppercase" href="dettaglioArgomento.html?utente=' + utente._id + '">View Details</a>'; // vedere se metterlo o no il dettaglio dell'utente
                // codHtml += '</li>';
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
                   
        //codHtml += '</ul>';
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
        /*codHtml += '<li>';
        codHtml += '<a class="justify-content-between d-flex" href="#">';
        codHtml += '<p>Materia</p>';
        codHtml += '<span class="color">' + gruppo[0]["materia"][0].descrizione + '</span>';
        codHtml += '</a>';
        codHtml += '</li>';*/
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
            codHtml += '<button class="genric-btn success radius" style="margin:2px;" id="btnAddMember">Aggiungi Membro/i</button>';
            codHtml += '<button class="genric-btn success radius" style="margin:2px;" id="btnModGroup">Modifica Gruppo</button>';
            codHtml += '<button class="genric-btn danger radius" style="margin:2px;" id="btnRemGroup">Elimina Gruppo</button>';
            codHtml += '</div>';
            codHtml += '</div>';
            $(".right-contents").append(codHtml);
            $("#btnIscrivitiGruppo").hide();
        }
        else if (data.ris == "componente")
            $("#btnIscrivitiGruppo").hide();
    });
}