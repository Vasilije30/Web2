import { useEffect, useState } from "react";
import { checkAllServices, type ServiceHealth } from "../services/healthService";

export default function DashboardPage() {
  const [statuses, setStatuses] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAllServices().then((result) => {
      setStatuses(result);
      setLoading(false);
    });
  }, []);

  return (
    <section>
      <h1>Travel Planner</h1>
      <p>Lista planova putovanja dolazi u Fazi 7.</p>

      <h2>Status backend servisa</h2>
      {loading ? (
        <p>Proveravam servise...</p>
      ) : (
        <ul>
          {statuses.map((status) => (
            <li key={status.service}>
              {status.service}: {status.healthy ? "✅ dostupan" : "❌ nedostupan"}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
