// 1.Autocomplete
// 2.list multiple
// 3.eventuale limite di appunti
$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        $("#btnRicerca").on("click", ricercaAppunti);
        $("#btnInviaAppunto").on("click", aggiuntaAppunto);
        loadArgomenti();
    });
});

function loadArgomenti() {
    let elArgomenti = inviaRichiesta('/api/elencoArgomenti', 'POST', {});
    elArgomenti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    elArgomenti.done(function (data) {
        let codHtml = '';
        console.log(data);
        data.forEach(argomento =>{
            codHtml += '<option value="' + argomento._id + '">' + argomento.descrizione+'</option>';
        });     
        $("#argomentiAppunto").html(codHtml).niceSelect('update');   
        document.getElementById("argomentiAppunto").selectedIndex = 1;
        $("#argomentiAppunto").niceSelect('update');  
    });
}

function ricercaAppunti() {
    let ricAppunti = inviaRichiesta('/api/ricercaAppunti', 'POST', { "tipo": $("#tipoRicerca").val(), "par": $("#txtRicerca").val()});
    ricAppunti.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    ricAppunti.done(function (data) {
        stampaRisRicerca(data);
    });
}

function stampaRisRicerca(appunti) {
    //fare segnalazione nessun risultato
    console.log(appunti);
    if (appunti.length == 0) {
        $(".msg").text("Non è stato individuato alcun appunto");
    }else{
        $("#contRis").html("");
        $(".msg").text("");
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
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
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
    $(".msg").text("");

    if ($("#descAppunto").val() != "") {
        if ($("#nomeAutoreAppunto").val() != "") {
            if ($("#cognomeAutoreAppunto").val() != "") {
                console.log($("#argomentiAppunto").val());
                // if ($("#cognomeAutoreAppunto").val() != "") {

                // } else {
                //     gestErrori("Inserire il Cognome dell' Autore", $("#cognomeAutoreAppunto"));
                // }
            } else {
                gestErrori("Inserire il Cognome dell' Autore", $("#cognomeAutoreAppunto"));
            }
        }else{
            gestErrori("Inserire il Nome dell' Autore", $("#nomeAutoreAppunto"));
        }
    }else{
        gestErrori("Inserire la Descrizione dell'Appunto", $("#descAppunto"));
    }
}

function gestErrori(msg, controllo) {
    $(".msg").html(msg);
    controllo.addClass("alert-danger");
}