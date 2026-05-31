import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler, Legend } from 'chart.js';
import { analytics } from '../../data/mockData.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler, Legend);

const baseOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(148,163,184,.18)' } }, x: { grid: { display: false } } } };

export function RevenueChart() {
  return <div className="chart"><Line options={baseOptions} data={{ labels: analytics.revenueLabels, datasets: [{ data: analytics.revenueData, borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,.12)', fill: true, tension: .42 }] }} /></div>;
}

export function DiseaseChart() {
  return <div className="chart"><Doughnut options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } } }} data={{ labels: analytics.diseaseLabels, datasets: [{ data: analytics.diseaseData, backgroundColor: ['#0ea5e9', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444'], borderWidth: 0 }] }} /></div>;
}

export function AppointmentTrend() {
  return <div className="chart small"><Bar options={baseOptions} data={{ labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], datasets: [{ data: [42, 39, 51, 47, 63, 34], backgroundColor: '#14b8a6', borderRadius: 8 }] }} /></div>;
}
