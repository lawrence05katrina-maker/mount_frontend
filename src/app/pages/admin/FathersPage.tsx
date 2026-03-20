import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
type Father = {
  id: number;
  name: string;
  period?: string;
  category: string;
  display_order: number;
};

// ── Section Component ──────────────────────────────
const Section = ({ title, data }: { title: string; data: Father[] }) => {
  if (data.length === 0) return null;
  return (
    <div className="section-card">
      <h3>{title}</h3>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            {item.period && <em>{item.period}</em>}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Main Component ─────────────────────────────────
const FathersPage: React.FC = () => {
  const [fathers, setFathers] = useState<Father[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetchFathers();
  }, []);

  const fetchFathers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/bind/fathers`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        setFathers(data.data);
      } else {
        throw new Error(data.message || 'Failed to load fathers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fathers data');
    } finally {
      setLoading(false);
    }
  };

  // ── Group by category ────────────────────────────
  const grouped = {
    'Parish Priest':    fathers.filter(f => f.category === 'Parish Priest'),
    'Associate Priest': fathers.filter(f => f.category === 'Associate Priest'),
    'Son of Soil':      fathers.filter(f => f.category === 'Son of Soil'),
    'Deacon':           fathers.filter(f => f.category === 'Deacon'),
  };

  // ── Loading ──────────────────────────────────────
  if (loading) return (
    <div className="fathers-page">
      <div className="loading">Loading fathers information...</div>
      <style>{styles}</style>
    </div>
  );

  // ── Error ────────────────────────────────────────
  if (error) return (
    <div className="fathers-page">
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchFathers}>Try Again</button>
      </div>
      <style>{styles}</style>
    </div>
  );

  // ── Render ───────────────────────────────────────
  return (
    <div className="fathers-page">
      <h1>Fathers Information</h1>
      <div className="grid">
        <Section title="Parish Priests"         data={grouped['Parish Priest']} />
        <Section title="Associate Parish Priests" data={grouped['Associate Priest']} />
        <Section title="Sons of Soil"           data={grouped['Son of Soil']} />
        <Section title="Deacons"                data={grouped['Deacon']} />
      </div>
      <style>{styles}</style>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────
const styles = `
  .fathers-page { padding: 2.5rem 1.5rem; max-width: 1400px; margin: auto; font-family: "Inter", "Segoe UI", sans-serif; background: #f7faf7; }
  h1 { font-size: 2rem; font-weight: 600; margin-bottom: 2rem; color: #1f3d2b; border-left: 5px solid #2f6b3f; padding-left: 0.75rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.75rem; }
  .section-card { background: #ffffff; border-radius: 14px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-top: 4px solid #2f6b3f; }
  .section-card h3 { margin-bottom: 1rem; font-size: 1.15rem; color: #2f6b3f; font-weight: 600; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 0; border-bottom: 1px dashed #e2e8e2; font-size: 0.9rem; }
  li:last-child { border-bottom: none; }
  li span { font-weight: 500; color: #1f2937; }
  li em { font-style: normal; font-size: 0.8rem; color: #6b7280; }
  .loading { text-align: center; padding: 2rem; color: #666; }
  .error { text-align: center; padding: 2rem; color: #c33; }
  .error button { background: #2f6b3f; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; margin-top: 1rem; }
  @media (max-width: 768px) {
    .fathers-page { padding: 1rem 0.75rem; }
    h1 { font-size: 1.4rem; text-align: center; border-left: none; border-bottom: 3px solid #2f6b3f; padding-bottom: 0.5rem; }
    .grid { grid-template-columns: 1fr; gap: 1rem; }
    li { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
  }
`;

export default FathersPage;