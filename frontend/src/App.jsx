import { useState } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import SubmitComplaint from './SubmitComplaint.jsx'
import TrackComplaint from './TrackComplaint.jsx'
import MyComplaints from './MyComplaints.jsx'
import AdminComplaints from './AdminComplaints.jsx'
import kalmunaiMap from './assets/Kalmunai.png'

const pageTitles = {
  home: 'Home',
  about: 'About Us',
  payments: 'Payments',
  applications: 'Applications',
  contact: 'Contact Us',
}

function ComingSoon({ title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p className="subtitle">
        We are getting this page ready for you. Please check back soon!
      </p>
    </div>
  )
}

function SideInfo() {
  return (
    <div className="side-col">
      <div className="card map-card">
        <h3>Kalmunai Area</h3>
        <img src={kalmunaiMap} alt="Map of Kalmunai" />
        <p className="map-caption">
          Use "Pin on map" in the form to mark the exact spot of the problem.
        </p>
      </div>

      <div className="card">
        <h3>How it works</h3>
        <ol className="steps">
          <li><span className="step-no">1</span>Tell us what the problem is and where it is.</li>
          <li><span className="step-no">2</span>We send it to the right team at the council.</li>
          <li><span className="step-no">3</span>Use your ticket number to see progress anytime.</li>
        </ol>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('citizen')

  // Citizen side
  const [page, setPage] = useState('complaints')
  const [tab, setTab] = useState('submit')
  const [trackTicket, setTrackTicket] = useState('')

  // Admin side
  const [adminPage, setAdminPage] = useState('complaints')
  const [adminSearch, setAdminSearch] = useState('')

  function goToTab(name) {
    setTrackTicket('')
    setTab(name)
  }

  function openTrack(ticketNo) {
    setTrackTicket(ticketNo)
    setTab('track')
  }

  function handleAdminSearch(value) {
    setAdminSearch(value)
    if (adminPage !== 'complaints') setAdminPage('complaints')
  }

  return (
    <div>
      <div className="demo-bar">
        Demo view (temporary, until login is ready):
        <button className={view === 'citizen' ? 'on' : ''} onClick={() => setView('citizen')}>
          Citizen
        </button>
        <button className={view === 'admin' ? 'on' : ''} onClick={() => setView('admin')}>
          Admin
        </button>
      </div>

      <Header role={view} search={adminSearch} onSearch={handleAdminSearch} />

      {view === 'admin' ? (
        <div className="layout">
          <Sidebar role="admin" page={adminPage} setPage={setAdminPage} />

          <main className="content">
            {adminPage === 'dashboard' && <ComingSoon title="Dashboard" />}
            {adminPage === 'complaints' && <AdminComplaints search={adminSearch} />}
            {adminPage === 'payments' && <ComingSoon title="Payments" />}
            {adminPage === 'applications' && <ComingSoon title="Applications" />}
          </main>
        </div>
      ) : (
        <div className="layout">
          <Sidebar page={page} setPage={setPage} />

          <main className="content">
            {page !== 'complaints' ? (
              <ComingSoon title={pageTitles[page]} />
            ) : (
              <>
                <section className="hero">
                  <h1>Tell us your problem, <span>we will help you.</span></h1>
                  <p>
                    A broken light, a blocked drain, rubbish on the road? Let us know
                    and our team will take care of it. It only takes a minute.
                  </p>
                </section>

                <div className="tabs">
                  <button className={tab === 'submit' ? 'tab active' : 'tab'}
                          onClick={() => goToTab('submit')}>Submit Complaint</button>
                  <button className={tab === 'track' ? 'tab active' : 'tab'}
                          onClick={() => goToTab('track')}>Track Complaint</button>
                  <button className={tab === 'history' ? 'tab active' : 'tab'}
                          onClick={() => goToTab('history')}>My Complaints</button>
                </div>

                {tab === 'submit' && (
                  <div className="grid">
                    <SubmitComplaint />
                    <SideInfo />
                  </div>
                )}
                {tab === 'track' && <TrackComplaint initialTicket={trackTicket} />}
                {tab === 'history' && (
                  <MyComplaints onTrack={openTrack} onNew={() => goToTab('submit')} />
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  )
}