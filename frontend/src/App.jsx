import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import ProductList from './pages/products/ProductList';
import EnquiryList from './pages/enquiries/EnquiryList';
import EstimationList from './pages/estimations/EstimationList';
import FollowUpList from './pages/followups/FollowUpList';
import LeadList from './pages/leads/LeadList';
import QuotationList from './pages/quotations/QuotationList';
import NegotiationList from './pages/negotiations/NegotiationList';
import PIList from './pages/proformaInvoices/PIList';
import CustomerPOList from './pages/customerPOs/CustomerPOList';
import PaymentList from './pages/payments/PaymentList';
import SalesOrderList from './pages/salesOrders/SalesOrderList';
import Reports from './pages/reports/Reports';
import UserManagement from './pages/users/UserManagement';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating ERP session..." />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Business ERP Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="enquiries" element={<EnquiryList />} />
            <Route path="estimations" element={<EstimationList />} />
            <Route path="followups" element={<FollowUpList />} />
            <Route path="leads" element={<LeadList />} />
            <Route path="quotations" element={<QuotationList />} />
            <Route path="negotiations" element={<NegotiationList />} />
            <Route path="proforma-invoices" element={<PIList />} />
            <Route path="customer-pos" element={<CustomerPOList />} />
            <Route path="payments" element={<PaymentList />} />
            <Route path="sales-orders" element={<SalesOrderList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
