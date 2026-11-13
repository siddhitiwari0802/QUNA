
import { useEffect, useState } from 'react';
import './App.css';

function App() {

  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editAnswerContent, setEditAnswerContent] = useState("");
  const [editCategory, setEditCategory] = useState("Other");
  const [editTags, setEditTags] = useState([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [answers, setAnswers] = useState([]);
  const [answerContent, setAnswerContent] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [message, setMessage] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [accessToken, setAccessToken] = useState(
  sessionStorage.getItem("access_token")
);

const [loggedInUser, setLoggedInUser] = useState(() => {
  const savedUser = sessionStorage.getItem("logged_in_user");
  return savedUser ? JSON.parse(savedUser) : null;
});

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

  const filteredQuestions = questions.filter((question) => {
  const search = searchTerm.toLowerCase();

  return (
    question.title.toLowerCase().includes(search) ||
    question.description.toLowerCase().includes(search)
  );
});


async function handleRegister(e) {
  e.preventDefault();

  if (
    !registerName.trim() ||
    !registerEmail.trim() ||
    !registerPassword.trim()
  ) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Registration failed.");
      return;
    }

    alert("Registration successful! You can now log in.");

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setShowRegister(false);

  } catch (error) {
    console.error("Registration error:", error);
    alert("Could not connect to the server.");
  }
}


async function handleLogin(e) {
  e.preventDefault();

  if (!loginEmail.trim() || !loginPassword.trim()) {
    alert("Please enter your email and password.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Login failed.");
      return;
    }

    setLoggedInUser(data.user);
    setAccessToken(data.access_token);
    sessionStorage.setItem("access_token", data.access_token);
    sessionStorage.setItem(
        "logged_in_user",
        JSON.stringify(data.user)
);

    setLoginEmail("");
    setLoginPassword("");
    setShowLogin(false);

    alert("Login successful! Welcome, " + data.user.name);

  } catch (error) {
    console.error("Login error:", error);
    alert("Could not connect to the server.");
  }
}


async function handleEditAnswer(e) {
  e.preventDefault();

  if (!editAnswerContent.trim()) {
    alert("Answer cannot be empty.");
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/answers/${editingAnswer.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: editAnswerContent,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Could not update answer.");
      return;
    }

    alert("Answer updated successfully!");

    setEditingAnswer(null);
    setEditAnswerContent("");

    const updatedResponse = await fetch(
      `http://127.0.0.1:8000/questions/${selectedQuestion.id}/answers`
    );
    const updatedData = await updatedResponse.json();
    setAnswers(updatedData.answers);

  } catch (error) {
    console.error("Edit answer error:", error);
    alert("Could not connect to the server.");
  }
}

async function handleDeleteAnswer(answerId) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this answer?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/answers/${answerId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Could not delete answer.");
      return;
    }

    alert("Answer deleted successfully!");

    setAnswers((previousAnswers) =>
      previousAnswers.filter((answer) => answer.id !== answerId)
    );

  } catch (error) {
    console.error("Delete answer error:", error);
    alert("Could not connect to the server.");
  }
}


async function handleEditQuestion(e) {
  e.preventDefault();

  if (!editTitle.trim() || !editDescription.trim()) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/questions/${editingQuestion.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: editCategory,
          tags: editTags,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Could not update question.");
      return;
    }

    alert("Question updated successfully!");

    setEditingQuestion(null);
    setSelectedQuestion(null);

    const updatedResponse = await fetch(
      "http://127.0.0.1:8000/questions"
    );

    const updatedData = await updatedResponse.json();
    setQuestions(updatedData.questions);

  } catch (error) {
    console.error("Edit error:", error);
    alert("Could not connect to the server.");
  }
}


async function handleDeleteQuestion(questionId) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this question?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/questions/${questionId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Could not delete question.");
      return;
    }

    alert("Question deleted successfully!");

    setQuestions((previousQuestions) =>
      previousQuestions.filter(
        (question) => question.id !== questionId
      )
    );

    setSelectedQuestion(null);

  } catch (error) {
    console.error("Delete error:", error);
    alert("Could not connect to the server.");
  }
}

  
async function handleSubmit(e) {
  e.preventDefault();

  if (!title.trim() || !description.trim()) {
    setMessage("Please fill in both fields.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
},
      body: JSON.stringify({
        title: title,
        description: description,
        category: category,
        tags: tags
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.detail || "Could not post question.");
      return;
    }

    const updatedResponse = await fetch(
      "http://127.0.0.1:8000/questions"
    );

    const updatedData = await updatedResponse.json();

    setQuestions(updatedData.questions);
    setTitle("");
    setDescription("");
    setCategory("Other");
    setTags([]);
    setTagInput("");
    setMessage("");
    setShowForm(false);

    alert("Question posted successfully!");

  } catch (error) {
    console.error("Error:", error);
    setMessage("Could not connect to the server.");
  }
}

