import { Link } from 'react-router-dom';
import { BlobField } from '../components/Blobs.jsx';
import { PageHead, Spinner } from '../components/ui.jsx';
import { withCopy } from '../data/catalog.js';
import { getProducts } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { eur } from '../lib/vat.js';

export function PlanCard({ plan, selected, onSelect, ink }) {
  const Tag = onSelect ? 'button' : 'div';
  return (
    <Tag type={onSelect ? 'button' : undefined} onClick={onSelect} className={`card plan ${ink ? 'card-ink' : ''} ${selected ? 'sel' : ''}`}>
      <div className="between" style={{ alignItems: 'center' }}>
        <span className="label">{plan.name}</span>
        {plan.badge && <span className="chip chip-accent">{plan.badge}</span>}
      </div>
      <div><span className="price">{eur(plan.price_excl)}</span> <span className="dim mono" style={{ fontSize: 12 }}>{plan.unit} excl. VAT</span></div>
      <p className="dim" style={{ margin: 0, fontSize: 15 }}>{plan.blurb}</p>
      <ul>{plan.features?.map((f) => <li key={f}>{f}</li>)}</ul>
    </Tag>
  );
}

export default function Pricing() {
  const { data } = useApi(getProducts, []);
  const plans = data ? withCopy(data) : null;
  return (
    <div className="page">
      <BlobField blobs={[{ x: '-4%', y: '10%', size: 240, duration: 14 }, { x: '4%', y: '24%', size: 150, duration: 11, delay: -3 }]} />
      <div className="wrap" style={{ position: 'relative' }}>
        <PageHead label="Pricing" title={<>Simple prices, <span className="serif">instant</span> invoices.</>}>
          <p className="lead">Prices exclude VAT. Belgian customers and private persons in the EU pay 21%. EU companies with a valid VAT number get the reverse charge, checked live in VIES.</p>
        </PageHead>
        {!plans ? <Spinner /> : (
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {plans.map((p) => (
              <div key={p.code} className="stack">
                <PlanCard plan={p} ink={p.code === 'yearly'} />
                <Link to={`/order?plan=${p.code}`} className={`btn ${p.code === 'yearly' ? 'btn-accent' : 'btn-ink'} btn-block`}>Choose {p.name.toLowerCase()}</Link>
              </div>
            ))}
          </div>
        )}
        <p className="hint" style={{ marginTop: 24 }}>Workshops at your company are quoted individually. <Link to="/support?topic=other" className="link">Ask us</Link></p>
      </div>
    </div>
  );
}
