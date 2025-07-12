import { useState } from 'react'
import Editor from './Editor'

const QuestionForm = () => {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  
  const handleSubmit = (body) => {
    console.log({ title, body, tags: tags.split(',') })
    // Submit to backend
  }

  return (
    <div className="question-form">
      <div className="form-group">
        <label>Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your question?"
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <Editor onSubmit={handleSubmit} />
      </div>
      <div className="form-group">
        <label>Tags</label>
        <input 
          type="text" 
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="comma-separated tags (javascript, react, etc.)"
        />
      </div>
    </div>
  )
}

export default QuestionForm