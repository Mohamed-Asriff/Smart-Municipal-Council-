
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale,LinearScale,BarElement,Title,Tooltip);

const ZoneChart = ({ bins }) => {
  const zones = {};
  bins.forEach(bin => {
    const fill = bin.latestFillPercentage ?? 0;
    if (!zones[bin.zone]) zones[bin.zone] = {total:0,count:0};
    zones[bin.zone].total += fill; zones[bin.zone].count++;
  });
  const labels = Object.keys(zones);
  const vals = labels.map(z => zones[z].total/zones[z].count);
  const colors = vals.map(v => v<50?'#00d4aa':v<70?'#ffc107':v<85?'#ff9800':'#f44336');
  const data = { labels, datasets:[{label:'Avg Fill %',data:vals,backgroundColor:colors,borderRadius:4}] };
  const options = { indexAxis:'y', responsive:true, plugins:{legend:{display:false}},
    scales:{ x:{min:0,max:100}, y:{ticks:{color:'#64748b'}} } };
  return <Bar data={data} options={options}/>;
};
export default ZoneChart;
