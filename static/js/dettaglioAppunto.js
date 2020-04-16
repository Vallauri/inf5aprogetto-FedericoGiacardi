"use strict";
let codUt = -1;
$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        codUt = data.id;
        loadPagina();
        $("#btnConfElAppunto").on("click", eliminaAppunto);
        $("#btnConfMexElimina").on("click", function () { window.location = "appunti.html";});
    });
});

function loadPagina() {
    let par = window.location.search.substring(1).split('=');
    // Controllo sui parametri in GET
    if (par[0] == "appunto" && !isNaN(parseInt(par[1]))) {
        let datiAppuntoRQ = inviaRichiesta('/api/datiAppuntoById', 'POST', { "idAppunto": par[1] });
        datiAppuntoRQ.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, ".msg");
        });
        datiAppuntoRQ.done(function (data) {
            window.sessionStorage.removeItem("codAppunto");
            window.sessionStorage.setItem("codAppunto", par[1]);
            $("#btnModAppunto").on("click", gestModifica);
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
        
        if (parseInt(appunto[0]["codUtente"]) == parseInt(codUt)) {
            codHtml += '<br><div class="form-group">';
            codHtml += '<a href="#sezModAppunto" id="btnModAppunto" onclick="loadDatiModifica();" class="genric-btn success circle"><i class="fas fa-edit"></i>Modifica</a >&nbsp';
            codHtml += '<a id="btnElAppunto" class="genric-btn danger circle" data-toggle="modal" data-target="#modalConfElimina"><i class="fa fa-trash" aria-hidden="true"></i></i>Elimina</a >';
            codHtml += '</div>';
        }

        codHtml += '</div>';
        $("#contDetAppunto").html(codHtml);
    }
}

