// Dati del quiz

// Array di oggetti: ogni oggetto rappresenta una domanda
const quizData = [
  {
    //Testo della domanda
    question: "Qual è il risultato di 2 + +'2' in JavaScript?",
    //Possibili risposte in ordine
    answers: ["4", "'22'", "NaN", "Errore"],
    //Indice della risposta corretta nell'array answers
    correct: 1,
  },
  {
    //Testo della domanda
    question: "Quale keyword si usa per dichiarare una costante?",
    //Possibili risposte in ordine
    answers: ["var", "let", "const", "static"],
    //Indice della risposta corretta nell'array answers
    correct: 2,
  },
  {
    //Testo della domanda
    question: "Quale metodo serve per aggiungere un elemento ad un array?",
    //Possibili risposte in ordine
    answers: ["push()", "pop()", "shift()", "concat()"],
    //Indice della risposta corretta nell'array answers
    correct: 0,
  },

  {
    //Testo della domanda
    question: "Quale metodo converte un oggetto in stringa JSON?",
    //Possibili risposte in ordine
    answers: ["JSON.stringify()", "JSON.parse()", "toString()", "String()"],
    //Indice della risposta corretta nell'array answers
    correct: 0,
  },

  {
    //Testo della domanda
    question:
      "Quale metodo viene usato per rimuovere l’ultimo elemento di un array?",
    //Possibili risposte in ordine
    answers: ["pop()", "push()", "shift()", "unshift()"],
    //Indice della risposta corretta nell'array answers
    correct: 0,
  },
  {
    //Testo della domanda
    question:
      "Quale operatore viene usato per confrontare valori senza convertire il tipo?",
    //Possibili risposte in ordine
    answers: ["==", "=", "===", "!="],
    //Indice della risposta corretta nell'array answers
    correct: 2,
  },
];

// Stato del quiz a runtime

// Indice della domanda attuale (parte da 0)
let currentQuestion = 0;
//Punteggio accumulato dall'utente
let score = 0;
//Contatore risposte consecutive corrette per il bonus e azzerato se sbaglia
let risp_cons = 0;
//Riferimento al setInterval
let timer;
//Secondi per domanda
let timeLeft = 10;

// Collegamenti al DOM

//<div> dove mostreremo il testo della domanda
const questionEl = document.getElementById("question-container");

//<ul> che conterrà i pulsanti delle risposte
const answersEl = document.getElementById("answers");

//Pulsante Prossima (inizialmente nascosto in HTML)
const nextBtn = document.getElementById("next-btn");

//<p> dove mostreremo feedback (corretto/sbagliato) e punteggio finale
const scoreEl = document.getElementById("score");

//Seleziona l'elemento HTML della barra di avanzamento e lo assegna alla variabile progressBar
//Permette di modificarne dinamicamente la larghezza in JavaScript per mostrare il progresso del quiz
const progressBar = document.getElementById("progress-bar");

const progressText = document.getElementById("progress-text");
const resultsBox = document.getElementById("result");
const finalScoreEl = document.getElementById("final-score");
const highScoreEl = document.getElementById("high-score");
const restartBtn = document.getElementById("restart-btn");
const clearStorageBtn = document.getElementById("clear-storage-btn");

// Si prende dal documento HTML l’elemento che ha id="timer"
const timerEl = document.getElementById("timer");

//Seleziona l'elemento <div> con id="history" dal DOM
const historyDiv = document.getElementById("history");

//Seleziona l'elemento <div> con id="history-cards" dal DOM
//Questo è il contenitore vuoto dove verranno inserite le "cards"
//generate dinamicamente per ogni quiz completato (massimo 10).
const cardsContainer = document.getElementById("history-cards");

//Funzioni di utilità

//Aggiorna la UI dell'avanzamento (domanda X/Y + barra grafica)
function updateProgress() {
  const total = quizData.length;
  // Se currentQuestion >= total significa che ha finito il quiz
  const humanIndex = Math.min(currentQuestion + 1, total);
  progressText.textContent = `Domanda ${humanIndex} / ${total}`;

  //Calcolo percentuale
  const pct = (humanIndex / total) * 100;
  progressBar.style.width = `${pct}%`;
}

function disableAnswerButtons() {
  const buttons = answersEl.querySelectorAll("button");
  buttons.forEach((b) => (b.disabled = true));
}

