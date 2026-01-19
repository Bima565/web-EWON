import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import "./index_style.css";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], dataVoltage: [] });

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: "Voltage AN",
              data: chartData.dataVoltage,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
              segment: {
                borderColor: (ctx) =>
                  ctx.p0.parsed.y > ctx.p1.parsed.y ? "#ef4444" : "#38bdf8",
              },
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: "#94a3b8" } },
            y: { ticks: { color: "#94a3b8" } },
          },
          plugins: {
            legend: { labels: { color: "#e5e7eb" } },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/ewon");
        if (!res.ok) throw new Error("Fetch failed");
        const d = await res.json();
        setData(d);

        setChartData((prevChartData) => {
          const now = new Date().toLocaleTimeString();
          const newLabels = [...prevChartData.labels, now];
          const newDataVoltage = [...prevChartData.dataVoltage, d.pm139voltAN];

          if (newLabels.length > 30) {
            newLabels.shift();
            newDataVoltage.shift();
          }
          return { labels: newLabels, dataVoltage: newDataVoltage };
        });
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
    const t = setInterval(loadData, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = chartData.labels;
      chartInstanceRef.current.data.datasets[0].data = chartData.dataVoltage;
      chartInstanceRef.current.update();
    }
  }, [chartData]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li>Power</li>
          <li>Settings</li>
          <li>Reboot</li>
        </ul>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>Magang PNM Energy Monitoring System</h1>
        </header>

        <section className="metrics">
          <div className="metric-card">
            <h4>Voltage (AN)</h4>
            <div className="value" id="v_an">{data ? `${data.pm139voltAN.toFixed(2)} V` : "-- V"}</div>
          </div>

          <div className="metric-card">
            <h4>Frequency</h4>
            <div className="value" id="freq">50.03 Hz</div>
          </div>

          <div className="metric-card">
            <h4>Ampere</h4>
            <div className="value" id="amp">40 A</div>
          </div>

          <div className="metric-card">
            <h4>KiloWattHour</h4>
            <div className="value" id="kwh">0.004 kWh</div>
          </div>

          <div className="metric-card">
            <h4>Total Harmonic Distortion</h4>
            <div className="value" id="thd">2.44 %</div>
          </div>
        </section>

        <section className="charts">
          <div className="chart-box">
            <canvas ref={chartRef} id="voltageChart"></canvas>
          </div>
        </section>
      </main>
    </div>
  );
}
