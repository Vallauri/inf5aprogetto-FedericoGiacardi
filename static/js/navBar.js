$(document).ready(function () {
    setNavBar();
});

function setNavBar() {
    let reqSetNavBar = inviaRichiesta('/api/setNavBar', 'POST', {});
    reqSetNavBar.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    reqSetNavBar.done(function (data) {
        let codHtml = "";

        if (data != undefined) {

            if (data.amministratore) {
                codHtml += '<a id="voceNavMaterie" class="nav-link" href="materie.html">Materie</a>';
            } else if (document.getElementById("voceNavMaterie"))
                $("#voceNavMaterie").remove();
            $("#linkMaterie").html(codHtml);
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

function doLogOut() {
    let rq = inviaRichiesta('/api/logout', 'POST');
    rq.done(function (data) {
        window.location.href = "index.html"
    });
    rq.fail(function (jqXHR, test_status, str_error) {
        if (jqXHR.status == 403) { // forbidden
            window.location.href = "index.html"
        } else
            error(jqXHR, test_status, str_error)
    });
}