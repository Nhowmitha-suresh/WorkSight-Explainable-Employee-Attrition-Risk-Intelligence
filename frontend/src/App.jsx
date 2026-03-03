import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [features, setFeatures] = useState([]);
  const [featureNames, setFeatureNames] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("input");

  useEffect(() => {
    const initializeModel = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/");
        const data = await res.json();
        const count = data.expected_feature_count;
        setFeatures(Array(count).fill(0));
        setFeatureNames(
          data.feature_names || 
          Array(count).fill(0).map((_, i) => `Feature ${i + 1}`)
        );
      } catch (err) {
        setError("Failed to connect to backend. Please ensure the server is running.");
      }
    };
    initializeModel();
  }, []);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = parseFloat(value) || 0;
    setFeatures(newFeatures);
  };

  const loadSampleEmployee = () => {
    const sample = features.map(() => Math.random() * 2 - 1);
    setFeatures(sample);
    setError(null);
  };

  const resetForm = () => {
    setFeatures(Array(features.length).fill(0));
    setResult(null);
    setError(null);
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
      setActiveTab("results");
    } catch (err) {
      setError(err.message || "An error occurred during prediction");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = () => {
    if (!result) return null;
    const prob = result.attrition_risk_probability;
    if (prob >= 0.7) return { category: "High Risk", color: "#ef4444" };
    if (prob >= 0.4) return { category: "Medium Risk", color: "#f59e0b" };
    return { category: "Low Risk", color: "#22c55e" };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>WorkSight AI</h1>
          <p>Advanced Employee Attrition Risk Intelligence Platform</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="card">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "input" ? "active" : ""}`}
              onClick={() => setActiveTab("input")}
            >
              Employee Data
            </button>
            <button
              className={`tab ${activeTab === "results" ? "active" : ""}`}
              onClick={() => setActiveTab("results")}
              disabled={!result}
            >
              Risk Assessment
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Input Tab */}
          {activeTab === "input" && (
            <div className="tab-content">
              <form onSubmit={handleSubmit}>
                <div className="features-grid">
                  {features.map((value, index) => (
                    <div key={index} className="feature-input">
                      <label htmlFor={`feature-${index}`}>
                        {featureNames[index] || `Feature ${index + 1}`}
                      </label>
                      <input
                        id={`feature-${index}`}
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadSampleEmployee}
                  >
                    Load Sample Employee
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Analyzing..." : "Analyze Risk"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && result && (
            <div className="tab-content">
              <div className="results-container">
                {/* Risk Score Display */}
                <div className="risk-display">
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
                    <p className="risk-percentage">
                      {(result.attrition_risk_probability * 100).toFixed(1)}%
                    </p>
                    <p className="risk-category" style={{ color: riskLevel.color }}>
                      {riskLevel.category}
                    </p>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="insights-section">
                  <h3>Key Contributing Factors</h3>
                  <div className="factors-list">
                    {result.top_feature_impacts.map((item, index) => (
                      <div key={index} className="factor-item">
                        <div className="factor-name">
                          <span className="factor-rank">#{index + 1}</span>
                          <span>{item.feature_name}</span>
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
                          <span className="impact-value">
                            {item.impact.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`recommendation box-${riskLevel.category.split(" ")[0].toLowerCase()}`}>
                  <h4>Recommendation</h4>
                  {riskLevel.category === "High Risk" && (
                    <p>
                      This employee is at high risk of attrition. Consider personalized 
                      retention strategies, career development opportunities, and engagement initiatives.
                    </p>
                  )}
                  {riskLevel.category === "Medium Risk" && (
                    <p>
                      This employee shows moderate attrition risk. Focus on addressing 
                      key contributing factors and maintaining strong communication.
                    </p>
                  )}
                  {riskLevel.category === "Low Risk" && (
                    <p>
                      This employee shows low attrition risk. Continue maintaining positive 
                      workplace culture and opportunities for growth.
                    </p>
                  )}
                </div>
              </div>
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