let idAppunto = -1;
let idModulo = -1;
let idArgomento = -1;

$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        loadPagina();
    });
});

function loadPagina() {

    getElArgomenti();
    getElMaterie();
    getElAppuntiArgomenti();
    getElModuliArgomenti();

    $("#btnAddArgomento").on("click", gestAddArgomento);
    $("#btnConfEliminazioneArg").on("click", eliminaArgomento);

    $("#btnConfApprovAllegato").on("click", approvaAllegato);
    $("#btnConfRifiutoAllegato").on("click", rifiutaAppunto);

    $("#btnConfApprovModulo").on("click", approvaModulo);
    $("#btnConfRifiutoModulo").on("click", rifiutaModulo);
}

function getElArgomenti() {
    let rqElMatModerate = inviaRichiesta('/api/elArgomentiModerati', 'POST', {});
    rqElMatModerate.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElArgomenti");
    });
    rqElMatModerate.done(function (data) {
        stampaTabArgomenti(data);
    });
}

function getElMaterie() {
    let rqElMat = inviaRichiesta('/api/elSimpleMaterie', 'POST', {});
    rqElMat.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgAddArgomento");
    });
    rqElMat.done(function (data) {
        let codHtml = '';
        data.forEach(argomento => {
            codHtml += '<option value="' + argomento._id + '">' + argomento.descrizione + '</option>';
        });
        $("#materiaAppunto").html(codHtml);
        document.getElementById("materiaAppunto").selectedIndex = -1;
        $('#materiaAppunto').selectpicker('refresh');
    });
}

function stampaTabArgomenti(argomenti) {
    let riga, colonna;
    let codHtml = "";

    if (argomenti.length > 0) {
        $("#sezNoArgomenti").css("display", "none");
        $("#corpoTabArgomenti").html("");
        argomenti.forEach(argomento => {
            riga = $("<tr></tr>");
            riga.attr("id", "argomento_" + argomento["_id"]);
            colonna = $("<td></td>");
            colonna.html(argomento["descrizione"]);
            riga.append(colonna);
            colonna = $("<td></td>");
            colonna.html(argomento["matArgomento"][0]["descrizione"]);
            riga.append(colonna);
            colonna = $("<td></td>");
            colonna.html('<button type="button" id="btnElimina_' + argomento["_id"] + '" class="btn btn-danger" onclick="gestEliminaArgomento(this);"><i class="fa fa-trash" aria-hidden="true"></i></button>');
            riga.append(colonna);
            $("#corpoTabArgomenti").append(riga);
        });
    } else {
        codHtml = '<div class="col-sm-12 col-md-12 col-lg-12 mx-auto">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Nessuna argomento moderato</h2>';
        codHtml += '<p><a href="areaPersonale.html">Torna all\' area personale</a></p>';
        codHtml += '</div>';
        codHtml += '</div>';
        $("#contNoArgomenti").html(codHtml);
        $("#sezNoArgomenti").css("display", "");
        $("#sezElArgomenti").css("display", "none");
        // $("#sezArgMateria").css("display", "none");
    }
}

function gestEliminaArgomento(btn) {
    idArgomento = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModaleEliminazioneArg").text("Sei sicuro di voler eliminare questo argomento? Tale operazione cancellerà tutti gli appunti, gli esami, i corsi e le lezioni collegate.");
    $("#btnConfEliminazioneArg").removeAttr("disabled");
    $("#modalEliminazioneArg").modal("show");
}

