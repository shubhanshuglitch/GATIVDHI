/**
 * ComplexityChart.jsx — Skill: Algorithm Complexity Visualization
 * ================================================================
 * Skills System: Displays Big-O comparison charts and runtime data.
 */
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ComplexityChart({ comparisonData }) {
  if (!comparisonData || !comparisonData.length) return <div className="empty-state">No data</div>;

  const data = {
    labels: comparisonData.map(c => c.name),
    datasets: [{
      label: 'Execution Time (ms)',
      data: comparisonData.map(c => c.execution_time_ms),
      backgroundColor: ['rgba(0,212,255,0.6)', 'rgba(0,255,136,0.6)', 'rgba(255,184,0,0.6)', 'rgba(168,85,247,0.6)', 'rgba(255,77,106,0.6)'],
      borderColor: ['#00d4ff', '#00ff88', '#ffb800', '#a855f7', '#ff4d6a'],
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(10,14,26,0.9)', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1 },
    },
    scales: {
      x: { ticks: { color: '#8892a8', font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: '#5a6478', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  return (
    <div>
      <div style={{ height: 220 }}><Bar data={data} options={options} /></div>
      <div className="complexity-info">
        {comparisonData.map((c, i) => (
          <div key={i} className="complexity-badge">
            <div className="algo-name">{c.name}</div>
            <div className="big-o">{c.time_complexity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
