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

const TAGS = [
  "Voltage_AN",
  "Frekuensi",
  "Ampere",
  "Kilowatt_hour",
  "THD_AN"
];

export default function HistoryPower() {
  const [history, setHistory] = useState([]);

  // ================= FETCH HISTORY =================
  const loadHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    loadHistory();
    const i = setInterval(loadHistory, 1000); // ⏱ 30 detik
    return () => clearInterval(i);
  }, []);

  // ================= GROUP DATA PER TAG =================
  const grouped = TAGS.reduce((acc, tag) => {
    acc[tag] = history
      .filter(h => h.tag_name === tag)
      .map(h => ({
        time: new Date(h.created_at).toLocaleTimeString(),
        value: h.tag_value
      }));
    return acc;
  }, {});

  return (
    <>
      <header className="topbar">
        <h1>Power History (60 Menit)</h1>
        <small>Update tiap 30 detik</small>
      </header>

      {/* ================= GRID CHART ================= */}
      <section
        className="charts"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16
        }}
      >
        {TAGS.map(tag => {
          const rows = grouped[tag] || [];

          const chartData = {
            labels: rows.map(r => r.time),
            datasets: [
              {
                label: tag,
                data: rows.map(r => r.value),
                backgroundColor: "#38bdf8"
              }
            ]
          };

          return (
            <div
              key={tag}
              className="chart-box"
              style={{ height: 300 }}
            >
              <h4 style={{ marginBottom: 8 }}>{tag}</h4>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: false,
                  scales: {
                    y: {
                      ticks: { precision: 2 }
                    }
                  }
                }}
              />
            </div>
          );
        })}
      </section>
    </>
  );
}
