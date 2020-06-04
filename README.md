# LearnOnTheNet

![](/Immagini/Home.PNG)

## [Test dell'app](https://learn-on-the-net.herokuapp.com/index.html)

## Descrizione:
Piattaforma di e-learning che consente di seguire, individualmente o come parte di un gruppo, corsi relativi a determinati argomenti, parte di una serie di materie. 
Ogni corso può prevedere degli esami finali. 
Il corso è composto da appunti caricati per ogni materia dagli utenti. 
Ogni appunto possiede degli allegati in diversi formati ed è possibile richiedere lettura automatica degli allegati .pdf e .docx 
Ogni corso è moderato da dei moderatori, impostati dall'organizzazione/community in possesso della piattaforma, che hanno il compito di controllare gli appunti e gli allegati caricati sul corso e verificare che siano inerenti all'argomento su cui è incentrato il corso.
Tra i compiti dei moderatori ci sono anche il controllo degli argomenti associati ad una materia e l'inserimento, modifica o eliminazione delle materie.

## Autori: Federico Giacardi e Stefano Fontana

## Tecnologie Utilizzate: 
* HTML
* CSS
* Bootstrap
* Javascript
* jQuery
* Ajax
* Node.js
* Express
* [IBM Watson Text to speech](https://www.ibm.com/it-it/cloud/watson-text-to-speech)
* MongoDB (Database hostato su cloud [Atlas](https://www.mongodb.com/cloud/atlas))
* Mongoose
* [Bootstrap Select (sostituisce il plugin di base del tema per gestire le select)](https://developer.snapappointments.com/bootstrap-select/)
* Gmail per invio di mail

## Note sulle tecnologie:
Data la difficoltà di realizzare ed addestrare un modello capace di effettuare la lettura dei documenti, si è deciso di utilizzare il servizio di Text to Speech sviluppato da IBM e reso disponibile sul loro cloud.
Si è deciso di utilizzare il DBMS NoSql MongoDB, sia per la familirità con il suo utilizzo sviluppata durante gli esercizi in classe, che ha evitato tempi e difficoltà aggiuntive, sia per la facilità di integrazione con Node.js.
Abbiamo poi deciso di utlizzare la libreria di Object Data Modelling Mongoose per definire uno schema meno restrittivo di quello imposto da DBMS relazionali, ma utile per validare i dati caricati nel DB e, soprattutto, per definire delle relazioni le quali, pur non essendo paragonabili a quelle dei DBMS relazionali, consentono di gestire molto bene i collegamenti tra tabelle presenti nel nostro DB.
La possibilità di creare campi vettoriali si è poi rivelata molto comoda per determinati aspetti, come la gestione delle domande di un esame, della realtà da noi gestita.
La familirità di utilizzo con Mongo e le possiblità offerte da Mongoose ci hanno fatto propendere per l'utilizzo di un DBMS NoSql invece di un DBMS relazionale.
Si è deciso di sostituire il plugin per la gestione delle select presente nel tema poichè quest'ultimo non presentava la possibilità di gestire una selezione multipla.

## Database:
Pur non essendo il nostro DB relizzato secondo il modello relazionale, abbiamo ritenuto opportuno relizzarne uno schema riassuntivo.
Si noti la presenza di alcune tabelle, caratterizzate dalla sigla temp, nelle quali vengono memorizzati appunti, argomenti e moduli in attesa di essere da approvati dai moderatori.
![](/Immagini/SchemaDB.PNG)

## Piattaforma di Hosting: [Heroku](https://www.heroku.com/)

## Versione:
0.1

## Licenza:
Progetto rilasciato con licenza [Apache License 2.0](LICENSE)

## Sezioni Sito:
* Home: Pagina di presentazione del sito con breve descrizione, elenco dei principali servizi offerti, statistiche di utilizzo e recensioni. Pagina relizzata da Giacardi.
![](/Immagini/Home.PNG)
* Registrati: Sezione con form di iscrizione. Una volta completata la registrazione si viene re-indirizzati alla pagina di login. Pagina relizzata da Giacardi.
![](/Immagini/Registrati.PNG)
* Login: Pagina con form di login che richiede l'inserimento di Username e Password. Qualora il login vada a buon fine, si viene re-indirizzati sulla propria area personale. Pagina relizzata da Giacardi.
![](/Immagini/Login.PNG)
* Reimposta Password: Pagina con form che richiede username, email e numero di telefono per la reimpostazione della password.
Qualora i dati inseriti siano corretti verrà inviata una mail con un link al quale è associato un token per la reimpostazione della password. Se il token passato come corretto è valido si avrà accesso ad una nuova pagina con un form che consentirà di scegliere la nuova password. Al termine dell'operazione si verrà re-indirizzati alla pagina di login e verrà inviata una mail di conferma. Se il token non è corretto quando si tenterà di inviare la nuova password l'operazione verrà bloccata. Pagina relizzata da Giacardi.
![](/Immagini/NuovaPassword.PNG)
![](/Immagini/MailToken.PNG)
![](/Immagini/ReimpostaPassword.PNG)
![](/Immagini/ConfermaModifcaPwd.PNG)
* Area Personale: La pagina contiene un calendario sul quale sono segnati moduli, lezioni ed esami svolti sia individualmente sia come parte di gruppi. Sono indicate le prove scadute (non completate in tempo), quelle programmate e quelle completate in passato. Cliccando sull'evento sarà possibile visualizzarne il dettaglio.
Più in basso sono indicati i gruppi a cui l'utente è iscritto, i corsi che potrebbero interessargli, basandosi su quelli da lui svolti di recente e gli appunti caricati. Cliccando sui box mostrati sarà possibile accedere alle rispettive pagine di dettaglio. E' stato implementato un meccanismo di "mostra di più" per comprimere la visualizzazione e mostrare tutti i dati solo su richiesta dell'utente. Pagina relizzata da Giacardi.
![](/Immagini/dashborad.PNG)
![](/Immagini/DatiDashboard.PNG)
* Corsi: Pagina che consente di ricercare e visualizzare i corsi presenti nel Database. Effettuata la ricerca vengono visualizzati in dei box alcuni dati riepilogativi di ogni corso che corrisponde ai filtri di ricerca, cliccando sul nome del corso sarà possibile accedere alla sua pagina di dettaglio dove sono presenti tutti i dettagli del corso. La corrente pagina presenta al fondo un form che permette l'inserimento di un nuovo corso specificandone il tipo (scolastico, privato, ecc.) tra quelli presenti su Database e la materia di appartenenza tra quelle presenti sul Database. Pagina realizzata da Fontana.
![](/Immagini/Corsi.png)
![](/Immagini/RicercaCorsi.png)
![](/Immagini/InserimentoCorso.png)
* DettaglioCorso: Pagina che consente di visualizzare i dettagli del corso selezionato. In caso in cui l'utente attualmente loggato sia l'autore del corso, verranno visualizzati dei pulsanti per l'aggiunta al corso di argomenti e lezioni già esistenti, la modifica e l'eliminazione del corso. Il pulsante di aggiunta degli argomenti, come quello di aggiunta delle lezioni, aprirà una modale nella quale è possibile ricercare l'oggetto da aggiungere al corso. Cliccando il pulsante della modifica del corso è possibile modificare i dettagli del corso, rimuovere gli argomenti e le lezioni. Al fondo della pagina è presente una sezione per l'inserimento di una nuova lezione. Se invece l'utente attualmente loggato è iscritto al corso sarà possibile visualizzare il dettaglio delle lezioni cliccando l'apposito pulsante oppure iscrivere un gruppo di cui è autore. Inoltre è presente, nei due casi precedenti, un pulsante per accedere alla sezione degli esami relativi al corso. Se invece l'utente loggato al sito non è iscritto avrà la possibilità di farlo o di iscrivere un gruppo di cui è autore con gli appositi pulsanti. Pagina realizzata da Fontana.
![](/Immagini/AdminCorso.png)
![](/Immagini/InsLezioneCorso.png)
![](/Immagini/IscrittoCorsoNoAdm.png)
![](/Immagini/NoIscrittoCorso.png)
* DettaglioLezione: Pagina che consente di visualizzare i dettagli del lezione selezionata. In caso in cui l'utente attualmente loggato sia l'autore della lezione, verranno visualizzati dei pulsanti per l'aggiunta di appunti alla lezione, la modifica e l'eliminazione della lezione. Il pulsante di aggiunta degli appunti aprirà una modale nella quale è possibile ricercare l'appunto da aggiungere alla lezione. Cliccando il pulsante della modifica della lezione è possibile modificarne i dettagli e rimuovere gli appunti. Se invece l'utente attualmente loggato è iscritto al corso di cui la lezione fa parte, solo una volta dopo essersi iscritto alla lezione tramite l'apposito pulsante potrà vedere i dettagli della lezione e visualizzare i dettagli degli appunti tramite l'apposito pulsante, a patto che la lezione non sia terminata. Pagina realizzata da Fontana.
![](/Immagini/AdminLezione.png)
![](/Immagini/NoIscrittoLezione.png)
* Esami: Pagina che consente di visualizzare un riepilogo di tutti gli esami collegati al corso di cui si stava visualizzando il dettaglio. In caso in cui l'utente attualmente loggato sia l'autore del corso, verrà visualizzato un elenco di tutti gli esami collegati al corso, con la possibilità di modificarli o di eliminarli. Cliccando il pulsante per la modifica, verranno visualizzati i dettagli dell'esame e le varie domande ad esso collegate. Le domande possono essere rimosse o essere aggiunte scegliendo fra i tipi forniti dal sistema (domanda chiusa, vero o falso, domanda a risposte multiple). Inoltre vi è una sezione apposita per l'inserimento di un nuovo esame e delle domande ad esso collegate. Se invece l'utente attualmente loggato è iscitto al corso, verrà visualizzato solo l'elenco degli esami; in caso in cui la data utile per lo svolgimento dell'esame non sia ancora passata, tramite l'apposito pulsante si verrà reindirizzati alla pagina di riepilogo per poi dare l'esame. Pagina realizzata da Fontana.
![](/Immagini/EsamiCorso.png)
![](/Immagini/InserimentoEsame.png)
* SvolgimentoEsame: Pagina che consente di visualizzare il dettaglio dell'esame selezionato e che permette di svolgere l'esame in caso non sia ancora scaduto e non sia già stato dato. Se l'esame è disponibile, cliccando sul pulsante Svolgi Esame verrà aperta una nuova finestra del browser nel quale verranno visualizzate, ad una ad una, le domande e partirà il timer per la durata dell'esame. Una volta che l'utente inserisce tutte le risposte o una volta che il tempo esaurisce, l'utente deve consegnare e verrà calcolato il risultato ottenuto e salvato sul database. È stato realizzato un sistema che, in caso l'utente debba ricaricare la pagina o perda la connessione e sia costretto a ricollegarsi, se la pagina dell'esame non viene chiusa le domande attualmente inserite non andranno perse e il tempo riprenderà dal momento della disconnessione. Nel caso in cui la pagina venga chiusa, le risposte date andranno perse. Se l'utente ha già sostenuto l'esame, verrà visualizzato il risultato ottenuto; se invece l'esame è terminato e non si ha effettuato nessun tentativo si vedrà solo il dettaglio dell'esame.
![](/Immagini/DettaglioEsame.png)
![](/Immagini/EsameDaSvolgere.png)
![](/Immagini/PagSvolgimentoEsame.png)
![](/Immagini/EsameSvolto.png)
* Gruppi: Pagina che consente di ricercare e visualizzare i gruppi presenti nel Database. Effettuata la ricerca vengono visualizzati in dei box alcuni dati riepilogativi di ogni gruppo che corrisponde ai filtri di ricerca, cliccando sul nome del gruppo sarà possibile accedere alla sua pagina di dettaglio dove sono presenti tutti i dettagli del gruppo. La corrente pagina presenta al fondo un form che permette l'inserimento di un nuovo gruppo specificandone il tipo (classe, privato, amici, ecc.) tra quelli presenti su Database. Pagina realizzata da Fontana.
![](/Immagini/Gruppi.png)
![](/Immagini/RicercaGruppi.png)
![](/Immagini/InserimentoGruppo.png)
* DettaglioGruppo: Pagina che consente di visualizzare i dettagli del gruppo selezionato. In caso in cui l'utente attualmente loggato sia l'autore del gruppo, verranno visualizzati anche dei pulsanti per l'aggiunta di componenti del gruppo, la modifica e l'eliminazione del gruppo. Il pulsante di aggiunta dei membri aprirà una modale nella quale è possibile ricercare un utente registrato sul sito e aggiungerlo al gruppo. Cliccando il pulsante della modifica del gruppo è possibile modificare i dettagli del gruppo e rimuoverne i componenti. Pagina realizzata da Fontana.
![](/Immagini/AdminGruppo.png)
![](/Immagini/DettaglioGruppo.png)
* Appunti: Pagina che consente di ricercare e visualizzare gli appunti presenti nel Database. Al termine di ogni ricerca sono visualizzati in un box alcuni dati di ogni appunto individuato, cliccando sul box sarà possibile accedere alla pagina con tutti i dettagli dell'appunto e le funzioni di modifica, eliminazione e lettura. La pagina presente anche un form per l'inserimento di un nuovo appunto con la possibilità di caricare nuovi allegati o di utilizzare quelli presenti nel Database. Pagina relizzata da Giacardi.
![](/Immagini/RicercaAppunti.PNG)
![](/Immagini/InserimentoAppunti.PNG)
* Dettaglio Appunto: Pagina che consente di visualizzare i dettagli dell'appunto selezionato. Qualora l'utente loggato sia colui che ha effettuato il caricamento dell'appunto, verranno visualizzati un pulsante per eliminare l'appunto e uno per modificarlo. Tale pulsante aprirà, nella medesima pagina, un form con i dati dell'appunto che potranno essere modificati. Il pulsante lettura consente di aprire un form che consente di indicare quali allegati dell'appunto leggere (sono ammessi, per ora, solo file PDF, DOCX e TXT), la lingua degli allegati da leggere e la voce di lettura. All'invio del form viene effettuata una chiamata al server il quale, qualora la lettura vada a buon fine, risponde restituendo i file .wav creati che l'utente può scaricare. Il servizio di Text to speech è basato sul servizio IBM Watson fruibile gratuitamente fino a 10000 caratteri mensili via cloud IBM. 
Per estrarre il contenuto del file da leggere, andando anche ad escludere anche eventuali immagini, si è dovuto realizzare un modulo, denominato FileReader, che effettui, in modo asincrono tramite dei Promise, l'estrazione del contenuto combinando le funzionalità di due moduli, [PdfReader](https://www.npmjs.com/package/pdfreader) e [node-stream-zip](https://www.npmjs.com/package/node-stream-zip).
Il contenuto così estratto viene poi passato a IBM Watson per la lettura.
Il file .wav così ottenuto viene salvato nella cartella static/audio e al client viene restituito il percorso del file salvato nel session storage.
Quando l'utente decide di eseguire il download del file, premendo l'apposito bottone, viene chimato un listener che effettua il download, tramite il metodo download dell'oggetto response, del file e provvede poi ad eliminarlo tramite il metodo unlink del modulo file system, nativo di Node.
Per poter usufruire dei servizi del cloud IBM in NodeJs si è utlizzata la [SDK disponibile su GitHub](https://github.com/watson-developer-cloud/node-sdk).
Pagina relizzata da Giacardi.
![](/Immagini/DettaglioAppunto.PNG)
![](/Immagini/TTSAppunto.PNG)
![](/Immagini/PaginaDownloadTTS.PNG)
![](/Immagini/DownloadTTS.PNG)
* Allegati: Pagina che consente di visualizzare una tabella con gli allegati presenti sul server con la possiblità di filtrare i dati nella tabella, è inoltre possibile scaricare gli allegati presenti o, nel caso di alcuni formati come il pdf, visualizzarli direttamente nel browser con un apposito pulsante. 
Pagina relizzata da Giacardi.
![](/Immagini/Allegati.PNG)
* Modifica Profilo: Pagina raggiungibile dalla navbar che consente di modificare le impostazioni relative al proprio profilo (ad eccezione della password, reimpostabile come descritto in precedenza). Pagina relizzata da Giacardi.
![](/Immagini/ModificaProfilo.PNG)
* Argomenti: Pagina accessibile solo da moderatori. Presenta l'elenco degli argomenti moderati dall'utente autenticato, con la possibilità di eliminazione.
E' presente poi una tabella con l'elenco degli appunti collegati agli argomenti in attesa di approvazione, che possono essere accettati oppure essere rifiutati. Nel caso in cui vengano accettati, gli appunti vengono trasferiti dalla collection AppuntiTemp alla collection Appunti.
La tabella sottostante presenta un elenco di moduli collegati agli argomenti in attesa di approvazione, che possono essere accettati oppure essere rifiutati. Nel caso in cui vengano accettati, i moduli vengono trasferiti dalla collection ModuliTemp alla collection Moduli.
Queste due tabelle sono visualizzate solo qualora vi siano Appunti o Moduli in attesa di approvazione.
Infine, è presente un form per l'aggiunta di un nuovo argomento, che verrà inserito in una collection ArgomentiTemp in attesa di essere approvati dal moderatore della materia.
![](/Immagini/Argomenti_1.PNG)
![](/Immagini/Argomenti_2.PNG)
![](/Immagini/Argomenti_3.PNG)
![](/Immagini/Argomenti_4.PNG)
* Materie: Pagina accessibile solo da moderatori. Presenta l'elenco delle materie moderate dall'utente autenticato, con la possibilità di eliminazione e di modifica.
E' presente poi una tabella con l'elenco degli Argomenti in attesa di approvazione.
Nel caso in cui vengano accettati, gli argomenti vengono trasferiti dalla collection ArgomentiTemp alla collection Argomenti.
Infine, è presente un form per l'aggiunta di una nuova materia.
![](/Immagini/Materie_1.PNG)
![](/Immagini/Materie_2.PNG)
![](/Immagini/Materie_3.PNG)

## Aggiunte Previste fino al 10/05/2020
* Aggiunta sezione per svolgimento esame.

## Considerazioni finali
La relizzazione della funzionalità di lettura automatica del file si è rivelata molto ostica.
Non essendo disponibile un modulo per l'estrazione del contenuto del file capace di offrire buone prestazioni su tipi di file diversi si è dovuto scrivere un nostro modulo, FileReader, che combini un modulo per la lettura di PDF con uno per la lettura dei DOCX. Particolarmente complicata si è poi rivelata la combinazione dell'estrazione del file con la sua lettura tramite IBM Watson a causa delle molte operazioni asincrone da coordinare. Il meccanismo risulta ad oggi funzionante, tuttavia siamo consci del fatto che sia piuttosto limitato, soprattuto per i pochi tipi di file supportati.
Molto complessa, sempre per il dover andare a coordinare più operazioni asincrone, si è rivelata la funzionalità di modifica dell'appunto. Si tratta della funzione che ha richiesto più tempo ma ad oggi risulta funzionante.
Anche la gestione dell'eliminazione di materie e argomenti si è rivelata complessa, per la necessità di intervenire su più tabelle collegate. Anche questa problematica è stata superata.
L'hosting su Heroku si è rivelato meno problematico del previsto.
Il modulo bycript ha generato qualche problema di compatibilità risolto modificando il package.
Si è poi dovuto modificare l'autenticazione all'account di Gmail, passando all'OAuth di Google per abilitare l'accesso anche ad IP esterni.
Sopratutto, si è dovuto passare dal modulo HTTPS a quello HTTP per far fronte al fatto che il load balancer di Heroku invia alla nostra app del traffico non cifrato.
In sostanza, quando il server di Heroku riceve del traffico HTTPS lo blocca e apre una connessione HTTP verso il nostro web dyno. Quest'ultimo risponderà al server che comunicherà la risposta in HTTPS, garantendo quindi la sicurezza della comunicazione, al client.
In questo modo non dovremo impostare alcun certificato sul nostro Dyno e, dato che esso riceverà soltanto traffico HTTP, dovremo utilizzare il modulo HTTP nel nostro server.
Con il meccanismo descritto in precedenza Heroku garantirà comunque la sicurezza dell'applicazione.
In conclusione, possiamo dire di aver implementato, pur con alcune riduzioni concernenti soprattutto la parte di text to speech, tutte le funzionalità previste inizialmente senza che si rendessero necessari variazioni significative.