function eliminaArgomento() {
    $("#contModaleEliminazioneArg").text("Operazione in corso");
    if (idArgomento) {
        let rqeliminaArgomento = inviaRichiesta('/api/eliminaArgomento', 'POST', { "codArgomento": idArgomento});
        rqeliminaArgomento.fail(function (jqXHR, test_status, str_error) {
            $("#btnConfEliminazioneArg").attr("disabled", "disabled");
            $("#contModaleEliminazioneArg").text("Operazione fallita");
            printErrors(jqXHR, "#msgEliminazioneArg");
        });
        rqeliminaArgomento.done(function (data) {
            $("#btnConfEliminazioneArg").removeAttr("disabled");
            $("#contModale").text("Operazione completata");
            $("#modalEliminazioneArg").modal("hide");
            getElArgomenti();
        });
    } else {
        gestErrori("Codice argomento mancante. Ricaricare la pagina", $("#btnConfEliminazioneArg"), "#msgEliminazioneArg");
    }
}

function gestAddArgomento() {
    $("#descArgomento").removeClass("alert-danger");
    $("#argomentoAppunto").removeClass("alert-danger");
    $("#msgAddArgomento").text("");

    if ($("#descArgomento").val() != "") {
        if (document.getElementById("argomentoAppunto").selectedIndex != -1) {
            let rqInsMateria = inviaRichiesta('/api/inserisciArgomento', 'POST', { "descArgomento": $("#descArgomento").val(), "codMateria": $("#argomentoAppunto").val()});
            rqInsMateria.fail(function (jqXHR, test_status, str_error) {
                $("#msgAddArgomento").removeClass("alert alert-success").addClass("alert alert-danger");
                printErrors(jqXHR, "#msgAddArgomento");
                $("#msgAddArgomento").show().fadeOut(5000);
            });
            rqInsMateria.done(function (data) {
                $("#msgAddArgomento").html("Operazione completata.<br> Argomento in attesa di approvazione.").removeClass("alert alert-danger").addClass("alert alert-success").show().fadeOut(5000);
                $("#descArgomento").val("");
                document.getElementById("argomentoAppunto").selectedIndex = -1;
            });
        }else{
            gestErrori("Inserire la Materia dell' argomento", $("#argomentoAppunto"), "#msgAddArgomento");
        }
    } else {
        gestErrori("Inserire la Descrizione dell' argomento", $("#descArgomento"), "#msgAddArgomento");
    }
}

function getElAppuntiArgomenti() {
    let rqElArgMatModerate = inviaRichiesta('/api/elAppuntiArgsModerati', 'POST', {});
    rqElArgMatModerate.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElAppuntiArgomenti");
    });
    rqElArgMatModerate.done(function (data) {
        stampaTabAppuntiArgomenti(data);
    });
}

function stampaTabAppuntiArgomenti(argomenti) {
    let riga, colonna;
    let argOk = false;

    if (argomenti.length > 0) {
        $("#corpoTabAppuntiArgomenti").html("");
        argomenti.forEach(argomento => {
            if (argomento["argomentiDaApprovare"].length > 0) {
                argOk = true;
                argomento["argomentiDaApprovare"].forEach(appunto => {
                    riga = $("<tr></tr>");
                    riga.attr("id", "argomentoAllegato_" + argomento["_id"] + "_" + appunto["_id"]);

                    colonna = $("<td></td>");
                    colonna.html(appunto["descrizione"]);
                    riga.append(colonna);

                    colonna = $("<td></td>");
                    colonna.html(setFormatoDate(new Date(appunto["dataCaricamento"])));
                    riga.append(colonna);

                    colonna = $("<td></td>");
                    colonna.html(appunto["nomeAutore"] + " " + appunto["cognomeAutore"]);
                    riga.append(colonna);

                    colonna = $("<td></td>");
                    colonna.html(argomento["descrizione"]);
                    riga.append(colonna);

                    colonna = $("<td></td>");
                    colonna.html('<button type="button" id="btnApprova_' + argomento["_id"] + "_" + appunto["_id"] + '" class="btn btn-success" onclick="openModalApprovaAppunto(this);"><i class="fa fa-check-circle" aria-hidden="true"></i></button>&nbsp;<button type="button" id="btnRifiuta_' + argomento["_id"] + "_" + appunto["_id"] + '" class="btn btn-danger" onclick="openModalRifiutoArgomento(this);"><i class="fa fa-times-circle" aria-hidden="true"></i></button>');
                    riga.append(colonna);
                    $("#corpoTabAppuntiArgomenti").append(riga);
                });
            }
        });
    }

    if (!argOk) {
        $("#sezAppuntiArgomenti").css("display", "none");
    }
}

