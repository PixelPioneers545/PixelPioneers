import { useState } from 'react'

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications] = useState([
    { id: 1, text: 'New answer on your question', read: false },
    { id: 2, text: 'User mentioned you in a comment', read: false }
  ])

  return (
    <div className="notification">
      <button onClick={() => setIsOpen(!isOpen)}>
        🔔 {notifications.filter(n => !n.read).length > 0 && 
           <span className="badge">{notifications.filter(n => !n.read).length}</span>}
      </button>
      {isOpen && (
        <div className="notification-dropdown">
          {notifications.map(notification => (
            <div key={notification.id} className="notification-item">
              {notification.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notification