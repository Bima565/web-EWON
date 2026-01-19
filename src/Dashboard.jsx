import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

const TAGS = [
  "Voltage_AN",
  "Frekuensi",
  "Ampere",
  "Kilowatt_hour",
  "THD_AN"
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState("Voltage_AN");

  const [history, setHistory] = useState({
    labels: [],
    Voltage_AN: [],
    Frekuensi: [],
    Ampere: [],
    Kilowatt_hour: [],
    THD_AN: []
  });

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // ===================== INIT CHART =====================
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: activeTag,
            data: [],
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            segment: {
              borderColor: (ctx) =>
                ctx.p0.parsed.y > ctx.p1.parsed.y
                  ? "#ef4444" // turun
                  : "#22c55e", // naik
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          y: {
            ticks: { precision: 2 },
          },
        },
      },
    });

    return () => chartInstanceRef.current.destroy();
  }, []);

  // ===================== FETCH DATA =====================
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/ewon");
        if (!res.ok) throw new Error("Fetch failed");
        const d = await res.json();
        setData(d);

        const time = new Date().toLocaleTimeString();

        setHistory((prev) => ({
          labels: [...prev.labels, time].slice(-30),
          Voltage_AN: [...prev.Voltage_AN, d.Voltage_AN].slice(-30),
          Frekuensi: [...prev.Frekuensi, d.Frekuensi].slice(-30),
          Ampere: [...prev.Ampere, d.Ampere].slice(-30),
          Kilowatt_hour: [...prev.Kilowatt_hour, d.Kilowatt_hour].slice(-30),
          THD_AN: [...prev.THD_AN, d.THD_AN].slice(-30),
        }));
      } catch (e) {
        setError(e.message);
      }
    };

    loadData();
    const i = setInterval(loadData, 1000);
    return () => clearInterval(i);
  }, []);

  // ===================== UPDATE CHART =====================
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    chartInstanceRef.current.data.labels = history.labels;
    chartInstanceRef.current.data.datasets[0].label = activeTag;
    chartInstanceRef.current.data.datasets[0].data = history[activeTag];
    chartInstanceRef.current.update();
  }, [history, activeTag]);

  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <header className="topbar">
        <h1>Magang PNM Energy Monitoring System</h1>
      </header>

      {/* ================= METRICS ================= */}
      <section className="metrics">
        {TAGS.map((tag) => (
          <div
            key={tag}
            className="metric-card"
            style={{
              cursor: "pointer",
              border:
                activeTag === tag
                  ? "2px solid #38bdf8"
                  : "1px solid #334155",
            }}
            onClick={() => setActiveTag(tag)}
          >
            <h4>{tag}</h4>
            <div className="value">
              {data && data[tag] !== null ? data[tag].toFixed(2) : "--"}
            </div>
          </div>
        ))}
      </section>

      {/* ================= CHART ================= */}
      <section className="charts">
        <div className="chart-box" style={{ height: 360 }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </section>
    </>
  );
}
