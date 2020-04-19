$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgRic");
    });
    chkToken.done(function (data) {
        document.getElementById("tipoRicerca").selectedIndex = -1;
        $('#tipoRicerca').selectpicker('refresh');
        
        $("#btnRicerca").on("click", ricercaAppunti);
        $("#btnInviaAppunto").on("click", aggiuntaAppunto);
        loadArgomenti(); 
        loadAllegati();
        $("#txtRicerca").autocomplete({
            source: function (req, res) {
                if ($("#tipoRicerca").val() != ""){
                    $.ajax({
                        minLength: 0,
                        url: "/api/ricercaAppunti",
                        dataType: "json",
                        type: "POST",
                        data: {
                            par: req.term,
                            tipo: $("#tipoRicerca").val()
                        },
                        success: function (data) {
                            stampaRisRicerca(data);
                        },
                        error: function (xhr) {
                            printErrors(jqXHR, "#msgRic");
                        }
                    });
                } else {
                    gestErrori("Indicare il tipo di ricerca", $("#tipoRicerca"), "#msgRic");
                }
            }
        });
    });
});

function loadArgomenti() {
    let elArgomenti = inviaRichiesta('/api/elencoArgomenti', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgAddAppunto");
    });
    elArgomenti.done(function (data) {
        let codHtml = '';
        console.log(data);
        data.forEach(argomento =>{
            codHtml += '<option value="' + argomento._id + '">' + argomento.descrizione+'</option>';
        });     
        $("#argomentiAppunto").html(codHtml); 
        document.getElementById("argomentiAppunto").selectedIndex = -1;
        $('#argomentiAppunto').selectpicker('refresh');
    });
}

function loadAllegati() {
    let elArgomenti = inviaRichiesta('/api/elencoAllegati', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgAddAppunto");
    });
    elArgomenti.done(function (data) {
        let codHtml = "";
        let ausVet = new Array();
        data.forEach(allegato => {
            ausVet = allegato.percorso.split('\\');
            ausVet = ausVet[ausVet.length - 1].split("_");
            codHtml += '<option value="' + allegato._id + '">' + ausVet[1] + '</option>';
        });
        document.getElementById("allPresentiAppunto").selectedIndex = -1;
        $("#allPresentiAppunto").html(codHtml).selectpicker("refresh");
    });
}

function ricercaAppunti() {
    if ($("#tipoRicerca").val() != "") {
        let ricAppunti = inviaRichiesta('/api/ricercaAppunti', 'POST', { "tipo": $("#tipoRicerca").val(), "par": $("#txtRicerca").val() });
        ricAppunti.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, "#msgRic");
        });
        ricAppunti.done(function (data) {
            stampaRisRicerca(data);
        });
    }else{
        gestErrori("Indicare il tipo di ricerca", $("#tipoRicerca"), "#msgRic");
    }
}

function stampaRisRicerca(appunti) {
    //fare segnalazione nessun risultato
    console.log(appunti);
    if (appunti.length == 0) {
        $("#msgRic").text("Non è stato individuato alcun appunto");
    }else{
        $("#contRis").html("");
        $("#msgRic").text("");
        let codHtml = '<div class="row">';
        let I = 0;
        let appuntiFiltered = appunti.filter(chkAppunti);
        appuntiFiltered.forEach(appunto => {
            if (I == 0) {
                if (appuntiFiltered.length == 1) {
                    codHtml += '<div class="col-sm-12 col-md-4 col-lg-4 col-xs-4"></div>';
                } else if (appuntiFiltered.length == 2) {
                    codHtml += '<div class="col-sm-12 col-md-2 col-lg-2 col-xs-2"></div>';
                }
            }

            codHtml += '<div class="col-sm-12 col-md-4 col-lg-4 col-xs-4">';
            if (appunto != undefined) {
                codHtml += '<a href="dettaglioAppunto.html?appunto='+appunto._id+'" class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + appunto.descrizione + '</h5>';
                codHtml += '</div>';
                codHtml += '<p class="mb-1">Autore: ' + appunto.nomeAutore + ' ' + appunto.cognomeAutore + '<br>Argomenti: ';
                for (let i = 0; i < appunto.detArgomenti.length; i++) {
                    codHtml += appunto.detArgomenti[i].descrizione;
                    if (i != appunto.detArgomenti.length - 1) {
                        codHtml += ", ";
                    }
                }
            } else {
                codHtml += "<p style='text-align:center'>Dati non disponibili</p>";
            }
            codHtml += "</div>";
            if (I == 2) {
                codHtml += '</div><div class="row">';
                I = 0;
            } else if (I == appuntiFiltered.length - 1) {
                if (appuntiFiltered.length == 1) {
                    codHtml += '<div class="col-sm-12 col-md-4 col-lg-4 col-xs-4"></div>';
                } else if (appuntiFiltered.length == 2) {
                    codHtml += '<div class="col-sm-12 col-md-2 col-lg-2 col-xs-2"></div>';
                }
                codHtml += "</div>";
            }
            I++;
        });

        $("#contRis").html(codHtml);
    }
}

