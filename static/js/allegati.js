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
    let rqElAllegati = inviaRichiesta('/api/elencoAllegati', 'POST', {});
    rqElAllegati.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElAllegati");
    });
    rqElAllegati.done(function (data) {
        stampaTabAllegati(data);
    });
}

function stampaTabAllegati(allegati) {
    let riga, colonna;
    let ausVet;

    $("#txtRicercaAllegato").on("keyup", ricercaTabella);
    $("#corpoTabAllegati").html("");
    allegati.forEach(allegato => {
        riga = $("<tr></tr>");
        riga.attr("id", "allegato_" + allegato["_id"]);
        for (let campo in allegato) {
            colonna = $("<td></td>");
            if (campo != "_id") {
                if (campo == "dataCaricamento") {
                    colonna.html(new Date(allegato[campo]).toLocaleTimeString()); 
                    riga.append(colonna);
                } else if (campo == "percorso"){
                    ausVet = allegato[campo].split('\\');
                    ausVet = ausVet[ausVet.length - 1].split(/_(.+)/);
                    colonna.html(ausVet[1]);
                    riga.append(colonna);
                } else if (campo == "autoreCaricamento"){
                    colonna.html(allegato.autoreCaricamento[0].user);
                    riga.append(colonna);
                } else if (campo != "codUtente" && campo != "__v"){
                    colonna.html(allegato[campo]);
                    riga.append(colonna);
                }
            }
        }
        colonna = $("<td></td>");
        colonna.html('<button type="button" id="btnDownload_' + allegato["_id"] +'" class="btn btn-success" onclick="gestDownloadFile(this);">Scarica</button>');
        riga.append(colonna);
        $("#corpoTabAllegati").append(riga);
    });
}

function gestDownloadFile(btn) {
    $("#msgElAllegati").html("").removeClass("alert-danger");
    let idAllegato = parseInt($(btn).attr("id").split('_')[1]);
    fetch('/api/downloadAllegato?codAllegato=' + idAllegato)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
            gestErrori(err, $("#msgElAllegati"), "#msgElAllegati");
        });
}

function gestErrori(msg, controllo, target) {
    $(target).html(msg);
    controllo.addClass("alert-danger");
}

function ricercaTabella() {
    let input = document.getElementById("txtRicercaAllegato");
    let filter = input.value;
    let table = document.getElementById("tabellaAllegati");
    let tr = table.getElementsByTagName("tr");
    let td, i, txtValue;

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[2];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}