function loadDatiModifica() {
    let vetNomeCognome = $("#nomeCognomeAutoreAppunto").html().split(' ');
    let nome = "";
    for (let k = 0; k < vetNomeCognome.length-1; k++) {
        nome += vetNomeCognome[k];
    }
    $("#descModAppunto").val($("#descAppunto").html());
    $("#nomeAutoreModAppunto").val(nome);
    $("#cognomeAutoreModAppunto").val(vetNomeCognome[vetNomeCognome.length-1]);
    let args = $(".descAppunto");
    let value = new Array();
    let I;
    for (I = 0; I < args.length; I++) {
        value[I] = args[I].attributes[1].value;
    }
    window.sessionStorage.setItem("currentArgs", value);
    $('#argomentiModAppunto').selectpicker('val', value);
    $('#argomentiModAppunto').selectpicker('refresh');
    value = new Array();
    args = $(".descAllegati");
    for (I = 0; I < args.length; I++) {
        value[I] = args[I].attributes[1].value;
    }
    window.sessionStorage.setItem("currentAttachments", value);
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

function gestModifica() {
    $("#descModAppunto").removeClass("alert-danger");
    $("#nomeAutoreModAppunto").removeClass("alert-danger");
    $("#cognomeAutoreModAppunto").removeClass("alert-danger");
    $("#argomentiModAppunto").removeClass("alert-danger");
    $("#allegatiModAppunto").removeClass("alert-danger");
    $("#newAllegatiModAppunto").removeClass("alert-danger");
    $("#msgModAppunto").text("");
    let argomentiOk = false;
    let allegatiOk = false;

    if (window.sessionStorage.getItem("codAppunto") != null) {
        if ($("#descModAppunto").val() != "") {
            if ($("#nomeAutoreModAppunto").val() != "") {
                if ($("#cognomeAutoreModAppunto").val() != "") {
                    if (document.getElementById("argomentiModAppunto").selectedIndex != -1) {
                        if (($('#newAllegatiModAppunto').prop('files').length > 0) || (document.getElementById("allegatiModAppunto").selectedIndex != -1)) {
                            let formData = new FormData();
                            argomentiOk = true;
                            allegatiOk = true;
                            formData.append('codAppunto', window.sessionStorage.getItem("codAppunto"));
                            formData.append('descrizione', $("#descModAppunto").val());
                            formData.append('nome', $("#nomeAutoreModAppunto").val());
                            formData.append('cognome', $("#cognomeAutoreModAppunto").val());
                            formData.append('argomentiOk', argomentiOk);
                            formData.append('allegatiOk', allegatiOk);
                            let ausArgs = $("#argomentiModAppunto").val();
                            let oldArgs = window.sessionStorage.getItem("currentArgs").split(',');
                            let newAtt = $("#allegatiModAppunto").val();
                            let oldAtt = window.sessionStorage.getItem("currentAttachments").split(',');
                            formData.append('addArgomenti', ausArgs.filter(x => !oldArgs.includes(x))); //Argomenti da aggiungere
                            formData.append('removeArgomenti', oldArgs.filter(x => !ausArgs.includes(x)));//Argomenti da togliere
                            if (document.getElementById("allegatiModAppunto").selectedIndex != -1) {
                                formData.append('addAllegati', newAtt.filter(x => !oldAtt.includes(x))); //Allegati da aggiungere
                                formData.append('removeAllegati', oldAtt.filter(x => !newAtt.includes(x)));//Allegati da togliere
                            } else {
                                formData.append('removeAllegati', window.sessionStorage.getItem("currentAttachments").split(','));//Se non ho selezionato nulla tolgo tutti i vecchi allegati
                            }

                            if ($('#newAllegatiModAppunto').prop('files').length > 0) {
                                for (let i = 0; i < $('#newAllegatiModAppunto').prop('files').length; i++) {
                                    formData.append('newAllegati', $('#newAllegatiModAppunto').prop('files')[i]);
                                }
                            }

                            let modAppuntoRQ = inviaRichiestaMultipart('/api/modificaAppunto', 'POST', formData);
                            modAppuntoRQ.fail(function (jqXHR, test_status, str_error) {
                                if (jqXHR.status == 603) {
                                    $("#msgModAppunto").text("Parametri Errati o Mancanti");
                                }
                                else {
                                    printErrors(jqXHR, "#msgModAppunto");
                                }
                            });
                            modAppuntoRQ.done(function (data) {
                                clearInputFields();
                            });
                        } else {
                            allegatiOk = false;
                            gestErrori("Indicare almeno un allegato", $("#allegatiAppunto"), "#msgModAppunto");
                        }
                    } else {
                        argomentiOk = false;
                        gestErrori("Selezionare un Argomento", $("#argomentiModAppunto"), "#msgModAppunto");
                    }
                } else {
                    gestErrori("Inserire il Nome dell' Autore", $("#cognomeAutoreModAppunto"), "#msgModAppunto");
                }
            } else {
                gestErrori("Inserire il Nome dell' Autore", $("#nomeAutoreModAppunto"), "#msgModAppunto");
            }

        } else {
            gestErrori("Inserire la Descrizione dell'Appunto", $("#descModAppunto"), "#msgModAppunto");
        }
    } else {
        gestErrori("Codice Appunto mancante. Ricaricare la pagina", undefined, "#msgModAppunto");
    }
    
}

function gestErrori(msg, controllo, target) {
    $(target).html(msg);
    if (controllo) {
        controllo.addClass("alert-danger");
    }
}

function clearInputFields() {
    $("#descModAppunto").val("");
    $("#nomeAutoreModAppunto").val("");
    $("#cognomeAutoreModAppunto").val("");
    document.getElementById("argomentiModAppunto").selectedIndex = -1;
    document.getElementById("allegatiModAppunto").selectedIndex = -1;
    $("#newAllegatiModAppunto").val("");
    $("#msgModAppunto").text("");
    window.location.reload();
}

function eliminaAppunto() {
    if (window.sessionStorage.getItem("codAppunto") != null) {
        let eliminaAppuntoRQ = inviaRichiesta('/api/removeAppunto', 'POST', { "codAppunto": window.sessionStorage.getItem("codAppunto")});
        eliminaAppuntoRQ.fail(function (jqXHR, test_status, str_error) {
            if (jqXHR.status == 603) {
                $("#msgDetAppunto").text("Parametri Errati o Mancanti");
            }
            else {
                printErrors(jqXHR, "#msgDetAppunto");
            }
        });
        eliminaAppuntoRQ.done(function (data) {
            $('#modalMexElimina').modal('show');
        });
    } else {
        gestErrori("Codice Appunto mancante. Ricaricare la pagina", undefined, "#msgDetAppunto");
    }
}