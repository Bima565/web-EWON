import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const TAGS = [
  "Voltage_AN",
  "Frekuensi",
  "Ampere",
  "Kilowatt_hour",
  "THD_AN"
];

const STORAGE_KEY = "dashboard_state_v1";

export default function Dashboard() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // ================= LOAD STATE DARI STORAGE =================
  const loadInitialState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const savedState = loadInitialState();

  const [activeTag, setActiveTag] = useState(
    savedState?.activeTag || "Voltage_AN"
  );

  const [latest, setLatest] = useState(
    savedState?.latest || {}
  );

  const [history, setHistory] = useState(
    savedState?.history || {
      labels: [],
      Voltage_AN: [],
      Frekuensi: [],
      Ampere: [],
      Kilowatt_hour: [],
      THD_AN: []
    }
  );

  // ================= SIMPAN KE STORAGE =================
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ activeTag, latest, history })
    );
  }, [activeTag, latest, history]);

  // ================= INIT CHART =================
  useEffect(() => {
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: history.labels,
        datasets: [
          {
            label: activeTag,
            data: history[activeTag],
            borderWidth: 2,
            tension: 0, // 🔥 tajam lancip
            pointRadius: 0,
            segment: {
              borderColor: ctx =>
                ctx.p1.parsed.y > ctx.p0.parsed.y
                  ? "#22c55e"
                  : "#ef4444"
            }
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 300 },
        maintainAspectRatio: false,
        scales: {
          y: { ticks: { precision: 2 } }
        }
      }
    });

    return () => chartInstanceRef.current.destroy();
  }, []);

  // ================= FETCH TERAKHIR (2 DETIK) =================
  useEffect(() => {
    const loadLatest = async () => {
      const res = await fetch("/api/history/latest");
      const rows = await res.json();

      const now = new Date().toLocaleTimeString();
      const values = {};

      rows.forEach(r => {
        values[r.tag_name] = r.tag_value;
      });

      setLatest(values);

      setHistory(prev => ({
        labels: [...prev.labels, now].slice(-30),
        Voltage_AN: [...prev.Voltage_AN, values.Voltage_AN].slice(-30),
        Frekuensi: [...prev.Frekuensi, values.Frekuensi].slice(-30),
        Ampere: [...prev.Ampere, values.Ampere].slice(-30),
        Kilowatt_hour: [...prev.Kilowatt_hour, values.Kilowatt_hour].slice(-30),
        THD_AN: [...prev.THD_AN, values.THD_AN].slice(-30)
      }));
    };

    loadLatest();
    const i = setInterval(loadLatest, 2000);
    return () => clearInterval(i);
  }, []);

  // ================= UPDATE CHART =================
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    chartInstanceRef.current.data.labels = history.labels;
    chartInstanceRef.current.data.datasets[0].label = activeTag;
    chartInstanceRef.current.data.datasets[0].data = history[activeTag];
    chartInstanceRef.current.update("none");
  }, [history, activeTag]);

  return (
    <>
      <header className="topbar">
        <h1>PNM Energy Monitoring</h1>
        <small>SQL Live Data (2 detik)</small>
      </header>

      {/* METRICS */}
      <section className="metrics">
        {TAGS.map(tag => (
          <div
            key={tag}
            className="metric-card"
            onClick={() => setActiveTag(tag)}
            style={{
              cursor: "pointer",
              border:
                activeTag === tag
                  ? "2px solid #38bdf8"
                  : "1px solid #334155"
            }}
          >
            <h4>{tag}</h4>
            <div className="value">
              {latest[tag] !== undefined
                ? Number(latest[tag]).toFixed(2)
                : "--"}
            </div>
          </div>
        ))}
      </section>

      {/* CHART */}
      <section className="charts">
        <div className="chart-box" style={{ height: 360 }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </section>
    </>
  );
}
