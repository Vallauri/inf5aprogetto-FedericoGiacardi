"use strict";

let lastClickSchedule;
const nElementiVis = 3;

$(document).ready(function () {
    loadPagina();
});

function loadPagina() {
    let chkToken = inviaRichiesta('/api/chkToken', 'POST', {});
    chkToken.fail(function (jqXHR, test_status, str_error) {
        printErrors(jqXHR, ".msg");
    });
    chkToken.done(function (data) {
        chkToken = inviaRichiesta('/api/elGruppi', 'POST', {});
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
    });  
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
            let colore;
            let stato;
            console.log(data);
            for (I = 0; I < utente.moduli.length; I++) {
                evento = {};
                evento["id"] = String(utente.moduli[I].codModulo);
                evento["calendarId"] = String(contEventi);
                evento["title"] = 'Modulo';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                colore = setColoreEvento();
                evento["bgColor"] = colore;
                evento["borderColor"] = colore;
                evento["dueDateClass"] = '';
                evento["isReadOnly"] = true;
                evento["start"] = utente.moduli[I].dataInizio;
                evento["end"] = '';
                stato = "inCorso";
                if (utente.moduli[I].dataFine != undefined) {
                    evento["end"] = utente.moduli[I].dataFine;
                    stato = "completato";
                    if (utente.moduli[I].scadenza != undefined) {
                        if (new Date(utente.moduli[I].dataFine) > new Date(utente.moduli[I].scadenza)) {
                            evento["bgColor"] = 'red';
                            evento["borderColor"] = 'red';
                            stato = "scaduto";
                        }
                    }
                } else if (utente.moduli[I].scadenza != undefined){
                    if (new Date() > new Date(utente.moduli[I].scadenza)) {
                        evento["bgColor"] = 'red';
                        evento["borderColor"] = 'red';
                        stato = "scaduto";
                    }
                    evento["end"] = utente.moduli[I].scadenza;
                }
                evento["raw"] = 'moduliUt;'+stato;//Memorizzo il tipo di evento per sapere quale tab itnerrogare
                contEventi++;
                vetEventi.push(evento);
            }

            for ( I = 0; I < utente.moduliGruppi.length; I++) {
                evento = {};
                evento["id"] = String(utente.moduliGruppi[I].codModulo) + "_" + String(utente.moduliGruppi[I].codModulo);
                evento["calendarId"] = String(contEventi);
                evento["title"] = 'Modulo';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                colore = setColoreEvento();
                evento["bgColor"] = colore;
                evento["borderColor"] = colore;
                evento["dueDateClass"] = '';
                evento["isReadOnly"] = true;
                evento["start"] = utente.moduliGruppi[I].dataInizio;
                evento["end"] = '';
                stato = "inCorso";
                if (utente.moduliGruppi[I].dataFine != undefined) {
                    evento["end"] = utente.moduliGruppi[I].dataFine;
                    stato = "completato";
                    if (utente.moduliGruppi[I].scadenza != undefined) {
                        if (new Date(utente.moduliGruppi[I].dataFine) > new Date(utente.moduliGruppi[I].scadenza)) {
                            evento["bgColor"] = 'red';
                            evento["borderColor"] = 'red';
                            stato = "scaduto";
                        }
                    }
                } else if (utente.moduliGruppi[I].scadenza != undefined){
                    if (new Date() > new Date(utente.moduliGruppi[I].scadenza)) {
                        evento["bgColor"] = 'red';
                        evento["borderColor"] = 'red';
                        stato = "scaduto";
                    }
                    evento["end"] = utente.moduli[I].scadenza;
                }
                evento["raw"] = 'moduliGr;'+stato;
                contEventi++;
                vetEventi.push(evento);
            }

            for (I = 0; I < utente.esami.length; I++) {
                evento = {};
                evento["id"] = String(utente.esami[I].codEsame);
                evento["calendarId"] = String(contEventi);
                evento["title"] = 'Esame';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                colore = setColoreEvento();
                evento["bgColor"] = colore;
                evento["borderColor"] = colore;
                evento["dueDateClass"] = '';
                evento["isReadOnly"] = true;
                evento["start"] = utente.esami[I].data;
                evento["end"] = '';
                evento["raw"] = 'esamiUt;';
                if (utente.esami[I].voto != undefined) {
                    evento["raw"] = evento["raw"] + utente.esami[I].voto;
                }
                
                contEventi++;
                vetEventi.push(evento);
            }

            for (I = 0; I < utente.esamiGruppi.length; I++) {
                evento = {};
                evento["id"] = String(utente.esamiGruppi[I].codEsame) + "_" + String(utente.esamiGruppi[I].codGruppo);
                evento["calendarId"] = String(contEventi);
                evento["title"] = 'Esame';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                colore = setColoreEvento();
                evento["bgColor"] = colore;
                evento["borderColor"] = colore;
                evento["dueDateClass"] = '';
                evento["isReadOnly"] = true;
                evento["start"] = utente.esamiGruppi[I].data;
                evento["end"] = '';
                evento["raw"] = 'esamiGr;';
                if (utente.esamiGruppi[I].voto != undefined) {
                    evento["raw"] = evento["raw"] + utente.esamiGruppi[I].voto;
                }
                contEventi++;
                vetEventi.push(evento);
            }

            for (I = 0; I < utente.lezioni.length; I++) {
                evento = {};
                evento["id"] = String(utente.lezioni[I].codLez);
                evento["calendarId"] = String(contEventi);
                evento["title"] = 'Lezione';
                evento["isAllDay"] = true;
                evento["category"] = 'allday';
                colore = setColoreEvento();
                evento["bgColor"] = colore;
                evento["borderColor"] = colore;
                evento["dueDateClass"] = '';
                evento["isReadOnly"] = true;
                evento["start"] = utente.lezioni[I].dataInizio;
                evento["end"] = '';
                stato = "inCorso";
                if (utente.lezioni[I].dataFine != undefined) {
                    evento["end"] = utente.lezioni[I].dataFine;
                    stato = "completato";
                    if (utente.datiLezione[I].dataScadenza != undefined) {
                        if (new Date(utente.lezioni[I].dataFine) > new Date(utente.datiLezione[I].dataScadenza)) {
                            evento["bgColor"] = 'red';
                            evento["borderColor"] = 'red';
                            stato = "scaduto";
                        }
                    }
                } else if (utente.datiLezione[I].dataScadenza != undefined) {
                    evento["start"] = utente.datiLezione[I].dataScadenza;
                    if (new Date() > new Date(utente.datiLezione[I].dataScadenza)) {
                        evento["bgColor"] = 'red';
                        evento["borderColor"] = 'red';
                        stato = "scaduto";
                    }
                    evento["end"] = utente.datiLezione[I].dataScadenza;
                }
                evento["raw"] = 'lezioni;'+stato;
                vetEventi.push(evento);
            }

            calendar.createSchedules(vetEventi);
        });
    });

    $("#btnPrevWeek").on("click", function () {
        calendar.prev();
    });

    $("#btnNextWeek").on("click", function () {
        calendar.next();
    });

    calendar.on('clickSchedule', function (event) {
        var schedule = event.schedule;

        // focus the schedule
        if (lastClickSchedule) {
            calendar.updateSchedule(lastClickSchedule.id, lastClickSchedule.calendarId, {
                isFocused: false
            });
        }
        calendar.updateSchedule(schedule.id, schedule.calendarId, {
            isFocused: true
        });

        lastClickSchedule = schedule;

        let detEvento;
        let tipoEvento = schedule.raw.split(";")[0];
        let idEvento = schedule.id.split("_")[0];
        if (tipoEvento == "moduliUt" || tipoEvento == "moduliGr") {
            detEvento = inviaRichiesta('/api/dettaglioEventoModuli', 'POST', { "idEvento": idEvento });
            detEvento.done(function (data) {
                creazioneDetModulo(data, new Date(schedule.start).toLocaleDateString(), new Date(schedule.end).toLocaleDateString(), schedule.raw.split(";")[1]);
            });
        } else if (tipoEvento == "esamiUt" || tipoEvento == "esamiGr"){
            detEvento = inviaRichiesta('/api/dettaglioEventoEsame', 'POST', { "idEvento": idEvento });
            detEvento.done(function (data) {
                creazioneDetEsame(data, new Date(schedule.start).toLocaleDateString(), schedule.raw.split(";")[1]);
            });
        } else if (tipoEvento == "lezioni") {
            detEvento = inviaRichiesta('/api/dettaglioEventoLezione', 'POST', { "idEvento": idEvento });
            detEvento.done(function (data) {
                creazioneDetLezione(data, new Date(schedule.start).toLocaleString(), new Date(schedule.end).toLocaleString(), schedule.raw.split(";")[1]);
            });
        }
        
        detEvento.fail(function (jqXHR, test_status, str_error) {
            printErrors(jqXHR, ".msg");
        });
        
    });
}

