/**
 * PriceChart.jsx — Skill: Interactive Stock Price Chart
 * =====================================================
 * Skills System: Reusable chart component used across Prediction,
 * Algorithm, and Backtest panels. Supports multiple datasets overlay.
 */
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PriceChart({ labels, datasets, title = '', height = 280 }) {
  if (!labels || !datasets) return <div className="empty-state">No chart data</div>;

  const colors = [
    { border: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    { border: '#00ff88', bg: 'rgba(0,255,136,0.1)' },
    { border: '#ff4d6a', bg: 'rgba(255,77,106,0.1)' },
    { border: '#ffb800', bg: 'rgba(255,184,0,0.1)' },
    { border: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  ];

  const data = {
    labels: labels.map((l, i) => i % Math.ceil(labels.length / 15) === 0 ? l : ''),
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color || colors[i % colors.length].border,
      backgroundColor: ds.fill ? (ds.bgColor || colors[i % colors.length].bg) : 'transparent',
      borderWidth: ds.borderWidth || 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: ds.fill || false,
      tension: 0.3,
      borderDash: ds.dashed ? [5, 5] : [],
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#8892a8', font: { size: 11, family: 'Inter' }, boxWidth: 12, padding: 15 } },
      title: title ? { display: true, text: title, color: '#e8ecf4', font: { size: 13, family: 'Inter', weight: 600 } } : { display: false },
      tooltip: { backgroundColor: 'rgba(10,14,26,0.9)', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1, titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } },
    },
    scales: {
      x: { ticks: { color: '#5a6478', font: { size: 10 }, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#5a6478', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
    interaction: { intersect: false, mode: 'index' },
  };

  return <div style={{ height }}><Line data={data} options={options} /></div>;
}
