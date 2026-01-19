import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function HistoryPower() {
  const [history, setHistory] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/ewon");
      const data = await res.json();

      const now = new Date().toLocaleTimeString();

      setHistory(prev => [
        ...prev,
        {
          time: now,
          voltage: data.pm139voltAN,
          thd: data.pm139THDVAN
        }
      ]);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData(); // fetch awal

    const interval = setInterval(fetchData, 30000); // 30 detik
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: history.map(h => h.time),
    datasets: [
      {
        label: "Voltage (AN)",
        data: history.map(h => h.voltage),
      },
      {
        label: "THD Voltage (%)",
        data: history.map(h => h.thd),
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <>
      <header className="topbar">
        <h1>Power History</h1>
        <small>Update setiap 30 detik</small>
      </header>

      <section className="charts">
        <div className="chart-box" style={{ height: 350 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </section>
    </>
  );
}