function setFormatoDate(data) {
    let dd = ("0" + (data.getDate())).slice(-2);
    let mm = ("0" + (data.getMonth() + 1)).slice(-2);
    let yyyy = data.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}

function openModalApprovaAppunto(btn) {
    idAppunto = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    idArgomento = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 2]);
    $("#contModale").text("Sei sicuro di voler accettare questo allegato?");
    $("#btnConfApprovAllegato").removeAttr("disabled");
    $("#modalApprovAllegato").modal("show");
}

function approvaAllegato() {
    $("#contModale").text("Operazione in corso");
    if (idAppunto) {
        let rqeliminaArgomento = inviaRichiesta('/api/approvaAllegato', 'POST', { "codAppunto": idAppunto, "idArgomento": idArgomento});
        rqeliminaArgomento.fail(function (jqXHR, test_status, str_error) {
            $("#btnConfApprovAllegato").attr("disabled", "disabled");
            $("#contModale").text("Operazione fallita");
            printErrors(jqXHR, "#msgApprovAllegato");
        });
        rqeliminaArgomento.done(function (data) {
            $("#btnConfApprovAllegato").removeAttr("disabled");
            $("#contModale").text("Operazione completata");
            $("#modalApprovAllegato").modal("hide");
            getElAppuntiArgomenti();
        });
    } else {
        gestErrori("Codice appunto mancante. Ricaricare la pagina", $("#btnConfApprovAllegato"), "#msgApprovAllegato");
    }
}

function openModalRifiutoArgomento(btn) {
    idAppunto = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModaleRifiuto").text("Sei sicuro di voler rifiutare questo appunto?");
    $("#btnConfRifiutoAllegato").removeAttr("disabled");
    $("#modalRifiutoAllegato").modal("show");
}

function rifiutaAppunto() {
    $("#contModaleRifiuto").text("Operazione in corso");
    if (idAppunto) {
        let rqRifiutaAppunto = inviaRichiesta('/api/rifiutoAppunto', 'POST', { "codAppunto": idAppunto });
        rqRifiutaAppunto.fail(function (jqXHR, test_status, str_error) {
            $("#contModaleRifiuto").text("Operazione fallita");
            $("#btnConfRifiutoAllegato").attr("disabled", "disabled");
            printErrors(jqXHR, "#msgRifiutoAllegato");
        });
        rqRifiutaAppunto.done(function (data) {
            $("#btnConfRifiutoAllegato").removeAttr("disabled");
            $("#contModaleRifiuto").text("Operazione completata");
            $("#modalRifiutoAllegato").modal("hide");
            getElAppuntiArgomenti();
        });
    } else {
        gestErrori("Codice appunto mancante. Ricaricare la pagine", $("#btnConfRifiutoAllegato"), "#modalRifiutoAllegato");
    }
}

function getElModuliArgomenti() {
    let rqElModuliArgomenti = inviaRichiesta('/api/elModuliArgomenti', 'POST', {});
    rqElModuliArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElModuliArgomenti");
    });
    rqElModuliArgomenti.done(function (data) {
        stampaTabModuliArgomenti(data);
    });
}

