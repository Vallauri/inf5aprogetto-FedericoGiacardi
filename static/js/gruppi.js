"use strict";
$(document).ready(function () {
    loadPagina();

    $("#btnRicerca").on("click", function () {
        $(".msg").text("");

        if ($("#txtRicerca").val() != "") {
            let ricerca = inviaRichiesta('/api/cercaGruppo', 'POST', { "valore": $("#txtRicerca").val(), "filtri": { "gruppiDaCercare": $("#tipoRicerca option:selected").val(), "tipoGruppo": $("#tipoGruppo option:selected").val() } });
            ricerca.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, ".msg");
            });
            ricerca.done(function (data) {
                console.log(data);
                creazioneElencoGruppi(data);
            });
        }
        else {
            $(".msg").text("Inserire un valore per la ricerca");
            $("#txtRicerca").focus();
        }
    });

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
        },
        select: function (event, ui) {

        }
    });

    let tipiGruppi = inviaRichiesta('/api/elTipiGruppi', 'POST', {});
    tipiGruppi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    tipiGruppi.done(function (data) {
        console.log(data);
        data.forEach(tipogruppo => {
            $("#tipoGruppo").append("<option value='" + tipogruppo._id + "'>" + tipogruppo.descrizione + "</option>");
            $("#default-select-1 .list").append("<li data-value='" + tipogruppo._id + "' class='option'>" + tipogruppo.descrizione + "</li>");
        });
    });

    $("#btnInviaGruppo").on("click", aggiuntaGruppo);
    loadTipiGruppi();
});

function loadPagina() {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        //printErrors(jqXHR, ".msg"); // vedere se va bene o se da cambiare campo di segnalazione errore
        console.log(jqXHR + " " + test_status + " " + str_error);
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
    });
}

function loadTipiGruppi() {
    let elTipiGruppi = inviaRichiesta('/api/elTipiGruppi', 'POST', {});
    elTipiGruppi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgAddGruppo");
    });
    elTipiGruppi.done(function (data) {
        let codHtml = '';
        console.log(data);
        data.forEach(tipogruppo => {
            codHtml += '<option value="' + tipogruppo._id + '">' + tipogruppo.descrizione + '</option>';
        });
        $("#tipoGruppoAdd").html(codHtml);
        $('#tipoGruppoAdd').selectpicker('refresh');
        document.getElementById("tipoGruppoAdd").selectedIndex = -1;
    });
}

function aggiuntaGruppo() {
    $("#nomeGruppo").removeClass("alert-danger");
    $("#descGruppo").removeClass("alert-danger");
    $("#tipoGruppoAdd").removeClass("alert-danger");
    $("#msgAddGruppo").text("");


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
                        $("#msgAddGruppo").text("Parametri Errati o Mancanti");
                    }
                    else {
                        printErrors(jqXHR, "#msgAddGruppo");
                    }
                });
                aggGruppo.done(function (data) {
                    $("#msgAddGruppo").text("Gruppo aggiunto con successo");
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

function clearInputFields() {
    $("#nomeGruppo").val("");
    $("#descGruppo").val("");
    $('#tipoGruppoAdd').selectpicker('refresh');
    document.getElementById("tipoGruppoAdd").selectedIndex = -1;
}

function gestErrori(msg, controllo, target) {
    $(target).html(msg);
    controllo.addClass("alert-danger");
}

function creazioneElencoGruppi(gruppi) {
    $("#contGruppi").html("");
    let codHtml = "";
    let aus;
    
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
            // codHtml += '<div class="row justify-content-center">';
            // codHtml += '<div class="col-xl-5">';
            // codHtml += '<div class="section_tittle text-center">';
            // codHtml += '<h3> Categoria: ' + gruppo["descrizione"] + '</h3>';
            // codHtml += '</div>';
            // codHtml += '</div>';
            // codHtml += '</div>';
            
            codHtml += '<div class="row">';
            codHtml += '<div class="col-sm-8 col-lg-8">';
            codHtml += '<div class="single_special_cource">';
            
            // codHtml += '<img src="img/special_cource_1.png" class="special_img" alt="">';
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

    $("html, body").animate({ scrollTop: $("#contGruppi").parent().offset().top }, "slow");
}