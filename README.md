# LearnOnTheNet

![](/Home_1.PNG)

## Descrizione:
Piattaforma di e-learning che consente di seguire, individualmente o come parte di un gruppo, corsi relativi a determinati argomenti. 
Ogni corso può prevedere degli esami finali. 
Il corso è composto da appunti caricati per ogni materia dagli utenti. 
Ogni appunto può possedere degli allegati ed è possibile richiedere lettura automatica dell’appunto. 
Ogni corso è moderato da dei moderatori che hanno il compito di controllare gli appunti e gli allegati caricati sul corso e verificare che siano inerenti all'argomento su cui è incentrato il corso.

## Autori: Federico Giacardi e Stefano Fontana

## Tecnologie Utilizzate: 
* HTML
* CSS
* Bootstrap
* Javascript
* jQuery
* Ajax
* Node.js
* [IBM Watson Text to speech](https://www.ibm.com/it-it/cloud/watson-text-to-speech)
* MongoDB (Database hostato su cloud [Atlas](https://www.mongodb.com/cloud/atlas))

## Piattaforma di Hosting: [Heroku](https://www.heroku.com/)

## Versione:
Progetto in fase di sviluppo

## Sezioni Sito:
* Home: Pagina di presentazione del sito con breve descrizione, elenco dei principali servizi offerti,  statistiche di utilizzo e recensioni. Pagina relizzata da Giacardi.
![](/immagini/Home_1.PNG)
* Registrati: Sezione con form di iscrizione. Una volta completata la registrazione si viene re-indirizzati alla pagina di login. Pagina relizzata da Giacardi.
![](/immagini/Registrati.PNG)
* Login: Pagina con form di login che richiede l'inserimento di Username e Password. Qualora il login vada a buon fine, si viene re-indirizzati sulla propria area personale. Pagina relizzata da Giacardi.
![](/immagini/Login.PNG)
* Reimposta Password: Pagina con form che richiede username, email e numero di telefono per la reimpostazione della password.
Qualora i dati inseriti sia corretti verrà inviata una mail con un link al quale è associato un token per la reimpostazione della password. Se il token passato come corretto è valido si avrà accesso ad una nuova pagina con un form che consentirà di scegliere la nuova password. Al termine dell'operazione si verrà re-indirizzati alla pagina di login e verrà inviata una mail di conferma. Se il token non è corretto quando si tenterà di inviare la nuova password l'operazione verrà bloccata. Pagina relizzata da Giacardi.
![](/immagini/NuovaPassword.PNG)
![](/immagini/MailToken.PNG)
![](/immagini/ReimpostaPassword.PNG)
![](/immagini/ConfermaModifcaPwd.PNG)
* Area Personale: La pagina contiene un calendario sul quale sono segnati moduli, lezioni ed esami svolti sia individualmente sia come parte di gruppi. Sono indicate le prove scadute (non completate in tempo), quelle programmate e quelle completate in passato. Cliccando sull'evento sarà possibile visualizzarne il dettaglio.
Più in basso sono indicati i gruppi a cui l'utente è iscritto, i corsi che potrebbero interessargli, basandosi su quelli da lui svolti di recente, le materie moderate e gli appunti caricati. Cliccando sui box mostrati sarà possibile accedere alle rispettive pagine di dettaglio. Attualmente si sta implementando un meccanismo di "mostra di più" per comprimere la visualizzazione e mostrare tutti i dati solo su richiesa dell'utente. Pagina relizzata da Giacardi.
![](/immagini/dashborad.PNG)
![](/immagini/DatiDashboard.PNG)
* Appunti: Pagina che consente di ricercare e visualizzare gli appunti presenti nel Database. Al termine di ogni ricerca sono visualizzati in un box alcuni dati di ogni appunto idividuato, cliccando sul box sarà possibile accedere alla pagina con tutti i dettagli dell'appunto e le funzioni di modifica, eliminazione e lettura. La pagina presente anche un form per l'inserimento di un nuovo appunto con la possibilità di caricare nuovi allegati o di utilizzare quelli presenti nel Database. Pagina relizzata da Giacardi.
![](/immagini/RicercaAppunti.PNG)
![](/immagini/InserimentoAppunti.PNG)
* Dettaglio Appunto: Pagina che consente di visualizzare i dettagli dell'appunto selezionato. Qualora l'utente loggato sia colui che ha effettuato il caricamento dell'appunto, verranno visualizzati un pulsante per eliminare l'appunto e uno per modificarlo. Tale pulsante aprirà, nella medesima pagina, un form con i dati dell'appunto che potranno essere modificati. Il pulsante lettura consente di aprire un form che consente di indicare quali allegati dell'appunto leggere (sono ammessi, per ora, solo file PDF, DOCX e TXT), la lingua degli allegati da leggere e la voce di lettura. All'invio del form viene effettuata una chiamata al server il quale, qualora la lettura vada a buon fine, risponde restituendo i file .wav creati che l'utente può scaricare. Il servizio di Text to speech è basato sul servizio IBM Watson fruibile gratuitamente fino a 10000 caratteri mensili via cloud IBM. Al momento si sta valutando l'inserimento nel form di un campione audio di prova della voce scelta. Il problema è legato al fatto che IBM non offre un web service con l'elenco dei campioni che andrebbero scaricati su server. Per la estrarre il contenuto del file da leggere, andando anche ad escludere anche eventuali immagini, si è dovuto realizzare un modulo, denominato FileReader, che effettui, in modo asincrono tramite dei Promise, l'estrazione del contenuto combinando le funzionalità di due moduli, [PdfReader](https://www.npmjs.com/package/pdfreader) e [node-stream-zip](https://www.npmjs.com/package/node-stream-zip).
Il contenuto così estratto viene poi passato a IBM Watson per la lettura.
Per poter usufruire dei servizi del cloud IBM in NodeJs si è utlizzata la [SDK disponibile su GitHub](https://github.com/watson-developer-cloud/node-sdk).
Si prevede di implementare l'eliminazione dei campioni audio una volta scaricati. Pagina relizzata da Giacardi.
![](/immagini/DettaglioAppunto.PNG)
![](/immagini/TTSAppunto.PNG)
![](/immagini/PaginaDownloadTTS.PNG)
![](/immagini/DownloadTTS.PNG)
* Allegati: Pagina che consente di visualizzare una tabella con gli allegati presenti sul server con la possiblità di filtrare i dati nella tabella, è inoltre possibile scaricare gli allegati presenti con un apposito pulsante. Pagina relizzata da Giacardi.
![](/immagini/Allegati.PNG)
* Modifica Profilo: Pagina raggiungibile dalla navbar che consente di modificare le impostazioni relative al proprio profilo (ad eccezione della password, modificabile come descritto in precedenza). Pagina relizzata da Giacardi.
![](/immagini/ModificaProfilo.PNG)

## Aggiunte Previste fino al 10/05/2020
* Aggiunta sezione moderatore materia con possibilità di accettare o rifiutare gli appunti caricati. Per questo punto verrà realizzata una pagina di dettaglio materia collegata all'area personale.
* Aggiunta sezione per svolgimento esame.
* Si sta valutando l'opportunità di realizzare una pagina con la possibilità di visualizzare le meterie caricate sul sito.

## Aggiunte Previste oltre il 10/05/2020
* Implementazione delle funzionalità mancanti indicate nelle varie sezioni.
* Revisioni del codice.
* Revisione grafica delle pagine.
* Deploy su Heroku e test di funzionamento e carico

## Stima conclusione lavori
Orientativamente si ritiene di poter completare i lavori entro il 17/05/2020. In base a quanto impiegato per implementare le funzionalità della sezione "Aggiunte Previste" e alla durata della fase di deploy e test (ci sono moduli di NodeJs, come il NodeMailer, che potrebbero dare problemi) si potrebbe anche terminare in anticipo o poco oltre la data stabilita (di sicuro non oltre il 24/05/2020).

## Problemi riscontrati
La relizzazione della funzionalità di lettura automatica del file si è rivelata molto ostica.
Non essendo disponibile un modulo per l'estrazione del contenuto del file capace di offrire buone prestazioni su tipi di file diversi si è dovuto scrivere un nostro modulo, FileReader, che combini un modulo per la lettura di PDF con uno per la lettura dei DOCX. Particolarmente complicata si è poi rivelata la combinazione dell'estrazione del file con la sua lettura tramite IBM Watson a causa delle molte operazioni asincrone da coordinare. Il meccanismo risulta ad oggi funzionante, tuttavia siamo consci del fatto che sia piuttosto limitato, soprattuto per i pochi tipi di file supportati.
Molto complessa, sempre per il dover andare a coordinare più operazioni asincrone, si è rivelata la funzionalità di modifica dell'appunto. Si tratta della funzione che ha richiesto più tempo ma ad oggi risulta funzionante.