import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchBinHistory } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FillLevelChart = ({ binId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await fetchBinHistory(binId);
      setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, [binId]);

  if (loading) return <div>Loading chart...</div>;

  const data = {
    labels: history.map(h => {
      const d = new Date(h.timestamp);
      return `${d.getHours()}:00`;
    }),
    datasets: [
      {
        label: 'Fill Percentage',
        data: history.map(h => h.fillPercentage),
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0, 212, 170, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(10, 14, 23, 0.9)',
        titleColor: '#e8eaf6',
        bodyColor: '#e8eaf6',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#8892b0',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#8892b0',
          maxTicksLimit: 8
        }
      }
    }
  };

  return <Line data={data} options={options} height={100} />;
};

export default FillLevelChart;
