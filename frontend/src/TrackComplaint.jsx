import { useEffect, useState } from 'react'
import { Search, MapPin, Calendar, Building2, Check } from 'lucide-react'
import StatusBadge from './components/StatusBadge.jsx'
import { STATUS, DEPARTMENT, formatDate } from './statusInfo.js'

const POSITION = { PENDING: 0, IN_PROGRESS: 1, RESOLVED: 2, REJECTED: 2 }

export default function TrackComplaint({ initialTicket = '' }) {
  const [ticket, setTicket] = useState(initialTicket)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function search(value) {
    const query = value.trim()
    setResult(null)
    setError('')

    if (!query) {
      setError('Please type your ticket number.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/complaints/track/${encodeURIComponent(query)}`)
      if (response.status === 404) {
        setError("We couldn't find that ticket. Please check the number and try again.")
        return
      }
      if (!response.ok) throw new Error('failed')
      setResult(await response.json())
    } catch {
      setError('Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // If we arrive from "My Complaints", search straight away
  useEffect(() => {
    if (initialTicket) search(initialTicket)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTicket])

  const current = result ? POSITION[result.status] : 0
  const finished = result?.status === 'RESOLVED'
  const steps = [
    'Submitted',
    'In Progress',
    result?.status === 'REJECTED' ? 'Rejected' : 'Resolved',
  ]

  return (
    <div className="card">
      <h2>Track Your Complaint</h2>
      <p className="subtitle">
        Type the ticket number you received when you submitted your complaint.
      </p>

      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault()
          search(ticket)
        }}
      >
        <input
          value={ticket}
          onChange={(e) => setTicket(e.target.value)}
          placeholder="e.g. KMC-2026-000001"
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && <div className="message error">{error}</div>}

      {result && (
        <div>
          <div className="result-head">
            <div>
              <span className="ticket-tag">{result.ticketNo}</span>
              <h3 style={{ marginTop: 10 }}>{result.title}</h3>
            </div>
            <StatusBadge status={result.status} />
          </div>

          <div className="meta">
            <span><MapPin size={15} /> {result.location}</span>
            <span><Calendar size={15} /> {formatDate(result.createdAt)}</span>
            <span>
              <Building2 size={15} />
              {result.department ? DEPARTMENT[result.department] : 'Not assigned yet'}
            </span>
          </div>

          <div className="stepper">
            {steps.map((label, i) => (
              <div key={label} className={i <= current ? 'stepper-step done' : 'stepper-step'}>
                <span className="dot">
                  {i < current || (finished && i === current) ? <Check size={16} /> : i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          <h3>Updates</h3>
          <ul className="timeline">
            {result.timeline.map((item, index) => (
              <li key={index}>
                <strong>{STATUS[item.status]?.label || item.status}</strong>
                {item.note && <div>{item.note}</div>}
                <small>{formatDate(item.changedAt)}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}