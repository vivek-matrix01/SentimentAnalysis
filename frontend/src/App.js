import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, color: payload[0].color }}>Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function App() {
  const [batchData, setBatchData] = useState([]);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 🔹 Text sentiment
  const analyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 🔹 CSV upload
  const uploadCSV = async () => {
    if (!file) {
      setUploadStatus("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.results) {
        setBatchData(data.results);
        setUploadStatus("Upload successful");
      } else {
        setUploadStatus("No results found in data");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // 🔥 DASHBOARD LOGIC
  const total = batchData.length;
  const summary = batchData.reduce(
    (acc, item) => {
      if (item.positive > item.neutral && item.positive > item.negative) {
        acc.positive++;
      } else if (item.negative > item.positive && item.negative > item.neutral) {
        acc.negative++;
      } else {
        acc.neutral++;
      }
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const chartData = [
    { name: "Positive", value: summary.positive, color: "#10b981" },
    { name: "Neutral", value: summary.neutral, color: "#f59e0b" },
    { name: "Negative", value: summary.negative, color: "#ef4444" },
  ];

  return (
    <div className="app-container">
      
      <header className="header animate-fade-in-up">
        <h1>AI Sentiment Analyzer</h1>
        <p>Uncover the emotions behind your data instantly</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* 🔹 TEXT ANALYSIS */}
        <section className="glass-panel animate-fade-in-up delay-100">
          <h2 className="panel-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: "var(--accent-color)"}}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Single Text Analysis
          </h2>
          
          <div className="input-group">
            <textarea
              rows="4"
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn" onClick={analyze} disabled={isAnalyzing || !text.trim()}>
              {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {result && (
            <div className="results-container animate-fade-in">
              <h3 style={{margin: "0 0 1rem 0", fontSize: "1.1rem"}}>Results</h3>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                <span>Positive:</span> <strong className="val-positive">{result.roberta.roberta_pos.toFixed(3)}</strong>
              </div>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                <span>Neutral:</span> <strong className="val-neutral">{result.roberta.roberta_neu.toFixed(3)}</strong>
              </div>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <span>Negative:</span> <strong className="val-negative">{result.roberta.roberta_neg.toFixed(3)}</strong>
              </div>
            </div>
          )}
        </section>

        {/* 🔹 CSV UPLOAD */}
        <section className="glass-panel animate-fade-in-up delay-200">
          <h2 className="panel-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: "var(--accent-color)"}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            Batch CSV Analysis
          </h2>
          
          <div className="input-group">
            <div className="file-upload-wrapper">
              <input
                type="file"
                accept=".csv"
                className="file-input-custom"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setUploadStatus("");
                }}
              />
              <div className="file-upload-display">
                <button className="btn" style={{background: "rgba(0,0,0,0.06)", color: "var(--text-main)", boxShadow: "none"}}>
                  Select File
                </button>
                <div className="file-name">{file ? file.name : "No file chosen"}</div>
              </div>
            </div>

            <button className="btn" onClick={uploadCSV} disabled={isUploading || !file}>
              {isUploading ? "Uploading..." : "Process CSV"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </button>
          </div>

          {uploadStatus && (
            <p className={`upload-status ${uploadStatus.includes("failed") ? "error" : "animate-fade-in"}`}>
              {uploadStatus}
            </p>
          )}
        </section>
      </div>

      {/* 🔥 DASHBOARD */}
      {batchData.length > 0 && (
        <section className="glass-panel animate-fade-in-up delay-300 dashboard-grid">
          <h2 className="panel-title">Batch Dashboard</h2>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value val-total">{total}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-value val-positive">{summary.positive}</div>
              <div className="stat-label">Positive</div>
            </div>
            <div className="stat-card">
              <div className="stat-value val-neutral">{summary.neutral}</div>
              <div className="stat-label">Neutral</div>
            </div>
            <div className="stat-card">
              <div className="stat-value val-negative">{summary.negative}</div>
              <div className="stat-label">Negative</div>
            </div>
          </div>

          <div>
            <h3 style={{margin: "0 0 1rem 0"}}>Sentiment Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                  <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.04)'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {
                      chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 style={{margin: "2rem 0 1rem 0"}}>Detailed Records</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Text</th>
                    <th>Score Group</th>
                    <th>Positive</th>
                    <th>Neutral</th>
                    <th>Negative</th>
                  </tr>
                </thead>
                <tbody>
                  {batchData.map((item, index) => {
                    let scoreClass = 'score-neutral';
                    if (item.positive > item.neutral && item.positive > item.negative) scoreClass = 'score-positive';
                    if (item.negative > item.positive && item.negative > item.neutral) scoreClass = 'score-negative';

                    return (
                      <tr key={index}>
                        <td style={{minWidth: "250px"}}>{item.text}</td>
                        <td><span className={`score-badge ${scoreClass}`}>{item.score}</span></td>
                        <td className="val-positive">{item.positive?.toFixed(3)}</td>
                        <td className="val-neutral">{item.neutral?.toFixed(3)}</td>
                        <td className="val-negative">{item.negative?.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default App;