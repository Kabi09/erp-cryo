import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';
import { Edit3, CheckCircle2 } from 'lucide-react';

export const EditLeadModal = ({ isOpen, onClose, lead, onSaved }) => {
  const addToast = useToastStore((state) => state.addToast);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    designation: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    source: 'Website',
    priority: 'MEDIUM',
    status: 'New',
    equipmentType: '',
    quantity: 1,
    estimatedBudget: 0,
    specificationDetails: '',
    expectedDeliveryTime: '4-6 Weeks',
  });

  useEffect(() => {
    if (isOpen && lead) {
      setFormData({
        companyName: lead.companyName || '',
        contactName: lead.contactPerson?.name || '',
        designation: lead.contactPerson?.designation || '',
        email: lead.email || '',
        phone: lead.phone || '',
        city: lead.city || '',
        state: lead.state || '',
        source: lead.source || 'Website',
        priority: lead.priority || 'MEDIUM',
        status: lead.status || 'New',
        equipmentType: lead.requirements?.equipmentType || '',
        quantity: lead.requirements?.quantity || 1,
        estimatedBudget: lead.requirements?.estimatedBudget || 0,
        specificationDetails: lead.requirements?.specificationDetails || '',
        expectedDeliveryTime: lead.requirements?.expectedDeliveryTime || '4-6 Weeks',
      });
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead?._id) return;

    try {
      setSaving(true);
      const payload = {
        companyName: formData.companyName.trim(),
        contactPerson: {
          name: formData.contactName.trim(),
          designation: formData.designation.trim(),
        },
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        source: formData.source.trim(),
        priority: formData.priority,
        status: formData.status,
        requirements: {
          equipmentType: formData.equipmentType.trim(),
          quantity: Number(formData.quantity) || 1,
          estimatedBudget: Number(formData.estimatedBudget) || 0,
          specificationDetails: formData.specificationDetails.trim(),
          expectedDeliveryTime: formData.expectedDeliveryTime.trim(),
        },
      };

      const res = await api.put(`/leads/${lead._id}`, payload);
      addToast({
        type: 'success',
        title: 'Lead Updated',
        message: `Lead ${lead.leadNumber} has been updated successfully.`,
      });

      if (onSaved) {
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Could not update lead details.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Lead: ${lead.leadNumber}`}
      subtitle={`Update commercial parameters, contact information, and requirements`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company & Contact Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company / Institution Name"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <Input
            label="Contact Person Name"
            required
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          />

          <Input
            label="Designation / Department"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Phone Number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Source"
            placeholder="e.g. Exhibition Bangalore, Website, Referral"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />

          <Select
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </Select>

          <Select
            label="Lead Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Qualified">Qualified</option>
            <option value="Disqualified">Disqualified</option>
            <option value="Quoted">Quoted</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Closed">Closed</option>
          </Select>
        </div>

        {/* Equipment & Value Section */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
            Equipment & Commercial Requirement
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product / Requirement Description"
                required
                placeholder="e.g. Blood Bank Refrigerator (+4°C) with automatic chart logging"
                value={formData.equipmentType}
                onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
              />
            </div>

            <Input
              label="Quantity"
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />

            <div className="sm:col-span-1">
              <Input
                label="Estimated Value / Budget (INR)"
                type="number"
                placeholder="e.g. 180000"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Expected Delivery Time"
                value={formData.expectedDeliveryTime}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Technical Specification Notes
          </label>
          <textarea
            rows="2"
            placeholder="Special technical parameters, accessories, or site requirements..."
            value={formData.specificationDetails}
            onChange={(e) => setFormData({ ...formData, specificationDetails: e.target.value })}
            className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} icon={CheckCircle2}>
            Update Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
};

