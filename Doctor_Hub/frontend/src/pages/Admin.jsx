import { Database, KeyRound, Shield, UserPlus } from 'lucide-react';
import { Page, StatCard } from '../components/common/UI.jsx';

const users = [
  ['Dr. Sana Khan', 'DOCTOR', 'Active'],
  ['Bilal Ahmed', 'ASSISTANT', 'Active'],
  ['Ayesha Noor', 'PATIENT', 'Active'],
  ['Dr. Mariam Shah', 'DOCTOR', 'Review']
];

export default function Admin() {
  return <Page title="Administration" eyebrow="Users, diseases, permissions" actions={<button className="primary"><UserPlus size={17} /> Add user</button>}>
    <section className="stats-grid compact"><StatCard icon={Shield} label="Roles" value="5" /><StatCard icon={Database} label="Diseases" value="42" tone="teal" /><StatCard icon={KeyRound} label="Permissions" value="18" tone="indigo" /></section>
    <div className="panel data-panel"><div className="panel-head"><h3>User management</h3><span>Doctors, assistants, admins and patients</span></div><table><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Permission</th></tr></thead><tbody>{users.map(row => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td><span className={`status ${row[2].toLowerCase()}`}>{row[2]}</span></td><td><button className="secondary small">Manage</button></td></tr>)}</tbody></table></div>
  </Page>;
}
