import React, { useState,useEffect } from 'react';
import axios from 'axios';
import './AssessmentForm.css'

const questions = [
  {
    question: "Which of the following data structures allow insertion and deletion from both ends?",
    options: ["Queue", "Deque", "Stack", "Strings"],
    answer: "Deque"
  },
  {
    question: "What function is used to append a character at the back of a string in C++?",
    options: ["push_back()", "append()", "push()", "insert()"],
    answer: "push_back()"
  },
  {
    question: "When a pop() operation is called on an empty queue, what is the condition called?",
    options: ["overflow", "underflow", "syntax error", "garbage value"],
    answer: "underflow"
  },
  {
    question: "Which of the following data structures can be used to implement queues?",
    options: ["Stack", "Arrays", "Linked List", "All of the above"],
    answer: "All of the above"
  },
  {
    question: "Which of the following data structures finds its use in recursion?",
    options: ["Stack", "Queue", "Array", "Linked List"],
    answer: "Stack"
  }
];

const AssessmentForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [status, setStatus] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [userInfos, setUserInfos] = useState([]);
  const [showStudentScore, setShowStudentScore] = useState(false);

  const handleAnswerOptionClick = (answer) => {
    if (answer === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const startTest = async () => {
    // If user is admin
    if(name === 'admin' && invitationCode==='123456'){
      setShowStudentScore(true);
      return;
    }

    alert('Please allow the access of audio and video otherwise it will not get access of exam')
    setStatus('Performing camera and audio checks...');
    setIsTesting(true);

    try {
      // Get user's camera and audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Show user's camera feed
      const video = document.getElementById('video');
      video.srcObject = stream;
      video.play();

      setStatus('');
      const user = { name, email, invitationCode };
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const savedUser = await response.json();
        setStatus('Please be within the frame otherwise, Test will be stopped');
        setInterval(async () => {
          // Take screenshot of user's camera feed
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageUrl = canvas.toDataURL('image/png');

          // Save screenshot to server
          const imageResponse = await fetch(
            `http://localhost:5000/api/users/${savedUser._id}/images`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl }),
            }
          );

          if (imageResponse.ok) {
            setImageUrls([...imageUrls, imageUrl]);
          } else {
            console.error('Error adding image URL to user');
          }
        }, 30000); // Send image every 30 seconds
      } else {
        console.error('Error creating user');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() =>{
    axios.get("http://localhost:5000/api/users")
    .then(res=>setUserInfos(res.data))
    .catch(error=> console.log(error))
  },[])

  return (
    <div className="test_page">
      <div className='container'>
        {!isTesting&&!showStudentScore ? (<form className='detail_container'>
        <h1>Test Page</h1>
          <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          <label>Invitation Code:</label>
            <input
              type="text"
              value={invitationCode}
              onChange={(event) => setInvitationCode(event.target.value)}
            />
          <button type="button" onClick={startTest}>
            Start Test
          </button>
        </form>):!showStudentScore&&<div>Exam has been started</div>}
        <p>{status}</p>
        {isTesting && <video className='video' id="video" width="320" height="240" />}
        {imageUrls.length > 0 &&
          imageUrls.map((imageUrl, index) => (
            <img key={index} src={imageUrl} alt="Screenshot" />
          ))}

        {isTesting ? (showScore ? (
        <div className='score-section'>
          You scored {score} out of {questions.length}
        </div>
      ) : (
        <>
          <div className='question-section'>
            <div className='question-count'>
              <span>Question {currentQuestion + 1}</span>/{questions.length}
            </div>
            <div className='question-text'>{questions[currentQuestion].question}</div>
          </div>
          <div className='answer-section'>
            {questions[currentQuestion].options.map((option) => (
              <button onClick={() => handleAnswerOptionClick(option)}>{option}</button>
            ))}
          </div>
        </>
      )):!showStudentScore&&<div><b>Please fill the Student Details to access the exam.</b></div>}

        {showStudentScore ? (<h2>Admin DashBoard</h2>,
        <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Image Urls</th>
          </tr>
        </thead>
        <tbody>
          {userInfos.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {user.imageUrls.map((imageUrl, index) => (
                    <img src={imageUrl} alt={`User ${user._id} Image ${index}`} />
                ))}
              </td>
            </tr>
        ))}
        </tbody>
    </table>):showStudentScore&&<div>No student have taken the test.</div>}
      </div>
    </div>
  );
}

export default AssessmentForm;
