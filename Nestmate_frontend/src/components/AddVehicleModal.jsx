// src/components/AddVehicleModal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AddVehicleModal({ show, onClose, newVehicle, setNewVehicle, onSubmit }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (show) {
      document.body.style.overflow = 'hidden'; // lock background scroll
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop (clicking it closes modal) */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel - highest z so inputs receive clicks */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[10000] w-full max-w-lg bg-white rounded-lg shadow-xl p-6 mx-4"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Allowed Vehicle</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">License Plate *</label>
            <input
              type="text"
              value={newVehicle.licensePlate}
              onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value.toUpperCase() })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0e2a4a] focus:border-[#0e2a4a]"
              placeholder="Enter license plate"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Flat Number *</label>
            <input
              type="text"
              value={newVehicle.flatNumber}
              onChange={(e) => setNewVehicle({ ...newVehicle, flatNumber: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0e2a4a] focus:border-[#0e2a4a]"
              placeholder="Enter flat number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Owner Name</label>
            <input
              type="text"
              value={newVehicle.ownerName}
              onChange={(e) => setNewVehicle({ ...newVehicle, ownerName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0e2a4a] focus:border-[#0e2a4a]"
              placeholder="Enter owner name"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-[#0e2a4a] text-white rounded hover:bg-[#112f5a]"
          >
            Add Vehicle
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
