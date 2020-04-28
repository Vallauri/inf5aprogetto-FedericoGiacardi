$(document).ready(function () {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        window.location.href = "login.html";
    });
    chkToken.done(function (data) {
        if (!data.amministratore) {
            window.location.href = "areaPersonale.html";
        }else{
            loadPagina();
        }
    });
});

function loadPagina() {
    let rqElMatModerate = inviaRichiesta('/api/elencoMaterieModerate', 'POST', {});
    rqElMatModerate.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, "#msgElAllegati");
    });
    rqElMatModerate.done(function (data) {
        stampaTabMaterie(data);
    });
}

function stampaTabMaterie(materie) {
    let riga, colonna;
    let ausVet;

    $("#txtRicercaMaterie").on("keyup", function () {
        ricercaTabella("txtRicercaMaterie", "tabellaMaterie");
    });
    $("#corpoTabMaterie").html("");
    materie.forEach(materia => {
        riga = $("<tr></tr>");
        riga.attr("id", "materia_" + materia["_id"]);
        colonna = $("<td></td>");
        colonna.html(materia["descrizione"]);
        riga.append(colonna);
        colonna = $("<td></td>");
        colonna.html('<button type="button" id="btnModifica_' + materia["_id"] + '" class="btn btn-success" onclick="gestModMateria(this);"><i class="fas fa-edit"></i> Modifica</button>&nbsp;<button type="button" id="btnElimina_' + materia["_id"] + '" class="btn btn-danger" onclick="gestEliminaMateria(this);"><i class="fas fa-edit"></i><i class="fa fa-trash" aria-hidden="true"></i> Elimina</button>');
        riga.append(colonna);
        $("#corpoTabMaterie").append(riga);
    });
}

function ricercaTabella(txtPar, tab) {
    let input = document.getElementById(txtPar);
    let filter = input.value;
    let table = document.getElementById(tab);
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

function gestModMateria(btn) {
    
}

function gestEliminaMateria(btn) {
    
}