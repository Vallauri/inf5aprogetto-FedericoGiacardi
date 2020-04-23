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