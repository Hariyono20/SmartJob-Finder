import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const JobSearch = ({ onResults }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const recommendations = [
    "Yogyakarta",
    "Frontend",
    "Backend",
    "Fullstack",
    "React Developer",
  ];

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Browser tidak mendukung fitur pengenalan suara.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "id-ID";
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setQuery(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      setError("Error pengenalan suara: " + event.error);
      setIsListening(false);
      recognitionRef.current.stop();
    };

    recognitionRef.current.onend = () => setIsListening(false);

    return () => recognitionRef.current?.stop();
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch {
        setError("Perekaman suara sedang berjalan.");
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Masukkan kata kunci pencarian");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (response.ok) {
        onResults(data.results);
        setSuggestions(data.suggestions || []);
      } else {
        setError(data.error || "Terjadi kesalahan saat pencarian");
      }
    } catch {
      setError("Gagal menghubungi server");
    }

    setLoading(false);
  };

  const handleRecommendationClick = (text) => {
    setQuery(text);
    setError(null);
    setTimeout(() => document.querySelector("form").requestSubmit(), 100);
  };
  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        padding: "0 20px",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <img
          src="/images/Desain tanpa judul-3.png"
          alt="SmartJob Logo"
          style={{ width: 80, height: 80, objectFit: "contain" }}
        />
        <h1
          style={{
            fontSize: "2.25rem",
            color: "#1e3a8a",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          SmartJob Finder
        </h1>
      </div>

      {/* Form Pencarian */}
      <form onSubmit={handleSearch}>
        <div
          style={{
            display: "flex",
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #d1d5db",
            boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            overflow: "hidden",
            width: "100%",
            maxWidth: "680px",
            margin: "0 auto",
          }}
        >
          <input
            type="text"
            placeholder="Cari pekerjaan impianmu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              padding: "16px 20px",
              fontSize: "1rem",
              outline: "none",
              background: "transparent",
            }}
          />

          {query.trim() && (
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "transparent",
                border: "none",
                padding: "0 16px",
                cursor: loading ? "not-allowed" : "pointer",
                color: "#1e40af",
                fontSize: "1.4rem",
              }}
              title="Cari"
            >
              {loading ? "..." : <FaPaperPlane />}
            </button>
          )}

          <button
            type="button"
            onClick={toggleListening}
            style={{
              background: "transparent",
              border: "none",
              padding: "0 16px",
              cursor: "pointer",
              color: isListening ? "#dc2626" : "#3b82f6",
              fontSize: "1.4rem",
            }}
            title={isListening ? "Matikan Voice" : "Aktifkan Voice"}
          >
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        </div>
      </form>

      {/* Rekomendasi Cepat */}
      {recommendations.length > 0 && (
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {recommendations.map((item) => (
            <button
              key={item}
              onClick={() => handleRecommendationClick(item)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                background: "#f3f4f6",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                color: "#374151",
                cursor: "pointer",
                transition: "0.2s ease-in-out",
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          style={{
            color: "#dc2626",
            marginTop: 20,
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {error}
        </p>
      )}

      {/* Saran Pencarian */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: "1rem",
              marginBottom: 10,
              color: "#1f2937",
            }}
          >
            Mungkin yang kamu maksud:
          </p>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleRecommendationClick(s)}
              style={{
                margin: "4px 6px",
                padding: "6px 12px",
                border: "none",
                borderRadius: 10,
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSearch;