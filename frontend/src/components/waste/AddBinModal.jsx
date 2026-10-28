
import React, { useState } from 'react';
import { api } from '../../api';

const ZONES = ['Town Center','Beach Side','Hospital Area','Mosque Area','School Zone','Station Area','North Zone'];
const inp = { width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box',marginTop:'6px' };
const lbl = { fontSize:'13px',fontWeight:600,color:'#374151' };

export default function AddBinModal({ onClose, onBinAdded }) {
  const [form, setForm] = useState({ id:'',name:'',latitude:'',longitude:'',zone:'Town Center',binHeightCm:40 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => { setForm(p=>({...p,[e.target.name]:e.target.value})); setError(''); };

  const validate = () => {
    if (!form.id.trim()) return 'Bin ID is required';
    if (!form.name.trim()) return 'Bin Name is required';
    const lat=parseFloat(form.latitude), lng=parseFloat(form.longitude);
    if (isNaN(lat)||isNaN(lng)) return 'Valid GPS coordinates required';
    if (lat<7.39||lat>7.43) return 'Latitude must be 7.39–7.43 (Kalmunai)';
    if (lng<81.81||lng>81.84) return 'Longitude must be 81.81–81.84 (Kalmunai)';
    return null;
  };

  const submit = async e => {
    e.preventDefault();
    const err = validate(); if (err) { setError(err); return; }
    setLoading(true);
    try {
      await api.createBin({ id:form.id.trim(),name:form.name.trim(),
        latitude:parseFloat(form.latitude),longitude:parseFloat(form.longitude),
        zone:form.zone,binHeightCm:parseFloat(form.binHeightCm)||40 });
      setSuccess('Bin registered!'); onBinAdded?.(); setTimeout(onClose,1500);
    } catch(e){ setError(e.response?.data?.message||e.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div style={{background:'white',borderRadius:'16px',padding:'28px',width:'480px',maxWidth:'90vw',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{margin:0,fontSize:'18px',color:'#1e293b'}}>Register New Bin</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'#64748b'}}>x</button>
        </div>
        <form onSubmit={submit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <div><label style={lbl}>Bin ID</label><input style={inp} name="id" value={form.id} onChange={handle} placeholder="BIN-011"/></div>
            <div><label style={lbl}>Zone</label><select style={inp} name="zone" value={form.zone} onChange={handle}>{ZONES.map(z=><option key={z}>{z}</option>)}</select></div>
          </div>
          <div style={{marginBottom:'16px'}}><label style={lbl}>Bin Name</label><input style={inp} name="name" value={form.name} onChange={handle} placeholder="Main Street Bin"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
            <div><label style={lbl}>Latitude</label><input style={inp} type="number" step="0.0001" name="latitude" value={form.latitude} onChange={handle} placeholder="7.4150"/><small style={{color:'#94a3b8'}}>7.39-7.43</small></div>
            <div><label style={lbl}>Longitude</label><input style={inp} type="number" step="0.0001" name="longitude" value={form.longitude} onChange={handle} placeholder="81.8200"/><small style={{color:'#94a3b8'}}>81.81-81.84</small></div>
          </div>
          <div style={{marginBottom:'20px'}}><label style={lbl}>Bin Height (cm)</label><input style={inp} type="number" step="0.1" name="binHeightCm" value={form.binHeightCm} onChange={handle}/></div>
          {error && <div style={{background:'#fef2f2',color:'#dc2626',padding:'10px',borderRadius:'8px',marginBottom:'12px',fontSize:'13px'}}>{error}</div>}
          {success && <div style={{background:'#f0fdf4',color:'#16a34a',padding:'10px',borderRadius:'8px',marginBottom:'12px',fontSize:'13px'}}>{success}</div>}
          <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
            <button type="button" onClick={onClose} style={{padding:'10px 20px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'white',cursor:'pointer'}}>Cancel</button>
            <button type="submit" disabled={loading} style={{padding:'10px 20px',borderRadius:'8px',border:'none',background:'#3b82f6',color:'white',cursor:'pointer',fontWeight:600}}>
              {loading?'Registering...':'Register Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
