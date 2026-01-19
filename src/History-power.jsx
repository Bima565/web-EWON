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
  "pm139voltAN",
  "pmtest1",
  "pmtest2",
  "pmtest3",
  "pm139THDVAN"
];

export default function HistoryPower() {
  const [history, setHistory] = useState([]);

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
    const i = setInterval(loadHistory, 30000); // update 30 detik
    return () => clearInterval(i);
  }, []);

  const labels = [
    ...new Set(
      history.map(h =>
        new Date(h.created_at).toLocaleTimeString()
      )
    )
  ];

  const datasets = TAGS.map(tag => ({
    label: tag,
    data: labels.map((_, idx) => {
      const row = history.filter(h => h.tag_name === tag)[idx];
      return row ? row.tag_value : null;
    })
  }));

  return (
    <>
      <header className="topbar">
        <h1>Power History</h1>
        <small>Data dari database (update 30 detik)</small>
      </header>

      <section className="charts">
        <div className="chart-box" style={{ height: 350 }}>
          <Bar
            data={{ labels, datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false
            }}
          />
        </div>
      </section>
    </>
  );
}
