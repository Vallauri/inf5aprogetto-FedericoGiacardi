"use strict";

$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let chkToken = inviaRichiesta('/api/elGruppi', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoGruppi(data);
    });

    chkToken = inviaRichiesta('/api/elAppunti', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoAppunti(data);
    });

    chkToken = inviaRichiesta('/api/elMaterie', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoMaterie(data);
    });

    chkToken = inviaRichiesta('/api/feedModuli', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        creazioneElencoFeed(data);
    });
    creazioneCalendario();
}

function creazioneCalendario() {
    let Calendar = tui.Calendar;
    let calendar = new Calendar('#calendar',{
        defaultView: 'month',
        taskView: true,
        template: {
            monthDayname: function (dayname) {
                return '<span class="calendar-week-dayname-name">' + dayname.label + '</span>';
            }
        },
        month: {
            daynames: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
            moreLayerSize: {
                height: 'auto'
            },
            grid: {
                header: {
                    header: 34
                },
                footer: {
                    height: 10
                }
            },
            narrowWeekend: false,
            startDayOfWeek: 1,
            visibleWeeksCount: 3
        }
    });
    
    // calendar.createSchedules([
    //     {
    //         id: '1',
    //         calendarId: '1',
    //         title: '',
    //         isAllDay:true,
    //         category: 'day',
    //         dueDateClass: '',
    //         start: '2020-03-24T22:30:00+09:00',
    //         end: ''
    //     },
    //     {
    //         id: '2',
    //         calendarId: '2',
    //         title: '',
    //         isAllDay: true,
    //         category: 'allday',
    //         bgColor:"red",
    //         dueDateClass: '',
    //         start: '2020-03-25T22:30:00+09:00',
    //         end: ''
    //     }
    // ]);
    
    let eventiCalendario = inviaRichiesta('/api/elEventiCalendario', 'POST', {});
    eventiCalendario.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    eventiCalendario.done(function (data) {
        let contEventi = 0;
        data.forEach(utente => {
            let vetEventi = new Array();
            let evento = {};
            let I;
            
            for (I = 0; I < utente.moduli.length; I++) {
                evento = {};
                evento["id"] = String(utente.moduli[I].codModulo);
                evento["calendarId"] = String(contEventi);
                evento["title"] = '';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                evento["bgColor"] = 'red';
                evento["dueDateClass"] = '';
                evento["start"] = utente.moduli[I].dataInizio;
                evento["end"] = '';
                if (utente.moduli[I].dataFine != undefined) {
                    evento["end"] = utente.moduli[I].dataFine;
                    if (utente.moduli[I].scadenza != undefined) {
                        if (new Date(utente["gruppo"][i].dataFine) > new Date(utente["gruppo"][i].scadenza)) {
                            evento["bgColor"] = 'red';
                        }
                    }
                } else if (utente.moduli[I].scadenza != undefined){
                    evento["end"] = utente.moduli[I].scadenza;
                }
                contEventi++;
                vetEventi.push(evento);
            }

            for ( I = 0; I < utente.moduliGruppi.length; I++) {
                evento = {};
                evento["id"] = String(utente.moduliGruppi[I].codModulo) + "_" + String(utente.moduliGruppi[I].codModulo);
                evento["calendarId"] = String(contEventi);
                evento["title"] = '';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                evento["bgColor"] = 'red';
                evento["dueDateClass"] = '';
                evento["start"] = utente.moduliGruppi[I].dataInizio;
                evento["end"] = '';
                if (utente.moduliGruppi[I].dataFine != undefined) {
                    evento["end"] = utente.moduliGruppi[I].dataFine;
                }
                contEventi++;
                vetEventi.push(evento);
            }

            for (I = 0; I < utente.esami.length; I++) {
                evento = {};
                evento["id"] = String(utente.esami[I].codEsame);
                evento["calendarId"] = String(contEventi);
                evento["title"] = '';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                evento["bgColor"] = 'red';
                evento["dueDateClass"] = '';
                evento["start"] = utente.esami[I].data;
                evento["end"] = '';
                contEventi++;
                vetEventi.push(evento);
            }

            for (I = 0; I < utente.esamiGruppi.length; I++) {
                evento = {};
                evento["id"] = String(utente.esamiGruppi[I].codEsame) + "_" + String(utente.esamiGruppi[I].codGruppo);
                evento["calendarId"] = String(contEventi);
                evento["title"] = '';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                evento["bgColor"] = 'red';
                evento["dueDateClass"] = '';
                evento["start"] = utente.esamiGruppi[I].data;
                evento["end"] = '';
                contEventi++;
                vetEventi.push(evento);
            }

            console.log(vetEventi);
            calendar.createSchedules(vetEventi);
        });
    });

    //setColoreEvento();
}

