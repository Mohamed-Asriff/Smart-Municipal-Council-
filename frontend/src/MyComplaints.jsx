import { useEffect, useState } from 'react'
import { MapPin, Calendar, Paperclip, Search, Tag } from 'lucide-react'
import StatusBadge from './components/StatusBadge.jsx'
import { CATEGORY, formatDate } from './statusInfo.js'

export default function MyComplaints({ onTrack, onNew }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/citizen/complaints')
      .then((response) => {
        if (!response.ok) throw new Error('failed')
        return response.json()
      })
      .then(setItems)
      .catch(() => setError('Could not load your complaints. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="card">
      <h2>My Complaints</h2>
      <p className="subtitle">
        {loading ? 'Loading...' : `You have sent ${items.length} complaint${items.length === 1 ? '' : 's'}.`}
      </p>

      {error && <div className="message error">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">
          <p>You have not sent any complaints yet.</p>
          <button className="btn" type="button" onClick={onNew}>
            Submit your first complaint
          </button>
        </div>
      )}

      <div className="complaint-list">
        {items.map((c) => {
          const isImage = c.imageUrl && !c.imageUrl.endsWith('.pdf')
          return (
            <div className="complaint-item" key={c.id}>
              <div>
                <span className="ticket-tag">{c.ticketNo}</span>
                <h3>{c.title}</h3>
                <div className="meta">
                  <span><Tag size={15} /> {CATEGORY[c.category] || c.category}</span>
                  <span><MapPin size={15} /> {c.location}</span>
                  <span><Calendar size={15} /> {formatDate(c.createdAt)}</span>
                </div>

                {isImage && <img className="thumb" src={c.imageUrl} alt="Attachment" />}
                {c.imageUrl && !isImage && (
                  <p style={{ marginTop: 10 }}>
                    <a className="link-red" href={c.imageUrl} target="_blank" rel="noreferrer">
                      <Paperclip size={13} /> View attached file
                    </a>
                  </p>
                )}
              </div>

              <div className="complaint-actions">
                <StatusBadge status={c.status} />
                <button type="button" className="btn-secondary" onClick={() => onTrack(c.ticketNo)}>
                  <Search size={15} /> Track
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}