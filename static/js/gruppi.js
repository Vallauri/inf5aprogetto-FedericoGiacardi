"use strict";
//Routine Principale
$(document).ready(function () {
    loadPagina();
    //Gestione Ricerca Gruppi
    $("#btnRicerca").on("click", function () {
        $("#msgRicerca").text("");

        if ($("#txtRicerca").val() != "") {
            let ricerca = inviaRichiesta('/api/cercaGruppo', 'POST', { "valore": $("#txtRicerca").val(), "filtri": { "gruppiDaCercare": $("#tipoRicerca option:selected").val(), "tipoGruppo": $("#tipoGruppo option:selected").val() } });
            ricerca.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, "#msgRicerca");
            });
            ricerca.done(function (data) {
                creazioneElencoGruppi(data);
            });
        }
        else {
            $("#msgRicerca").text("Inserire un valore per la ricerca").addClass("alert alert-danger");
            $("#txtRicerca").focus();
        }
    });

    //Gestione Autocomplete con Jquery UI
    $('#txtRicerca').autocomplete({
        source: function (req, res) {
            $.ajax({
                url: "/api/cercaGruppo",
                dataType: "json",
                type: "POST",
                data: {
                    valore: req.term,
                    filtri: { "gruppiDaCercare": $("#tipoRicerca option:selected").val(), "tipoGruppo": $("#tipoGruppo option:selected").val() }
                },
                success: function (data) {
                    creazioneElencoGruppi(data);
                },
                error: function (xhr) {
                    alert(xhr.status + ' : ' + xhr.statusText);
                }
            });
        }
    });

    $("#btnInviaGruppo").on("click", aggiuntaGruppo);
    loadTipiGruppi();
    $('#tipoRicerca').selectpicker('refresh');
});

//Controllo validità token
function loadPagina() {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        console.log(jqXHR + " " + test_status + " " + str_error);
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {});
}

//Caricamento Combo Tipi Gruppi per ricerca e inserimento nuovo gruppo
function loadTipiGruppi() {
    let elTipiGruppi = inviaRichiesta('/api/elTipiGruppi', 'POST', {});
    elTipiGruppi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgErrRicAvanzata");
    });
    elTipiGruppi.done(function (data) {
        let codHtml = '';
        data.forEach(tipogruppo => {
            codHtml += '<option value="' + tipogruppo._id + '">' + tipogruppo.descrizione + '</option>';
        });
        $("#tipoGruppoAdd").html(codHtml);
        document.getElementById("tipoGruppoAdd").selectedIndex = -1;
        $('#tipoGruppoAdd').selectpicker('refresh');
        $("#tipoGruppo").html(codHtml);
        document.getElementById("tipoGruppo").selectedIndex = -1;
        $('#tipoGruppo').selectpicker('refresh');
    });
}

//Inserimento Nuovo Gruppo
function aggiuntaGruppo() {
    $("#nomeGruppo").removeClass("alert-danger");
    $("#descGruppo").removeClass("alert-danger");
    $("#tipoGruppoAdd").removeClass("alert-danger");
    $("#msgAddGruppo").removeClass("alert alert-danger").text("");

    //Controllo dati di input
    if ($("#nomeGruppo").val() != "") {
        if ($("#descGruppo").val() != "") {
            if (document.getElementById("tipoGruppoAdd").selectedIndex != -1) {
                let formData = {
                    'nome': $("#nomeGruppo").val(),
                    'descrizione': $("#descGruppo").val(),
                    'tipoGruppo': $("#tipoGruppoAdd").val()
                };

                let aggGruppo = inviaRichiesta('/api/aggiungiGruppo', 'POST', formData);
                aggGruppo.fail(function (jqXHR, test_status, str_error) {
                    if (jqXHR.status == 603) {
                        $("#msgAddGruppo").text("Parametri Errati o Mancanti").addClass("alert alert-danger");
                    }
                    else {
                        printErrors(jqXHR, "#msgAddGruppo");
                    }
                });
                aggGruppo.done(function (data) {
                    $("#msgAddGruppo").text("Gruppo aggiunto con successo").removeClass("alert alert-danger").addClass("alert alert-success");
                    clearInputFields();
                });
            } else {
                gestErrori("Selezionare un Tipo di Gruppo", $("#tipoGruppoAdd"), "#msgAddGruppo");
            }
        } else {
            gestErrori("Inserire la Descrizione del Gruppo", $("#descGruppo"), "#msgAddGruppo");
        }
    } else {
        gestErrori("Inserire il Nome del Gruppo", $("#nomeGruppo"), "#msgAddGruppo");
    }
}

//Pulizia Campi di input
function clearInputFields() {
    $("#nomeGruppo").val("");
    $("#descGruppo").val("");
    document.getElementById("tipoGruppoAdd").selectedIndex = -1;
    $('#tipoGruppoAdd').selectpicker('refresh');
}

//Funzione di stampa errori
function gestErrori(msg, controllo, target) {
    $(target).html(msg).addClass("alert alert-danger");
    controllo.addClass("alert-danger");
}

//Stampo i gruppi trovati con la ricerca
function creazioneElencoGruppi(gruppi) {
    $("#contGruppi").html("");
    $("#msgErrRicAvanzata").removeClass("alert alert-danger").html("");
    $("#msgRicerca").removeClass("alert alert-danger").html("");
    let codHtml = "";
    
    if (gruppi == undefined || gruppi.length == 0){
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-12">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Non ci sono gruppi da visualizzare</h2>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
    }
    else{
        codHtml += '<div class="row justify-content-center">';
        codHtml += '<div class="col-xl-6">';
        codHtml += '<div class="section_tittle text-center">';
        codHtml += '<h2>Elenco Gruppi</h2>';
        codHtml += '</div>';
        codHtml += '</div>';
        codHtml += '</div>';
        
        gruppi.forEach(gruppo => {
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-6 col-lg-6 mx-auto">';
            codHtml += '<div class="single_special_cource">';
            
            codHtml += '<div class="special_cource_text">';
            codHtml += '<a href="dettaglioGruppo.html?gruppo=' + gruppo._id + '">' + gruppo.nome + '</a>';
            codHtml += '<p>Descrizione: ' + gruppo.descrizione + '</p>';
            codHtml += '<p>Tipo di Gruppo: ' + gruppo.descTipoGruppo[0].descrizione + '</p>';
            codHtml += '</div>';
            
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';  
        });
    }
    $("#contGruppi").html(codHtml);
    $("#sezRisRicerca").css("display", "");

    $("html, body").animate({ scrollTop: $("#contGruppi").parent().offset().top }, "slow");
}