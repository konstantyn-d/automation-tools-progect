import Pipeline from '../components/Pipeline.jsx'
import { ADMIN_ORDERS } from '../data/member.js'
import { euro } from '../lib/vat.js'
import '../styles/course.css'
import '../styles/account.css'

const STATE = {
  access: ['chip--ok', 'Access given'],
  waiting: ['chip--info', 'Waiting for payment'],
  review: ['chip--warn', 'Needs a person'],
}

// First screen of the admin panel. This is where the automation becomes visible:
// customers never see it, the team does.
export default function Admin() {
  return (
    <main className="admin">
      <div className="container">
        <p className="eyebrow">Admin · sample data</p>
        <h1 className="h-section">
          Order runs. <span className="soft">From order form to login, step by step.</span>
        </h1>
        <p className="lede">
          Every order travels through the same five steps. A step that fails shows up here, with the reason,
          before a customer has to mail about it.
        </p>
      </div>

      <div className="admin__stage">
        <Pipeline />
      </div>

      <div className="container">
        <h2 className="course__h">Recent orders</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Product</th><th className="num">Total</th><th>Status</th><th>When</th></tr>
            </thead>
            <tbody>
              {ADMIN_ORDERS.map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.product}</td>
                  <td className="num">{euro(o.total)}</td>
                  <td><i className={`chip ${STATE[o.state][0]}`}>{STATE[o.state][1]}</i></td>
                  <td>{o.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
