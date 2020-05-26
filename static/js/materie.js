"use strict";
let idMateria = -1;
let idArgomento = -1;

//Routine Principale
$(document).ready(function () {
    //Controllo validità token
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        //La gestione della materia è disponibile solo per l'amministratore
        //se l'utente loggato non lo è si viene reindirizzati all'area personale
        if (!data.amministratore) {
            window.location.href = "areaPersonale.html";
        }else{
            loadPagina();
        }
    });
});

//Caricamento Pagina
function loadPagina() {
    getElMaterie();
    getElArgMaterie();
    $("#btnAddMateria").on("click", gestAddMateria);
    $("#btnConfEliminazioneMat").on("click", eliminaMateria);
    $("#btnConfModificaMateria").on("click", inviaModMateria);
    $("#btnConfApprovArgomento").on("click", approvaArgomento);
    $("#btnConfRifiutoArgomento").on("click", rifiutaAllegato);
}

//Recupero elenco materie moderate dall'utente
function getElMaterie() {
    let rqElMatModerate = inviaRichiesta('/api/elMatModerate', 'POST', {});
    rqElMatModerate.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElMaterie");
    });
    rqElMatModerate.done(function (data) {
        stampaTabMaterie(data);
    });
}

//Recupero elenco nuovi argomenti da approvare
function getElArgMaterie() {
    let rqElArgMatModerate = inviaRichiesta('/api/elArgomentiMatModerate', 'POST', {});
    rqElArgMatModerate.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElArgMaterie");
    });
    rqElArgMatModerate.done(function (data) {
        $("#sezArgMateria").show();
        stampaTabAllegatiMaterie(data);
    });
}

//Creazione tabella materie moderate
function stampaTabMaterie(materie) {
    let riga, colonna;
    let codHtml = "";
    $("#voceNavMaterie").addClass("active");
    if (materie.length > 0) {
        $("#sezNoMaterie").hide();
        $("#sezElMaterie").show();
        $("#corpoTabMaterie").html("");
        materie.forEach(materia => {
            riga = $("<tr></tr>");
            riga.attr("id", "materia_" + materia["_id"]);
            colonna = $("<td></td>");
            colonna.html(materia["descrizione"]);
            riga.append(colonna);
            colonna = $("<td></td>");
            colonna.html(setFormatoDate(new Date(materia["dataCreazione"])));
            riga.append(colonna);
            colonna = $("<td></td>");
            colonna.html('<button type="button" id="btnModifica_' + materia["_id"] + '" class="btn btn-success" onclick="gestModMateria(this);"><i class="fas fa-edit"></i></button>&nbsp;<button type="button" id="btnElimina_' + materia["_id"] + '" class="btn btn-danger" onclick="gestEliminaMateria(this);"><i class="fa fa-trash" aria-hidden="true"></i></button>');
            riga.append(colonna);
            $("#corpoTabMaterie").append(riga);
        });
    }else{
        codHtml = '<div class="col-sm-12 col-md-12 col-lg-12 mx-auto">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Nessuna materia moderata</h2>';
        codHtml += '<p><a href="areaPersonale.html">Torna all\' area personale</a></p>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contNoMaterie").html(codHtml);
        $("#sezNoMaterie").show();
        $("#sezElMaterie").hide();
        $("#sezArgMateria").hide();
    }
}