function chkAppunti(appunto) {
    return appunto.detArgomenti.length > 0;
}

function aggiuntaAppunto() {
    $("#descAppunto").removeClass("alert-danger");
    $("#nomeAutoreAppunto").removeClass("alert-danger");
    $("#cognomeAutoreAppunto").removeClass("alert-danger");
    $("#argomentiAppunto").removeClass("alert-danger");
    $("#allegatiAppunto").removeClass("alert-danger");
    $("#msgAddAppunto").text("");

    
    if ($("#descAppunto").val() != "") {
        if ($("#nomeAutoreAppunto").val() != "") {
            if ($("#cognomeAutoreAppunto").val() != "") {
                if (document.getElementById("argomentiAppunto").selectedIndex != -1) {
                    if (($('#allegatiAppunto').prop('files').length > 0) || (document.getElementById("allPresentiAppunto").selectedIndex != -1)) {
                        let formData = new FormData();
                        formData.append('descrizione', $("#descAppunto").val());
                        formData.append('nome', $("#nomeAutoreAppunto").val());
                        formData.append('cognome', $("#cognomeAutoreAppunto").val());
                        formData.append('allegatiPresenti', $("#allPresentiAppunto").val());
                        console.log($("#allPresentiAppunto").val());
                        formData.append('argomenti', new Array($("#argomentiAppunto").val()));
                        for (let i = 0; i < $('#allegatiAppunto').prop('files').length; i++) {
                            formData.append('allegati', $('#allegatiAppunto').prop('files')[i]);
                        }
                        let aggAppuntoRQ = inviaRichiestaMultipart('/api/aggiungiAppunti', 'POST', formData);
                        aggAppuntoRQ.fail(function (jqXHR, test_status, str_error) {
                            if (jqXHR.status == 603) {
                                $("#msgAddAppunto").text("Parametri Errati o Mancanti");
                            }
                            else {
                                printErrors(jqXHR, "#msgAddAppunto");
                            }
                        });
                        aggAppuntoRQ.done(function (data) {
                            $("#msgAddAppunto").text("Appunto aggiunto con successo");
                            clearInputFields();
                        });
                    } else {
                        gestErrori("Indicare almeno un allegato", $("#allegatiAppunto"), "#msgAddAppunto");
                    }
                } else {
                    gestErrori("Selezionare un Argomento", $("#argomentiAppunto"), "#msgAddAppunto");
                }
            } else {
                gestErrori("Inserire il Cognome dell' Autore", $("#cognomeAutoreAppunto"), "#msgAddAppunto");
            }
        } else {
            gestErrori("Inserire il Nome dell' Autore", $("#nomeAutoreAppunto"), "#msgAddAppunto");
        }
    }else{
        gestErrori("Inserire la Descrizione dell'Appunto", $("#descAppunto"), "#msgAddAppunto");
    }
}

function clearInputFields() {
    $("#descAppunto").val("");
    $("#nomeAutoreAppunto").val("");
    $("#cognomeAutoreAppunto").val("");
    document.getElementById("argomentiAppunto").selectedIndex = -1;
    document.getElementById("allPresentiAppunto").selectedIndex = -1;
    $("#allegatiAppunto").val("");
}

function gestErrori(msg, controllo, target) {
    $(target).html(msg);
    controllo.addClass("alert-danger");
}