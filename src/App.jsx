import { useState, useMemo } from 'react';
import { data } from './data';
import './index.css';

function App() {
  const [view, setView] = useState('home'); // home, topics, flashcards, quiz-setup, quiz, quiz-summary
  const [selectedTopic, setSelectedTopic] = useState(null);
  
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
    // Get random questions
    let shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, numQuestions);

    // Generate options for each
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

  return (
    <div className="app-container">
      <header className="header" onClick={() => setView('home')} style={{cursor: 'pointer'}}>
        <h1>Imperium Romanum</h1>
        <p>Aplikacja do nauki historii prawa rzymskiego</p>
      </header>

      {view === 'home' && (
        <main className="menu-view">
          <div className="menu-card" onClick={() => setView('topics')}>
            <h2>📚 Nauka z fiszek</h2>
            <p>Przeglądaj pytania z podziałem na konkretne tematy i odkrywaj odpowiedzi.</p>
          </div>
          <div className="menu-card quiz-card" onClick={startQuizSetup}>
            <h2>🎯 Quiz ABCD</h2>
            <p>Sprawdź swoją wiedzę w losowym teście wyboru ze wszystkich tematów.</p>
          </div>
        </main>
      )}

      {view === 'topics' && (
        <main>
          <button className="back-btn" onClick={() => setView('home')}>← Wróć do menu</button>
          <div className="topics-grid">
            {data.map((topicData, index) => (
              <div 
                key={index} 
                className="glass-card"
                onClick={() => startFlashcards(index)}
              >
                <h3>{topicData.topic}</h3>
                <p>{topicData.questions.length} pytań</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {view === 'flashcards' && selectedTopic !== null && (
        <main className="flashcard-view">
          <button className="back-btn" onClick={() => setView('topics')}>← Wróć do tematów</button>
          
          <div className="progress-indicator">
            {currentQuestionIndex + 1} / {data[selectedTopic].questions.length}
          </div>

          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
            <div className="flip-card-inner">
              <div className="flip-card-front">
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
              className="nav-btn" 
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
          <h2>Wybierz liczbę pytań do Quizu:</h2>
          <p>Mamy łącznie {allQuestions.length} pytań w bazie.</p>
          <div className="quiz-options">
            <button className="quiz-btn" onClick={() => generateQuiz(10)}>10 pytań</button>
            <button className="quiz-btn" onClick={() => generateQuiz(20)}>20 pytań</button>
            <button className="quiz-btn" onClick={() => generateQuiz(50)}>50 pytań</button>
            <button className="quiz-btn" onClick={() => generateQuiz(allQuestions.length)}>Wszystkie ({allQuestions.length})</button>
          </div>
        </main>
      )}

      {view === 'quiz' && quizQuestions.length > 0 && (
        <main className="quiz-play-view">
          <button className="back-btn" onClick={() => setView('quiz-setup')}>← Przerwij quiz</button>
          <div className="progress-indicator">
            Wynik: {quizScore} | Pytanie {quizIndex + 1} / {quizQuestions.length}
          </div>

          <h2 className="quiz-question">{quizQuestions[quizIndex].q}</h2>

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
                  {opt}
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div className="quiz-next-container">
              <button className="nav-btn action" onClick={nextQuizQuestion}>
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
          <p>Twój wynik to {Math.round((quizScore / quizQuestions.length) * 100)}%</p>
          <div className="controls">
            <button className="nav-btn" onClick={() => setView('quiz-setup')}>Zagraj ponownie</button>
            <button className="nav-btn action" onClick={() => setView('home')}>Wróć do menu</button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
