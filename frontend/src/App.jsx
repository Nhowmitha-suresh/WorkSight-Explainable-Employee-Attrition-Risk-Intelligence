import { useState, useEffect } from "react";

function App() {
  const [featureCount, setFeatureCount] = useState(0);
  const [features, setFeatures] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then(res => res.json())
      .then(data => {
        const count = data.expected_feature_count;
        setFeatureCount(count);
        setFeatures(Array(count).fill(0));
      });
  }, []);

  const loadSample = () => {
    const sample = Array(featureCount).fill(0).map(() =>
      Math.random() * 2 - 1
    );
    setFeatures(sample);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const getRiskColor = () => {
    if (!result) return "#64748b";
    if (result.risk_category === "High Risk") return "#ef4444";
    if (result.risk_category === "Medium Risk") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>WorkSight</h1>
        <p style={styles.subtitle}>
          Employee Attrition Risk Intelligence
        </p>

        <p style={styles.meta}>
          Model expects {featureCount} features
        </p>

        <div style={styles.buttonRow}>
          <button style={styles.secondaryBtn} onClick={loadSample}>
            Load Sample Employee
          </button>

          <button style={styles.primaryBtn} onClick={handleSubmit}>
            {loading ? "Analyzing..." : "Analyze Risk"}
          </button>
        </div>

        {result && (
          <div style={styles.resultCard}>
            <h3>Prediction Result</h3>
            <p>
              Probability:{" "}
              <strong>{result.attrition_risk_probability}</strong>
            </p>

            <div
              style={{
                ...styles.badge,
                backgroundColor: getRiskColor(),
              }}
            >
              {result.risk_category}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#0f172a",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    width: "600px",
    color: "white",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    marginTop: "5px",
    color: "#94a3b8",
  },
  meta: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#cbd5e1",
  },
  buttonRow: {
    display: "flex",
    gap: "15px",
    marginTop: "25px",
  },
  primaryBtn: {
    flex: 1,
    padding: "12px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryBtn: {
    flex: 1,
    padding: "12px",
    background: "#334155",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  resultCard: {
    marginTop: "30px",
    padding: "20px",
    background: "#0f172a",
    borderRadius: "12px",
  },
  badge: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "10px",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default App;