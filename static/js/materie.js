let idMateria = -1;
let idArgomento = -1;

$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        if (!data.amministratore) {
            window.location.href = "areaPersonale.html";
        }else{
            loadPagina();
        }
    });
});

function loadPagina() {

    getElMaterie();
    getElArgMaterie();
    
    $("#btnAddMateria").on("click", gestAddMateria);
    $("#btnConfModificaMateria").on("click", inviaModMateria);
    $("#btnConfApprovArgomento").on("click", approvaArgomento);
    $("#btnConfRifiutoArgomento").on("click", rifiutaAllegato);
}

function getElMaterie() {
    let rqElMatModerate = inviaRichiesta('/api/elMatModerate', 'POST', {});
    rqElMatModerate.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElAllegati");
    });
    rqElMatModerate.done(function (data) {
        stampaTabMaterie(data);
    });
}

function getElArgMaterie() {
    let rqElArgMatModerate = inviaRichiesta('/api/elArgomentiMatModerate', 'POST', {});
    rqElArgMatModerate.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElArgMaterie");
    });
    rqElArgMatModerate.done(function (data) {
        stampaTabAllegatiMaterie(data);
    });
}

function stampaTabMaterie(materie) {
    let riga, colonna;
    let codHtml = "";

    if (materie.length > 0) {
        $("#sezNoMaterie").css("display", "none");
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
        $("#sezNoMaterie").css("display", "unset");
        $("#sezElMaterie").css("display", "none");
        $("#sezArgMateria").css("display", "none");
    }
}

function setFormatoDate(data) {
    let dd = ("0" + (data.getDate())).slice(-2);
    let mm = ("0" + (data.getMonth() + 1)).slice(-2);
    let yyyy = data.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function gestModMateria(btn) {
    idMateria = parseInt($(btn).attr("id").split('_')[1]);
    let celle = $("#materia_" + idMateria).find("td");
    if (celle.length > 0) {
        let d = celle[1]["innerText"].split('/')[2] + "-" + celle[1]["innerText"].split('/')[1] + "-" + celle[1]["innerText"].split('/')[0];
        $("#descModMateria").val(celle[0]["innerText"]);
        $("#dataModMateria").val(d);
        $("#modalModMateria").modal("show");
    } 
}

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

function gestEliminaMateria(btn) {
    
}

function gestAddMateria() {
    $("#descMateria").removeClass("alert-danger");
    $("#msgAddMateria").text("");

    if ($("#descMateria").val() != "") {
        let rqInsMateria = inviaRichiesta('/api/inserisciMateria', 'POST', { "descMat": $("#descMateria").val()});
        rqInsMateria.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, "#msgAddMateria");
        });
        rqInsMateria.done(function (data) {
            getElMaterie();
        });
    }else{
        gestErrori("Inserire la Descrizione della Materia", $("#descMateria"), "#msgAddMateria");
    }
}

function gestErrori(msg, controllo, target) {
    $(target).html(msg);
    controllo.addClass("alert-danger");
}

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

function openModalApprovaArgomento(btn) {
    idArgomento = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModale").text("Sei sicuro di voler accettare questo argomento?");
    $("#btnConfApprovArgomento").removeAttr("disabled");
    $("#modalApprovArgomento").modal("show");
}

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

function openModalRifiutoArgomento(btn) {
    idArgomento = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModaleRifiuto").text("Sei sicuro di voler rifiutare questo argomento?");
    $("#btnConfRifiutoArgomento").removeAttr("disabled");
    $("#modalRifiutoArgomento").modal("show");
}

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
        gestErrori("Codice argometo mancante. Ricaricare la pagine", $("#btnConfRifiutoArgomento"), "#modalRifiutoArgomento");
    }
}