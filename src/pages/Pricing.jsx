import { Link } from 'react-router-dom';
import { BlobField } from '../components/Blobs.jsx';
import { PageHead } from '../components/ui.jsx';
import { PLANS } from '../data/catalog.js';
import { eur } from '../lib/vat.js';

export function PlanCard({ plan, selected, onSelect, ink }) {
  const Tag = onSelect ? 'button' : 'div';
  return (
    <Tag type={onSelect ? 'button' : undefined} onClick={onSelect} className={`card plan ${ink ? 'card-ink' : ''} ${selected ? 'sel' : ''}`}>
      <div className="between" style={{ alignItems: 'center' }}>
        <span className="label">{plan.name}</span>
        {plan.badge && <span className="chip chip-accent">{plan.badge}</span>}
      </div>
      <div><span className="price">{eur(plan.price)}</span> <span className="dim mono" style={{ fontSize: 12 }}>{plan.unit} excl. VAT</span></div>
      <p className="dim" style={{ margin: 0, fontSize: 15 }}>{plan.blurb}</p>
      <ul>{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
    </Tag>
  );
}

export default function Pricing() {
  return (
    <div className="page">
      <BlobField blobs={[{ x: '-4%', y: '10%', size: 240, duration: 14 }, { x: '4%', y: '24%', size: 150, duration: 11, delay: -3 }]} />
      <div className="wrap" style={{ position: 'relative' }}>
        <PageHead label="Pricing" title={<>Simple prices, <span className="serif">instant</span> invoices.</>}>
          <p className="lead">Prices exclude VAT. Belgian customers pay 21%. EU companies with a valid VAT number get the reverse charge, checked live in VIES.</p>
        </PageHead>
        <div className="grid-3">
          {PLANS.map((p, i) => (
            <div key={p.id} className="stack">
              <PlanCard plan={p} ink={i === 1} />
              <Link to={`/order?plan=${p.id}`} className={`btn ${i === 1 ? 'btn-accent' : 'btn-ink'} btn-block`}>Choose {p.id === 'team' ? 'team' : p.id}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
