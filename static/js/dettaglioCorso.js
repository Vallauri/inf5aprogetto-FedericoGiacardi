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
        $("#contCorso").hide();
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
            for (let i = 0; i < modulo[0]["lezioniModulo"].length; i++){
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
        codHtml += '<a href="#" class="btn_1 d-block">Iscriviti al Corso</a>'; // da vedere
        codHtml += '</div>';
        codHtml += '</div>';
        
        $("#contCorso").html(codHtml);
    }
}