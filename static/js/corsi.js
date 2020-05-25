"use strict";
//Routine Principale
$(document).ready(function () {
    loadPagina();

    //Gestione Ricerca Corsi
    $("#btnRicerca").on("click", function () {
        $("#msgRicerca").removeClass("alert alert-danger").text("");

        if ($("#txtRicerca").val() != "") {
            let ricerca = inviaRichiesta('/api/cercaCorso', 'POST', { "valore": $("#txtRicerca").val(), "filtri": { "corsiDaCercare": $("#tipoRicerca option:selected").val(), "tipoCorso": $("#tipoCorso option:selected").val() } });
            ricerca.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgRicerca");
            });
            ricerca.done(function (data) {
                creazioneElencoCorsi(data);
            });
        }
        else {
            $("#msgRicerca").html("Inserire un valore per la ricerca").addClass("alert alert-danger");
            $("#txtRicerca").focus();
        }
    });

    //Gestione Autocomplete con Jquery UI
    $('#txtRicerca').autocomplete({
        source: function (req, res) {
            $.ajax({
                url: "/api/cercaCorso",
                dataType: "json",
                type: "POST",
                data: {
                    valore: req.term,
                    filtri: { "corsiDaCercare": $("#tipoRicerca option:selected").val(), "tipoCorso": $("#tipoCorso option:selected").val() }
                },
                success: function (data) {
                    creazioneElencoCorsi(data);
                },
                error: function (xhr) {
                    printErrors(xhr, "#msgRicerca");
                }
            });
        }
    });

    $("#btnInviaCorso").on("click", aggiuntaCorso);
    loadTipiModuli();
    loadMaterie();
    loadArgomenti();
    document.getElementById('tipoRicerca').selectedIndex = -1;
    $('#tipoRicerca').selectpicker('refresh');
});

//Controllo validità token
function loadPagina() {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {});
}

//Caricamento Combo Tipi Moduli per ricerca e inserimento nuovo modulo
function loadTipiModuli() {
    let elTipiModuli = inviaRichiesta('/api/elTipiCorsi', 'POST', {});
    elTipiModuli.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgErrRicAvanzata");
    });
    elTipiModuli.done(function (data) {
        let codHtml = '';
        data.forEach(tipocorso => {
            codHtml += '<option value="' + tipocorso._id + '">' + tipocorso.descrizione + '</option>';
        });
        $("#tipoModuloAdd").html(codHtml);
        document.getElementById("tipoModuloAdd").selectedIndex = -1;
        $('#tipoModuloAdd').selectpicker('refresh');
        $("#tipoCorso").html(codHtml);
        document.getElementById("tipoCorso").selectedIndex = -1;
        $('#tipoCorso').selectpicker('refresh');
    });
}

//Caricamento Combo Materie per inserimento nuovo corso
function loadMaterie() {
    let elMaterie = inviaRichiesta('/api/elSimpleMaterie', 'POST', {});
    elMaterie.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgAddCorso");
    });
    elMaterie.done(function (data) {
        let codHtml = '';
        data.forEach(materia => {
            codHtml += '<option value="' + materia._id + '">' + materia.descrizione + '</option>';
        });
        $("#materiaCorso").html(codHtml);
        $('#materiaCorso').selectpicker('refresh');
        document.getElementById("materiaCorso").selectedIndex = -1;
    });
}

//Carcamento Combobox Argomenti per Inserimento Corso
function loadArgomenti() {
    let elArgomenti = inviaRichiesta('/api/elencoArgomenti', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgAddCorso");
    });
    elArgomenti.done(function (data) {
        let codHtml = '';
        data.forEach(argomento => {
            codHtml += '<option value="' + argomento._id + '">' + argomento.descrizione + '</option>';
        });
        $("#argomentiCorso").html(codHtml);
        document.getElementById("argomentiCorso").selectedIndex = -1;
        $('#argomentiCorso').selectpicker('refresh');
    });
}

