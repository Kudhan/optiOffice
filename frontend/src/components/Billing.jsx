import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Billing({ token }) {
  const [billingInfo, setBillingInfo] = useState(null);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await axios.get(`${API_URL}/billing`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBillingInfo(response.data);
      } catch (err) {
        console.error("Failed to fetch billing info", err);
      }
    };
    fetchBilling();
  }, [token]);

  if (!billingInfo) return <div>Loading...</div>;

  return (
    <div className="billing-container">
      <h2>Billing & Subscription</h2>

      <div className="plan-summary">
        <div className="plan-card current">
          <h3>Current Plan</h3>
          <div className="plan-name">{billingInfo.plan}</div>
          <div className="plan-price">${billingInfo.amount_due}/mo</div>
          <div className="next-billing">Next billing: {billingInfo.next_billing_date}</div>
        </div>

        <div className="payment-method">
          <h3>Payment Method</h3>
          <div className="card-preview">
            <span className="card-brand">VISA</span>
            <span className="card-last4">•••• 4242</span>
          </div>
          <button className="update-btn">Update</button>
        </div>
      </div>

      <div className="invoice-history">
        <h3>Invoice History</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {billingInfo.invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.date}</td>
                <td>${inv.amount.toFixed(2)}</td>
                <td><span className="status-paid">{inv.status}</span></td>
                <td><button className="download-btn">PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Billing;
