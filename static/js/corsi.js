"use strict";
$(document).ready(function () {
    loadPagina();
    $("#btnRicerca").on("click", function () {
        $(".msg").text("");

        if ($("#txtRicerca").val() != "") {
            let ricerca = inviaRichiesta('/api/cercaCorso', 'POST', { "valore": $("#txtRicerca").val(), "filtri": { "corsiDaCercare": $("#default-select .selected").attr("data-value"), "tipoCorso": $("#default-select-1 .selected").attr("data-value") }});
            ricerca.fail(function (jqXHR, test_status, str_error) {
                printErrors(jqXHR, ".msg");
            });
            ricerca.done(function (data) {
                console.log(data);
                creazioneElencoCorsi(data);
            });
        }
        else{
            $(".msg").text("Inserire un valore per la ricerca");
            $("#txtRicerca").focus();
        }
    });

    $('#txtRicerca').autocomplete({
        source: function (req, res) {
            $.ajax({
                url: "/api/cercaCorso",
                dataType: "json",
                type: "POST",
                data: {
                    valore: req.term,
                    filtri: { "corsiDaCercare": $("#default-select .selected").attr("data-value"), "tipoCorso": $("#default-select-1 .selected").attr("data-value") }
                },
                success: function (data) {
                    creazioneElencoCorsi(data);
                },
                error: function (xhr) {
                    alert(xhr.status + ' : ' + xhr.statusText);
                }
            });
        },
        select: function (event, ui) {

        }
    });

    let tipiCorsi = inviaRichiesta('/api/elTipiCorsi', 'POST', {});
    tipiCorsi.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    tipiCorsi.done(function (data) {
        console.log(data);
        data.forEach(tipocorso => {
            $("#tipoCorso").append("<option value='" + tipocorso._id + "'>" + tipocorso.descrizione + "</option>");
            $("#default-select-1 .list").append("<li data-value='" + tipocorso._id + "' class='option'>" + tipocorso.descrizione + "</li>");
        });
    });
});

function loadPagina() {
    /* potrebbe servire per filtri di ricerca */
    /*let chkToken = inviaRichiesta('/api/elTipoModEModuli', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg"); // vedere se va bene o se da cambiare campo di segnalazione errore
    });
    chkToken.done(function (data) {
        creazioneElencoCorsi(data, 0);
    });*/
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        //printErrors(jqXHR, ".msg"); // vedere se va bene o se da cambiare campo di segnalazione errore
        console.log(jqXHR + " " + test_status + " " + str_error);
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
    });
}

function creazioneElencoCorsi(tipimodulo) {
    $("#contCorsi").html("");
    let codHtml = "";
    let aus;
    
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
            codHtml += '<div class="section_tittle text-center">';
            codHtml += '<h3> Categoria: ' + tipomodulo["descrizione"] + '</h3>';
            codHtml += '</div>';
            codHtml += '</div>';
            codHtml += '</div>';
            
            if (tipomodulo["moduli"] != undefined && tipomodulo["moduli"].length > 0){
                codHtml += '<div class="row">';
                for (let i = 0; i < tipomodulo["moduli"].length; i++) {
                    codHtml += '<div class="col-sm-6 col-lg-4">';
                    codHtml += '<div class="single_special_cource">';
                    
                    codHtml += '<img src="img/special_cource_1.png" class="special_img" alt="">'; // manca immagine corso su db
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

    $("html, body").animate({ scrollTop: $("#contCorsi").parent().offset().top }, "slow");
}