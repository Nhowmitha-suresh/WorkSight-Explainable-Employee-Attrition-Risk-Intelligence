import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [features, setFeatures] = useState([]);
  const [featureNames, setFeatureNames] = useState([]);
  const [featureDesc, setFeatureDesc] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("input");
  const [apiConnected, setApiConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [batchData, setBatchData] = useState("");
  const [customThreshold, setCustomThreshold] = useState(0.3);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [profile, setProfile] = useState("");

  useEffect(() => {
    const initializeModel = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/");
        const data = await res.json();
        const count = data.expected_feature_count;
        setFeatures(Array(count).fill(0));
        if (data.feature_info) {
          setFeatureNames(data.feature_info.map(i => i.name));
          setFeatureDesc(data.feature_info.map(i => i.description));
        } else {
          setFeatureNames(data.feature_names || Array(count).fill(0).map((_, i) => `Feature ${i + 1}`));
          setFeatureDesc(Array(count).fill(""));
        }
        setApiConnected(true);
      } catch (err) {
        setError("Failed to connect to backend. Please ensure the server is running.");
        setApiConnected(false);
      }
    };
    initializeModel();
    
    // Load history from localStorage
    const savedHistory = localStorage.getItem("workSightHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // load theme
    const savedTheme = localStorage.getItem("workSightTheme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = parseFloat(value) || 0;
    setFeatures(newFeatures);
  };

  const loadSampleEmployee = () => {
    const sample = features.map(() => Math.random() * 2 - 1);
    setFeatures(sample);
    setEmployeeName("Sample Employee");
    setError(null);
  };

  const resetForm = () => {
    setFeatures(Array(features.length).fill(0));
    setResult(null);
    setError(null);
    setEmployeeName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) throw new Error("Prediction failed");
      
      const data = await response.json();
      setResult(data);
      
      // Save to history
      const newRecord = {
        id: Date.now(),
        name: employeeName || "Employee",
        timestamp: new Date().toLocaleString(),
        probability: data.attrition_risk_probability,
        category: data.risk_category,
      };
      
      const updatedHistory = [newRecord, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("workSightHistory", JSON.stringify(updatedHistory));
      
      setActiveTab("results");
    } catch (err) {
      setError(err.message || "An error occurred during prediction");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const lines = batchData.trim().split('\n');
      const results = [];
      
      for (const line of lines) {
        const values = line.split(',').map(v => parseFloat(v.trim()));
        if (values.length !== features.length) continue;
        
        const response = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features: values }),
        });
        
        if (response.ok) {
          const data = await response.json();
          results.push(data);
        }
      }
      
      if (results.length > 0) {
        exportBatchResults(results);
        setError(`Successfully analyzed ${results.length} employees`);
      }
    } catch (err) {
      setError("Batch analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportBatchResults = (results) => {
    const csv = "Employee,Risk Probability,Risk Category\n" + 
      results.map((r, i) => `Employee ${i+1},${r.attrition_risk_probability.toFixed(4)},${r.risk_category}`).join('\n');
    downloadFile(csv, "batch_analysis.csv");
  };

  const exportResults = () => {
    if (!result) return;
    
    const json = {
      employee: employeeName || "Employee",
      timestamp: new Date().toISOString(),
      risk_probability: result.attrition_risk_probability,
      risk_category: result.risk_category,
      top_factors: result.top_feature_impacts,
    };
    
    downloadFile(JSON.stringify(json, null, 2), "analysis_result.json");
  };

  const exportHistoryCSV = () => {
    if (history.length === 0) return;
    
    const csv = "Name,Date,Risk Probability,Risk Category\n" +
      history.map(h => `${h.name},${h.timestamp},${h.probability.toFixed(4)},${h.category}`).join('\n');
    downloadFile(csv, "history.csv");
  };

  const downloadFile = (content, filename) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem("workSightTheme", next);
  };

  const applyProfile = (profile) => {
    setProfile(profile);
    // simple presets with random ranges
    const presets = {
      "new-hire": Array(features.length).fill(0).map(() => Math.random() * 0.2),
      "high-performer": Array(features.length).fill(0).map(() => 0.8 + Math.random() * 0.2),
      "at-risk": Array(features.length).fill(0).map(() => -0.5 + Math.random()),
    };
    if (presets[profile]) setFeatures(presets[profile]);
  };

  const focusNextInput = (idx) => {
    const next = document.getElementById(`feature-${idx + 1}`);
    if (next) next.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextInput(idx);
    }
  };

  const addRipple = (e) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - btn.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - btn.offsetTop - radius}px`;
    circle.classList.add("ripple");
    const ripple = btn.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    btn.appendChild(circle);
  };

  const getRiskLevel = () => {
    if (!result) return null;
    const prob = result.attrition_risk_probability;
    if (prob >= customThreshold) return { category: "High Risk", color: "#ef4444", icon: "⚠️" };
    if (prob >= customThreshold * 0.5) return { category: "Medium Risk", color: "#f59e0b", icon: "⚡" };
    return { category: "Low Risk", color: "#22c55e", icon: "✓" };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title-animate">WorkSight AI</h1>
          <p>Advanced Employee Attrition Risk Intelligence Platform</p>
          <div className="api-status">
            <div className={`status-dot ${apiConnected ? "connected" : "disconnected"}`}></div>
            <span>{apiConnected ? "API Connected" : "API Disconnected"}</span>
          </div>
          <button className="theme-toggle btn" onClick={toggleTheme} title="Toggle light/dark theme" onMouseDown={addRipple}>
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="card fade-in">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "input" ? "active" : ""}`}
              onClick={() => setActiveTab("input")}
            >
              <span className="tab-icon">👥</span> Employee Data
            </button>
            <button
              className={`tab ${activeTab === "batch" ? "active" : ""}`}
              onClick={() => setActiveTab("batch")}
            >
              <span className="tab-icon">📦</span> Batch Analysis
            </button>
            <button
              className={`tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="tab-icon">⚙️</span> Settings
            </button>
            <button
              className={`tab ${activeTab === "results" ? "active" : ""}`}
              onClick={() => setActiveTab("results")}
              disabled={!result}
            >
              <span className="tab-icon">📊</span> Results
            </button>
            <button
              className={`tab ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <span className="tab-icon">📜</span> History ({history.length})
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className={`alert ${error.includes("Successfully") ? "alert-success" : "alert-error"} slide-in`}>
              <span>{error.includes("Failed") || error.includes("failed") ? "⚠️" : "✓"} {error}</span>
            </div>
          )}

          {/* Single Employee Input Tab */}
          {activeTab === "input" && (
            <div className="tab-content fade-in">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Employee Name (Optional)</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter employee name..."
                    className="name-input"
                    title="Give this analysis a friendly name"
                  />
                </div>
                <div className="form-group">
                  <label>Quick Profile</label>
                  <select
                    value={profile}
                    onChange={(e) => applyProfile(e.target.value)}
                    className="name-input"
                    title="Choose a preset profile to auto-fill features"
                  >
                    <option value="">-- select --</option>
                    <option value="new-hire">New Hire</option>
                    <option value="high-performer">High Performer</option>
                    <option value="at-risk">At-Risk</option>
                  </select>
                </div>

                <div className="features-grid">
                  {features.map((value, index) => (
                    <div key={index} className="feature-input slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <label htmlFor={`feature-${index}`}>
                        <span className="feature-label" title={featureDesc[index] || ''}>{featureNames[index] || `Feature ${index + 1}`}</span>
                        {featureDesc[index] && (
                          <span className="feature-desc">{featureDesc[index]}</span>
                        )}
                      </label>
                      <input
                        id={`feature-${index}`}
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder="0.00"
                        title="Enter a value and press Enter to move to next field"
                      />
                    </div>
                  ))}
                </div>

                <div className="button-group">
                  <button type="button" className="btn btn-secondary hover-lift" onClick={loadSampleEmployee} onMouseDown={addRipple} title="Fill fields with random sample">
                    <span>🎲</span> Load Sample
                  </button>
                  <button type="button" className="btn btn-secondary hover-lift" onClick={resetForm} onMouseDown={addRipple} title="Clear all inputs">
                    <span>🔄</span> Clear
                  </button>
                  <button type="submit" className="btn btn-primary hover-lift" disabled={loading} onMouseDown={addRipple} title="Submit features for risk analysis">
                    {loading ? <><span className="spinner"></span> Analyzing...</> : <><span>🔍</span> Analyze Risk</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Batch Analysis Tab */}
          {activeTab === "batch" && (
            <div className="tab-content fade-in">
              <h3>🚀 Batch Employee Analysis</h3>
              <p style={{color: 'var(--text-secondary)', marginBottom: '20px'}}>
                Enter employee data (comma-separated values, one per line). Example: 25,2,50000,4,3,4,...
              </p>
              <textarea
                value={batchData}
                onChange={(e) => setBatchData(e.target.value)}
                placeholder="25,2,50000,4,3,4,2,5,3,10"
                className="batch-textarea"
                rows="8"
              />
              <button type="button" className="btn btn-primary hover-lift" onClick={handleBatchAnalysis} disabled={loading || !batchData} onMouseDown={addRipple} title="Run analysis on each line of input">
                {loading ? <><span className="spinner"></span> Processing...</> : <><span>📦</span> Analyze Batch</>}
              </button>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="tab-content fade-in">
              <div className="settings-panel">
                <h3>⚙️ Risk Threshold Settings</h3>
                
                <div className="setting-item">
                  <label>High Risk Threshold: {(customThreshold * 100).toFixed(1)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={customThreshold}
                    onChange={(e) => setCustomThreshold(parseFloat(e.target.value))}
                    className="threshold-slider"
                  />
                  <div className="threshold-labels">
                    <span>10%</span>
                    <span>50%</span>
                    <span>90%</span>
                  </div>
                </div>

                <div className="setting-item">
                  <h4>Risk Categories</h4>
                  <p>🔴 High Risk: ≥ {(customThreshold * 100).toFixed(0)}%</p>
                  <p>🟡 Medium Risk: {((customThreshold * 50) | 0)}% - {((customThreshold * 100) | 0)}%</p>
                  <p>🟢 Low Risk: &lt; {((customThreshold * 50) | 0)}%</p>
                </div>

                {history.length > 0 && (
                  <div className="setting-item">
                    <h4>Data Management</h4>
                    <button onClick={exportHistoryCSV} className="btn btn-secondary" onMouseDown={addRipple} title="Download history as CSV">
                      <span>📥</span> Export History as CSV
                    </button>
                    <button onClick={() => { setHistory([]); localStorage.removeItem("workSightHistory"); }} className="btn btn-secondary" onMouseDown={addRipple} title="Erase history records">
                      <span>🗑️</span> Clear History
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && result && (
            <div className="tab-content fade-in">
              <div className="results-container">
                {/* Risk Score Display */}
                <div className="risk-display slide-up">
                  <div className="risk-meter">
                    <div
                      className="risk-indicator"
                      style={{
                        background: riskLevel.color,
                        height: `${result.attrition_risk_probability * 100}%`,
                      }}
                    />
                  </div>
                  <div className="risk-info">
                    <div className="risk-icon" style={{ color: riskLevel.color }}>
                      {riskLevel.icon}
                    </div>
                    <p className="risk-percentage" style={{ color: riskLevel.color }}>
                      {(result.attrition_risk_probability * 100).toFixed(1)}%
                    </p>
                    <p className="risk-category">{riskLevel.category}</p>
                    {employeeName && <p className="employee-name">Employee: {employeeName}</p>}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="insights-section slide-up" style={{ animationDelay: "0.1s" }}>
                  <h3>🎯 Key Contributing Factors</h3>
                  <div className="factors-list">
                    {result.top_feature_impacts.map((item, index) => (
                      <div 
                        key={index} 
                        className="factor-item slide-up" 
                        style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                      >
                        <div className="factor-name">
                          <span className="factor-rank">#{index + 1}</span>
                          <span title={item.description || ''}>{item.feature_name}</span>
                        </div>
                        <div className="factor-impact">
                          <div className="impact-bar">
                            <div
                              className="impact-fill"
                              style={{
                                width: `${Math.min(
                                  (Math.abs(item.impact) / 
                                    Math.max(...result.top_feature_impacts.map(f => Math.abs(f.impact)))) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="impact-value">{item.impact.toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div 
                  className={`recommendation box-${riskLevel.category.split(" ")[0].toLowerCase()} slide-up`}
                  style={{ animationDelay: "0.3s" }}
                >
                  <h4>💡 Recommendation</h4>
                  {riskLevel.category === "High Risk" && (
                    <p>This employee is at high risk of attrition. Prioritize retention strategies, career development, and engagement initiatives immediately.</p>
                  )}
                  {riskLevel.category === "Medium Risk" && (
                    <p>This employee shows moderate risk. Focus on addressing key factors and maintaining strong communication and support.</p>
                  )}
                  {riskLevel.category === "Low Risk" && (
                    <p>This employee shows low attrition risk. Continue fostering positive workplace culture and growth opportunities.</p>
                  )}
                </div>

                {/* Export Button */}
                <div className="export-section">
                  <button onClick={exportResults} className="btn btn-secondary" onMouseDown={addRipple} title="Download current result as JSON">
                    <span>📥</span> Export Results as JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="tab-content fade-in">
              <h3>📜 Analysis History</h3>
              {history.length === 0 ? (
                <p style={{color: 'var(--text-secondary)'}}>No analyses yet. Perform your first analysis to see history!</p>
              ) : (
                <div className="history-list">
                  {history.map((item, index) => (
                    <div key={item.id} className="history-item slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="history-header">
                        <strong>{item.name}</strong>
                        <span className="history-time">{item.timestamp}</span>
                      </div>
                      <div className="history-details">
                        <span className="history-prob">Risk: {(item.probability * 100).toFixed(1)}%</span>
                        <span className={`history-category category-${item.category.split(" ")[0].toLowerCase()}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>WorkSight • Employee Attrition Risk Intelligence • Powered by Machine Learning</p>
      </footer>
    </div>
  );
}

export default App;
