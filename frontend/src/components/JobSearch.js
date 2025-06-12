import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const JobSearch = ({ onResults }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

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
    recognitionRef.current.continuous = false;

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setQuery(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      setError("Error pada pengenalan suara: " + event.error);
      setIsListening(false);
      recognitionRef.current.stop();
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
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
        setError("Perekaman suara sudah berjalan");
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Masukkan kata kunci pencarian");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (response.ok) {
        onResults(data.results);
      } else {
        setError(data.error || "Terjadi kesalahan saat pencarian");
      }
    } catch {
      setError("Gagal menghubungi server");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "0 24px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Branding Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 30,
          gap: 15,
          justifyContent: "center",
        }}
      >
        <img
          src="/logo.png" // atau "/logo.svg"
          alt="SmartJob Finder Logo"
          style={{ height: 60, width: 60, borderRadius: "12px" }}
        />
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#1e3a8a",
              margin: 0,
            }}
          >
            SmartJob Finder
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#4b5563",
              margin: 0,
              fontWeight: "500",
            }}
          >
            Solusi Cerdas Menemukan Karier Impian
          </p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div
          style={{
            display: "flex",
            background: "#fff",
            borderRadius: "12px",
            boxShadow:
              "0 6px 14px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0,0,0,0.05)",
            border: "1px solid #d1d5db",
            overflow: "hidden",
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
              padding: "14px 20px",
              fontSize: "1.1rem",
              outline: "none",
              fontWeight: 500,
              color: "#111827",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          />

          <button
            type="button"
            onClick={toggleListening}
            style={{
              backgroundColor: isListening ? "#ef4444" : "#3b82f6",
              border: "none",
              padding: "0 18px",
              cursor: "pointer",
              color: "#fff",
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease",
            }}
            title={isListening ? "Berhenti merekam" : "Mulai rekam suara"}
          >
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          {query.trim() && (
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#1e40af",
                border: "none",
                padding: "0 20px",
                cursor: loading ? "not-allowed" : "pointer",
                color: "#fff",
                fontSize: "1.3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.3s ease",
              }}
              title="Cari"
            >
              {loading ? "..." : <FaPaperPlane />}
            </button>
          )}
        </div>

        {error && (
          <p
            style={{
              marginTop: 14,
              textAlign: "center",
              color: "#dc2626",
              fontWeight: "600",
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default JobSearch;