async function openQuestion(questionId) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/questions/${questionId}`
    );

    if (!response.ok) {
      alert("Could not load question details.");
      return;
    }

    const data = await response.json();

    setSelectedQuestion(data);
    const answerResponse = await fetch(
  `http://127.0.0.1:8000/questions/${questionId}/answers`
);

if (!answerResponse.ok) {
  alert("Could not load answers.");
  return;
}

const answerData = await answerResponse.json();

setAnswers(answerData.answers);
setAnswerContent('');
  } catch (error) {
    console.error("Error:", error);
    alert("Could not connect to the server.");
  }
}


async function handleAnswerSubmit(e) {
  e.preventDefault();

  if (!answerContent.trim()) {
    alert("Please write an answer first.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
},
      body: JSON.stringify({
        content: answerContent,
        question_id: selectedQuestion.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Could not submit answer.");
      return;
    }

    const answerResponse = await fetch(
      `http://127.0.0.1:8000/questions/${selectedQuestion.id}/answers`
    );

    const answerData = await answerResponse.json();

    setAnswers(answerData.answers);
    setAnswerContent("");

    alert("Answer submitted successfully!");

  } catch (error) {
    console.error("Error:", error);
    alert("Could not connect to the server.");
  }
}


  return (

    <div className="app">
      {selectedQuestion ? (
  <section className="question-details">
    <button
      className="secondary-btn"
      onClick={() => setSelectedQuestion(null)}
    >
      ← Back to Questions
    </button>

    <div className="details-card">
      <h1>{selectedQuestion.title}</h1>

      <p className="question-author">
        Asked by: {selectedQuestion.username}
      </p>

      {loggedInUser &&
 Number(selectedQuestion.user_id) === Number(loggedInUser.id) && (
  <div className="question-actions">
    <button
    className="edit-btn"
    onClick={() => {
    setEditTitle(selectedQuestion.title);
    setEditDescription(selectedQuestion.description);
    setEditCategory(selectedQuestion.category || "Other");
    setEditTags(selectedQuestion.tags || []);
    setEditTagInput("");
    setEditingQuestion(selectedQuestion);
  }}
>
  Edit
</button>

    <button
      className="delete-btn"
      onClick={() => handleDeleteQuestion(selectedQuestion.id)}
    >
      Delete Question
    </button>
  </div>
)}

   {editingQuestion && (
  <form
    className="edit-question-form"
    onSubmit={handleEditQuestion}
  >
    <h2>Edit Your Question</h2>

    <input
      type="text"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      placeholder="Question title"
    />

    <textarea
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      placeholder="Question description"
    />

    <label>Category</label>
    <select
      value={editCategory}
      onChange={(e) => setEditCategory(e.target.value)}
    >
      <option value="Other">Other</option>
      <option value="Programming">Programming</option>
      <option value="Python">Python</option>
      <option value="Java">Java</option>
      <option value="Web Development">Web Development</option>
      <option value="Database">Database</option>
      <option value="Artificial Intelligence">Artificial Intelligence</option>
      <option value="Machine Learning">Machine Learning</option>
      <option value="Data Science">Data Science</option>
    </select>

    <label>Custom Tags</label>
    <div className="tag-input-container">
      <input
        type="text"
        value={editTagInput}
        onChange={(e) => setEditTagInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();

            const newTag = editTagInput.trim();

            if (
              newTag &&
              !editTags.some(
                (tag) => tag.toLowerCase() === newTag.toLowerCase()
              )
            ) {
              setEditTags([...editTags, newTag]);
            }

            setEditTagInput("");
          }
        }}
        placeholder="Enter a tag and press Enter"
      />

      <button
        type="button"
        className="secondary-btn"
        onClick={() => {
          const newTag = editTagInput.trim();

          if (
            newTag &&
            !editTags.some(
              (tag) => tag.toLowerCase() === newTag.toLowerCase()
            )
          ) {
            setEditTags([...editTags, newTag]);
          }

          setEditTagInput("");
        }}
      >
        Add Tag
      </button>
    </div>

    <div className="selected-tags">
      {editTags.map((tag, index) => (
        <span className="tag-item" key={index}>
          {tag}
          <button
            type="button"
            onClick={() =>
              setEditTags(editTags.filter((_, i) => i !== index))
            }
          >
            ×
          </button>
        </span>
      ))}
    </div>

    <button className="primary-btn" type="submit">
      Save Changes
    </button>

    <button
      className="secondary-btn"
      type="button"
      onClick={() => setEditingQuestion(null)}
    >
      Cancel
    </button>
  </form>
)}


      <p className="question-description">
        {selectedQuestion.description}
      </p>

{/* Answer Form */}
<div className="answer-section">
  <h2>Write Your Answer 💜</h2>

  <form onSubmit={handleAnswerSubmit}>
    <textarea
      placeholder="Share your answer..."
      value={answerContent}
      onChange={(e) => setAnswerContent(e.target.value)}
    />

    <button className="primary-btn" type="submit">
      Submit Answer
    </button>
  </form>
</div>

{/* Existing Answers */}
<div className="existing-answers">
  <h2>Community Answers ({answers.length})</h2>

  {answers.length > 0 ? (
    answers.map((answer) => (
      <div className="answer-card" key={answer.id}>
        <p>{answer.content}</p>
        <p>Answered by: {answer.username}</p>

        {loggedInUser &&
          Number(answer.user_id) === Number(loggedInUser.id) && (
            <>
              <div className="answer-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingAnswer(answer);
                    setEditAnswerContent(answer.content);
                  }}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteAnswer(answer.id)}
                >
                  Delete
                </button>
              </div>

              {editingAnswer?.id === answer.id && (
                <form
                  className="edit-question-form"
                  onSubmit={handleEditAnswer}
                >
                  <textarea
                    value={editAnswerContent}
                    onChange={(e) => setEditAnswerContent(e.target.value)}
                    placeholder="Edit your answer..."
                  />

                  <button className="primary-btn" type="submit">
                    Save Changes
                  </button>

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => {
                      setEditingAnswer(null);
                      setEditAnswerContent("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </>
          )}
      </div>
    ))
  ) : (
    <p className="no-answers">
      No answers yet. Be the first to answer!
    </p>
  )}
</div>

    </div>
  </section>
) : (
  <>

      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">QUNA<span>.</span></h1>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#questions">Explore</a>
          <a href="#ask">Ask Question</a>
        </div>

        <div className="nav-buttons">
         {loggedInUser ? (
  <>
    <span className="welcome-user">
      Welcome, {loggedInUser.name}
    </span>

    <button
      className="login-btn"
      onClick={() => {
        setLoggedInUser(null);
        setAccessToken(null);

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("logged_in_user");

        alert("Logged out successfully!");
}}
    >
      Log Out
    </button>
  </>
) : (
  <>
    <button
      className="login-btn"
      onClick={() => setShowLogin(true)}
    >
      Log In
    </button>

    <button
      className="signup-btn"
      onClick={() => setShowRegister(true)}
    >
      Sign Up
    </button>
  </>
)}
        </div>
      </nav>


{/* Registration Form */}
{showRegister && (
  <section className="register-section">
    <form className="register-form" onSubmit={handleRegister}>
      <h2>Create Your Account 💜</h2>
      <p>Join the QUNA community and start sharing knowledge.</p>

      <input
        type="text"
        placeholder="Enter your name"
        value={registerName}
        onChange={(e) => setRegisterName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Enter your email"
        value={registerEmail}
        onChange={(e) => setRegisterEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Create a password"
        value={registerPassword}
        onChange={(e) => setRegisterPassword(e.target.value)}
      />

      <button className="primary-btn" type="submit">
        Create Account
      </button>

      <button
        className="secondary-btn"
        type="button"
        onClick={() => setShowRegister(false)}
      >
        Cancel
      </button>
    </form>
  </section>
)}

{showLogin && (
  <section className="login-section">
    <form className="login-form" onSubmit={handleLogin}>
      <h2>Welcome Back 💜</h2>
      <p>Log in to continue with QUNA.</p>

      <input
        type="email"
        placeholder="Enter your email"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter your password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
      />

      <button className="primary-btn" type="submit">
        Log In
      </button>

      <button
        className="secondary-btn"
        type="button"
        onClick={() => setShowLogin(false)}
      >
        Cancel
      </button>
    </form>
  </section>
)}


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
            <button
                className="primary-btn"
                onClick={() => setShowForm(true)}
                >
                  Ask a Question
            </button>
            <button className="secondary-btn">Explore Questions</button>
          </div>
        </div>

        <div className="hero-illustration">
          <div className="illustration-circle">Q</div>
          <div className="floating-card card-one">✦ Share knowledge</div>
          <div className="floating-card card-two">♡ Learn together</div>
        </div>
      </section>

      


{/* Ask Question Form */}
{showForm && (
  <section className="ask-form-section" id="ask">
    <form className="ask-form" onSubmit={handleSubmit}>
      <h2>Ask a Question 💜</h2>
      <p>Share your question with the QUNA community.</p>

      <input
        type="text"
        placeholder="Enter your question title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Describe your question..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Category Dropdown */}
      <label htmlFor="question-category">Select Category</label>
      <select
        id="question-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="Other">Other</option>
        <option value="Programming">Programming</option>
        <option value="Python">Python</option>
        <option value="Java">Java</option>
        <option value="Web Development">Web Development</option>
        <option value="Database">Database</option>
        <option value="Artificial Intelligence">Artificial Intelligence</option>
        <option value="Machine Learning">Machine Learning</option>
        <option value="Data Science">Data Science</option>
      </select>

      {/* Custom Tags */}
      <label htmlFor="question-tags">Custom Tags</label>
      <div className="tag-input-container">
        <input
          id="question-tags"
          type="text"
          placeholder="Type a tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              const newTag = tagInput.trim();

              if (
                newTag &&
                !tags.some(
                  (tag) => tag.toLowerCase() === newTag.toLowerCase()
                )
              ) {
                setTags([...tags, newTag]);
              }

              setTagInput("");
            }
          }}
        />

        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            const newTag = tagInput.trim();

            if (
              newTag &&
              !tags.some(
                (tag) => tag.toLowerCase() === newTag.toLowerCase()
              )
            ) {
              setTags([...tags, newTag]);
            }

            setTagInput("");
          }}
        >
          Add Tag
        </button>
      </div>

      {/* Display Added Tags */}
      <div className="selected-tags">
        {tags.map((tag, index) => (
          <span className="tag-item" key={index}>
            {tag}
            <button
              type="button"
              onClick={() =>
                setTags(tags.filter((_, i) => i !== index))
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="form-buttons">
        <button className="primary-btn" type="submit">
          Submit Question
        </button>

        <button
          className="secondary-btn"
          type="button"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </button>
      </div>

      {message && <p>{message}</p>}
    </form>
  </section>
)}




      {/* Questions Section */}
      <section className="questions-section" id="questions">
        <div className="section-heading">
          <div>
            <p className="section-tag">COMMUNITY DISCUSSIONS</p>
            <h2>Explore Questions</h2>
            <input
                type="text"
                className="search-input"
                placeholder="Search questions by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="view-btn">View all →</button>
        </div>

        <div className="question-list">
          
{filteredQuestions.length > 0 ? (
  filteredQuestions.map((question) => (
    <div
      className="question-card"
      key={question.id}
      onClick={() => openQuestion(question.id)}
    >
      <span className="category">
        {question.category || "Other"}
      </span>

      <h3>{question.title}</h3>

      <p>{question.description}</p>

      {question.tags && question.tags.length > 0 && (
        <div className="question-tags">
          {question.tags.map((tag, index) => (
            <span className="question-tag" key={index}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="question-footer">
        <span>Asked by {question.username}</span>
        <span>Question #{question.id}</span>
      </div>
    </div>
  ))
) : (
  <p>
    {searchTerm
      ? "No matching questions found. Try another keyword."
      : "No questions available yet. Be the first to ask!"}
  </p>
)}
 

</div>
</section>

      {/* Footer */}
      <footer className="footer">
        <h2>QUNA.</h2>
        <p>Ask freely. Learn together. Grow smarter.</p>
      </footer>
        </>
)}

    </div>
  );
}

export default App;
