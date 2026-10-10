import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ZoneChart = ({ bins }) => {
  const zones = {};
  bins.forEach(bin => {
    const fill = bin.latestFillPercentage != null ? bin.latestFillPercentage : 0;
    if (!zones[bin.zone]) {
      zones[bin.zone] = { total: 0, count: 0 };
    }
    zones[bin.zone].total += fill;
    zones[bin.zone].count += 1;
  });

  const labels = Object.keys(zones);
  const dataValues = labels.map(zone => zones[zone].total / zones[zone].count);
  const colors = dataValues.map(val => {
    if (val < 50) return '#00d4aa';
    if (val < 70) return '#ffc107';
    if (val < 85) return '#ff9800';
    return '#f44336';
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Average Fill %',
        data: dataValues,
        backgroundColor: colors,
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#8892b0'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#8892b0'
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

export default ZoneChart;
