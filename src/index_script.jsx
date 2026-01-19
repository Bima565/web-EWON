const ctx = document.getElementById("voltageChart").getContext("2d");

const labels = [];
const dataVoltage = [];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Voltage AN",
      data: dataVoltage,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      segment: {
        borderColor: ctx =>
          ctx.p0.parsed.y > ctx.p1.parsed.y
            ? "#ef4444"
            : "#38bdf8"
      }
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: "#94a3b8" } },
      y: { ticks: { color: "#94a3b8" } }
    },
    plugins: {
      legend: { labels: { color: "#e5e7eb" } }
    }
  }
});

// === FETCH DATA ===
async function loadData() {
  const res = await fetch("/api/ewon");
  const d = await res.json();

  document.getElementById("v_an").textContent = d.pm139voltAN.toFixed(2) + " V";
  document.getElementById("freq").textContent = "50.03 Hz";
  document.getElementById("amp").textContent = "40 A";
  document.getElementById("kwh").textContent = "0.004 kWh";
  document.getElementById("thd").textContent = "2.44 %";

  const now = new Date().toLocaleTimeString();
  labels.push(now);
  dataVoltage.push(d.pm139voltAN);

  if (labels.length > 30) {
    labels.shift();
    dataVoltage.shift();
  }

  chart.update();
}

setInterval(loadData, 2000);
loadData();

