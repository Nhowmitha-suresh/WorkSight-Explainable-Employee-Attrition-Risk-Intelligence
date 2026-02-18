import { useState, useEffect } from "react";

function App() {
  const [featureCount, setFeatureCount] = useState(0);
  const [features, setFeatures] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then(res => res.json())
      .then(data => {
        const count = data.expected_feature_count;
        setFeatureCount(count);
        setFeatures(Array(count).fill(""));
      })
      .catch(() => {
        alert("Backend not running!");
      });
  }, []);

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleSubmit = async () => {
    const featureArray = features.map(Number);

    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: featureArray }),
    });

    const data = await response.json();
    setResult(data);
  };

  const getRiskColor = () => {
    if (!result) return "white";
    if (result.risk_category === "High Risk") return "#ef4444";
    if (result.risk_category === "Medium Risk") return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={{
      background: "#0f172a",
      minHeight: "100vh",
      color: "white",
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <h1>WorkSight HR Attrition Intelligence</h1>

      <h3>Model expects {featureCount} features</h3>

      <div style={{ marginTop: "20px" }}>
        {features.map((value, index) => (
          <input
            key={index}
            type="number"
            placeholder={`Feature ${index + 1}`}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            style={{
              display: "block",
              marginBottom: "8px",
              padding: "6px",
              width: "200px"
            }}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#3b82f6",
          border: "none",
          color: "white",
          cursor: "pointer"
        }}
      >
        Analyze Risk
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Prediction Result</h2>
          <p>Probability: {result.attrition_risk_probability}</p>
          <p style={{ color: getRiskColor(), fontWeight: "bold" }}>
            Category: {result.risk_category}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
