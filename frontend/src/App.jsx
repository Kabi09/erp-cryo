import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsListPage } from './pages/LeadsListPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { CustomerListPage } from './pages/CustomerListPage';
import { QuotationsListPage } from './pages/QuotationsListPage';
import { ProformaInvoicesListPage } from './pages/ProformaInvoicesListPage';
import { PurchaseOrdersListPage } from './pages/PurchaseOrdersListPage';
import { POVerificationsListPage } from './pages/POVerificationsListPage';
import { SalesOrdersListPage } from './pages/SalesOrdersListPage';
import { SalesOrderDetailPage } from './pages/SalesOrderDetailPage';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Sales ERP routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsListPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/quotations" element={<QuotationsListPage />} />
            <Route path="/proforma-invoices" element={<ProformaInvoicesListPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersListPage />} />
            <Route path="/verifications" element={<POVerificationsListPage />} />
            <Route path="/sales-orders" element={<SalesOrdersListPage />} />
            <Route path="/sales-orders/:id" element={<SalesOrderDetailPage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