//Funzione Timer 10sec
function startTimer() {
  //Ferma timer precedenti per evitare che più setInterval siano attivi contemporaneamente
  clearInterval(timer);

  //Imposta il tempo iniziale per la domanda (10 secondi)
  timeLeft = 10;

  //Aggiorna il DOM per mostrare all'utente il tempo rimanente
  timerEl.textContent = `Tempo rimasto: ${timeLeft}s`;

  //Avvia il countdown: esegue la funzione ogni 1000[ms] (1[s])
  timer = setInterval(() => {
    //Decrementa il tempo rimasto di 1[s]
    timeLeft--;

    //Aggiorna il testo nel DOM per mostrare all'utente il tempo aggiornato
    timerEl.textContent = `Tempo rimasto: ${timeLeft}s`;

    //Controlla se il timer è terminato
    if (timeLeft <= 0) {
      // Ferma il timer
      clearInterval(timer);

      //Azzera le risp_cons poichè l'utente non ha risposto in tempo
      risp_cons = 0;

      //Mostra messaggio di risposta sbagliata nel DOM
      scoreEl.textContent = "Tempo scaduto! Non è più possibile rispondere";

      //Applica la classe CSS "wrong" per colorare il messaggio in rosso
      scoreEl.className = "wrong";

      //Disabilita i pulsanti delle risposte per impedire ulteriori click
      disableAnswerButtons();

      //Mostra il pulsante "Prossima" per permettere all'utente di continuare
      nextBtn.style.display = "block";
    }
  }, 1000); // 1000 [ms] = 1 [s]
}

//Salva i risultati in localstorage
function saveResultsToLocalStorage(finalScore) {
  //Salva l'ultimo risultato con data
  const last = { score: finalScore, date: new Date().toLocaleString() }; //toISOString no vedi Note_Timer.md
  localStorage.setItem("quiz:lastScore", JSON.stringify(last));

  //Gestione record
  //Aggiorna l'high score se necessario
  const prevHigh = Number(localStorage.getItem("quiz:highScore") || 0);
  if (finalScore > prevHigh) {
    localStorage.setItem("quiz:highScore", String(finalScore));
  }
  //Ritorna il valore aggiornato dell'high score
  return Math.max(finalScore, prevHigh);
}

//Legge high score da local storage
function getHighScore() {
  return Number(localStorage.getItem("quiz:highScore") || 0);
}

function saveQuizHistory(finalScore) {
  //Crea un oggetto che rappresenta un singolo quiz completato
  const entry = {
    score: finalScore, // punteggio ottenuto in questo quiz
    date: new Date().toLocaleString(), // data e ora locali in cui il quiz è stato completato
    totalQuestions: quizData.length, // numero totale di domande del quiz
  };

  // Legge la cronologia esistente dal localStorage
  // Se non esiste nulla, inizializza come array vuoto
  const history = JSON.parse(localStorage.getItem("quiz:history") || "[]");

  // Aggiunge il nuovo quiz alla fine dell'array della cronologia
  history.push(entry);

  // Mantiene solo gli ultimi 10 quiz
  // Se ci sono più di 10 elementi, rimuove il primo (il più vecchio)
  while (history.length > 10) {
    // rimuove il quiz più vecchio dall'inizio dell'array
    history.shift();
  }

  // Salva la cronologia aggiornata nel localStorage
  //Si converte l'array in stringa JSON per poterlo salvare
  localStorage.setItem("quiz:history", JSON.stringify(history));
}

// Funzione per leggere la cronologia dei quiz completati
function getQuizHistory() {
  // Restituisce l'array dei quiz completati dal localStorage
  // Se non è popolato, restituisce un array vuoto
  return JSON.parse(localStorage.getItem("quiz:history") || "[]");
}

function showHistory() {
  // Svuota contenitore per ricreare le cards da zero
  cardsContainer.innerHTML = "";

  // Legge cronologia dal localStorage
  let history = getQuizHistory();

  // Ordina per data dal più recente al più vecchio con sort
  history = history.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Prende solo i 10 più recenti
  history = history.slice(0, 10);

  if (history.length === 0) {
    cardsContainer.innerHTML = `<p>Nessun quiz completato</p>`;
  } else {
    // Per ogni elemento della cronologia crea una card visiva
    history.forEach((entry) => {
      //Crea un nuovo <div> che conterrà i dettagli del singolo quiz.
      const card = document.createElement("div");
      //Aggiunge la classe CSS "history-card" per lo stile della card
      card.classList.add("history-card");

      //Popola la card con la data, il punteggio e il totale delle domande.
      //Usa template literal per inserire i valori dell'entry.
      card.innerHTML = `
        <p><strong>Data:</strong> ${entry.date}</p>
        <p class="score">Punteggio: ${entry.score}</p>
        <p class="total">Domande totali: ${entry.totalQuestions}</p>
      `;
      //Aggiunge la card appena creata al contenitore delle card nel DOM
      cardsContainer.appendChild(card);
    });
  }
  //Rende visibile il contenitore principale della cronologia
  historyDiv.style.display = "block";
}

