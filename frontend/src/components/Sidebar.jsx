import {
  House, Info, ClipboardList, CreditCard, FileText, Phone, Siren, LayoutDashboard,
} from 'lucide-react'

const citizenItems = [
  { key: 'home', label: 'Home', icon: House },
  { key: 'about', label: 'About Us', icon: Info },
  { key: 'complaints', label: 'Complaints', icon: ClipboardList },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'contact', label: 'Contact Us', icon: Phone },
]

const adminItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'complaints', label: 'Complaints', icon: ClipboardList },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'applications', label: 'Applications', icon: FileText },
]

export default function Sidebar({ page, setPage, role = 'citizen' }) {
  const isAdmin = role === 'admin'
  const items = isAdmin ? adminItems : citizenItems

  return (
    <aside className="sidebar">
      <ul className="menu">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={page === item.key ? 'active' : ''}
              onClick={() => setPage(item.key)}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {!isAdmin && (
        <div className="emergency">
          <h4><Siren size={18} /> Emergency</h4>
          <p>Need urgent help? Call</p>
          <strong>1990 Suwa Seriya</strong>
          <p>KMC Secretariat: 067-2220261</p>
        </div>
      )}
    </aside>
  )
}