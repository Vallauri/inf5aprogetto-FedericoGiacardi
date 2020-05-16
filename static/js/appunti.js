//Routine Principale
$(document).ready(function () {
    //Controllo validità token
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
        //Gestione autocomplete con jquery Ui
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

//Carcamento Combobox Argomenti per Inserimento Appunto
function loadArgomenti() {
    let elArgomenti = inviaRichiesta('/api/elencoArgomenti', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgAddAppunto");
    });
    elArgomenti.done(function (data) {
        let codHtml = '';
        data.forEach(argomento =>{
            codHtml += '<option value="' + argomento._id + '">' + argomento.descrizione+'</option>';
        });     
        $("#argomentiAppunto").html(codHtml); 
        document.getElementById("argomentiAppunto").selectedIndex = -1;
        $('#argomentiAppunto').selectpicker('refresh');
    });
}

//Carcamento Combobox Allegati per Inserimento Appunto
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
            //Recupero il nome del file dal percorso assoluto
            ausVet = ausVet[ausVet.length - 1].split(/_(.+)/);
            codHtml += '<option value="' + allegato._id + '">' + ausVet[1] + '</option>';
        });
        document.getElementById("allPresentiAppunto").selectedIndex = -1;
        $("#allPresentiAppunto").html(codHtml).selectpicker("refresh");
    });
}

//Gestione Ricerca Appunti
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

//Stampo i risultati della ricerca appunti
function stampaRisRicerca(appunti) {
    $("#contRis").html("");
    $("#msgRic").text("").removeClass("alert alert-danger");
    if (appunti.length == 0) {
        $("#msgRic").text("Non è stato individuato alcun appunto").addClass("alert alert-danger");
    }else{
        //Filter restituisce un vettore con solo gli elementi del vettore di partenza che rispettano la condizione data
        //In questo caso restituisce gli appunti con almeno un argomento
        let appuntiFiltered = appunti.filter(chkAppunti);
        if (appuntiFiltered.length == 0) {
            $("#msgRic").text("Non è stato individuato alcun appunto").addClass("alert alert-danger");
        }
        else{
            let codHtml = '<div class="row">';
            let I = 0;
            appuntiFiltered.forEach(appunto => {

                codHtml += '<div class="col-sm-12 col-md-4 col-lg-4 col-xs-4 mx-auto">';
                if (appunto != undefined) {
                    codHtml += '<a href="dettaglioAppunto.html?appunto=' + appunto._id + '" class="list-group-item list-group-item-action flex-column align-items-start">';
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
                } 
                I++;
            });
            $("#contRis").html(codHtml);
        }
    }
}

//Restituisce true se l'appunto contiene almeno un argomento
function chkAppunti(appunto) {
    return appunto.detArgomenti.length > 0;
}

//Gestione Aggiunta Appunto
function aggiuntaAppunto() {
    $("#descAppunto").removeClass("alert-danger");
    $("#nomeAutoreAppunto").removeClass("alert-danger");
    $("#cognomeAutoreAppunto").removeClass("alert-danger");
    $("#argomentiAppunto").removeClass("alert-danger");
    $("#allegatiAppunto").removeClass("alert-danger");
    $("#msgAddAppunto").text("").removeClass("alert alert-danger");

    //Controlli di input
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
                        formData.append('argomenti', new Array($("#argomentiAppunto").val()));
                        for (let i = 0; i < $('#allegatiAppunto').prop('files').length; i++) {
                            formData.append('allegati', $('#allegatiAppunto').prop('files')[i]);
                        }
                        let aggAppuntoRQ = inviaRichiestaMultipart('/api/aggiungiAppunti', 'POST', formData);
                        aggAppuntoRQ.fail(function (jqXHR, test_status, str_error) {
                            if (jqXHR.status == 603) {
                                $("#msgAddAppunto").text("Parametri Errati o Mancanti").addClass("alert alert-danger");
                            }
                            else {
                                printErrors(jqXHR, "#msgAddAppunto");
                            }
                        });
                        aggAppuntoRQ.done(function (data) {
                            $("#msgAddAppunto").text("Appunto aggiunto con successo").removeClass("alert alert-danger").addClass("alert alert-success")
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

//Pulizia campi di input
function clearInputFields() {
    $("#descAppunto").val("");
    $("#nomeAutoreAppunto").val("");
    $("#cognomeAutoreAppunto").val("");
    document.getElementById("argomentiAppunto").selectedIndex = -1;
    document.getElementById("allPresentiAppunto").selectedIndex = -1;
    $("#argomentiAppunto").selectpicker("refresh");
    $("#allPresentiAppunto").selectpicker("refresh");
    $("#allegatiAppunto").val("");
}

//Funzione di stampa errori
function gestErrori(msg, controllo, target) {
    $(target).html(msg).addClass("alert alert-danger");
    controllo.addClass("alert-danger");
}