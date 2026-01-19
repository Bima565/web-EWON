import { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

const TAGS = [
  "pm139voltAN",
  "pmtest1",
  "pmtest2",
  "pmtest3",
  "pm139THDVAN"
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState("pm139voltAN");

  const [history, setHistory] = useState({
    labels: [],
    pm139voltAN: [],
    pmtest1: [],
    pmtest2: [],
    pmtest3: [],
    pm139THDVAN: []
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
          pm139voltAN: [...prev.pm139voltAN, d.pm139voltAN].slice(-30),
          pmtest1: [...prev.pmtest1, d.pmtest1].slice(-30),
          pmtest2: [...prev.pmtest2, d.pmtest2].slice(-30),
          pmtest3: [...prev.pmtest3, d.pmtest3].slice(-30),
          pm139THDVAN: [...prev.pm139THDVAN, d.pm139THDVAN].slice(-30),
        }));
      } catch (e) {
        setError(e.message);
      }
    };

    loadData();
    const i = setInterval(loadData, 2000);
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
