"use strict";

$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let chkToken = inviaRichiesta('/api/elGruppi', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoGruppi(data);
    });

    chkToken = inviaRichiesta('/api/elAppunti', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoAppunti(data);
    });
}

function creazioneElencoGruppi(utenti) {
    $("#contGruppi").html("");
    let codHtml = "";
    let aus;
    
    utenti.forEach(utente => {
        if (utente["gruppi"] != undefined && utente["gruppi"].length > 0) {
            for (let i = 0; i < utente["gruppi"].length; i++) {
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + utente["gruppi"][i].nome + '</h5>'; //mettere il nome del gruppo
                codHtml += '</div>';
                aus = new Date(utente["gruppo"][i].dataInizio);
                console.log(utente["gruppi"][i].tipoGruppo[0].descrizione);
                codHtml += '<p class="mb-1">' + utente["gruppi"][i].descrizione + '<br>Data iscrizione: ' + aus.toLocaleDateString() +'<br>Tipo Gruppo: ' + utente["gruppi"][i].tipoGruppo[0].descrizione+'</p>'; //tipo gruppo descrizione e data iscrizione
                codHtml += '</a>';
            }
        }else{
            codHtml += "<p>Non fai parte di alcun gruppo</p>";
        }
    });
    $("#contGruppi").html(codHtml);
}

function creazioneElencoAppunti(utenti) {
    $("#contAppunti").html("");
    let codHtml = "", vetArg = "";
    let aus;
    console.log(utenti);
    utenti.forEach(utente => {
        if (utente["appuntiCaricati"] != undefined && utente["appuntiCaricati"].length > 0) {
            for (let i = 0; i < utente["appuntiCaricati"].length; i++) {
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + utente["appuntiCaricati"][i].descrizione + '</h5>';
                codHtml += '</div>';
                aus = new Date(utente["appuntiCaricati"][i].dataCaricamento);
                vetArg = "Argomenti: ";
                for (let j = 0; j < utente["appuntiCaricati"][i].argomenti.length; j++) {
                    vetArg += utente["appuntiCaricati"][i].argomenti[j].descrizione; 
                    if (j != utente["appuntiCaricati"][i].argomenti.length - 1) {
                        vetArg+=", ";
                    }
                }
                codHtml += '<p class="mb-1">' + vetArg + '<br>Data caricamento: ' + aus.toLocaleDateString(); +'</p>';
                codHtml += '</a>';
            }
        }else{
            codHtml += "<p style='text-align:center''>Non hai caricato alcun appunto</p>";
        }
    });
    $("#contAppunti").html(codHtml);
}