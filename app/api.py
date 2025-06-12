from flask import Flask, request, jsonify
import pandas as pd
import re
import string
import os
import difflib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from flask_cors import CORS

# Setup Flask
app = Flask(__name__)
CORS(app)

# Path ke data
DATA_PATH = "../scripts/data/job_data.csv"

# Load Data
try:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"❌ File CSV tidak ditemukan: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    df.fillna('', inplace=True)
except Exception as e:
    print(f"⚠️ ERROR saat load data: {e}")
    exit()

# Download resource NLTK
nltk.download('stopwords')
stop_words = set(stopwords.words('indonesian'))

# === Fungsi Pendukung ===

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.strip().split()
    filtered = [word for word in tokens if word not in stop_words]
    return ' '.join(filtered)

def expand_synonyms(text):
    synonyms = {
        "developer": ["programmer", "engineer", "coder"],
        "marketing": ["sales", "promosi", "penjualan"],
        "designer": ["desain", "ux", "ui"]
    }
    words = text.split()
    expanded = []
    for word in words:
        expanded.append(word)
        for key, values in synonyms.items():
            if word == key or word in values:
                expanded.extend(values)
    return ' '.join(set(expanded))

def suggest_query(input_query, all_titles):
    suggestions = difflib.get_close_matches(input_query, all_titles, n=3)
    return suggestions

def extract_salary_range(query):
    query = query.replace(',', '')
    numbers = list(map(int, re.findall(r'\d+', query)))
    min_salary, max_salary = None, None
    if len(numbers) == 1:
        if ">" in query:
            min_salary = numbers[0]
        elif "<" in query:
            max_salary = numbers[0]
    elif len(numbers) >= 2:
        min_salary, max_salary = min(numbers), max(numbers)
    return min_salary, max_salary

# === Preprocess Data ===
text_columns = ['Title', 'Description', 'Company', 'Location', 'JobType']
df['content'] = df[text_columns].apply(lambda row: ' '.join(row.values.astype(str)), axis=1)
df['content_clean'] = df['content'].apply(preprocess_text)
tfidf = TfidfVectorizer()
tfidf_matrix = tfidf.fit_transform(df['content_clean'])

# === Endpoint Search ===
@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "")
    location = request.args.get("location", "").lower()
    job_type = request.args.get("job_type", "").lower()

    if not query:
        return jsonify({"error": "Query tidak boleh kosong"}), 400

    min_salary, max_salary = extract_salary_range(query)

    clean_query = preprocess_text(query)
    expanded_query = expand_synonyms(clean_query)
    query_vec = tfidf.transform([expanded_query])
    sim_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()

    filtered_df = df.copy()
    if location:
        filtered_df = filtered_df[filtered_df['Location'].str.lower().str.contains(location)]
    if job_type:
        filtered_df = filtered_df[filtered_df['JobType'].str.lower().str.contains(job_type)]

    if min_salary or max_salary:
        try:
            filtered_df['Salary'] = pd.to_numeric(filtered_df['Salary'], errors='coerce')
            if min_salary:
                filtered_df = filtered_df[filtered_df['Salary'] >= min_salary]
            if max_salary:
                filtered_df = filtered_df[filtered_df['Salary'] <= max_salary]
        except Exception as e:
            print(f"⚠️ Gagal memfilter salary: {e}")

    filtered_indices = filtered_df.index
    sim_scores_filtered = sim_scores[filtered_indices]

    top_indices = sim_scores_filtered.argsort()[::-1][:10]
    results = []
    for rank, idx in enumerate(top_indices):
        real_idx = filtered_indices[idx]
        if sim_scores[real_idx] == 0:
            continue
        job = df.iloc[real_idx]
        results.append({
            "id": int(real_idx),
            "title": job['Title'],
            "company": job['Company'],
            "location": job['Location'],
            "salary": job['Salary'],
            "job_type": job.get('JobType', ''),
            "date_posted": job.get('DatePosted', ''),
            "description": job.get('Description', ''),  # ✅ Sudah ditambahkan di sini
            "url": job['URL'],
            "logo": job.get('CompanyLogo', ''),
            "score": round(float(sim_scores[real_idx]), 4),
            "rank": rank + 1
        })

    if not results:
        suggestions = suggest_query(clean_query, df['Title'].tolist())
        return jsonify({"query": query, "results": [], "suggestions": suggestions}), 200

    return jsonify({"query": query, "results": results})

# === Endpoint Detail Job ===
@app.route("/job/<int:job_id>", methods=["GET"])
def get_job_detail(job_id):
    if job_id >= len(df) or job_id < 0:
        return jsonify({"error": "Job ID tidak ditemukan"}), 404

    job = df.iloc[job_id]
    return jsonify({
        "title": job['Title'],
        "company": job['Company'],
        "location": job['Location'],
        "salary": job['Salary'],
        "job_type": job.get('JobType', ''),
        "date_posted": job.get('DatePosted', ''),
        "description": job['Description'],
        "url": job['URL'],
        "logo": job.get('CompanyLogo', '')
    })

# === Run App ===
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