//Inserimento Nuovo Corso
function aggiuntaCorso(){
    $("#descCorso").removeClass("alert-danger");
    $("#tipoModuloAdd").removeClass("alert-danger");
    $("#materiaCorso").removeClass("alert-danger");
    $("#argomentiCorso").removeClass("alert-danger");
    $("#msgAddCorso").removeClass("alert alert-danger").text("");

    //Controllo dati di input
    if ($("#descCorso").val() != "") {
        if (document.getElementById("tipoModuloAdd").selectedIndex != -1) {
            if (document.getElementById("materiaCorso").selectedIndex != -1) {
                if (document.getElementById("argomentiCorso").selectedIndex != -1) {
                    let formData = {
                        'descrizione' : $("#descCorso").val(),
                        'tipoCorso' : $("#tipoModuloAdd").val(),
                        'materia' : $("#materiaCorso").val(),
                        'argomenti': $("#argomentiCorso").val()
                    };

                    let aggCorso = inviaRichiesta('/api/aggiungiCorso', 'POST', formData);
                    aggCorso.fail(function (jqXHR, test_status, str_error) {
                        if (jqXHR.status == 603) {
                            $("#msgAddCorso").text("Parametri Errati o Mancanti").addClass("alert alert-danger");
                        }
                        else {
                            printErrors(jqXHR, "#msgAddCorso");
                        }
                    });
                    aggCorso.done(function (data) {
                        $("#msgAddCorso").text("Corso aggiunto con successo").removeClass("alert alert-danger").addClass("alert alert-success");
                        clearInputFields();
                    });
                } else {
                    gestErrori("Selezionare almeno un Argomento", $("#argomentiCorso"), "#msgAddCorso");
                }
            } else {
                gestErrori("Selezionare una Materia", $("#materiaCorso"), "#msgAddCorso");
            }
        } else {
            gestErrori("Selezionare un Tipo di Corso", $("#tipoModuloAdd"), "#msgAddCorso");
        }
    } else {
        gestErrori("Inserire la Descrizione del Corso", $("#descCorso"), "#msgAddCorso");
    }
}

//Pulizia Campi di input
function clearInputFields() {
    $("#descCorso").val("");
    document.getElementById("tipoModuloAdd").selectedIndex = -1;
    $('#tipoModuloAdd').selectpicker('refresh');
    document.getElementById("materiaCorso").selectedIndex = -1;
    $('#materiaCorso').selectpicker('refresh');
    document.getElementById("argomentiCorso").selectedIndex = -1;
    $('#argomentiCorso').selectpicker('refresh');
}

//Funzione di stampa errori
function gestErrori(msg, controllo, target) {
    $(target).html(msg).addClass("alert alert-danger");
    controllo.addClass("alert-danger");
}

//Stampo i corsi trovati con la ricerca
function creazioneElencoCorsi(tipimodulo) {
    $("#contCorsi").html("");
    $("#msgErrRicAvanzata").removeClass("alert alert-danger").html("");
    $("#msgRicerca").removeClass("alert alert-danger").html("");
    let codHtml = "";
    
    if (tipimodulo == undefined || tipimodulo.length == 0){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Non ci sono corsi da visualizzare</h2>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
    }
    else{
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-5">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Elenco Corsi</h2>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        
        tipimodulo.forEach(tipomodulo => {
            codHtml += '<div class="row justify-content-center">';
            codHtml += '<div class="col-xl-5">';
            codHtml += '<br><div class="section_tittle text-center">';
            codHtml += '<h3> Categoria: ' + tipomodulo["descrizione"] + '</h3>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            
            if (tipomodulo["moduli"] != undefined && tipomodulo["moduli"].length > 0){
                codHtml += '<div class="row">';
                for (let i = 0; i < tipomodulo["moduli"].length; i++) {
                    codHtml += '<div class="col-sm-12 col-md-4 col-lg-4 col-xs-4 mx-auto">';
                    codHtml += '<div class="single_special_cource">';
                    
                    //codHtml += '<img src="img/special_cource_1.png" class="special_img" alt="">'; // manca immagine corso su db
                    codHtml += '<div class="special_cource_text">';
                    codHtml += '<a href="dettaglioCorso.html?corso=' + tipomodulo["moduli"][i]._id + '">' + tipomodulo["moduli"][i].descrizione + '</a>';
                    codHtml += '<p>Materia: ' + tipomodulo["moduli"][i].materia[0].descrizione + '</p>';
                    codHtml += '<p>Data Creazione: ' + new Date(tipomodulo["moduli"][i].dataCreazione).toLocaleDateString() + '</p>';
                    codHtml += '<p>Autore: ' + tipomodulo["moduli"][i].autore[0].cognome + ' ' + tipomodulo["moduli"][i].autore[0].nome + '</p>';
                    codHtml += '</div>';
                    
                    codHtml += '</div>';
                    codHtml += '</div>';
                }
                codHtml += '</div>';  
            }
            else{
                codHtml += '<div class="row justify-content-center">';
                codHtml += '<div class="col-xl-5">';
                codHtml += '<div class="text-center">';
                codHtml += "<h4>Non ci sono ancora dei corsi nella categoria</h4>";  
                codHtml += '</div>';
                codHtml += '</div>';
                codHtml += '</div>';          
            }
        });
    }
    $("#contCorsi").html(codHtml);
    $("#sezRisRicerca").css("display", "");

    $("html, body").animate({ scrollTop: $("#contCorsi").parent().offset().top }, "slow");
}