function stampaTabModuliArgomenti(argomenti) {
    let riga, colonna;
    let argOk = false;

    if (argomenti.length > 0) {
        $("#corpoTabModuliArgomenti").html("");
        argomenti.forEach(argomento => {
            if (argomento["argomentiDaApprovare"].length > 0) {
                argOk = true;
                argomento["argomentiDaApprovare"].forEach(modulo => {
                    riga = $("<tr></tr>");
                    riga.attr("id", "argomentoModulo_" + argomento["_id"] + "_" + modulo["_id"]);

                    colonna = $("<td></td>");
                    colonna.html(modulo["descrizione"]);
                    riga.append(colonna);

                    colonna = $("<td></td>");
                    colonna.html(setFormatoDate(new Date(modulo["dataCreazione"])));
                    riga.append(colonna);

                    colonna = $("<td></td>");
                    colonna.html(argomento["descrizione"]);
                    riga.append(colonna);

                    colonna = $("<td></td>");
                    colonna.html('<button type="button" id="btnApprova_' + argomento["_id"] + "_" + modulo["_id"] + '" class="btn btn-success" onclick="openModalApprovaModulo(this);"><i class="fa fa-check-circle" aria-hidden="true"></i></button>&nbsp;<button type="button" id="btnRifiuta_' + argomento["_id"] + "_" + modulo["_id"] + '" class="btn btn-danger" onclick="openModalRifiutoModulo(this);"><i class="fa fa-times-circle" aria-hidden="true"></i></button>');
                    riga.append(colonna);
                    $("#corpoTabModuliArgomenti").append(riga);
                });
            }
        });
    }

    if (!argOk) {
        $("#sezModuliArgomenti").css("display", "none");
    }
}

function openModalApprovaModulo(btn) {
    idModulo = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    idArgomento = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 2]);
    $("#contModaleApprovModulo").text("Sei sicuro di voler accettare questo corso?");
    $("#btnConfApprovModulo").removeAttr("disabled");
    $("#modalApprovModulo").modal("show");
}

function approvaModulo() {
    $("#contModaleApprovModulo").text("Operazione in corso");
    if (idModulo) {
        let rqApprovaModulo = inviaRichiesta('/api/approvaModulo', 'POST', { "codModulo": idModulo, "idArgomento": idArgomento });
        rqApprovaModulo.fail(function (jqXHR, test_status, str_error) {
            $("#btnConfApprovModulo").attr("disabled", "disabled");
            $("#contModaleApprovModulo").text("Operazione fallita");
            printErrors(jqXHR, "#msgApprovModulo");
        });
        rqApprovaModulo.done(function (data) {
            $("#btnConfApprovModulo").removeAttr("disabled");
            $("#contModaleApprovModulo").text("Operazione completata");
            $("#modalApprovModulo").modal("hide");
            getElModuliArgomenti();
        });
    } else {
        gestErrori("Codice corso mancante. Ricaricare la pagina", $("#btnConfApprovModulo"), "#msgApprovModulo");
    }
}


function openModalRifiutoModulo(btn) {
    idModulo = parseInt($(btn).attr("id").split('_')[$(btn).attr("id").split('_').length - 1]);
    $("#contModaleRifiutoModulo").text("Sei sicuro di voler rifiutare questo corso?");
    $("#btnConfRifiutoModulo").removeAttr("disabled");
    $("#modalRifiutoModulo").modal("show");
}

function rifiutaModulo() {
    $("#contModaleRifiutoModulo").text("Operazione in corso");
    if (idModulo) {
        let rqRifiutaModulo = inviaRichiesta('/api/rifiutaModulo', 'POST', { "codModulo": idModulo });
        rqRifiutaModulo.fail(function (jqXHR, test_status, str_error) {
            $("#contModaleRifiutoModulo").text("Operazione fallita");
            $("#btnConfRifiutoModulo").attr("disabled", "disabled");
            printErrors(jqXHR, "#msgRifiutoModulo");
        });
        rqRifiutaModulo.done(function (data) {
            $("#btnConfRifiutoModulo").removeAttr("disabled");
            $("#contModaleRifiutoModulo").text("Operazione completata");
            $("#modalRifiutoModulo").modal("hide");
            getElModuliArgomenti();
        });
    } else {
        gestErrori("Codice corso mancante. Ricaricare la pagine", $("#btnConfRifiutoModulo"), "#modalRifiutoModulo");
    }
}