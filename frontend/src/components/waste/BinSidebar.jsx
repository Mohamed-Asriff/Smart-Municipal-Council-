
import React from 'react';
import BinCard from './BinCard';

const inp = {width:'100%',padding:'9px 12px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',
  background:'rgba(255,255,255,0.06)',color:'#f1f5f9',fontSize:'13px',boxSizing:'border-box',outline:'none'};
const opt = {background:'#1e293b',color:'#f1f5f9'};
const lbl = {fontSize:'11px',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:'6px'};

export default function BinSidebar({ bins, allBins, searchTerm, onSearchChange, zoneFilter, onZoneChange,
    statusFilter, onStatusChange, selectedBin, onSelectBin }) {
  const zones = ['All', ...new Set((allBins||[]).map(b=>b.zone).filter(Boolean))];
  return (
    <div style={{width:'300px',flexShrink:0,background:'#0f172a',borderRadius:'16px',padding:'16px',
      display:'flex',flexDirection:'column',gap:'12px',overflowY:'auto',border:'1px solid rgba(255,255,255,0.06)'}}>
      <h3 style={{margin:0,fontSize:'15px',fontWeight:700,color:'#f1f5f9'}}>Bins ({bins.length})</h3>
      <div><label style={lbl}>Search</label>
        <input style={inp} placeholder="Search bins..." value={searchTerm} onChange={e=>onSearchChange(e.target.value)}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
        <div><label style={lbl}>Zone</label>
          <select style={{...inp,cursor:'pointer'}} value={zoneFilter} onChange={e=>onZoneChange(e.target.value)}>
            {zones.map(z=><option key={z} style={opt}>{z}</option>)}</select></div>
        <div><label style={lbl}>Status</label>
          <select style={{...inp,cursor:'pointer'}} value={statusFilter} onChange={e=>onStatusChange(e.target.value)}>
            {['All','Normal','Warning','High','Critical'].map(s=><option key={s} style={opt}>{s}</option>)}</select></div>
      </div>
      <div style={{flex:1,overflowY:'auto',minHeight:'100px'}}>
        {bins.length===0
          ? <p style={{textAlign:'center',color:'#475569',fontSize:'13px',padding:'20px 0'}}>No bins found</p>
          : bins.map(b=><BinCard key={b.id} bin={b} isSelected={selectedBin?.id===b.id} onSelect={()=>onSelectBin(b)}/>)
        }
      </div>

    </div>
  );
}
