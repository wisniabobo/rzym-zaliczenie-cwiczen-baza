import { useState, useMemo, useEffect, useCallback } from 'react';
import { data, theory } from './data';
import './index.css';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function App() {
  const [view, setView] = useState('home');
  const [expandedTheory, setExpandedTheory] = useState(null);
  const toggleTheory = (index) => setExpandedTheory(expandedTheory === index ? null : index);

  // Flashcards (deck-based, simple)
  const [deck, setDeck] = useState([]);
  const [deckTitle, setDeckTitle] = useState('');
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const allQuestions = useMemo(() => data.flatMap(topic => topic.questions), []);

  const openDeck = (questions, title) => {
    setDeck(questions);
    setDeckTitle(title);
    setCardIdx(0);
    setIsFlipped(false);
    setView('flashcards');
  };
  const startFlashcards = (topicIndex) => openDeck(data[topicIndex].questions, data[topicIndex].topic);
  const startCram = () => openDeck(shuffle(allQuestions), 'Wszystkie pytania — tryb cram 🔀');

  const nextFlashcard = useCallback(() => {
    setIsFlipped(false);
    setCardIdx(prev => Math.min(prev + 1, deck.length - 1));
  }, [deck.length]);

  const prevFlashcard = useCallback(() => {
    setIsFlipped(false);
    setCardIdx(prev => Math.max(prev - 1, 0));
  }, []);

  // Keyboard control: Space = flip, arrows = navigate
  useEffect(() => {
    if (view !== 'flashcards') return;
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(f => !f); }
      else if (e.key === 'ArrowRight') nextFlashcard();
      else if (e.key === 'ArrowLeft') prevFlashcard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, nextFlashcard, prevFlashcard]);

  const startQuizSetup = () => setView('quiz-setup');

  const generateQuiz = (numQuestions) => {
    let shuffled = shuffle(allQuestions);
    let selected = shuffled.slice(0, numQuestions);
    const questionsWithOptions = selected.map(q => {
      let options = [q.a];
      let otherAnswers = allQuestions.filter(other => other.a !== q.a).map(o => o.a);
      otherAnswers = shuffle(otherAnswers);
      options.push(...otherAnswers.slice(0, 3));
      options = shuffle(options);
      return { ...q, options };
    });
    setQuizQuestions(questionsWithOptions);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setView('quiz');
  };

  const handleQuizAnswer = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === quizQuestions[quizIndex].a) setQuizScore(prev => prev + 1);
  };

  const nextQuizQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setView('quiz-summary');
    }
  };

  const card = deck[cardIdx];

  return (
    <div className="app-container">
      <header className="header" onClick={() => setView('home')} style={{cursor: 'pointer'}}>
        <h1>Imperium Romanum</h1>
        <p>Aplikacja do nauki historii prawa rzymskiego</p>
      </header>

      {view === 'home' && (
        <main className="menu-view">
          <div className="menu-card" onClick={() => setView('topics')}>
            <div className="icon-wrapper">📚</div>
            <h2>Nauka z fiszek</h2>
            <p>Przeglądaj pytania z podziałem na konkretne tematy i odkrywaj odpowiedzi.</p>
          </div>
          <div className="menu-card quiz-card" onClick={startQuizSetup}>
            <div className="icon-wrapper">🎯</div>
            <h2>Quiz ABCD</h2>
            <p>Sprawdź swoją wiedzę w losowym teście wyboru ze wszystkich tematów.</p>
          </div>
          <div className="menu-row">
            <div className="menu-card small-card plan-card" onClick={() => setView('plan')}>
              <div className="icon-wrapper">⚡</div>
              <h2>Plan 3h</h2>
            </div>
            <div className="menu-card small-card" onClick={() => setView('theory')}>
              <div className="icon-wrapper">📜</div>
              <h2>Streszczenia</h2>
            </div>
            <div className="menu-card small-card" onClick={() => setView('list-all')}>
              <div className="icon-wrapper">📋</div>
              <h2>Wszystkie Pytania</h2>
            </div>
            <div className="menu-card small-card" onClick={() => setView('info')}>
              <div className="icon-wrapper">ℹ️</div>
              <h2>Info</h2>
            </div>
          </div>
        </main>
      )}

      {view === 'plan' && (
        <main className="theory-view">
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="view-header">
            <h2>⚡ Plan nauki w 3 godziny (od zera, bez quizu)</h2>
            <p>Egzamin: 5 pytań z bazy. Metoda: aktywne przypominanie — mów/pisz odpowiedź Z PAMIĘCI, zanim obrócisz kartę.</p>
          </div>
          <div className="plan-list">
            <div className="plan-step">
              <span className="plan-time">0:00–0:20</span>
              <div><strong>👀 Spokojne pierwsze przejście.</strong> Przejdź wszystkie fiszki na luzie (Spacja = obróć, → dalej). Tylko czytasz pytanie i odpowiedź — niczego nie kujesz. Chodzi o złapanie, „o co chodzi" w każdym z 8 tematów.</div>
            </div>
            <div className="plan-step">
              <span className="plan-time">0:20–1:30</span>
              <div><strong>📚 Drugie przejście — aktywnie, temat po temacie.</strong> Czytasz pytanie i <b>mówisz odpowiedź na głos ZANIM obrócisz</b>. Dopiero potem sprawdzasz. To (nie bierne czytanie) wgrywa wiedzę.</div>
            </div>
            <div className="plan-step">
              <span className="plan-time">1:30–1:40</span>
              <div><strong>☕ Przerwa.</strong> Bez telefonu. Mózg utrwala w tle.</div>
            </div>
            <div className="plan-step">
              <span className="plan-time">1:40–2:30</span>
              <div><strong>✍️ Trzecie przejście + kartka.</strong> Skup się na tematach, które idą słabo. Daty i imiona, które nie wchodzą — <b>wypisz ręcznie</b> i zrób mnemonik (niżej). Ręka pamięta lepiej niż oko.</div>
            </div>
            <div className="plan-step">
              <span className="plan-time">2:30–2:55</span>
              <div><strong>🧠 Recytacja z pamięci (najmocniejsze).</strong> Zamknij fiszki. Dla każdego z 8 tematów powiedz/wypisz z głowy wszystko, co pamiętasz. Potem otwórz „Wszystkie Pytania" i sprawdź dziury.</div>
            </div>
            <div className="plan-step">
              <span className="plan-time">2:55–3:00</span>
              <div><strong>✅ Ostatni rzut.</strong> Tylko to, co wciąż kuleje, + przeczytaj mnemoniki raz.</div>
            </div>
          </div>
          <div className="plan-tip">
            <strong>💡 Mnemoniki:</strong> Karakalla → <b>212</b> obywatelstwo, ojciec <b>Septymiusz Sewer</b> + matka <b>Julia Domna</b>, brat <b>Geta</b>. Więźniowie → <b>320</b> Konstantyn (światło dzienne), <b>340</b> Konstancjusz (M/K osobno), <b>529</b> Justynian (koniec więzień prywatnych). Adopcja → <b>18 lat</b> różnicy = <i>plena pubertas</i>, słowa <b>Cycerona</b>. Aborcja → reskrypt <b>198–211</b> Sewer + Karakalla (chodziło o prawo OJCA). Obywatelstwo Italii → <b>89 p.n.e.</b> → szczyt: <b>212</b> Constitutio Antoniniana.
          </div>
        </main>
      )}

      {view === 'theory' && (
        <main className="theory-view">
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="view-header">
            <h2>📜 Streszczenia Referatów</h2>
            <p>Po jednym na każdy z 8 referatów — oparte wyłącznie na faktach z bazy i materiałów referatów.</p>
          </div>
          <div className="theory-list">
            {theory.map((item, index) => (
              <div
                key={index}
                className={`theory-card ${expandedTheory === index ? 'expanded' : ''}`}
                onClick={() => toggleTheory(index)}
              >
                <div className="theory-card-header">
                  <h3>{item.topic}</h3>
                  <span className="toggle-icon">{expandedTheory === index ? '−' : '+'}</span>
                </div>
                {expandedTheory === index && (
                  <div className="theory-content">
                    <p>{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      )}

      {view === 'info' && (
        <main className="info-view">
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="info-card">
            <div className="icon-wrapper large">⏱️</div>
            <h2>Ile czasu zajmie Ci nauka?</h2>
            <p>Mamy w bazie łącznie <strong>{allQuestions.length} pytań</strong> rozbitych na {data.length} tematów (8 referatów + pytania z pierwszych zajęć).</p>
            <div className="timeline">
              <div className="timeline-item">
                <span className="dot"></span>
                <strong>Pierwsze czytanie (ok. 1-1.5h):</strong> Przejście przez wszystkie tematy w trybie fiszek. Część rzeczy od razu naturalnie zapamiętasz.
              </div>
              <div className="timeline-item">
                <span className="dot"></span>
                <strong>Drugie przejście (ok. 1h):</strong> Ponowne przejrzenie z odpowiadaniem z pamięci. Będziesz już pamiętać około 50-60% odpowiedzi.
              </div>
              <div className="timeline-item">
                <span className="dot"></span>
                <strong>Recytacja z pamięci (ok. 45-60 min):</strong> Mówienie odpowiedzi z głowy i sprawdzanie w „Wszystkich Pytaniach". Mózg buduje trwałe skojarzenia.
              </div>
            </div>
            <p className="summary-text">Razem: około <strong>3 do 4 godzin</strong> solidnej nauki. Masz mało czasu? Otwórz <strong>Plan 3h ⚡</strong> z menu głównego.</p>
          </div>

          <div className="info-card verification-card">
            <h3>🛡️ O bazie pytań</h3>
            <p>Każde pytanie i każda odpowiedź pochodzą słowo w słowo z dwóch dostarczonych plików PDF (sprawdzone automatycznie — treść występuje dosłownie w jednym z plików). Pytania z obu baz połączono bez przeredagowywania, a powtórzenia złączono w jeden wpis. Nic nie jest dopisane „od siebie".</p>
          </div>
        </main>
      )}

      {view === 'list-all' && (
        <main className="list-all-view" style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="view-header">
            <h2>📋 Wszystkie Pytania i Odpowiedzi</h2>
            <p>Pełna baza wszystkich pytań w jednym miejscu.</p>
          </div>
          <div className="all-questions-list">
            {data.map((topicData, topicIdx) => (
              <div key={topicIdx} className="theory-card expanded">
                <div className="theory-card-header">
                  <h3>{topicData.topic} <span className="badge">{topicData.questions.length}</span></h3>
                </div>
                <div className="theory-content">
                  {topicData.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                      <div style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>{qIdx + 1}. {q.q}</div>
                      <div style={{color: '#ddd', whiteSpace: 'pre-line'}}>{q.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {view === 'topics' && (
        <main className="topics-view">
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="view-header">
            <h2>Wybierz temat</h2>
            <button className="cram-btn" onClick={startCram}>🔀 Ucz się wszystkiego ({allQuestions.length})</button>
          </div>
          <div className="topics-grid">
            {data.map((topicData, index) => (
              <div
                key={index}
                className="glass-card topic-item"
                onClick={() => startFlashcards(index)}
              >
                <div className="topic-content">
                  <h3>{topicData.topic}</h3>
                  <span className="badge">{topicData.questions.length} pytań</span>
                </div>
                <div className="topic-arrow">→</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {view === 'flashcards' && card && (
        <main className="flashcard-view">
          <button className="back-btn" onClick={() => setView('topics')}>← Wróć do tematów</button>

          <div className="deck-title">{deckTitle}</div>

          <div className="progress-container">
            <div className="progress-bar" style={{width: `${((cardIdx + 1) / deck.length) * 100}%`}}></div>
          </div>
          <div className="progress-text">
            Pytanie {cardIdx + 1} z {deck.length}
          </div>

          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div className="card-decoration"></div>
                <span className="tap-hint">Tapnij / Spacja, aby obrócić</span>
                <h2 className="question-text">{card.q}</h2>
              </div>
              <div className="flip-card-back">
                <div className="answer-text">{card.a}</div>
              </div>
            </div>
          </div>

          <div className="controls">
            <button className="nav-btn" onClick={prevFlashcard} disabled={cardIdx === 0}>← Poprzednie</button>
            <button className="nav-btn primary-btn" onClick={nextFlashcard} disabled={cardIdx === deck.length - 1}>Następne →</button>
          </div>
          <p className="kbd-hint">Klawisze: <kbd>Spacja</kbd> obróć · <kbd>→</kbd> / <kbd>←</kbd> nawigacja</p>
        </main>
      )}

      {view === 'quiz-setup' && (
        <main className="quiz-setup-view">
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="icon-wrapper large">🎯</div>
          <h2>Wybierz liczbę pytań do Quizu:</h2>
          <p>Mamy łącznie {allQuestions.length} pytań w bazie.</p>
          <div className="quiz-options">
            <button className="quiz-btn" onClick={() => generateQuiz(10)}>10 pytań</button>
            <button className="quiz-btn" onClick={() => generateQuiz(20)}>20 pytań</button>
            <button className="quiz-btn" onClick={() => generateQuiz(50)}>50 pytań</button>
            <button className="quiz-btn highlight" onClick={() => generateQuiz(allQuestions.length)}>Wszystkie ({allQuestions.length})</button>
          </div>
        </main>
      )}

      {view === 'quiz' && quizQuestions.length > 0 && (
        <main className="quiz-play-view">
          <button className="back-btn" onClick={() => setView('quiz-setup')}>← Przerwij quiz</button>

          <div className="quiz-header-stats">
            <div className="stat">
              <span className="label">Wynik</span>
              <span className="value score">{quizScore}</span>
            </div>
            <div className="stat">
              <span className="label">Pytanie</span>
              <span className="value">{quizIndex + 1} / {quizQuestions.length}</span>
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-bar accent" style={{width: `${((quizIndex + 1) / quizQuestions.length) * 100}%`}}></div>
          </div>

          <div className="quiz-question-container">
            <h2 className="quiz-question">{quizQuestions[quizIndex].q}</h2>
          </div>

          <div className="quiz-answers">
            {quizQuestions[quizIndex].options.map((opt, idx) => {
              let btnClass = "quiz-option-btn";
              if (isAnswered) {
                if (opt === quizQuestions[quizIndex].a) btnClass += " correct";
                else if (opt === selectedAnswer) btnClass += " wrong";
                else btnClass += " disabled";
              }
              return (
                <button
                  key={idx}
                  className={btnClass}
                  onClick={() => handleQuizAnswer(opt)}
                  disabled={isAnswered}
                >
                  <span className="option-letter">{['A', 'B', 'C', 'D'][idx]}</span>
                  <span className="option-text">{opt}</span>
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div className="quiz-next-container">
              <button className="nav-btn primary-btn pulse" onClick={nextQuizQuestion}>
                {quizIndex < quizQuestions.length - 1 ? 'Następne pytanie →' : 'Zakończ quiz'}
              </button>
            </div>
          )}
        </main>
      )}

      {view === 'quiz-summary' && (
        <main className="quiz-summary-view">
          <h2>Koniec Quizu! 🎉</h2>
          <div className="score-circle">
            <span>{quizScore}</span>
            <span className="divider">/</span>
            <span>{quizQuestions.length}</span>
          </div>
          <p className="score-percentage">Twój wynik to <strong>{Math.round((quizScore / quizQuestions.length) * 100)}%</strong></p>

          <div className="feedback-message">
            {quizScore / quizQuestions.length >= 0.8 ? 'Świetna robota! Jesteś gotowa na egzamin.' :
             quizScore / quizQuestions.length >= 0.5 ? 'Niezły wynik! Jeszcze trochę powtórek i będzie idealnie.' :
             'Początki bywają trudne. Przejrzyj jeszcze raz fiszki i spróbuj ponownie!'}
          </div>

          <div className="controls">
            <button className="nav-btn" onClick={() => setView('quiz-setup')}>Zagraj ponownie</button>
            <button className="nav-btn primary-btn" onClick={() => setView('home')}>Wróć do menu</button>
          </div>
        </main>
      )}

      <footer className="footer">
        <p>Created by wisnia</p>
      </footer>
    </div>
  );
}

export default App;
