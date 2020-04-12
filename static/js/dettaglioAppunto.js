"use strict";
$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET
    if (par[0] == "appunto" && !isNaN(parseInt(par[1]))) {
        let chkToken = inviaRichiesta('/api/datiAppuntoById', 'POST', { "idAppunto": par[1] });
        chkToken.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, ".msg");
        });
        chkToken.done(function (data) {
            loadArgomenti();
            loadAllegati();
            caricamentoDatiCorso(data);
        });
    }
    else {
        $(".msg").html("Errore nel passaggio dei parametri");
        window.location.href = "appunti.html";
    }
}

function caricamentoDatiCorso(appunto) {
    $("#contDetAppunto").html("");
    let codHtml = "";

    if (appunto == undefined || appunto.length == 0) {
        // codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-sm-12 col-md-12 col-lg-12 mx-auto">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>L\'Appunto richiesto non è disponibile</h2>';
        codHtml += '<p><a href="appunti.html">Torna agli appunti</a></p>';
        codHtml += '</div>';
        codHtml += '</div>';
        // codHtml += '</div>';
        $("#contDetAppunto").html(codHtml);
    }
    else {
        codHtml += '<div class="col-sm-6 col-md-12 col-lg-6 mx-auto">';
        codHtml += '<div class="content_wrapper">';
        codHtml += '<h4 class="title_top">Descrizione</h4>';
        codHtml += '<div id="descAppunto" class="content">';
        codHtml += appunto[0]["descrizione"];
        codHtml += '</div>';
        codHtml += '<h4 class="title">Data Caricamento</h4>';
        codHtml += '<div class="content">';
        codHtml += new Date(appunto[0]["dataCaricamento"]).toLocaleDateString();
        codHtml += '</div>';
        codHtml += '<h4 class="title">Autore Appunto</h4>';
        codHtml += '<div id="nomeCognomeAutoreAppunto" class="content">';
        codHtml += appunto[0]["nomeAutore"] + " " + appunto[0]["cognomeAutore"];
        codHtml += '</div>';
        codHtml += '<h4 class="title">Autore Caricamento</h4>';
        codHtml += '<div class="content">';
        codHtml += appunto[0]["autoreCaricamento"][0].nome + " " + appunto[0]["autoreCaricamento"][0].cognome;
        codHtml += '</div>';
        codHtml += '<h4 class="title">Argomenti Appunto</h4>';
        codHtml += '<div class="content">';
        codHtml += '<ul class="course_list">';
        if (appunto[0]["detArgomenti"] != undefined && appunto[0]["detArgomenti"].length > 0) {
            for (let i = 0; i < appunto[0]["detArgomenti"].length; i++) {
                codHtml += '<li class="justify-content-between align-items-center d-flex">';
                codHtml += '<p class="descAppunto" codArgomento="' + appunto[0]["detArgomenti"][i]._id+'">' + appunto[0]["detArgomenti"][i].descrizione + '</p>';
                codHtml += '<p>Data aggiunta: ' + new Date(appunto[0]["detArgomenti"][i].dataAggiunta).toLocaleDateString() + '</p>';
                codHtml += '</li>';
            }
        }
        else {
            codHtml += '<li class="justify-content-between align-items-center d-flex">';
            codHtml += '<p>Al momento non ci sono argomenti relativi all\' appunto</p>';
            codHtml += '</li>';
        }
        codHtml += '</ul>';
        codHtml += '</div>';

        codHtml += '<h4 class="title">Allegati Appunto</h4>';
        codHtml += '<div class="content">';
        codHtml += '<ul class="course_list">';
        let ausVet = new Array();
        if (appunto[0]["detAllegati"] != undefined && appunto[0]["detAllegati"].length > 0) {
            for (let i = 0; i < appunto[0]["detAllegati"].length; i++) {
                codHtml += '<li class="justify-content-between align-items-center d-flex">';
                ausVet = appunto[0]["detAllegati"][i].percorso.split('\\');
                ausVet = ausVet[ausVet.length - 1].split("_");
                codHtml += '<p class="descAllegati" codAllegato="' + appunto[0]["detAllegati"][i]._id+'">' + ausVet[1] + '</p>';
                codHtml += '<p>Data aggiunta: ' + new Date(appunto[0]["detAllegati"][i].dataCaricamento).toLocaleDateString() + '</p>';
                codHtml += '</li>';
            }
        }
        else {
            codHtml += '<li class="justify-content-between align-items-center d-flex">';
            codHtml += '<p>Al momento non ci sono allegati relativi all\' appunto</p>';
            codHtml += '</li>';
        }
        codHtml += '</ul>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '<br><div class="form-group">';
        codHtml += '<a href="#argomentiModAppunto" id="btnModAppunto" onclick="loadDatiModifica();" class="genric-btn success circle"><i class="fas fa-edit"></i>Modifica</a >&nbsp';
        codHtml += '<a id="btnElAppunto" class="genric-btn danger circle"><i class="fa fa-trash" aria-hidden="true"></i></i>Elimina</a >';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contDetAppunto").html(codHtml);
    }
}

function loadDatiModifica() {
    $("#descModAppunto").val($("#descAppunto").html());
    $("#nomeCognomeAutoreModAppunto").val($("#nomeCognomeAutoreAppunto").html());
    let args = $(".descAppunto");
    let value = new Array();
    let I;
    for (I = 0; I < $(".descAppunto").length; I++) {
        value[I] = args[I].attributes[1].value;
    }
    $('#argomentiModAppunto').selectpicker('val', value);
    $('#argomentiModAppunto').selectpicker('refresh');

    for (I = 0; I < $(".descAllegati").length; I++) {
        value[I] = args[I].attributes[1].value;
    }
    $('#allegatiModAppunto').selectpicker('val', value);
    $('#allegatiModAppunto').selectpicker('refresh');

    $("#sezModAppunto").css("visibility", "visible");
}

function loadArgomenti() {
    let elArgomenti = inviaRichiesta('/api/elencoArgomenti', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModAppunto");
    });
    elArgomenti.done(function (data) {
        let codHtml = "";
        data.forEach(argomento => {
            codHtml += '<option value="' + argomento._id + '">' + argomento.descrizione + '</option>';
        });
        document.getElementById("argomentiModAppunto").selectedIndex = -1;
        $("#argomentiModAppunto").html(codHtml).selectpicker("refresh");
    });
}

function loadAllegati() {
    let elArgomenti = inviaRichiesta('/api/elencoAllegati', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgModAppunto");
    });
    elArgomenti.done(function (data) {
        let codHtml = "";
        let ausVet = new Array();
        data.forEach(allegato => {
            ausVet = allegato.percorso.split('\\');
            ausVet = ausVet[ausVet.length - 1].split("_");
            codHtml += '<option value="' + allegato._id + '">' + ausVet[1] + '</option>';
        });
        document.getElementById("allegatiModAppunto").selectedIndex = -1;
        $("#allegatiModAppunto").html(codHtml).selectpicker("refresh");
    });
}