function creazioneDetModulo(moduli, dataInizio, dataFine, stato) {
    $("#contDettaglioEvento").html("");
    let codHtml = "";

    moduli.forEach(modulo => {
        if (modulo != undefined) {
            codHtml += '<a href="dettaglioCorso.html?corso=' + modulo._id+'" class="list-group-item list-group-item-action flex-column align-items-start">';
            codHtml += '<div class="d-flex w-100 justify-content-between">';
            codHtml += '<h5 class="mb-1">' + modulo.descrizione + '</h5>';
            codHtml += '</div>';
            codHtml += '<p class="mb-1">Tipo: ' + modulo.tipoModulo[0].descrizione + '<br>Materia: ' + modulo.materia[0].descrizione + '<br>Autore: ' + modulo.autore[0].user + '<br>Data Inizio: ' + dataInizio + '<br>Data Fine: ' + dataFine;
            if (stato == "inCorso") {
                codHtml += '<br>Stato: In Corso</p>';
            } else if (stato == "scaduto")
                codHtml += '<br><span style="color:red">Stato: Scaduto</span></p>';
            else if (stato == "completato")
                codHtml += '<br>Stato: Completato</p>';
            codHtml += '</a>';
        }else{
            codHtml += "<p style='text-align:center'>Dati non disponibili</p>";
        }
    });

    $("#contDettaglioEvento").html(codHtml);
}

