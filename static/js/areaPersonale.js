"use strict";

$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        loadPagina();
    });
});

function loadPagina() {
    let chkToken = inviaRichiesta('/api/elGruppi', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoGruppi(data);
    });
}

function creazioneElencoGruppi(utenti) {
    $("#contGruppi").html("");
    let codHtml = "";
    let aus;
    console.log(utenti);
    utenti.forEach(utente => {
        for (let i = 0; i < utente["gruppi"].length; i++) {
            codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
            codHtml += '<div class="d-flex w-100 justify-content-between">';
            codHtml += '<h5 class="mb-1">' + utente["gruppi"][i].nome+'</h5>'; //mettere il nome del gruppo
            codHtml += '</div>';
            aus = new Date(utente["gruppo"][i].dataInizio);
            console.log(aus.toLocaleDateString());
            codHtml += '<p class="mb-1">' + utente["gruppi"][i].descrizione+'<br>Data iscrizione: ' + aus.toLocaleDateString();+'</p>'; //tipo gruppo descrizione e data iscrizione
            codHtml += '</a>';
        }
    });
    $("#contGruppi").html(codHtml);
}