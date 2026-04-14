import React, { useState } from "react";
import { Loader2, Dna } from "lucide-react";
import PredictionCard from "./components/PredictionCard";
import MotifChart from "./components/MotifChart";
import StructureViewer from "./components/StructureViewer";
import { getPrediction } from "./api";

const App = () => {
  const [sequence, setSequence] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [saliency, setSaliency] = useState([]);
  const [topResidues, setTopResidues] = useState([]);
  const [pdbData, setPdbData] = useState("");

  const handleGenerateReport = async () => {
    if (!sequence.trim()) return alert("Please enter a sequence.");

    setLoading(true);
    setPrediction(null);
    setSaliency([]);
    setTopResidues([]);
    setPdbData("");

    try {
      const res = await getPrediction(sequence);
      setPrediction(res.prediction || {});
      setSaliency(res.saliency || []);
      setTopResidues(res.top_residues || []);
      setPdbData(res.structure?.pdb || "");
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const showResults = prediction && Object.keys(prediction).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background blur blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200 rounded-full opacity-20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="glass-icon">
              <Dna className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">
              Allergen Analysis Dashboard
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Protein allergenicity prediction and structural insights
          </p>
        </div>

        {/* Input Section */}
        <div className="glass-card p-8 mb-8">
          <label
            htmlFor="sequence-input"
            className="block text-sm font-medium text-slate-700 mb-3"
          >
            Protein Sequence Input
          </label>
          <textarea
            id="sequence-input"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            placeholder={"Paste amino acid sequence...\n\nExample:\nMKTIIALSYIFCLVFA..."}
            className="w-full h-40 px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm text-slate-700 resize-none transition-all"
          />
          <button
            onClick={handleGenerateReport}
            disabled={loading || !sequence.trim()}
            className="mt-4 w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Sequence...
              </>
            ) : (
              "Generate Report"
            )}
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            <PredictionCard prediction={prediction} />

            {/* Row 2: Motif Chart */}
            {saliency.length > 0 && (
              <MotifChart
                saliency={saliency}
                topResidues={topResidues}
                sequence={sequence}
              />
            )}

            {/* Row 3: Structure Viewer */}
            {pdbData && <StructureViewer pdbData={pdbData} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;