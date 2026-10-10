import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './CitizenPayment.css';

const CitizenPayment = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardType, setCardType] = useState('visa');
  const [receiptFile, setReceiptFile] = useState(null);
  
  const citizenId = "Citizen ID-99372-XM"; 

  // Pagination & Sorting States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const [sortConfig, setSortConfig] = useState({ key: 'paymentDate', direction: 'desc' });

  // Custom Notification Toast State
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPendingPayments();
    fetchPaymentHistory();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/payments/citizen/${citizenId}/pending`);
      setPendingPayments(response.data);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/payments/citizen/${citizenId}/history`);
      const completedPayments = response.data.filter(payment => payment.status !== 'PENDING');
      setPaymentHistory(completedPayments);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault(); 
    if (!selectedPayment) return;

    if (paymentMethod === 'upload' && !receiptFile) {
      setNotification({ type: 'error', message: 'Please upload your bank transfer slip to proceed.' });
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/payments/process/${selectedPayment.id}`);
      
      if (paymentMethod === 'upload') {
        setNotification({ type: 'success', message: 'Receipt uploaded successfully! Pending admin verification.' });
      } else {
        setNotification({ type: 'success', message: 'Secure Card Payment Successful!' });
      }

      setSelectedPayment(null);
      setReceiptFile(null);
      
      fetchPendingPayments();
      fetchPaymentHistory(); 
      
      // Auto-hide toast after 4 seconds
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error("Payment failed:", error);
      setNotification({ type: 'error', message: 'Payment failed. Please try again.' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDownloadReceipt = (payment) => {
    const receiptHTML = `
      <html>
        <head>
          <title>Receipt - ${payment.transactionId}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #e61c24; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #1a1a1a; margin: 0; }
            .details p { font-size: 16px; line-height: 1.6; }
            .amount { font-size: 24px; font-weight: bold; color: #1e8e3e; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart Municipal Council</h1>
            <h3>Official Payment Receipt</h3>
          </div>
          <div class="details">
            <p><strong>Citizen ID:</strong> ${payment.citizenId}</p>
            <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
            <p><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleString()}</p>
            <p><strong>Category:</strong> ${payment.category}</p>
            <p class="amount">Total Paid: Rs. ${payment.amount.toLocaleString()}.00</p>
            <p><strong>Status:</strong> SUCCESS</p>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedHistory = [...paymentHistory].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
  const outstandingBalance = pendingPayments.reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="page-layout citizen-bg">
      <Sidebar role="citizen" activeMenu="Payments" />

      <main className="main-content">
        <Header role="citizen" />

        <div className="page-header">
          <h1>Payment Center</h1>
          <p>Manage and pay your municipal bills, taxes, and fines securely</p>
        </div>

        <div className="dashboard-grid">
          <div className="balance-card">
            <div className="card-top">
              <h3>Outstanding Balance</h3>
              {outstandingBalance > 0 && <span className="badge">Action Required</span>}
            </div>
            <h2>Rs. {outstandingBalance.toLocaleString()}.00</h2>
          </div>

          <div className="last-paid-card">
            <h3>Last Paid</h3>
            {paymentHistory.length > 0 ? (
              <>
                <h2>Rs. {paymentHistory[0].amount.toLocaleString()}.00</h2>
                <p>{paymentHistory[0].paymentDate ? new Date(paymentHistory[0].paymentDate).toLocaleDateString() : 'Date not available'}</p>
              </>
            ) : (
              <h2>Rs. 0.00</h2>
            )}
          </div>

          <div className="pending-section">
            <h3>Pending Payments</h3>
            {pendingPayments.length === 0 ? (
              <p style={{ color: '#666' }}>No pending payments right now.</p>
            ) : (
              pendingPayments.map((payment) => (
                <div className="pending-item" key={payment.id} style={{ border: selectedPayment?.id === payment.id ? '2px solid #e61c24' : '1px solid #eee' }}>
                  <span>{payment.category} - Rs. {payment.amount.toLocaleString()}.00</span>
                  <button className="btn-primary" onClick={() => setSelectedPayment(payment)}>Select</button>
                </div>
              ))
            )}
          </div>

          <div className="payment-form-container">
            <h3>Payment Options</h3>
            {selectedPayment ? (
              <div className="payment-form">
                <div className="payment-amount-box">
                  <strong>Paying:</strong> {selectedPayment.category} <br/>
                  <strong className="amount-highlight">Rs. {selectedPayment.amount.toLocaleString()}.00</strong>
                </div>

                <div className="payment-tabs">
                  <button className={paymentMethod === 'card' ? 'tab-btn active-tab' : 'tab-btn'} onClick={() => setPaymentMethod('card')}>💳 Credit / Debit Card</button>
                  <button className={paymentMethod === 'upload' ? 'tab-btn active-tab' : 'tab-btn'} onClick={() => setPaymentMethod('upload')}>🏦 Bank Deposit</button>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  {paymentMethod === 'card' && (
                    <div className="card-details-section">
                      <div className="card-type-selector">
                        <label className={`card-radio ${cardType === 'visa' ? 'selected' : ''}`}>
                          <input type="radio" name="cardType" checked={cardType === 'visa'} onChange={() => setCardType('visa')} />
                          <span className="card-logo visa">VISA</span>
                        </label>
                        <label className={`card-radio ${cardType === 'master' ? 'selected' : ''}`}>
                          <input type="radio" name="cardType" checked={cardType === 'master'} onChange={() => setCardType('master')} />
                          <span className="card-logo master">MasterCard</span>
                        </label>
                      </div>

                      <label>Cardholder Name</label>
                      <input type="text" placeholder="John Doe" required />
                      <label>Card Number</label>
                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength="19" required />
                      
                      <div className="form-row">
                        <div>
                          <label>Expiry Date</label>
                          <input type="text" placeholder="MM/YY" maxLength="5" required />
                        </div>
                        <div>
                          <label>CVV / CVC</label>
                          <input type="password" placeholder="123" maxLength="4" required />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upload' && (
                    <div className="upload-details-section">
                      <div className="bank-instructions">
                        <p>Please transfer <strong>Rs. {selectedPayment.amount.toLocaleString()}.00</strong> to the following account and upload the deposit slip.</p>
                        <ul>
                          <li><strong>Bank:</strong> Bank of Ceylon (BOC)</li>
                          <li><strong>Account No:</strong> 0001234567</li>
                        </ul>
                      </div>
                      <label>Upload Payment Slip / Receipt (PDF or Image)</label>
                      <input type="file" accept="image/*,.pdf" className="file-input" onChange={(e) => setReceiptFile(e.target.files[0])} />
                    </div>
                  )}

                  <button className="btn-pay-full" type="submit">
                    {paymentMethod === 'card' ? 'Secure Checkout' : 'Upload and Confirm'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => { setSelectedPayment(null); setReceiptFile(null); }}>Cancel</button>
                </form>
              </div>
            ) : (
              <div className="payment-placeholder">
                <span style={{ fontSize: '40px' }}>📄</span>
                <p>Please select a pending payment from the list to view payment options.</p>
              </div>
            )}
          </div>
        </div>

        <div className="table-container">
          <h3>Recent Payments</h3>
          <table>
            <thead>
              <tr>
                <th className="sortable-th" onClick={() => handleSort('paymentDate')}>
                  Date {sortConfig.key === 'paymentDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('transactionId')}>
                  Transaction ID {sortConfig.key === 'transactionId' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('category')}>
                  Category {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('amount')}>
                  Amount {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#666' }}>No recent payments found.</td>
                </tr>
              ) : (
                currentItems.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{payment.transactionId || 'N/A'}</td>
                    <td>{payment.category}</td>
                    <td>Rs. {payment.amount.toLocaleString()}.00</td>
                    <td><span className="status-success">Paid</span></td>
                    <td>
                      {payment.status === 'SUCCESS' && (
                        <button className="btn-icon" onClick={() => handleDownloadReceipt(payment)} title="Download Receipt">📥</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {paymentHistory.length > itemsPerPage && (
            <div className="pagination-controls">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="btn-page">Prev</button>
              <span className="page-indicator">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="btn-page">Next</button>
            </div>
          )}
        </div>

        {/* Top-Right Toast Notification */}
        {notification && (
          <div className="custom-popup-overlay">
            <div className={`custom-popup ${notification.type === 'error' ? 'error-toast' : ''}`}>
              <div className="popup-icon">
                {notification.type === 'success' ? '✅' : '⚠️'}
              </div>
              <div className="popup-text-content">
                <h2>{notification.type === 'success' ? 'Success!' : 'Notice'}</h2>
                <p>{notification.message}</p>
              </div>
              <button className="btn-popup-close" onClick={() => setNotification(null)}>✖</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CitizenPayment;