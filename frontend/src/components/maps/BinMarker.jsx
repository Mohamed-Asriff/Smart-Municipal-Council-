
import React, { useState } from 'react';
import { Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { getFillColor, formatDateTime } from '../../utils/wasteHelpers';

const createBinIcon = (fillColor, pct) => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60">'
    + '<rect x="6" y="15" width="36" height="38" rx="3" fill="' + fillColor + '" stroke="white" stroke-width="2.5"/>'
    + '<rect x="2" y="9" width="44" height="7" rx="3" fill="' + fillColor + '" stroke="white" stroke-width="2.5"/>'
    + '<rect x="16" y="2" width="16" height="9" rx="3" fill="' + fillColor + '" stroke="white" stroke-width="2.5"/>'
    + '<text x="24" y="37" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="900" fill="white" stroke="black" stroke-width="3" paint-order="stroke">' + Math.round(pct) + '%</text>'
    + '</svg>';
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

const BinMarker = ({ bin, isSelected, onSelect }) => {
  const [showInfo, setShowInfo] = useState(false);
  const fill = bin.latestFillPercentage ?? 0;
  const color = getFillColor(fill);
  const pos = { lat: bin.latitude, lng: bin.longitude };
  return (
    <>
      <Marker position={pos} onClick={() => setShowInfo(true)}
        icon={{ url: createBinIcon(color, fill), scaledSize:{width:48,height:60}, anchor:{x:24,y:55} }}
        animation={fill >= 85 ? 1 : undefined} />
      {(showInfo || isSelected) && (
        <InfoWindow position={pos} onCloseClick={() => setShowInfo(false)}>
          <div style={{padding:'8px',minWidth:'180px',fontFamily:'sans-serif'}}>
            <h3 style={{margin:'0 0 4px',fontSize:'14px',color:'#1a237e',fontWeight:700}}>{bin.name}</h3>
            <p style={{margin:'0 0 6px',fontSize:'12px',color:'#555'}}>📍 {bin.zone}</p>
            <div style={{background:'#eee',borderRadius:'4px',height:'8px',marginBottom:'4px'}}>
              <div style={{width:fill+'%',background:color,height:'8px',borderRadius:'4px'}}/>
            </div>
            <p style={{margin:'0 0 4px',fontSize:'13px',fontWeight:700,color:color}}>{fill.toFixed(1)}% Full</p>
            <p style={{margin:'0 0 6px',fontSize:'11px',color:'#888'}}>Updated: {formatDateTime(bin.lastUpdated)}</p>
            <p style={{margin:'0 0 8px',fontSize:'11px',fontWeight:600,color:fill>=85?'#f44336':'#00897b'}}>
              {fill>=85?'🔴':'🟢'} {bin.status||'ACTIVE'}
            </p>
            <button onClick={()=>{onSelect();setShowInfo(false);}}
              style={{width:'100%',padding:'6px',background:color,color:'white',border:'none',
                borderRadius:'6px',cursor:'pointer',fontWeight:600,fontSize:'12px'}}>
              View Details
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
};
export default BinMarker;
