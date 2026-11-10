
import { useEffect, useState } from 'react';
import './App.css';

function App() {

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/questions')
      .then(response => response.json())
      .then(data => {
        setQuestions(data.questions);
      })
      .catch(error => {
        console.error("Error fetching questions:", error);
      });
  }, []);

  return (

    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">QUNA<span>.</span></h1>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#questions">Explore</a>
          <a href="#ask">Ask Question</a>
        </div>

        <div className="nav-buttons">
          <button className="login-btn">Log In</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="hero-tag">WELCOME TO QUNA</p>

          <h2>
            Curious minds<br />
            <span>find answers here.</span>
          </h2>

          <p className="hero-description">
            Ask questions, share your knowledge, and learn
            something new every day.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Ask a Question</button>
            <button className="secondary-btn">Explore Questions</button>
          </div>
        </div>

        <div className="hero-illustration">
          <div className="illustration-circle">Q</div>
          <div className="floating-card card-one">✦ Share knowledge</div>
          <div className="floating-card card-two">♡ Learn together</div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="questions-section" id="questions">
        <div className="section-heading">
          <div>
            <p className="section-tag">COMMUNITY DISCUSSIONS</p>
            <h2>Explore Questions</h2>
          </div>

          <button className="view-btn">View all →</button>
        </div>

        <div className="question-list">
          
{questions.length > 0 ? (
  questions.map((question) => (
    <div className="question-card" key={question.id}>

      <span className="category">COMMUNITY QUESTION</span>

      <h3>{question.title}</h3>

      <p>{question.description}</p>

      <div className="question-footer">
        <span>Asked by {question.username}</span>
        <span>Question #{question.id}</span>
      </div>

    </div>
  ))
) : (
  <p>No questions available yet. Be the first to ask!</p>
)}

</div>
</section>

      {/* Footer */}
      <footer className="footer">
        <h2>QUNA.</h2>
        <p>Ask freely. Learn together. Grow smarter.</p>
      </footer>

    </div>
  );
}

export default App;
