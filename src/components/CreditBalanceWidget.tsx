import React from 'react';

// Normally you would fetch this from your useCreditoStore
const CreditBalanceWidget: React.FC = () => {
    return (
        <div className="badge bg-warning text-dark border border-warning fs-6">
            <i className="bi bi-coin me-2"></i>
            Créditos: 5 {/* Placeholder */}
        </div>
    );
};

export default CreditBalanceWidget;
