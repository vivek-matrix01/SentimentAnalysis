from flask import Flask, request, jsonify
from flask_cors import CORS
from model.sentiment import analyze

app = Flask(__name__)

CORS(app)
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json.get("text", "")
    result = analyze(data)
    return jsonify(result)

@app.route("/")
def home():
    return "Backend is running"

@app.route("/upload", methods=["POST"])
def upload_csv():
    import pandas as pd

    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        df = pd.read_csv(file)
    except Exception:
        return jsonify({"error": "Invalid CSV"}), 400

    # ✅ Check if Text column exists
    if "Text" not in df.columns:
        return jsonify({
            "error": "CSV must contain 'Text' column"
        }), 400

    # 🔥 Limit rows (VERY IMPORTANT)
    df = df.head(50)

    results = []

    for _, row in df.iterrows():
        text = str(row["Text"])

        try:
            res = analyze(text)

            results.append({
                "text": text[:100],  # shorten for UI
                "score": row.get("Score", None),
                "positive": res["roberta"]["roberta_pos"],
                "neutral": res["roberta"]["roberta_neu"],
                "negative": res["roberta"]["roberta_neg"]
            })

        except Exception as e:
            results.append({
                "text": text[:100],
                "error": str(e)
            })

    return jsonify({
        "total_rows": len(df),
        "results": results
    })
if __name__ == "__main__":
    app.run(debug=True)
