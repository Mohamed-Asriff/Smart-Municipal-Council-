import { STATUS } from '../statusInfo.js'

export default function StatusBadge({ status }) {
  const info = STATUS[status] || { label: status, cls: 'pending' }
  return <span className={`badge ${info.cls}`}>{info.label}</span>
}