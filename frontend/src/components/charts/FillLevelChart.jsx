
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { api } from '../../api';
ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Filler);

const FillLevelChart = ({ binId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.getBinHistory(binId,24).then(d=>{ setHistory(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [binId]);
  if (loading) return <div style={{textAlign:'center',color:'#94a3b8',padding:'20px'}}>Loading chart...</div>;
  if (!history.length) return <div style={{textAlign:'center',color:'#94a3b8',padding:'20px'}}>No history data</div>;
  const data = {
    labels: history.map(h => { const d=new Date(h.timestamp); return d.getHours()+':00'; }),
    datasets: [{
      label:'Fill %', data: history.map(h=>h.fillPercentage),
      borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.15)',
      fill:true, tension:0.4, pointRadius:2
    }]
  };
  const options = { responsive:true, plugins:{legend:{display:false}},
    scales:{ y:{min:0,max:100,ticks:{callback:v=>v+'%'}}, x:{ticks:{maxTicksLimit:8}} } };
  return <Line data={data} options={options} height={100}/>;
};
export default FillLevelChart;
