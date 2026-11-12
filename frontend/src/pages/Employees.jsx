import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  isSuperAdmin,
  isDepartmentAdmin,
  getRoleLabel,
  getDepartmentLabel,
  ALL_ROLES,
  ALL_DEPARTMENTS,
  ROLE_DEPARTMENT_MAP,
} from '../utils/roles';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    department: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuper = isSuperAdmin(user?.role);
  const isDept = isDepartmentAdmin(user?.role);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get('/employees');
      if (res.data?.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddDrawer = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: isSuper ? 'salesadmin' : user.role,
      department: isSuper ? 'sales' : user.department,
    });
    setFormError('');
    setDrawerOpen(true);
  };

  const openEditDrawer = (emp) => {
    setEditingId(emp._id);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      password: '', // optional on update
      role: emp.role,
      department: emp.department,
    });
    setFormError('');
    setDrawerOpen(true);
  };

  const handleRoleChange = (selectedRole) => {
    // If not superadmin, department is locked to user's department
    if (!isSuper) {
      setFormData((prev) => ({ ...prev, role: selectedRole }));
    } else {
      // For superadmin, auto-suggest the mapped department if available
      const mappedDept = ROLE_DEPARTMENT_MAP[selectedRole] || formData.department;
      setFormData((prev) => ({
        ...prev,
        role: selectedRole,
        department: mappedDept,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!formData.name.trim() || !formData.email.trim()) {
        throw new Error('Name and email are required');
      }

      if (!editingId && !formData.password) {
        throw new Error('Password is required for new employees');
      }

      if (editingId) {
        // Update
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // don't overwrite if empty
        const res = await api.put(`/employees/${editingId}`, payload);
        if (res.data?.success) {
          setDrawerOpen(false);
          fetchEmployees();
        }
      } else {
        // Create
        const res = await api.post('/employees', formData);
        if (res.data?.success) {
          setDrawerOpen(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        err.message ||
        'Error saving employee records.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (emp) => {
    if (emp._id === user?._id || emp._id === user?.id) {
      alert('You cannot deactivate your own account.');
      return;
    }

    const action = emp.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${emp.name}?`)) {
      return;
    }

    try {
      const res = await api.patch(`/employees/${emp._id}/toggle-active`);
      if (res.data?.success) {
        setEmployees((prev) =>
          prev.map((item) =>
            item._id === emp._id ? { ...item, isActive: !item.isActive } : item
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  // Filter list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      deptFilter === 'ALL' || emp.department === deptFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && emp.isActive) ||
      (statusFilter === 'INACTIVE' && !emp.isActive);

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="employees-page">
      {/* ─── Page Header ─── */}
      <div className="page-header">
        <div>
          <h1>Employee Governance</h1>
          <p>
            {isSuper
              ? 'Corporate Directory — full authority across all departments'
              : `Directory scoped to the ${getDepartmentLabel(user?.department)} department`}
          </p>
        </div>
        <button className="btn-primary" onClick={openAddDrawer}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Employee</span>
        </button>
      </div>

      {/* ─── Filters Bar ─── */}
      <div className="filters-card">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects">
          {isSuper && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="select-filter"
            >
              <option value="ALL">All Departments</option>
              {ALL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {getDepartmentLabel(dept)}
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* ─── Employees Table Card ─── */}
      <div className="table-card">
        {isLoading ? (
          <div className="table-loading">
            <div className="spinner" />
            <span>Retrieving personnel records...</span>
          </div>
        ) : error ? (
          <div className="table-error">{error}</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <h3>No employees found</h3>
            <p>Try modifying your search criteria or add a new employee.</p>
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="table-user-cell">
                        <div className="user-initials-badge">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="cell-name">{emp.name}</div>
                          <div className="cell-email">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dept-tag">
                        {getDepartmentLabel(emp.department)}
                      </span>
                    </td>
                    <td>
                      <span className="role-pill">
                        {getRoleLabel(emp.role)}
                      </span>
                    </td>
                    <td className="cell-phone">{emp.phone || '—'}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          emp.isActive ? 'active' : 'inactive'
                        }`}
                      >
                        <span className="dot" />
                        {emp.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action edit"
                          onClick={() => openEditDrawer(emp)}
                          title="Edit employee"
                        >
                          Edit
                        </button>
                        <button
                          className={`btn-action ${
                            emp.isActive ? 'deactivate' : 'activate'
                          }`}
                          onClick={() => handleToggleActive(emp)}
                          title={
                            emp.isActive
                              ? 'Deactivate account'
                              : 'Reactivate account'
                          }
                        >
                          {emp.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Slide-in Add/Edit Drawer ─── */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button
                className="drawer-close-btn"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            {formError && <div className="drawer-error">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="drawer-form">
              <div className="form-item">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-item">
                <label>Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. j.doe@cryo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="form-item">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 555-0199"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-item">
                <label>
                  {editingId
                    ? 'Reset Password (leave blank to keep current)'
                    : 'Password *'}
                </label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* Department selection */}
              <div className="form-item">
                <label>Department *</label>
                {isSuper ? (
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  >
                    {ALL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {getDepartmentLabel(dept)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={getDepartmentLabel(user?.department)}
                    className="disabled-input"
                  />
                )}
              </div>

              {/* Role selection */}
              <div className="form-item">
                <label>Role Assignment *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  {ALL_ROLES.filter((r) => isSuper || r !== 'superadmin').map(
                    (role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="drawer-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setDrawerOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

