import { useState } from "react";

function App() {
  const [features, setFeatures] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      const featureArray = features.split(",").map(Number);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features: featureArray }),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError("Error connecting to backend. Make sure FastAPI is running.");
    }
  };

  return (
    <div style={{
      background: "#0f172a",
      minHeight: "100vh",
      color: "white",
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <h1>WorkSight – Attrition Risk Dashboard</h1>

      <p>Enter feature values separated by commas:</p>

      <textarea
        rows="4"
        style={{ width: "100%", padding: "10px", marginTop: "10px" }}
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
      />

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
        Predict Risk
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Prediction Result</h2>
          <p>Probability: {result.attrition_risk_probability}</p>
          <p>Category: {result.risk_category}</p>
        </div>
      )}
    </div>
  );
}

export default App;