function setColoreEvento() {
    Colors = {};
    Colors.names = {
        aqua: "#00ffff",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        black: "#000000",
        blue: "#0000ff",
        brown: "#a52a2a",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgrey: "#a9a9a9",
        darkgreen: "#006400",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkviolet: "#9400d3",
        fuchsia: "#ff00ff",
        gold: "#ffd700",
        green: "#008000",
        indigo: "#4b0082",
        khaki: "#f0e68c",
        lightblue: "#add8e6",
        lightcyan: "#e0ffff",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        magenta: "#ff00ff",
        maroon: "#800000",
        navy: "#000080",
        olive: "#808000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        violet: "#800080",
        red: "#ff0000",
        silver: "#c0c0c0",
        white: "#ffffff",
        yellow: "#ffff00"
    };

    Colors.random = function () {
        var result;
        var count = 0;
        for (var prop in this.names)
            if (Math.random() < 1 / ++count)
                result = prop;
        return result;
    };

    console.log(Colors.random());
}

function creazioneElencoGruppi(utenti) {
    $("#contGruppi").html("");
    let codHtml = "";
    let aus;
    
    utenti.forEach(utente => {
        if (utente["gruppi"] != undefined && utente["gruppi"].length > 0) {
            for (let i = 0; i < utente["gruppi"].length; i++) {
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + utente["gruppi"][i].nome + '</h5>'; //mettere il nome del gruppo
                codHtml += '</div>';
                aus = new Date(utente["gruppo"][i].dataInizio);
                codHtml += '<p class="mb-1">' + utente["gruppi"][i].descrizione + '<br>Data iscrizione: ' + aus.toLocaleDateString() +'<br>Tipo Gruppo: ' + utente["gruppi"][i].tipoGruppo[0].descrizione+'</p>'; //tipo gruppo descrizione e data iscrizione
                codHtml += '</a>';
            }
        }else{
            codHtml += "<p style='text-align:center'>Non fai parte di alcun gruppo</p>";
        }
    });
    $("#contGruppi").html(codHtml);
}

function creazioneElencoMaterie(utenti) {
    $("#contMaterie").html("");
    let codHtml = "", vetArg = "";
    let aus;
    utenti.forEach(utente => {
        if (utente["materieModerate"] != undefined && utente["materieModerate"].length > 0) {
            for (let i = 0; i < utente["materieModerate"].length; i++) {
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + utente["materieModerate"][i].descrizione + '</h5>';
                codHtml += '</div>';
                aus = new Date(utente["materieModerate"][i].dataCreazione);
                if (utente["materieModerate"][i].argomenti != undefined) {
                    vetArg = "Argomenti: ";
                    for (let j = 0; j < utente["materieModerate"][i].argomenti.length; j++) {
                        vetArg += utente["materieModerate"][i].argomenti[j].descrizione;
                        if (j != utente["materieModerate"][i].argomenti.length - 1) {
                            vetArg += ", ";
                        }
                    }
                }
                codHtml += '<p class="mb-1">Data iscrizione: ' + aus.toLocaleDateString() + '<br>' + vetArg + '</p>';
                codHtml += '</a>';
            }
        } else {
            codHtml += "<p style='text-align:center'>Non hai creato alcuna materia</p>";
        }
    });
    $("#contMaterie").html(codHtml);
}

