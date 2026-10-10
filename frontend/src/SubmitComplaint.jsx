import { useRef, useState } from 'react'
import { Paperclip, FileText, X, MapPin, LocateFixed } from 'lucide-react'
import MapPicker from './components/MapPicker.jsx'

const emptyForm = {
  title: '',
  category: '',
  location: '',
  description: '',
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export default function SubmitComplaint() {
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [pin, setPin] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ticketNo, setTicketNo] = useState('')
  const [error, setError] = useState('')
  const fileInput = useRef(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFile(e) {
    const chosen = e.target.files[0]
    if (!chosen) return

    if (!ALLOWED_TYPES.includes(chosen.type)) {
      setError('Please choose a JPG, PNG, WEBP or PDF file.')
      return
    }
    if (chosen.size > MAX_SIZE) {
      setError('The file is too big. Please choose one under 5 MB.')
      return
    }

    setError('')
    setFile(chosen)
    setPreview(chosen.type.startsWith('image/') ? URL.createObjectURL(chosen) : '')
  }

  function removeFile() {
    setFile(null)
    setPreview('')
    if (fileInput.current) fileInput.current.value = ''
  }

  function findMe() {
    if (!navigator.geolocation) {
      setError('Your browser cannot find your location. Please click on the map instead.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError('')
        setPin({ lat: position.coords.latitude, lng: position.coords.longitude, fly: true })
        setShowMap(true)
      },
      () => setError('Could not get your location. Please click on the map instead.')
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setTicketNo('')

    if (!form.title || !form.category || !form.description) {
      setError('Please fill in the title, category and description.')
      return
    }
    if (!form.location.trim() && !pin) {
      setError('Please type the location or pin it on the map.')
      return
    }

    const payload = {
      ...form,
      location: form.location.trim()
        || `Pinned on map (${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)})`,
      latitude: pin ? pin.lat : null,
      longitude: pin ? pin.lng : null,
    }

    const data = new FormData()
    data.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    if (file) data.append('photo', file)

    setLoading(true)
    try {
      const response = await fetch('/api/citizen/complaints', {
        method: 'POST',
        body: data,
      })
      if (!response.ok) throw new Error('Request failed')

      const saved = await response.json()
      setTicketNo(saved.ticketNo)
      setForm(emptyForm)
      setPin(null)
      setShowMap(false)
      removeFile()
    } catch (err) {
      setError('Could not submit the complaint. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Submit a Complaint</h2>
      <p className="subtitle">Report a problem in your area and we will look into it.</p>

      {ticketNo && (
        <div className="message success">
          Complaint submitted. Your ticket number is <strong>{ticketNo}</strong>. Keep it to track progress.
        </div>
      )}
      {error && <div className="message error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Complaint Title</label>
          <input name="title" value={form.title} onChange={handleChange}
                 placeholder="e.g. Broken streetlight" maxLength={150} />
        </div>

        <div className="field">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Select a category</option>
            <option value="STREETLIGHT">Streetlight</option>
            <option value="WASTE_MANAGEMENT">Waste Management</option>
            <option value="ROADS_DRAINAGE">Roads and Drainage</option>
            <option value="WATER_SUPPLY">Water Supply</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="field">
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange}
                 placeholder="Street name or ward" />

          <div className="pin-bar">
            <button type="button"
                    className={showMap ? 'btn-secondary active' : 'btn-secondary'}
                    onClick={() => setShowMap(!showMap)}>
              <MapPin size={16} /> {showMap ? 'Hide map' : 'Pin on map'}
            </button>
            <button type="button" className="btn-secondary" onClick={findMe}>
              <LocateFixed size={16} /> Use my location
            </button>
            {pin && (
              <button type="button" className="btn-secondary" onClick={() => setPin(null)}>
                <X size={16} /> Clear pin
              </button>
            )}
          </div>

          {showMap && (
            <>
              <MapPicker pin={pin} onPick={setPin} />
              <p className="pin-info">Click on the map to drop a pin where the problem is.</p>
            </>
          )}

          {pin && (
            <p className="pin-info">
              <strong>Pinned:</strong> {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
            </p>
          )}
        </div>

        <div className="field">
          <label>Description</label>
          <textarea name="description" rows="4" value={form.description}
                    onChange={handleChange} placeholder="Describe the problem in detail" />
        </div>

        <div className="field">
          <label>Attach a Photo or File (optional)</label>

          {!file ? (
            <div className="dropzone" onClick={() => fileInput.current.click()}>
              <Paperclip size={22} />
              <strong>Click to choose a file</strong>
              <span>JPG, PNG, WEBP or PDF, up to 5 MB</span>
            </div>
          ) : (
            <div className="file-preview">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className="file-icon"><FileText size={28} /></div>
              )}
              <div className="file-info">
                {file.name}
                <small>{(file.size / 1024).toFixed(0)} KB</small>
              </div>
              <button type="button" className="btn-remove" onClick={removeFile}>
                <X size={14} /> Remove
              </button>
            </div>
          )}

          <input
            ref={fileInput}
            className="hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFile}
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  )
}