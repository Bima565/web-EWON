import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./Dashboard";
import HistoryPower from "./History-power";

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/power" className={({ isActive }) => isActive ? "active" : ""}>
              Power
            </NavLink>
          </li>
          <li>Settings</li>
          <li>Reboot</li>
        </ul>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/power" element={<HistoryPower />} />
        </Routes>
      </main>
    </div>
  );
}