function creazioneElencoAppunti(utenti) {
    $("#contAppunti").html("");
    let codHtml = "", vetArg = "";
    let aus;
   
    utenti.forEach(utente => {
        if (utente["appuntiCaricati"] != undefined && utente["appuntiCaricati"].length > 0) {
            for (let i = 0; i < utente["appuntiCaricati"].length; i++) {
                codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
                codHtml += '<div class="d-flex w-100 justify-content-between">';
                codHtml += '<h5 class="mb-1">' + utente["appuntiCaricati"][i].descrizione + '</h5>';
                codHtml += '</div>';
                aus = new Date(utente["appuntiCaricati"][i].dataCaricamento);
                if (utente["appuntiCaricati"][i].argomenti != undefined) {
                    vetArg = "Argomenti: ";
                    for (let j = 0; j < utente["appuntiCaricati"][i].argomenti.length; j++) {
                        vetArg += utente["appuntiCaricati"][i].argomenti[j].descrizione;
                        if (j != utente["appuntiCaricati"][i].argomenti.length - 1) {
                            vetArg += ", ";
                        }
                    }
                }
                codHtml += '<p class="mb-1">' + vetArg + '<br>Data caricamento: ' + aus.toLocaleDateString() +'</p>';
                codHtml += '</a>';
            }
        }else{
            codHtml += "<p style='text-align:center'>Non hai caricato alcun appunto</p>";
        }
    });
    $("#contAppunti").html(codHtml);
}

function creazioneElencoFeed(utenti) {
    let vetModuli = new Array();
    let vetPar = new Array();
    let vetAus = new Array();
    let codHtml = "", vetArg = "";
    let aus;

    utenti.forEach(utente =>{
        for (let i = 0; i < utente["appuntiInteressati"].length; i++) {
            vetPar.push(utente["appuntiInteressati"][i].descrizione);
            
            for (let j = 0; j < utente["appuntiInteressati"][i].argomenti.length; j++) {
                vetAus = new Array();
                vetAus.push(utente["appuntiInteressati"][i].argomenti[j].descrizione);
                for (let k = 0; k < utente["appuntiInteressati"][i].argomenti[j].appuntiOk.length; k++) {

                    if (chkElemVetModuli(utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k].descrizione, vetModuli) ) {
                        //Attenzione!!! Gli argomenti non funzionano
                        vetModuli.push({ "desc": utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k].descrizione, "data": utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k].dataCreazione, "argomenti": vetAus});
                    }
                }
                
            }
        }
    });

    for (let I = 0; I < vetPar.length; I++) {
        for (let J = 0; J < vetModuli.length; J++) {
            if (vetPar[I] == vetModuli[J]["desc"]) {
                vetModuli.splice(J, 1);
            }
        } 
    }
   
    $("#contFeed").html("");

    if (vetModuli.length > 0) {
        for (let K = 0; K < vetModuli.length; K++) {
            codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
            codHtml += '<div class="d-flex w-100 justify-content-between">';
            codHtml += '<h5 class="mb-1">' + vetModuli[K].desc + '</h5>';
            codHtml += '</div>';
            aus = new Date(vetModuli[K].data);
            if (vetModuli[K].argomenti != undefined) {
                vetArg = "Argomenti: ";
                for (let j = 0; j < vetModuli[K].argomenti.length; j++) {
                    vetArg += vetModuli[K].argomenti[j];
                    if (j != vetModuli[K].argomenti.length - 1) {
                        vetArg += ", ";
                    }
                }
            }
            codHtml += '<p class="mb-1">' + vetArg + '<br>Data caricamento: ' + aus.toLocaleDateString() + '</p>';
            codHtml += '</a>';
        }
    }else{
        codHtml += "<p style='text-align:center'>Non è stato individuato alcun appunto</p>";
    }
    
    
    $("#contFeed").html(codHtml);
}

function chkElemVetModuli(descModulo, vetModuli) {
    for (let i = 0; i < vetModuli.length; i++) {
        if (descModulo == vetModuli[i].desc) {
            return false;
        }    
    }
    return true;
}