//Funzione di impostazione formato date
function setFormatoDate(data) {
    let dd = ("0" + (data.getDate())).slice(-2);
    let mm = ("0" + (data.getMonth() + 1)).slice(-2);
    let yyyy = data.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

//Caricamento dati materia selezionata
//in modal modifica
function gestModMateria(btn) {
    idMateria = parseInt($(btn).attr("id").split('_')[1]);
    let celle = $("#materia_" + idMateria).find("td");
    if (celle.length > 0) {
        let d = celle[1]["innerText"].split('/')[2] + "-" + celle[1]["innerText"].split('/')[1] + "-" + celle[1]["innerText"].split('/')[0];
        $("#descModMateria").val(celle[0]["innerText"]);
        $("#dataModMateria").val(d);
        $("#modalModMateria").modal("show");
        $("#msgModMateria").text("").removeClass("alert alert-danger");
    } 
}

//Gestione Modifica Materia
function inviaModMateria() {
    if ($("#descModMateria").val() != "") {
        if (Date.parse($("#dataModMateria").val())) {
            let rqModMateria = inviaRichiesta('/api/modificaMateria', 'POST', { "desc": $("#descModMateria").val(), "data":$("#dataModMateria").val()});
            rqModMateria.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgModMateria");
            });
            rqModMateria.done(function (data) {
                $("#modalModMateria").modal("hide");
                getElMaterie();
            });
        }else{
            gestErrori("Inserire una data valida", $("#dataModMateria"), "#msgModMateria");
        }
    }else{
        gestErrori("Inserire la Descrizione della Materia", $("#descModMateria"), "#msgModMateria");
    }
}

//Apertura modal eliminazione materia
//e recupero codice materia selezionata
function gestEliminaMateria(btn) {
    idMateria = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModaleEliminazioneMat").text("Sei sicuro di voler eliminare questo materia? Tale operazione cancellerà tutti i dati ad essa collegati");
    $("#btnConfEliminazioneMat").removeAttr("disabled");
    $("#modalEliminazioneMat").modal("show");
    $("#msgEliminazioneMat").text("").removeClass("alert alert-danger");
}

//Gestione Eliminazione materia
function eliminaMateria() {
    $("#contModaleEliminazioneMat").text("Operazione in corso");
    if (idMateria) {
        let rqEliminaMateria = inviaRichiesta('/api/eliminaMateria', 'POST', { "codMateria": idMateria });
        rqEliminaMateria.fail(function (jqXHR, test_status, str_error) {
            $("#btnConfEliminazioneMat").attr("disabled", "disabled");
            $("#contModaleEliminazioneMat").text("Operazione fallita");
            printErrors(jqXHR, "#msgEliminazioneMat");
        });
        rqEliminaMateria.done(function (data) {
            $("#btnConfEliminazioneMat").removeAttr("disabled");
            $("#contModaleEliminazioneMat").text("Operazione completata");
            $("#modalEliminazioneMat").modal("hide");
            getElMaterie();
        });
    } else {
        gestErrori("Codice materia mancante. Ricaricare la pagina", $("#btnConfEliminazioneMat"), "#msgEliminazioneMat");
    }
}

//Gestione Aggiunta Materia
function gestAddMateria() {
    $("#descMateria").removeClass("alert-danger");
    $("#msgAddMateria").removeClass("alert alert-danger").text("");

    //Controllo campi di input
    if ($("#descMateria").val() != "") {
        let rqInsMateria = inviaRichiesta('/api/inserisciMateria', 'POST', { "descMat": $("#descMateria").val()});
        rqInsMateria.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, "#msgAddMateria");
        });
        rqInsMateria.done(function (data) {
            $("#msgAddMateria").removeClass("alert alert-danger").text("");
            getElMaterie();
        });
    }else{
        gestErrori("Inserire la Descrizione della Materia", $("#descMateria"), "#msgAddMateria");
    }
}

//Funzione di stampa errori
function gestErrori(msg, controllo, target) {
    $(target).html(msg).addClass("alert alert-danger");
    controllo.addClass("alert-danger");
}