//Funzione: carica/mostra una domanda
function loadQuestion() {
  //svuota la lista delle risposte da ventuali domande precedenti
  answersEl.innerHTML = "";

  //svuola il feedback sotto
  scoreEl.textContent = "";

  //Ricava l'oggetto domanda corrente partendo dall'indice
  const q = quizData[currentQuestion];

  //Mostra il testo della domanda nel relativo contenitore
  questionEl.textContent = q.question;

  //Per ogni risposta disponibile...
  q.answers.forEach((answer, index) => {
    // Crea un <li> per mantenere pulita la lista
    let li = document.createElement("li");

    //Crea un pulsante per la risposta
    let btn = document.createElement("button");

    // Testo del pulsante = testo della risposta
    btn.textContent = answer;

    // Assegna una funzione al clic del pulsante btn quando l'utente clicca
    // su questa risposta,viene chiamata la funzione checkAnswer, passa
    // come parametro index,cioè l'indice della risposta selezionata
    btn.onclick = () => checkAnswer(index);

    // Aggiunge l'elemento <li> appena creato alla lista <ul> delle risposte
    // (answersEl) nel DOM, in questo modo il pulsante della risposta diventa visibile nella pag
    li.appendChild(btn);
    answersEl.appendChild(li);
  });

  //Avvia il timer ad ogni nuova domanda
  startTimer();
}

// Funzione: verifica la risposta
function checkAnswer(index) {
  //Ferma il timer quando l'utente risponde
  clearInterval(timer);

  //Recuperiamo la domanda corrente
  const q = quizData[currentQuestion];

  //Se l'indice coincide con quello corretto allora incrementa il punteggio
  if (index === q.correct) {
    //Incrementa il contatore delle risposte corrette consecutive
    risp_cons++;

    //Bonus per risposte consecutive
    //Se la risp_cons è maggiore di 1, assegna un bonus pari a (risp_cons - 1);
    //altrimenti bonus = 0
    const bonus = risp_cons > 1 ? risp_cons - 1 : 0;

    //Aggiunge al punteggio 1 punto base + eventuale bonus per risp_cons
    score += 1 + bonus;

    //Mostra un messaggio all'utente indicando che la risposta è corretta e il bonus guadagnato
    scoreEl.textContent = `Risposta corretta! Bonus risposte consecutive: ${bonus}`;

    //Applica la classe CSS "correct" per colorare il messaggio di verde
    scoreEl.className = "correct";
  } else {
    risp_cons = 0; // reset risp_cons
    //Se la risposta è sbagliata, azzera il contatore di risp_cons

    //Mostra un messaggio all'utente indicando che la risposta è sbagliata
    scoreEl.textContent = "Risposta sbagliata";

    //Applica la classe CSS "wrong" per colorare il messaggio di rosso
    scoreEl.className = "wrong";
  }

  //Disabilita i bottoni per evitare doppio click
  disableAnswerButtons();

  //Rende visibile il pulsante "Prossima" per permettere all'utente di passare alla domanda successiva
  nextBtn.style.display = "block";
}

//Gestione del pulsante prossima
nextBtn.addEventListener("click", () => {
  //Se ci sono ancora domande...
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    loadQuestion();
    updateProgress();
    nextBtn.style.display = "none";
  } else {
    //Fine del quiz: verificare che la barra arrivi a 100%
    //Indica stato "completato"
    currentQuestion = quizData.length;
    //Pct sarà 100
    updateProgress();

    //Se non ci sono più domande mostra la schermata finale
    questionEl.textContent = "Quiz completato";
    answersEl.innerHTML = "";

    //Mostra il punteggio totale ottenuto
    scoreEl.textContent = `Hai totalizzato ${score} / ${quizData.length}`;
    nextBtn.style.display = "none";

    showResults();

    //Aggiorna la barra di avanzamento finale
    progressBar.style.width = `100%`;
  }
});

//Mostra risultati finali
function showResults() {
  //Segna il quiz come completato
  currentQuestion = quizData.length;
  updateProgress();

  //Pulizia UI
  questionEl.textContent = "Quiz completato!";
  answersEl.innerHTML = "";
  nextBtn.style.display = "none";

  //Salva risultato + aggiorna high score in modo centralizzato
  const high = saveResultsToLocalStorage(score);

  //Mostra la schermata finale
  resultsBox.style.display = "block";
  finalScoreEl.textContent = `Punteggio finale: ${score} / ${quizData.length}`;
  highScoreEl.textContent = `Record assoluto: ${high}`;

  //Mostra cronologia
  saveQuizHistory(score);
  showHistory();
}

//Pulsanti extra
restartBtn.addEventListener("click", () => {
  score = 0;
  risp_cons = 0;
  currentQuestion = 0;
  resultsBox.style.display = "none";
  //Nasconde la cronologia nella pagina
  document.getElementById("history").style.display = "none";
  loadQuestion();
  nextBtn.style.display = "none";
});

clearStorageBtn.addEventListener("click", () => {
  localStorage.clear();
  alert("LocalStorage svuotato!");
});

//Avvio dell'app: carica la prima domanda
loadQuestion();
nextBtn.style.display = "none";
