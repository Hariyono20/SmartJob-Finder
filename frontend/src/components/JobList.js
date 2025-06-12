import React from "react";
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {jobs.map((job, index) => (
        <motion.a
          key={index}
          href={job.url}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <motion.div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "16px",
              background: "#ffffff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
            }}
            whileHover={{
              boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
              y: -5,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              {job.logo ? (
                <img
                  src={job.logo}
                  alt={`${job.company} Logo`}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "contain",
                    borderRadius: "12px",
                    background: "#fff",
                    padding: "6px",
                    marginRight: "16px",
                    border: "1px solid #eee",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-logo.png";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#aaa",
                    fontSize: "12px",
                    borderRadius: "12px",
                    marginRight: "16px",
                  }}
                >
                  No Logo
                </div>
              )}

              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                  {job.title}
                </h3>
                <p
                  style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}
                >
                  <FaBuilding style={{ marginRight: 6 }} />
                  {job.company}
                </p>
              </div>
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#444",
                lineHeight: 1.5,
                display: "grid",
                gap: "6px",
              }}
            >
              <div>
                <FaMapMarkerAlt style={{ marginRight: 8 }} />
                {job.location}
              </div>
              <div>
                <FaBriefcase style={{ marginRight: 8 }} />
                {job.job_type || "-"}
              </div>
              <div>
                <FaCalendarAlt style={{ marginRight: 8 }} />
                {job.date_posted || "-"}
              </div>
              <div>
                <FaMoneyBillWave style={{ marginRight: 8 }} />
                {job.salary || "Tidak tersedia"}
              </div>
              <div>
                <FaStar style={{ marginRight: 8, color: "#f5b50a" }} />
                Skor relevansi: {job.score || "-"}
              </div>
            </div>

            {job.description && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #eee",
                  fontSize: "14px",
                  color: "#333",
                }}
              >
                <strong>Deskripsi:</strong>
                <p style={{ marginTop: "4px" }}>
                  {job.description.length > 250
                    ? job.description.slice(0, 250) + "..."
                    : job.description}
                </p>
              </div>
            )}
          </motion.div>
        </motion.a>
      ))}
    </div>
  );
};

export default JobList;
