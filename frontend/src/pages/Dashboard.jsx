import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel, getDepartmentLabel, isSuperAdmin, isDepartmentAdmin } from '../utils/roles';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  const isSuper = isSuperAdmin(user?.role);
  const isDeptAdmin = isDepartmentAdmin(user?.role);

  return (
    <div className="dashboard-page">
      {/* ─── Hero Welcome Banner ─── */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome, {user?.name || 'Administrator'}</h1>
          <p>
            You are logged in as <strong>{getRoleLabel(user?.role)}</strong> assigned to the{' '}
            <strong>{getDepartmentLabel(user?.department)}</strong> department.
          </p>
        </div>
        <div className="welcome-badge">
          <span className="live-dot" />
          System Operational
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Access Level</span>
            <div className="stat-icon-wrapper navy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{isSuper ? 'Enterprise Full' : 'Department Scoped'}</div>
          <div className="stat-footnote">
            {isSuper ? 'Cross-department administrative rights' : `Scoped strictly to ${getDepartmentLabel(user?.department)}`}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Role Permission Set</span>
            <div className="stat-icon-wrapper blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{getRoleLabel(user?.role)}</div>
          <div className="stat-footnote">
            {user?.role === 'serviceperson' ? 'Field services only' : 'Employee management enabled'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Assigned Division</span>
            <div className="stat-icon-wrapper emerald">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{getDepartmentLabel(user?.department)}</div>
          <div className="stat-footnote">Corporate Operations Division</div>
        </div>
      </div>

      {/* ─── Role Governance Info Card ─── */}
      <div className="info-card">
        <div className="info-card-header">
          <h2>RBAC Policy & Scoping Status</h2>
          {(isSuper || isDeptAdmin) && (
            <Link to="/employees" className="action-link-btn">
              Manage Employees &rarr;
            </Link>
          )}
        </div>
        <div className="info-card-body">
          {isSuper ? (
            <div className="policy-block super">
              <div className="policy-badge">Super Admin Override Active</div>
              <p>
                As Superadmin, you have unrestricted governance privileges. You can view, recruit, edit, and deactivate personnel across every department in the corporation (Sales, Accounts, Store, Logistics, R&amp;D, Service, Production, and Marketing).
              </p>
            </div>
          ) : isDeptAdmin ? (
            <div className="policy-block dept">
              <div className="policy-badge">Departmental Scoping Enforced</div>
              <p>
                As <strong>{getRoleLabel(user?.role)}</strong>, access is restricted to the <strong>{getDepartmentLabel(user?.department)}</strong> department. You can review and manage staff belonging only to your department. Modifications to other departments are rejected at the API boundary.
              </p>
            </div>
          ) : (
            <div className="policy-block service">
              <div className="policy-badge">Service Personnel Access</div>
              <p>
                You have localized field service access. Profile information is read-only and task execution logs will be surfaced in upcoming phases.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

