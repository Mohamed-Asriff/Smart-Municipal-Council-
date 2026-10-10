import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './AdminPayment.css';

const AdminPayment = () => {
  const [kpis, setKpis] = useState({ totalRevenue: 0, pendingCollections: 0, successRate: "0%" });
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [newBill, setNewBill] = useState({ citizenId: '', category: '', amount: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const [sortConfig, setSortConfig] = useState({ key: 'paymentDate', direction: 'desc' });

  // Custom Notification Toast State
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchKPIs();
    fetchTransactions();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/payments/admin/kpis");
      setKpis(response.data);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/payments/admin/all");
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewBill({ ...newBill, [e.target.name]: e.target.value });
  };

  const handleIssueBill = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/payments/admin/issue", newBill);
      setNotification({ type: 'success', message: 'New bill/fine issued successfully!' });
      setNewBill({ citizenId: '', category: '', amount: '' });
      fetchKPIs();
      fetchTransactions();
      
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error("Failed to issue bill:", error);
      setNotification({ type: 'error', message: 'Error issuing the bill. Please check backend connection.' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleGenerateReport = () => {
    const tableRows = filteredTransactions.map(txn => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${txn.paymentDate ? new Date(txn.paymentDate).toLocaleString() : 'Pending'}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${txn.transactionId || '---'}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${txn.citizenId}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${txn.category}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">Rs. ${txn.amount}.00</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${txn.status}</td>
      </tr>
    `).join('');

    const reportHTML = `
      <html>
        <head>
          <title>Payment Administration Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            h1 { color: #1a1a1a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { background-color: #1a1a1a; color: white; padding: 12px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart Municipal Council</h1>
            <h2>Transaction Report (${filterStatus})</h2>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Transaction ID</th>
                <th>Citizen ID</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '', 'width=1000,height=800');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filterStatus === 'ALL') return true;
    return txn.status === filterStatus;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let valA = a[sortConfig.key] || '';
    let valB = b[sortConfig.key] || '';
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  return (
    <div className="page-layout admin-bg">
      <Sidebar role="admin" activeMenu="Payment Management" />

      <main className="main-content">
        <Header role="admin" />

        <div className="page-header">
          <h1>Payment Administration & Oversight</h1>
        </div>

        <div className="issue-bill-card">
          <h3>Issue New Bill / Fine</h3>
          <form onSubmit={handleIssueBill} className="issue-bill-form">
            <input 
              type="text" name="citizenId" 
              placeholder="Citizen ID (e.g., Citizen ID-99372-XM)" 
              value={newBill.citizenId} onChange={handleInputChange} required 
            />
            <select name="category" value={newBill.category} onChange={handleInputChange} required className="category-select">
              <option value="" disabled>Select Category</option>
              <option value="Property Tax">Property Tax</option>
              <option value="Water Utility Bill">Water Utility Bill</option>
              <option value="Waste Collection Fee">Waste Collection Fee</option>
              <option value="Trade License Renewal">Trade License Renewal</option>
              <option value="Illegal Parking Fine">Illegal Parking Fine</option>
              <option value="Environmental Fine">Environmental Fine</option>
              <option value="Other Municipal Charges">Other Municipal Charges</option>
            </select>
            <input 
              type="number" name="amount" placeholder="Amount (Rs.)" 
              value={newBill.amount} onChange={handleInputChange} required 
            />
            <button type="submit" className="btn-issue">Issue Bill</button>
          </form>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <h3>Total Revenue (Monthly)</h3>
            <h2>Rs. {(kpis.totalRevenue || 0).toLocaleString()}.00</h2>
          </div>
          <div className="kpi-card">
            <h3>Pending Collections</h3>
            <h2>Rs. {(kpis.pendingCollections || 0).toLocaleString()}.00</h2>
          </div>
          <div className="kpi-card">
            <h3>Transaction Success Rate</h3>
            <h2>{kpis.successRate}</h2>
          </div>
        </div>

        <div className="filters-row">
          <input type="text" placeholder="Search Transaction ID..." className="search-input" />
          <select className="status-dropdown" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Transactions</option>
            <option value="SUCCESS">Paid / Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <button className="btn-generate" onClick={handleGenerateReport}>Generate Report</button>
        </div>

        <div className="table-container">
          <h3>Central Transaction Ledger</h3>
          <table>
            <thead>
              <tr>
                <th className="sortable-th" onClick={() => handleSort('paymentDate')}>
                  Date & Time {sortConfig.key === 'paymentDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('transactionId')}>
                  Transaction ID {sortConfig.key === 'transactionId' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('citizenId')}>
                  Citizen ID {sortConfig.key === 'citizenId' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('category')}>
                  Category {sortConfig.key === 'category' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('amount')}>
                  Amount {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#666' }}>No transactions found.</td>
                </tr>
              ) : (
                currentItems.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.paymentDate ? new Date(txn.paymentDate).toLocaleString() : 'Pending...'}</td>
                    <td>{txn.transactionId || '---'}</td>
                    <td>{txn.citizenId}</td>
                    <td>{txn.category}</td>
                    <td>Rs. {txn.amount.toLocaleString()}.00</td>
                    <td>
                      <span className={txn.status === 'SUCCESS' ? 'status-success' : txn.status === 'FAILED' ? 'status-failed' : 'status-pending'}>
                        {txn.status}
                      </span>
                    </td>
                    <td><button className="link-btn" onClick={() => setSelectedTxn(txn)}>[View Details]</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {filteredTransactions.length > itemsPerPage && (
            <div className="pagination-controls">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="btn-page">Prev</button>
              <span className="page-indicator">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="btn-page">Next</button>
            </div>
          )}
        </div>

        {/* View Details Modal */}
        {selectedTxn && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 style={{ color: '#000080', marginTop: 0 }}>Transaction Details</h2>
              <hr />
              <div className="modal-body" style={{ lineHeight: '1.8' }}>
                <p><strong>System ID:</strong> {selectedTxn.id}</p>
                <p><strong>Transaction ID:</strong> {selectedTxn.transactionId || 'Not Generated'}</p>
                <p><strong>Citizen ID:</strong> {selectedTxn.citizenId}</p>
                <p><strong>Category:</strong> {selectedTxn.category}</p>
                <p><strong>Amount:</strong> Rs. {selectedTxn.amount.toLocaleString()}.00</p>
                
                {/* Dynamically hide Date & Time if it does not exist (Pending) */}
                {selectedTxn.paymentDate && (
                  <p><strong>Date & Time:</strong> {new Date(selectedTxn.paymentDate).toLocaleString()}</p>
                )}

                <p><strong>Status:</strong> {selectedTxn.status}</p>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className="btn-close" onClick={() => setSelectedTxn(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

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

export default AdminPayment;