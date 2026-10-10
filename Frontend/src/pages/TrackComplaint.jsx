import { useState, useEffect } from "react";
import { getComplaints, getComplaintByTrackingId, updateComplaintStatus } from "../services/api";

function TrackComplaint({ initialTrackingId = "" }) {
  const [searchId, setSearchId] = useState(initialTrackingId);
  const [searchedComplaint, setSearchedComplaint] = useState(null);
  const [complaintsList, setComplaintsList] = useState([]);
  
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadComplaints = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const data = await getComplaints({
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        status: statusFilter || undefined
      });
      setComplaintsList(data.complaints || []);
    } catch (err) {
      setErrorMsg("Failed to load complaints list from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [categoryFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    if (initialTrackingId) {
      handleSearchById(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleSearchById = async (idToSearch = searchId) => {
    const queryId = (idToSearch || "").trim();
    if (!queryId) return;

    setIsLoading(true);
    setErrorMsg("");
    try {
      const result = await getComplaintByTrackingId(queryId);
      setSearchedComplaint(result);
    } catch (err) {
      setSearchedComplaint(null);
      setErrorMsg(err.response?.data?.detail || `No complaint record found for ID "${queryId}".`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (trackingId, newStatus) => {
    try {
      await updateComplaintStatus(trackingId, newStatus);
      if (searchedComplaint && searchedComplaint.tracking_id === trackingId) {
        setSearchedComplaint((prev) => ({ ...prev, status: newStatus }));
      }
      loadComplaints();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="kmc-view-container">
      <div className="view-header">
        <h2>Complaint Tracking & History</h2>
        <p>Track your complaint status using your Reference ID or browse recorded municipal complaints.</p>
      </div>

      {/* Search Bar Box */}
      <div className="track-search-card">
        <form onSubmit={(e) => { e.preventDefault(); handleSearchById(); }} className="search-input-group">
          <input
            type="text"
            placeholder="Enter Reference Tracking ID (e.g. KMC-2026-8492)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button type="submit" className="search-btn" disabled={isLoading || !searchId.trim()}>
            {isLoading ? "Searching..." : "Track Status"}
          </button>
        </form>
      </div>

      {errorMsg && <div className="form-error-alert">{errorMsg}</div>}

      {/* Single Searched Complaint Detail Card */}
      {searchedComplaint && (
        <div className="complaint-detail-card highlight-card">
          <div className="card-top-header">
            <div>
              <span className="reference-tag">{searchedComplaint.tracking_id}</span>
              <h3>{searchedComplaint.description}</h3>
            </div>
            <span className={`status-badge status-${searchedComplaint.status?.toLowerCase().replace(/\s+/g, '-')}`}>
              {searchedComplaint.status}
            </span>
          </div>

          <div className="progress-stepper">
            <div className={`step ${["Recorded", "In Progress", "Resolved"].includes(searchedComplaint.status) ? "active" : ""}`}>
              <div className="step-num">1</div>
              <span>Recorded</span>
            </div>
            <div className={`step-line ${["In Progress", "Resolved"].includes(searchedComplaint.status) ? "active" : ""}`} />
            <div className={`step ${["In Progress", "Resolved"].includes(searchedComplaint.status) ? "active" : ""}`}>
              <div className="step-num">2</div>
              <span>In Progress</span>
            </div>
            <div className={`step-line ${searchedComplaint.status === "Resolved" ? "active" : ""}`} />
            <div className={`step ${searchedComplaint.status === "Resolved" ? "active" : ""}`}>
              <div className="step-num">3</div>
              <span>Resolved</span>
            </div>
          </div>

          <div className="detail-grid">
            <div><span>Location:</span> <strong>📍 {searchedComplaint.location}</strong></div>
            <div><span>Category:</span> <strong className="category-chip">🏷️ {searchedComplaint.category}</strong></div>
            <div><span>Priority:</span> <strong className={`priority-chip priority-${searchedComplaint.priority?.toLowerCase()}`}>{searchedComplaint.priority}</strong></div>
            <div><span>Date Filed:</span> <strong>🕒 {searchedComplaint.created_at}</strong></div>
            <div><span>Citizen Contact:</span> <strong>👤 {searchedComplaint.citizen_name} {searchedComplaint.contact_number ? `(${searchedComplaint.contact_number})` : ''}</strong></div>
          </div>

          <div className="card-actions-row">
            <span>Update Status (Council Officer Action):</span>
            <select
              value={searchedComplaint.status}
              onChange={(e) => handleStatusChange(searchedComplaint.tracking_id, e.target.value)}
            >
              <option value="Recorded">Recorded</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Inspection">Pending Inspection</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      )}

      {/* Filter & Complaints History List */}
      <div className="history-section">
        <div className="section-title-bar">
          <h3>All Municipal Complaints ({complaintsList.length})</h3>
          
          <div className="filter-controls">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Road Maintenance">Road Maintenance</option>
              <option value="Drainage">Drainage</option>
              <option value="Street Lighting">Street Lighting</option>
              <option value="Electrical">Electrical</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Recorded">Recorded</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {complaintsList.length === 0 ? (
          <div className="empty-history-box">
            <p>No complaints found matching the criteria.</p>
          </div>
        ) : (
          <div className="complaints-table-container">
            <table className="kmc-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaintsList.map((item) => (
                  <tr key={item.id} onClick={() => { setSearchId(item.tracking_id); handleSearchById(item.tracking_id); }}>
                    <td><code className="tracking-code">{item.tracking_id}</code></td>
                    <td className="desc-cell">{item.description}</td>
                    <td>{item.location}</td>
                    <td><span className="table-badge cat">{item.category}</span></td>
                    <td><span className={`table-badge prio-${item.priority?.toLowerCase()}`}>{item.priority}</span></td>
                    <td><span className={`table-badge status-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span></td>
                    <td className="date-cell">{item.created_at?.split(" ")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackComplaint;
