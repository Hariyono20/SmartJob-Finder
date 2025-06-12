import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

# Path to dataset
DATA_PATH = "../data/job_data.csv"

def load_data():
    """Load job listings from CSV"""
    if not os.path.exists(DATA_PATH):
        print(" Data not found. Please run the scraper first.")
        return None

    column_names = [
        "Title",            
        "Company",          
        "Salary",           
        "Category",         
        "DatePosted",       
        "URL",              
        "CompanyLogo",      
        "Description"      
    ]
    
    df = pd.read_csv(DATA_PATH, header=0, names=column_names)
    df.fillna("", inplace=True)  # Fill missing values
    return df

def preprocess_data(df):
    """Combine relevant columns for TF-IDF analysis"""
    df["combined_text"] = (
        df["Title"] + " " +
        df["Company"] + " " +
        df["Category"] + " " +
        df["Description"]
    )
    return df

def search_jobs(query, df, top_n=5):
    """Search jobs using TF-IDF + Cosine Similarity"""
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(df["combined_text"])
    
    query_vector = vectorizer.transform([query])
    similarity_scores = cosine_similarity(query_vector, tfidf_matrix).flatten()

    top_indices = similarity_scores.argsort()[-top_n:][::-1]
    return df.iloc[top_indices]

def main():
    print("🔍 Job Search Engine")
    df = load_data()
    if df is None:
        return
    
    df = preprocess_data(df)

    while True:
        query = input("\n🔎 Enter keywords (type 'exit' to quit): ").strip()
        if query.lower() == "exit":
            print("👋 Exiting program.")
            break

        results = search_jobs(query, df)
        if results.empty:
            print("❌ No matching results found.")
        else:
            print("\n✅ Search results:")
            # Displaying all relevant columns including Salary, DatePosted, and URL
            print(results[["Title", "Company", "Salary", "DatePosted", "URL", "CompanyLogo", "Description"]].to_string(index=False))

if __name__ == "__main__":
    main()
