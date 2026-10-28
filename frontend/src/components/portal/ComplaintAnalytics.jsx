import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, PieChart } from 'lucide-react';
import { STATUS, normalizeStatus } from '../../utils/statusMap';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ComplaintAnalytics({ complaints = [] }) {
  // 1. Calculate status distribution (Existing logic)
  const statusData = useMemo(() => {
    let submitted = 0;
    let inProgress = 0;
    let resolved = 0;

    complaints.forEach((c) => {
      const s = normalizeStatus(c.status);
      if (s === STATUS.RESOLVED) {
        resolved++;
      } else if (s === STATUS.IN_PROGRESS || s === STATUS.DISPATCHED) {
        inProgress++;
      } else {
        submitted++;
      }
    });

    return { submitted, inProgress, resolved };
  }, [complaints]);

  // 2. NEW: Calculate real monthly data for the last 6 months
  const monthlyData = useMemo(() => {
    const labels = [];
    const data = [];
    
    // Get current date (e.g., Oct 2026)
    const now = new Date();
    
    // Loop backwards from 5 months ago up to the current month
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' }); // e.g., "May"
      
      // Count how many complaints were created in this specific month and year
      const count = complaints.filter((c) => {
        if (!c.createdAt) return false;
        const cDate = new Date(c.createdAt);
        return cDate.getMonth() === d.getMonth() && cDate.getFullYear() === d.getFullYear();
      }).length;

      labels.push(monthLabel);
      data.push(count);
    }

    return { labels, data };
  }, [complaints]);

  // Doughnut Chart Data
  const doughnutData = {
    labels: ['Submitted', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [statusData.submitted, statusData.inProgress, statusData.resolved],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'], // Blue, Amber, Emerald
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 11, family: 'Inter' },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#16324F',
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  // Bar Chart Data (Now using real database values)
  const barData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Complaints Filed',
        data: monthlyData.data, // <--- REAL DATA HERE
        backgroundColor: '#16324F',
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#16324F',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.parsed.y} complaint(s)`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 11, family: 'Inter' }, color: '#64748b' },
      },
      y: {
        display: false, // Hide Y axis for a cleaner look
        beginAtZero: true,
        suggestedMax: Math.max(...monthlyData.data, 3) + 1, // Ensure chart doesn't look flat if 0 complaints
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
      {/* Doughnut Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-[#16324F]" />
          <h2 className="font-bold text-[#16324F] text-sm">Status Overview</h2>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-[220px]">
          {complaints.length > 0 ? (
            <div className="w-full max-w-[240px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-slate-400">No data to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#16324F]" />
            <h2 className="font-bold text-[#16324F] text-sm">Monthly Activity</h2>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
            Last 6 Months
          </span>
        </div>
        <div className="flex-1 min-h-[220px]">
          {complaints.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
               <p className="text-sm text-slate-400">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}