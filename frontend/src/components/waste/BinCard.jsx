
import React from 'react';
import { getFillColor, getFillStatus, formatDateTime } from '../../utils/wasteHelpers';

export default function BinCard({ bin, isSelected, onSelect }) {
  const fill = bin.latestFillPercentage ?? 0;
  const color = getFillColor(fill);
  return (
    <div onClick={onSelect} style={{padding:'14px',borderRadius:'12px',cursor:'pointer',marginBottom:'10px',
      background:isSelected?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.05)',
      border:'1px solid '+(isSelected?'#3b82f6':'rgba(255,255,255,0.08)'),transition:'all 0.2s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:color}}/>
          <span style={{fontSize:'13px',fontWeight:700,color:'#f1f5f9'}}>{bin.name}</span>
        </div>
        <span style={{fontSize:'11px',color:'#475569'}}>#{bin.id}</span>
      </div>
      <p style={{margin:'0 0 8px',fontSize:'12px',color:'#64748b'}}>Zone: {bin.zone}</p>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
        <span style={{fontSize:'12px',color:'#94a3b8'}}>Fill</span>
        <span style={{fontSize:'12px',fontWeight:700,color:color}}>{fill.toFixed(1)}% - {getFillStatus(fill)}</span>
      </div>
      <div style={{background:'rgba(255,255,255,0.1)',borderRadius:'4px',height:'6px'}}>
        <div style={{width:fill+'%',background:color,height:'6px',borderRadius:'4px',transition:'width 0.3s'}}/>
      </div>
      <p style={{margin:'6px 0 0',fontSize:'11px',color:'#475569'}}>{formatDateTime(bin.lastUpdated)}</p>
    </div>
  );
}
