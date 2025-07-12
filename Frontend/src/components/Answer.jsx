const Answer = ({ answer, isAccepted }) => {
  return (
    <div className={`answer-card ${isAccepted ? 'accepted' : ''}`}>
      <div className="answer-body">{answer.body}</div>
      <div className="answer-meta">
        <div className="votes">
          <button className="vote-btn">▲</button>
          <span>{answer.votes}</span>
          <button className="vote-btn">▼</button>
        </div>
        <div className="user-info">
          <span>Answered by {answer.user}</span>
        </div>
      </div>
    </div>
  )
}

export default Answer