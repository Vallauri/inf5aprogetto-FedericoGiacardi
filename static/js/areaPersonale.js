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

    chkToken = inviaRichiesta('/api/elMaterie', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoMaterie(data);
    });

    chkToken = inviaRichiesta('/api/feedModuli', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoFeed(data);
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
            codHtml += "<p style='text-align:center'>Non fai parte di alcun gruppo</p>";
        }
    });
    $("#contGruppi").html(codHtml);
}

function creazioneElencoMaterie(utenti) {
    $("#contMaterie").html("");
    let codHtml = "", vetArg = "";
    let aus;
    console.log(utenti);
    utenti.forEach(utente => {
        if (utente["materieModerate"] != undefined && utente["materieModerate"].length > 0) {
            for (let i = 0; i < utente["materieModerate"].length; i++) {
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + utente["materieModerate"][i].descrizione + '</h5>';
                codHtml += '</div>';
                aus = new Date(utente["materieModerate"][i].dataCreazione);
                if (utente["materieModerate"][i].argomenti != undefined) {
                    vetArg = "Argomenti: ";
                    for (let j = 0; j < utente["materieModerate"][i].argomenti.length; j++) {
                        vetArg += utente["materieModerate"][i].argomenti[j].descrizione;
                        if (j != utente["materieModerate"][i].argomenti.length - 1) {
                            vetArg += ", ";
                        }
                    }
                }
                codHtml += '<p class="mb-1">Data iscrizione: ' + aus.toLocaleDateString() + '<br>' + vetArg + '</p>';
                codHtml += '</a>';
            }
        } else {
            codHtml += "<p style='text-align:center'>Non hai creato alcuna materia</p>";
        }
    });
    $("#contMaterie").html(codHtml);
}

function creazioneElencoAppunti(utenti) {
    $("#contAppunti").html("");
    let codHtml = "", vetArg = "";
    let aus;
   
    utenti.forEach(utente => {
        if (utente["appuntiCaricati"] != undefined && utente["appuntiCaricati"].length > 0) {
            for (let i = 0; i < utente["appuntiCaricati"].length; i++) {
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + utente["appuntiCaricati"][i].descrizione + '</h5>';
                codHtml += '</div>';
                aus = new Date(utente["appuntiCaricati"][i].dataCaricamento);
                if (utente["appuntiCaricati"][i].argomenti != undefined) {
                    vetArg = "Argomenti: ";
                    for (let j = 0; j < utente["appuntiCaricati"][i].argomenti.length; j++) {
                        vetArg += utente["appuntiCaricati"][i].argomenti[j].descrizione;
                        if (j != utente["appuntiCaricati"][i].argomenti.length - 1) {
                            vetArg += ", ";
                        }
                    }
                }
                codHtml += '<p class="mb-1">' + vetArg + '<br>Data caricamento: ' + aus.toLocaleDateString() +'</p>';
                codHtml += '</a>';
            }
        }else{
            codHtml += "<p style='text-align:center'>Non hai caricato alcun appunto</p>";
        }
    });
    $("#contAppunti").html(codHtml);
}

function creazioneElencoFeed(utenti) {
    let vetModuli = new Array();

    utenti.forEach(utente =>{
        for (let i = 0; i < utente["appuntiInteressati"].length; i++) {
            if (chkElemVetModuli(utente["appuntiInteressati"][i].descrizione, vetModuli)) {
                vetModuli.push(utente["appuntiInteressati"][i].descrizione);
            }
            for (let j = 0; j < utente["appuntiInteressati"][i].argomenti.length; j++) {
                for (let k = 0; k < utente["appuntiInteressati"][i].argomenti[j].appuntiOk.length; k++) {

                    if (chkElemVetModuli(utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k].descrizione, vetModuli)) {
                        vetModuli.push(utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k].descrizione);
                    }
                }
                
            }
        }
    });

    console.log(vetModuli);
}

function chkElemVetModuli(descModulo, vetModuli) {
    for (let i = 0; i < vetModuli.length; i++) {
        if (descModulo == vetModuli[i]) {
            return false;
        }    
    }
    return true;
}