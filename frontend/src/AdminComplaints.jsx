import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import StatusBadge from './components/StatusBadge.jsx'
import PriorityBadge from './components/PriorityBadge.jsx'
import ComplaintModal from './components/ComplaintModal.jsx'
import { CATEGORY, DEPARTMENT, formatDate } from './statusInfo.js'

export default function AdminComplaints({ search = '' }) {
  const [stats, setStats] = useState(null)
  const [data, setData] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 })
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Numbers at the top
  useEffect(() => {
    fetch('/api/admin/complaints/stats')
      .then((response) => response.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [refresh])

  // Go back to page 1 whenever the header search changes
  useEffect(() => {
    setPage(0)
  }, [search])

  // The complaint list (waits a moment while the officer is typing)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page, size: 8, q: search })
        if (status) params.set('status', status)
        if (department) params.set('department', department)

        const response = await fetch(`/api/admin/complaints?${params}`)
        if (!response.ok) throw new Error('failed')
        setData(await response.json())
      } catch {
        setError('Could not load complaints. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [search, status, department, page, refresh])

  function handleUpdated(updated) {
    setSelected(updated)
    setRefresh((n) => n + 1)
  }

  return (
    <div className="admin-wrap">
      <h1>Complaints</h1>
      <p className="subtitle">
        {search
          ? `Showing results for "${search}"`
          : 'Review complaints, send them to the right department and keep citizens informed.'}
      </p>

      <div className="stat-grid">
        <div className="stat"><span>Total complaints</span><strong>{stats ? stats.total : '-'}</strong></div>
        <div className="stat red"><span>Pending</span><strong>{stats ? stats.pending : '-'}</strong></div>
        <div className="stat"><span>In progress</span><strong>{stats ? stats.inProgress : '-'}</strong></div>
        <div className="stat"><span>Resolved</span><strong>{stats ? stats.resolved : '-'}</strong></div>
        <div className="stat"><span>Rejected</span><strong>{stats ? stats.rejected : '-'}</strong></div>
        <div className="stat red"><span>Resolution rate</span><strong>{stats ? `${stats.resolutionRate}%` : '-'}</strong></div>
      </div>

      <div className="filters">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(0) }}>
          <option value="">All departments</option>
          {Object.entries(DEPARTMENT).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="table-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Date</th>
              <th>Complaint</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Department</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((c) => (
              <tr key={c.id}>
                <td><span className="ticket-tag">{c.ticketNo}</span></td>
                <td>{formatDate(c.createdAt)}</td>
                <td className="title-cell">
                  <strong>{c.title}</strong>
                  <small>{CATEGORY[c.category] || c.category}</small>
                </td>
                <td>{c.location}</td>
                <td><PriorityBadge priority={c.priority} /></td>
                <td>
                  {c.department
                    ? DEPARTMENT[c.department]
                    : <span className="inline-note">Not assigned</span>}
                </td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <button className="btn-secondary" type="button" onClick={() => setSelected(c)}>
                    <Eye size={15} /> View
                  </button>
                </td>
              </tr>
            ))}
            {!loading && data.content.length === 0 && (
              <tr><td colSpan="8" className="empty">No complaints found.</td></tr>
            )}
          </tbody>
        </table>

        <div className="pager">
          <span className="inline-note">
            {loading ? 'Loading...' : `${data.totalElements} complaint${data.totalElements === 1 ? '' : 's'}`}
          </span>
          <div>
            <button className="btn-secondary" type="button"
                    disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="inline-note" style={{ alignSelf: 'center' }}>
              Page {data.totalPages === 0 ? 0 : data.page + 1} of {data.totalPages}
            </span>
            <button className="btn-secondary" type="button"
                    disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <ComplaintModal
          key={selected.id}
          complaint={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}