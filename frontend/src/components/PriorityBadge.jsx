import { PRIORITY } from '../statusInfo.js'

export default function PriorityBadge({ priority }) {
  const info = PRIORITY[priority] || { label: priority, cls: 'p-low' }
  return <span className={`badge ${info.cls}`}>{info.label}</span>
}