export default function HistoryPower() {
  return (
    <>
      <header className="topbar">
        <h1>Power History</h1>
      </header>

      <section className="metrics">
        <div className="metric-card">
          <h4>Total Energy</h4>
          <div className="value">12.4 kWh</div>
        </div>

        <div className="metric-card">
          <h4>Max Voltage</h4>
          <div className="value">232 V</div>
        </div>

        <div className="metric-card">
          <h4>Min Voltage</h4>
          <div className="value">210 V</div>
        </div>
      </section>

      <section className="charts">
        <div className="chart-box">
          <p>📊 Chart histori power (daily / weekly / monthly)</p>
        </div>
      </section>
    </>
  );
}
