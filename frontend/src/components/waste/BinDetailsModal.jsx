
import React, { useState } from 'react';
import { api } from '../../api';
import { getFillColor, getFillStatus, formatDateTime } from '../../utils/wasteHelpers';
import FillLevelChart from '../charts/FillLevelChart';

export default function BinDetailsModal({ bin, onClose, onBinDeleted }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const fill = bin.latestFillPercentage ?? 0;
  const color = getFillColor(fill);

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.deleteBin(bin.id); onBinDeleted?.(); onClose(); }
    catch(e){ setDeleteError(e.response?.data?.message||'Failed to delete'); setDeleting(false); }
  };

  const row = { display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.06)' };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div style={{background:'#0f172a',borderRadius:'20px',width:'540px',maxWidth:'95vw',maxHeight:'90vh',overflow:'auto',color:'#e2e8f0',boxShadow:'0 25px 80px rgba(0,0,0,0.7)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'24px 24px 0',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <h2 style={{margin:0,fontSize:'20px',fontWeight:700,color:'#f1f5f9'}}>{bin.name}</h2>
            <p style={{margin:'4px 0 0',fontSize:'13px',color:'#64748b'}}>ID: {bin.id} | {bin.zone}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#64748b',fontSize:'24px',cursor:'pointer',lineHeight:1}}>x</button>
        </div>

        <div style={{padding:'24px',textAlign:'center'}}>
          <div style={{width:'120px',height:'120px',borderRadius:'50%',border:'4px solid '+color,display:'inline-flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 0 24px '+color+'40',margin:'0 auto'}}>
            <span style={{fontSize:'28px',fontWeight:900,color:color}}>{Math.round(fill)}%</span>
            <span style={{fontSize:'11px',color:'#94a3b8'}}>Fill Level</span>
          </div>
          <p style={{margin:'12px 0 0',fontWeight:600,color:color}}>{getFillStatus(fill)}</p>
        </div>

        <div style={{padding:'0 24px'}}>
          <div style={row}><span style={{color:'#94a3b8',fontSize:'13px'}}>Sensor Distance</span><span style={{fontSize:'13px',fontWeight:600}}>{bin.latestDistanceCm!=null?Number(bin.latestDistanceCm).toFixed(1)+' cm':'N/A'}</span></div>
          <div style={row}><span style={{color:'#94a3b8',fontSize:'13px'}}>Status</span><span style={{fontSize:'13px',fontWeight:600,color:fill>=85?'#f44336':'#00d4aa'}}>{bin.status||'ACTIVE'}</span></div>
          <div style={row}><span style={{color:'#94a3b8',fontSize:'13px'}}>Last Updated</span><span style={{fontSize:'13px',fontWeight:600}}>{formatDateTime(bin.lastUpdated)}</span></div>
          <div style={row}><span style={{color:'#94a3b8',fontSize:'13px'}}>GPS</span><span style={{fontSize:'13px',fontWeight:600}}>{bin.latitude?.toFixed(4)}, {bin.longitude?.toFixed(4)}</span></div>
        </div>

        <div style={{padding:'20px 24px'}}>
          <h3 style={{margin:'0 0 12px',fontSize:'13px',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em'}}>Fill Level History (24h)</h3>
          <FillLevelChart binId={bin.id}/>
        </div>

        <div style={{padding:'0 24px 24px'}}>
          <button onClick={()=>setShowConfirm(true)} style={{width:'100%',padding:'12px',background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'10px',cursor:'pointer',fontWeight:600,fontSize:'14px'}}>
            Delete Bin
          </button>
        </div>

        {showConfirm && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001}}>
            <div style={{background:'#1e293b',borderRadius:'16px',padding:'28px',width:'340px',textAlign:'center',color:'#e2e8f0',boxShadow:'0 20px 60px rgba(0,0,0,0.8)'}}>
              <div style={{fontSize:'40px',marginBottom:'12px'}}>Warning</div>
              <h3 style={{margin:'0 0 8px'}}>Delete {bin.name}?</h3>
              <p style={{color:'#ef4444',fontSize:'12px',margin:'0 0 20px'}}>This cannot be undone.</p>
              {deleteError && <p style={{color:'#ef4444',fontSize:'13px',marginBottom:'12px'}}>{deleteError}</p>}
              <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                <button onClick={()=>setShowConfirm(false)} disabled={deleting} style={{padding:'10px 20px',borderRadius:'8px',border:'1px solid #334155',background:'transparent',color:'#94a3b8',cursor:'pointer'}}>Cancel</button>
                <button onClick={handleDelete} disabled={deleting} style={{padding:'10px 20px',borderRadius:'8px',border:'none',background:'#ef4444',color:'white',cursor:'pointer',fontWeight:600}}>
                  {deleting?'Deleting...':'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