function creazioneDetEsame(esame, data, voto) {
    $("#contDettaglioEvento").html("");
    let codHtml = "";

    if (esame != undefined) {
        codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
        codHtml += '<div class="d-flex w-100 justify-content-between">';
        codHtml += '<h5 class="mb-1">' + esame[0].descrizione + '</h5>';
        codHtml += '</div>';
        codHtml += '<p class="mb-1">Data Svolgimento: ' + data+'<br>Moduli: ';
        for (let i = 0; i < esame[0].detModuli.length; i++) {
            codHtml += esame[0].detModuli[i].descrizione;
            if (i != esame[0].detModuli.length - 1) {
                codHtml += ", ";
            }
        }

        if (voto != "") {
            codHtml += '<br>Voto: ' + voto + '</p>';
        }else{
            codHtml += '<br>Esame non ancora svolto</p>';
        }
        codHtml += '</a>';
    }else{
        codHtml += "<p style='text-align:center'>Dati non disponibili</p>";
    }
    

    $("#contDettaglioEvento").html(codHtml);
}

function creazioneDetLezione(lezione, dataInizio, dataFine, stato) {
    let codHtml = "";

    $("#contDettaglioEvento").html("");

    if (lezione != undefined) {
        codHtml += '<a class="list-group-item list-group-item-action flex-column align-items-start">';
        codHtml += '<div class="d-flex w-100 justify-content-between">';
        codHtml += '<h5 class="mb-1">' + lezione.titolo + '</h5>';
        codHtml += '</div>';
        codHtml += '<p class="mb-1">Data Creazione: ' + new Date(lezione.dataCreazione).toLocaleDateString()+"<br>Data Inizio: "+dataInizio;
        if (dataFine != "" ) {
            codHtml += "<br>Data Fine: "+dataFine;
        }
        if (lezione.dataScadenza != undefined) {
            codHtml += "<br>Data Scadenza: " + new Date(lezione.dataScadenza).toLocaleString();
        }
        if (stato == "inCorso") {
            codHtml += '<br>Stato: In Corso</p>';
        } else if (stato == "scaduto")
            codHtml += '<br><span style="color:red">Stato: Scaduto</span></p>';
        else if (stato == "completato")
            codHtml += '<br>Stato: Completato</p>';
        codHtml += '</a>';
    }else{
        codHtml += "<p style='text-align:center'>Dati non disponibili</p>";
    }

    $("#contDettaglioEvento").html(codHtml);
}

