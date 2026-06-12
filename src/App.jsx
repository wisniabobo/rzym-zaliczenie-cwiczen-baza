import { useState } from 'react';
import { data } from './data';
import './index.css';

function App() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleTopicSelect = (index) => {
    setSelectedTopic(index);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
  };

  const handleBack = () => {
    setSelectedTopic(null);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < data[selectedTopic].questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Imperium Romanum</h1>
        <p>Aplikacja do nauki historii prawa rzymskiego</p>
      </header>

      {selectedTopic === null ? (
        <main>
          <div className="topics-grid">
            {data.map((topicData, index) => (
              <div 
                key={index} 
                className="glass-card"
                onClick={() => handleTopicSelect(index)}
              >
                <h3>{topicData.topic}</h3>
                <p>{topicData.questions.length} pytań</p>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="question-view">
          <button className="back-btn" onClick={handleBack}>
            ← Wróć do tematów
          </button>
          
          <div className="progress-indicator">
            Pytanie {currentQuestionIndex + 1} z {data[selectedTopic].questions.length}
          </div>

          <h2 className="question-text">
            {data[selectedTopic].questions[currentQuestionIndex].q}
          </h2>

          {!showAnswer ? (
            <button 
              className="answer-btn"
              onClick={() => setShowAnswer(true)}
            >
              Pokaż odpowiedź
            </button>
          ) : (
            <div className="answer-text">
              {data[selectedTopic].questions[currentQuestionIndex].a}
            </div>
          )}

          <div className="controls">
            <button 
              className="nav-btn" 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Poprzednie
            </button>
            <button 
              className="nav-btn" 
              onClick={nextQuestion}
              disabled={currentQuestionIndex === data[selectedTopic].questions.length - 1}
            >
              Następne
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
