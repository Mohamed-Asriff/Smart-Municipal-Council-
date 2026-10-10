import { useState, useEffect } from "react";
import { analyzeComplaint, submitComplaint } from "../services/api";

function FileComplaint({ onSwitchToTracking }) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Live analysis debounce when description changes
  useEffect(() => {
    if (!description.trim() || description.trim().length < 5) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await analyzeComplaint(description);
        setAnalysis(res);
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      setErrorMsg("Please fill in both the issue description and exact location.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const result = await submitComplaint({
        description: description.trim(),
        location: location.trim(),
        citizen_name: citizenName.trim() || "Citizen",
        contact_number: contactNumber.trim() || ""
      });

      if (result.success) {
        setSubmissionResult(result.complaint);
        setDescription("");
        setLocation("");
        setCitizenName("");
        setContactNumber("");
        setAnalysis(null);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="kmc-view-container">
      <div className="view-header">
        <h2>Submit Municipal Complaint</h2>
        <p>File an official complaint with automated AI categorization and real-time priority analysis.</p>
      </div>

      {submissionResult ? (
        <div className="success-banner-card">
          <div className="success-icon">✓</div>
          <h3>Complaint Registered Successfully!</h3>
          <p>Your complaint has been saved in the Kalmunai Municipal Council database.</p>
          
          <div className="tracking-badge-box">
            <span>Reference Tracking ID:</span>
            <strong>{submissionResult.tracking_id}</strong>
          </div>

          <div className="summary-grid">
            <div><span>Category:</span> <strong>{submissionResult.category}</strong></div>
            <div><span>Priority:</span> <strong className={`priority-${submissionResult.priority?.toLowerCase()}`}>{submissionResult.priority}</strong></div>
            <div><span>Location:</span> <strong>{submissionResult.location}</strong></div>
            <div><span>Status:</span> <strong className="status-chip">{submissionResult.status}</strong></div>
          </div>

          <div className="action-buttons-row">
            <button className="primary-btn" onClick={() => setSubmissionResult(null)}>
              File Another Complaint
            </button>
            <button className="secondary-btn" onClick={() => onSwitchToTracking(submissionResult.tracking_id)}>
              Track Status
            </button>
          </div>
        </div>
      ) : (
        <div className="form-grid-layout">
          <form className="kmc-form-card" onSubmit={handleSubmit}>
            {errorMsg && <div className="form-error-alert">{errorMsg}</div>}

            <div className="form-group">
              <label htmlFor="description">Issue Description *</label>
              <textarea
                id="description"
                rows="4"
                placeholder="Describe the issue in detail (e.g. Water pipe leaking on Beach Road, Kalmunai-3...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location / Ward / Street *</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Main Street, Ward 5, Kalmunai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="citizenName">Your Name (Optional)</label>
                <input
                  id="citizenName"
                  type="text"
                  placeholder="e.g. Mohamed Asriff"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Phone Number (Optional)</label>
                <input
                  id="contactNumber"
                  type="tel"
                  placeholder="e.g. 077 123 4567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting || !description.trim() || !location.trim()}>
              {isSubmitting ? "Submitting Complaint..." : "Submit Complaint to KMC"}
            </button>
          </form>

          <aside className="ai-analysis-sidebar-card">
            <h3>AI Real-Time Analysis</h3>
            <p className="sidebar-subtext">Automatic priority, category classification & duplicate check.</p>

            {isAnalyzing ? (
              <div className="ai-loading-box">
                <span className="pulsing-dot" /> Analyzing text with KMC AI models...
              </div>
            ) : analysis ? (
              <div className="analysis-results-box">
                <div className="analysis-item">
                  <span className="analysis-label">Predicted Category</span>
                  <span className="category-tag">🏷️ {analysis.category}</span>
                </div>

                <div className="analysis-item">
                  <span className="analysis-label">Suggested Priority</span>
                  <span className={`priority-badge priority-${analysis.priority?.toLowerCase()}`}>
                    {analysis.priority === "HIGH" ? "🔴 HIGH" : analysis.priority === "MEDIUM" ? "🟡 MEDIUM" : "🟢 LOW"}
                  </span>
                </div>

                <div className="analysis-item">
                  <span className="analysis-label">Duplicate Detection</span>
                  {analysis.duplicate ? (
                    <div className="duplicate-alert warning">
                      <strong>⚠️ Potential Duplicate Found</strong> ({Math.round(analysis.similarity * 100)}% similarity)
                      <p className="matched-text">"{analysis.matched_complaint}"</p>
                    </div>
                  ) : (
                    <div className="duplicate-alert safe">
                      ✓ Unique complaint (similarity: {Math.round(analysis.similarity * 100)}%)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="ai-placeholder-box">
                <span className="sparkle-icon">✦</span>
                <p>Type a description on the left to see live AI priority classification and duplicate detection.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default FileComplaint;
