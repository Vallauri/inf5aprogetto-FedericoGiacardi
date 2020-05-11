$(document).ready(function () {
    setNavBar();
});

//Impostazione NavBar
function setNavBar() {
    //Recupero i dati dell'utente e creo dinamicamente la navbar
    let reqSetNavBar = inviaRichiesta('/api/setNavBar', 'POST', {});
    reqSetNavBar.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    reqSetNavBar.done(function (data) {
        let codHtml = "";

        if (data != undefined) {

            if (data.amministratore) {
                $("#navMateria").html('<a id="voceNavMaterie" class="nav-link" href="materie.html">Materie</a>');
                $("#navArgomenti").html('<a class="nav-link" href="argomenti.html">Argomenti</a>');
                $("#navRegAdmin").html('<a class="nav-link" href="registraAdmin.html">Registra Admin</a>');
            }else{
                $("#navMateria").remove();
                $("#navArgomenti").remove();
                $("#navRegAdmin").remove();
            }
            codHtml = "";
            codHtml += '<a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink-55" data-toggle="dropdown" aria-haspopup="true" aria - expanded="false" >';
            codHtml += '<img src="' + data.foto.replace(/\\/g, "/") + '" class="rounded-circle z-depth-0" alt = "avatar image" height = "50" ></img>';
            codHtml += data.user;
            codHtml += "</a>";
            codHtml += '<div class="dropdown-menu dropdown-menu-lg-right dropdown-secondary" aria-labelledby="navbarDropdownMenuLink-55">';
            codHtml += '<a class="dropdown-item" href="areaPersonale.html"><i class="fas fa-user"></i> Dashboard</a>';
            codHtml += '<a class="dropdown-item" href="modificaProfilo.html"><i class="fas fa-user-cog"></i> Opzioni</a>';
            codHtml += '<a class="dropdown-item" href="#" onclick="doLogOut();"><i class="fas fa-sign-out-alt"></i> Logout</a>';
        }
        $("#profiloUtNavBar").html(codHtml);
    });
}

//Gestione LogOut
function doLogOut() {
    let rq = inviaRichiesta('/api/logout', 'POST');
    rq.done(function (data) {
        window.location.href = "index.html"
    });
    rq.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 403) { // forbidden
            window.location.href = "index.html"
        } else
            error(jqXHR, test_status, str_error);
    });
}