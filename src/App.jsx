import { useState, useMemo } from 'react';
import { data, theory } from './data';
import './index.css';

function App() {
  const [view, setView] = useState('home'); 
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedTheory, setExpandedTheory] = useState(null);
  
  // Flashcards state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Helper to get all questions flat
  const allQuestions = useMemo(() => {
    return data.flatMap(topic => topic.questions);
  }, []);

  const startFlashcards = (topicIndex) => {
    setSelectedTopic(topicIndex);
    setCurrentQuestionIndex(0);
    setIsFlipped(false);
    setView('flashcards');
  };

  const nextFlashcard = () => {
    if (currentQuestionIndex < data[selectedTopic].questions.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 150);
    }
  };

  const prevFlashcard = () => {
    if (currentQuestionIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentQuestionIndex(prev => prev - 1), 150);
    }
  };

  const startQuizSetup = () => {
    setView('quiz-setup');
  };

  const generateQuiz = (numQuestions) => {
    let shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, numQuestions);

    const questionsWithOptions = selected.map(q => {
      let options = [q.a];
      let otherAnswers = allQuestions.filter(other => other.a !== q.a).map(o => o.a);
      otherAnswers.sort(() => 0.5 - Math.random());
      options.push(...otherAnswers.slice(0, 3));
      options.sort(() => 0.5 - Math.random());
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
    if (option === quizQuestions[quizIndex].a) {
      setQuizScore(prev => prev + 1);
    }
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

  const toggleTheory = (index) => {
    if (expandedTheory === index) setExpandedTheory(null);
    else setExpandedTheory(index);
  };

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
            <div className="menu-card small-card" onClick={() => setView('theory')}>
              <div className="icon-wrapper">📜</div>
              <h2>Teoria</h2>
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

      {view === 'theory' && (
        <main className="theory-view">
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="view-header">
            <h2>📜 Streszczenia Referatów</h2>
            <p>Pigułka wiedzy, która pomoże Ci ułożyć pytania w logiczną całość.</p>
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
            <p>Mamy w bazie łącznie <strong>{allQuestions.length} pytań</strong> rozbitych na {data.length} tematów.</p>
            <div className="timeline">
              <div className="timeline-item">
                <span className="dot"></span>
                <strong>Pierwsze czytanie (ok. 1-1.5h):</strong> Przejście przez wszystkie tematy w trybie fiszek. Część rzeczy od razu naturalnie zapamiętasz.
              </div>
              <div className="timeline-item">
                <span className="dot"></span>
                <strong>Drugie przejście (ok. 1h):</strong> Ponowne przejrzenie. Będziesz już pamiętać około 50-60% odpowiedzi.
              </div>
              <div className="timeline-item">
                <span className="dot"></span>
                <strong>Utrwalenie w Quizie (ok. 45-60 min):</strong> Rozwiązanie 3-4 quizów. Mózg rozpoznaje prawidłowe odpowiedzi i buduje żelazne skojarzenia.
              </div>
            </div>
            <p className="summary-text">Razem: około <strong>3 do 4 godzin</strong> solidnej nauki. Najlepszy efekt osiągniesz rozbijając to na krótsze sesje!</p>
          </div>
          
          <div className="info-card verification-card">
            <h3>🛡️ O bazie pytań</h3>
            <p>Baza została dokładnie zweryfikowana z dwóch dostarczonych plików PDF (ponad 120 pytań z tabeli i notatek). Wszystkie powtórzenia zostały złączone w spójne bloki wiedzy. Z bazy wykluczono tematy, które nie obowiązywały w wymaganym spisie referatów.</p>
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
                  <h3>{topicData.topic}</h3>
                </div>
                <div className="theory-content">
                  {topicData.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                      <div style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>{qIdx + 1}. {q.q}</div>
                      <div style={{color: '#ddd'}}>{q.a}</div>
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

      {view === 'flashcards' && selectedTopic !== null && (
        <main className="flashcard-view">
          <button className="back-btn" onClick={() => setView('topics')}>← Wróć do tematów</button>
          
          <div className="progress-container">
            <div className="progress-bar" style={{width: `${((currentQuestionIndex + 1) / data[selectedTopic].questions.length) * 100}%`}}></div>
          </div>
          <div className="progress-text">
            Pytanie {currentQuestionIndex + 1} z {data[selectedTopic].questions.length}
          </div>

          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div className="card-decoration"></div>
                <span className="tap-hint">Tapnij, aby obrócić</span>
                <h2 className="question-text">
                  {data[selectedTopic].questions[currentQuestionIndex].q}
                </h2>
              </div>
              <div className="flip-card-back">
                <div className="answer-text">
                  {data[selectedTopic].questions[currentQuestionIndex].a}
                </div>
              </div>
            </div>
          </div>

          <div className="controls">
            <button 
              className="nav-btn" 
              onClick={prevFlashcard}
              disabled={currentQuestionIndex === 0}
            >
              Poprzednie
            </button>
            <button 
              className="nav-btn primary-btn" 
              onClick={nextFlashcard}
              disabled={currentQuestionIndex === data[selectedTopic].questions.length - 1}
            >
              Następne
            </button>
          </div>
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
