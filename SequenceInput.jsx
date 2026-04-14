import React from "react";

const SequenceInput = ({ sequence, setSequence }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label htmlFor="sequence" style={{ display: "block", marginBottom: "5px" }}>
        Enter Protein Sequence:
      </label>
      <textarea
        id="sequence"
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
        rows={5}
        style={{ width: "100%", padding: "10px", fontFamily: "monospace" }}
        placeholder="Paste or type your amino acid sequence here..."
      />
    </div>
  );
};

export default SequenceInput;