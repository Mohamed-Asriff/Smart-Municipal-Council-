import { useState } from 'react'
import { LogIn, UserPlus, User, Search } from 'lucide-react'

export default function Header({ role = 'citizen', search = '', onSearch }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const isAdmin = role === 'admin'

  return (
    <header className="header">
      <div className="brand">
        {logoFailed ? (
          <div className="brand-badge">KMC</div>
        ) : (
          <img
            className="brand-logo"
            src="/kmc-logo.png"
            alt="Kalmunai Municipal Council logo"
            onError={() => setLogoFailed(true)}
          />
        )}
        <div>
          <div className="brand-name">Kalmunai Municipal Council</div>
          <div className="brand-tag">
            {isAdmin ? 'Complaint Administration' : 'Smart services for a better city'}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="header-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search complaints by ticket or title..."
          />
        </div>
      )}

      <div className="header-actions">
        {!isAdmin && (
          <>
            <button className="btn-outline-light" type="button">
              <LogIn size={16} /> Login
            </button>
            <button className="btn-red-small" type="button">
              <UserPlus size={16} /> Register
            </button>
          </>
        )}
        <div className="profile">
          <div className="avatar"><User size={20} /></div>
          <div className="profile-text">
            {isAdmin ? 'Admin' : 'Guest'}
            <small>{isAdmin ? 'Complaint Officer' : 'My Profile'}</small>
          </div>
        </div>
      </div>
    </header>
  )
}