function setColoreEvento() {
    let colori = {
        aqua: "#00ffff",
        azure: "#f0ffff",
        beige: "#f5f5dc",
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
        darksalmon: "#e9967a",
        darkviolet: "#9400d3",
        fuchsia: "#ff00ff",
        gold: "#ffd700",
        green: "#008000",
        indigo: "#4b0082",
        khaki: "#f0e68c",
        lightblue: "#add8e6",
        lightcyan: "#e0ffff",
        lightpink: "#ffb6c1",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        maroon: "#800000",
        navy: "#000080",
        olive: "#808000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        violet: "#800080",
        silver: "#c0c0c0",
        yellow: "#ffff00"
    };

    let result;
    let count = 0;
    for (let prop in colori)
        if (Math.random() < 1 / ++count)
            result = prop;
    return result;
}

function creazioneElencoGruppi(utenti) {
    $("#contGruppi").html("");
    let codHtml = "";
    let aus;
    
    utenti.forEach(utente => {
        if (utente["gruppi"] != undefined && utente["gruppi"].length > 0) {
            for (let i = 0; i < utente["gruppi"].length; i++) {
                codHtml += '<a href="dettaglioGruppo.html?gruppo=' + utente["gruppi"][i]._id+'" class="list-group-item list-group-item-action flex-column align-items-start">';
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
    let dim = 0;
   
    utenti.forEach(utente => {
        if (utente["appuntiCaricati"] != undefined && utente["appuntiCaricati"].length > 0) {
            if (utente["appuntiCaricati"].length < 3) {
                dim = utente["appuntiCaricati"].length;
            }else{
                dim = nElementiVis;
            }
            //Controllare il collapse
            for (let i = 0; i < dim; i++) {
                codHtml += '<a href="dettaglioAppunto.html?appunto=' + utente["appuntiCaricati"][i]._id+'" class="list-group-item list-group-item-action flex-column align-items-start">';
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
                if (i == dim - 1 && dim > 2) {
                    codHtml += '<button type="button" class="btn btn-info" data-toggle="collapse" data-target="#contAltriAppunti" data-parent="#acc"><i class="fa fa-plus"></i></button>';
                    codHtml += '<div id="contAltriAppunti" class="collapse">';
                    for (let k = dim; k < (utente["appuntiCaricati"].length-dim); k++) {
                        codHtml += '<a href="dettaglioAppunto.html?appunto=' + utente["appuntiCaricati"][k]._id + '" class="list-group-item list-group-item-action flex-column align-items-start">';
                        codHtml += '<div class="d-flex w-100 justify-content-between">';
                        codHtml += '<h5 class="mb-1">' + utente["appuntiCaricati"][k].descrizione + '</h5>';
                        codHtml += '</div>';
                        aus = new Date(utente["appuntiCaricati"][k].dataCaricamento);
                        if (utente["appuntiCaricati"][k].argomenti != undefined) {
                            vetArg = "Argomenti: ";
                            for (let J = 0; J < utente["appuntiCaricati"][k].argomenti.length; J++) {
                                vetArg += utente["appuntiCaricati"][k].argomenti[J].descrizione;
                                if (J != utente["appuntiCaricati"][k].argomenti.length - 1) {
                                    vetArg += ", ";
                                }
                            }
                        }
                    }
                    codHtml += '</div>';
                }
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
                        vetModuli.push({ "_id": utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k]._id, "desc": utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k].descrizione, "data": utente["appuntiInteressati"][i].argomenti[j].appuntiOk[k].dataCreazione, "argomenti": vetAus});
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
            codHtml += '<a href="dettaglioCorso.html?corso=' + vetModuli[K]._id+'" class="list-group-item list-group-item-action flex-column align-items-start">';
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