import { useEffect, useState } from 'react'
import { X, MapPin, Calendar, Tag, Paperclip, ExternalLink } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import PriorityBadge from './PriorityBadge.jsx'
import { STATUS, CATEGORY, DEPARTMENT, PRIORITY, formatDate } from '../statusInfo.js'

async function send(url, body) {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    let message = 'Something went wrong. Please try again.'
    try {
      const err = await response.json()
      if (err.message) message = err.message
    } catch {
      // keep the default message
    }
    throw new Error(message)
  }
  return response.json()
}

export default function ComplaintModal({ complaint, onClose, onUpdated }) {
  const c = complaint
  const closed = c.status === 'RESOLVED' || c.status === 'REJECTED'
  const hasPin = c.latitude != null && c.longitude != null
  const isPdf = c.imageUrl && c.imageUrl.endsWith('.pdf')

  const [department, setDepartment] = useState(c.department || '')
  const [priority, setPriority] = useState(c.priority)
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [timeline, setTimeline] = useState([])

  // Close with the Esc key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Load the update history (re-load after every change)
  useEffect(() => {
    fetch(`/api/complaints/track/${c.ticketNo}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setTimeline(data ? data.timeline : []))
      .catch(() => setTimeline([]))
  }, [c.ticketNo, c.updatedAt])

  async function run(action, successText) {
    setBusy(true)
    setMessage(null)
    try {
      const updated = await action()
      onUpdated(updated)
      setMessage({ type: 'success', text: successText })
      setNewStatus('')
      setNote('')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  function handleAssign() {
    if (!department) {
      setMessage({ type: 'error', text: 'Please choose a department.' })
      return
    }
    run(
      () => send(`/api/admin/complaints/${c.id}/assign`, { department, priority }),
      'Department and priority saved.'
    )
  }

  function handleStatus() {
    if (!newStatus) {
      setMessage({ type: 'error', text: 'Please choose a status.' })
      return
    }
    run(
      () => send(`/api/admin/complaints/${c.id}/status`, { status: newStatus, note }),
      'Status updated. The citizen can now see it.'
    )
  }

  return (
    <div className="overlay" onClick={onClose}>
      <section className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="ticket-tag">{c.ticketNo}</span>
            <h2 style={{ marginTop: 10 }}>{c.title}</h2>
          </div>
          <button className="btn-close" type="button" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="meta">
          <StatusBadge status={c.status} />
          <PriorityBadge priority={c.priority} />
        </div>
        <div className="meta">
          <span><Tag size={15} /> {CATEGORY[c.category] || c.category}</span>
          <span><Calendar size={15} /> {formatDate(c.createdAt)}</span>
          <span><MapPin size={15} /> {c.location}</span>
        </div>

        <div className="modal-body">
          {/* Left side: the details */}
          <div className="modal-col">
            <h4>Description</h4>
            <p className="detail-text">{c.description}</p>

            {hasPin && (
              <p style={{ marginTop: 10 }}>
                <a
                  className="link-red"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=17/${c.latitude}/${c.longitude}`}
                >
                  <ExternalLink size={13} /> Open the pinned location on the map
                </a>
              </p>
            )}

            {c.imageUrl && (
              <>
                <h4>Attachment</h4>
                {isPdf ? (
                  <a className="link-red" href={c.imageUrl} target="_blank" rel="noreferrer">
                    <Paperclip size={13} /> Open the attached PDF
                  </a>
                ) : (
                  <a href={c.imageUrl} target="_blank" rel="noreferrer">
                    <img className="attachment" src={c.imageUrl} alt="Attachment" />
                  </a>
                )}
              </>
            )}

            <h4>History</h4>
            <ul className="timeline">
              {timeline.map((item, index) => (
                <li key={index}>
                  <strong>{STATUS[item.status]?.label || item.status}</strong>
                  {item.note && <div>{item.note}</div>}
                  <small>{formatDate(item.changedAt)}</small>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side: the actions */}
          <div className="modal-col">
            <h4>Assign</h4>
            {closed ? (
              <div className="closed-note">
                This complaint is closed
                {c.resolutionNotes ? `. Final note: ${c.resolutionNotes}` : '.'}
              </div>
            ) : (
              <>
                <div className="row-2">
                  <div className="field">
                    <label>Department</label>
                    <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                      <option value="">Choose department</option>
                      {Object.entries(DEPARTMENT).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                      {Object.entries(PRIORITY).map(([key, info]) => (
                        <option key={key} value={key}>{info.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn" type="button" disabled={busy} onClick={handleAssign}>
                  Save assignment
                </button>

                <h4>Update status</h4>
                <div className="field">
                  <label>New status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="">Choose status</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="field">
                  <label>Note for the citizen</label>
                  <textarea
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Required when you resolve or reject, e.g. Streetlight replaced"
                  />
                </div>
                <button className="btn" type="button" disabled={busy} onClick={handleStatus}>
                  Save status
                </button>
              </>
            )}

            {message && <div className={`message ${message.type}`}>{message.text}</div>}
          </div>
        </div>
      </section>
    </div>
  )
}