//Creazione Tabella Elenco Argomenti da approvare
function stampaTabAllegatiMaterie(materie) {
    let riga, colonna;
    let argOk = false;

    if (materie.length > 0) {
        $("#corpoTabArgMaterie").html("");
        materie.forEach(materia => {
            if (materia["argMatModerate"].length > 0) {
                argOk = true;
                materia["argMatModerate"].forEach(argomento => {
                    riga = $("<tr></tr>");
                    riga.attr("id", "materiaArgomento_" + materia["_id"] + "_" + argomento["_id"]);
                    colonna = $("<td></td>");
                    colonna.html(argomento["descrizione"]);
                    riga.append(colonna);
                    colonna = $("<td></td>");
                    colonna.html('<button type="button" id="btnApprova_' + materia["_id"] + "_" + argomento["_id"] + '" class="btn btn-success" onclick="openModalApprovaArgomento(this);"><i class="fa fa-check-circle" aria-hidden="true"></i></button>&nbsp;<button type="button" id="btnRifiuta_' + materia["_id"] + "_" + argomento["_id"] + '" class="btn btn-danger" onclick="openModalRifiutoArgomento(this);"><i class="fa fa-times-circle" aria-hidden="true"></i></button>');
                    riga.append(colonna);
                    $("#corpoTabArgMaterie").append(riga);
                });
            }
        });
    }

    if (!argOk) {
        $("#sezArgMateria").css("display", "none");
    }
}

//Apertura modal approvazione argomento
//e recupero codice argomento selezionata
function openModalApprovaArgomento(btn) {
    idArgomento = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModale").text("Sei sicuro di voler accettare questo argomento?");
    $("#btnConfApprovArgomento").removeAttr("disabled");
    $("#modalApprovArgomento").modal("show");
    $("#msgApprovArgomento").text("").removeClass("alert alert-danger");
}

//Gestione Approvazione Argomento
function approvaArgomento(btn) {
    $("#contModale").text("Operazione in corso");
    if (idArgomento) {
        let rqApprovaArgomento = inviaRichiesta('/api/approvaArgomento', 'POST', { "codArgomento": idArgomento });
        rqApprovaArgomento.fail(function (jqXHR, test_status, str_error) {
            $("#btnConfApprovArgomento").attr("disabled", "disabled");
            $("#contModale").text("Operazione fallita");
            printErrors(jqXHR, "#msgApprovArgomento");
        });
        rqApprovaArgomento.done(function (data) {
            $("#btnConfApprovArgomento").removeAttr("disabled");
            $("#contModale").text("Operazione completata");
            $("#modalApprovArgomento").modal("hide");
            getElArgMaterie();
        });
    }else{
        gestErrori("Codice argomento mancante. Ricaricare la pagina", $("#btnConfApprovArgomento"), "#msgApprovArgomento");
    }
}

//Apertura modal rifiuto argomento
//e recupero codice argomento selezionato
function openModalRifiutoArgomento(btn) {
    idArgomento = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModaleRifiuto").text("Sei sicuro di voler rifiutare questo argomento?");
    $("#btnConfRifiutoArgomento").removeAttr("disabled");
    $("#modalRifiutoArgomento").modal("show");
    $("#msgRifiutoArgomento").text("").removeClass("alert alert-danger");
}

//Gestione Rifiuto Argomento
function rifiutaAllegato(btn) {
    $("#contModaleRifiuto").text("Operazione in corso");
    if (idArgomento) {
        let rqRifiutaArgomento = inviaRichiesta('/api/rifiutoArgomento', 'POST', { "codArgomento": idArgomento });
        rqRifiutaArgomento.fail(function (jqXHR, test_status, str_error) {
            $("#contModaleRifiuto").text("Operazione fallita");
            $("#btnConfRifiutoArgomento").attr("disabled", "disabled");
            printErrors(jqXHR, "#msgRifiutoArgomento");
        });
        rqRifiutaArgomento.done(function (data) {
            $("#btnConfRifiutoArgomento").removeAttr("disabled");
            $("#contModaleRifiuto").text("Operazione completata");
            $("#modalRifiutoArgomento").modal("hide");
            getElArgMaterie();
        });
    } else {
        gestErrori("Codice argomento mancante. Ricaricare la pagina", $("#btnConfRifiutoArgomento"), "#modalRifiutoArgomento");
    }
}