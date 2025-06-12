import React, { useState } from "react";
import JobSearch from "./components/JobSearch";
import JobList from "./components/JobList";

const App = () => {
  const [results, setResults] = useState([]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <JobSearch onResults={setResults} />
      <JobList jobs={results} />
    </div>
  );
};

export default App;
