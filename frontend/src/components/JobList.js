import React, { useState } from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaStar,
} from "react-icons/fa";
import { motion } from "framer-motion";

const JobList = ({ jobs }) => {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (!jobs || jobs.length === 0) {
    return (
      <p
        style={{
          fontStyle: "italic",
          color: "#888",
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        Tidak ada hasil ditemukan.
      </p>
    );
  }

  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentJobs = jobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
          padding: "24px",
          maxWidth: "740px",
          margin: "0 auto",
          justifyContent: "center",
        }}
      >
        {currentJobs.map((job, index) => (
          <JobCard
            key={startIndex + index}
            job={job}
            index={startIndex + index}
          />
        ))}
      </div>

      <div
        style={{
          maxWidth: "740px",
          margin: "0 auto 40px",
          padding: "0 24px",
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={paginationButtonStyle(currentPage === 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            style={paginationButtonStyle(currentPage === i + 1, true)}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={paginationButtonStyle(currentPage === totalPages)}
        >
          Next
        </button>
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            max-width: 360px !important;
          }
          div[style*="max-width: 740px"] {
            max-width: 360px !important;
          }
        }
      `}</style>
    </>
  );
};

const paginationButtonStyle = (disabled, isCurrent = false) => ({
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #007bff",
  backgroundColor: isCurrent ? "#007bff" : "transparent",
  color: isCurrent ? "white" : "#007bff",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
  userSelect: "none",
});

const JobCard = ({ job, index }) => (
  <motion.a
    href={job.url || "#"}
    target="_blank"
    rel="noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
    style={{
      textDecoration: "none",
      color: "inherit",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      // Pastikan card ikut isi grid item sepenuhnya
    }}
  >
    <motion.div
      style={{
        border: "1px solid #ddd",
        padding: "16px 20px",
        borderRadius: "16px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        gap: 12,
        minHeight: "320px", // Tetap pakai minHeight sama
        maxHeight: "320px", // Batas tinggi supaya semua sama
        overflow: "hidden", // Jangan sampai melebar karena isi
      }}
      whileHover={{
        boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
        y: -4,
      }}
    >
      {/* Header Logo dan Perusahaan */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {job.logo ? (
          <img
            src={job.logo}
            alt={`${job.company} Logo`}
            style={{
              width: 56,
              height: 56,
              objectFit: "contain",
              borderRadius: 12,
              background: "#fff",
              padding: 6,
              border: "1px solid #eee",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/Desain tanpa judul-3.png";
            }}
          />
        ) : (
          <img
            src="/images/Desain tanpa judul-3.png"
            alt="Default Logo"
            style={{
              width: 56,
              height: 56,
              objectFit: "contain",
              borderRadius: 12,
              background: "#fff",
              padding: 6,
              border: "1px solid #eee",
            }}
          />
        )}

        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={job.title}
          >
            {job.title || "Posisi Tidak Diketahui"}
          </h3>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={job.company}
          >
            <FaBuilding /> {job.company || "-"}
          </p>
        </div>
      </div>

      {/* Info detail */}
      <div
        style={{
          fontSize: 14,
          color: "#444",
          display: "grid",
          gap: 6,
          lineHeight: 1.3,
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <div title={job.location}>
          <FaMapMarkerAlt style={{ marginRight: 8 }} />
          {job.location || "-"}
        </div>
        <div title={job.job_type}>
          <FaBriefcase style={{ marginRight: 8 }} />
          {job.job_type || "-"}
        </div>
        <div title={job.date_posted}>
          <FaCalendarAlt style={{ marginRight: 8 }} />
          {job.date_posted || "-"}
        </div>
        <div title={job.salary}>
          <FaMoneyBillWave style={{ marginRight: 8 }} />
          {job.salary || "Tidak tersedia"}
        </div>
        <div>
          <FaStar style={{ marginRight: 8, color: "#f5b50a" }} />
          Skor relevansi: {job.score ? job.score.toFixed(2) : "-"}
        </div>
      </div>

      {/* Deskripsi (dipersingkat & diberi max tinggi) */}
      {job.description && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid #eee",
            fontSize: 14,
            color: "#333",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3, // maksimal 3 baris
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
          }}
          title={job.description}
        >
          {job.description.length > 150
            ? job.description.slice(0, 150) + "..."
            : job.description}
        </div>
      )}
    </motion.div>
  </motion.a>
);

export default JobList;
