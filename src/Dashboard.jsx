import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], dataVoltage: [] });

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Voltage AN",
            data: [],
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
      },
    });

    return () => chartInstanceRef.current.destroy();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/ewon");
        if (!res.ok) throw new Error("Fetch failed");
        const d = await res.json();
        setData(d);

        setChartData((prev) => {
          const time = new Date().toLocaleTimeString();
          const labels = [...prev.labels, time].slice(-30);
          const values = [...prev.dataVoltage, d.pm139voltAN].slice(-30);
          return { labels, dataVoltage: values };
        });
      } catch (e) {
        setError(e.message);
      }
    };

    loadData();
    const i = setInterval(loadData, 2000);
    return () => clearInterval(i);
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
    <>
      <header className="topbar">
        <h1>Magang PNM Energy Monitoring System</h1>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <h4>Voltage (AN)</h4>
          <div className="value">
            {data ? `${data.pm139voltAN.toFixed(2)} V` : "-- V"}
          </div>
        </div>
        <div className="metric-card">
          <h4>Frequency</h4>
          <div className="value">50.03 Hz</div>
        </div>
        <div className="metric-card">
          <h4>Ampere</h4>
          <div className="value">40 A</div>
        </div>
      </section>

      <section className="charts">
        <div className="chart-box">
          <canvas ref={chartRef}></canvas>
        </div>
      </section>
    </>
  );
}
