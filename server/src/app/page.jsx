"use client";

import { useState } from 'react';
import axios from 'axios';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { ShieldAlert, CheckCircle, Code, Activity, ServerCrash } from 'lucide-react';

export default function Home() {
  const [code, setCode] = useState('// Write or paste your vulnerable code here...\n\nconst query = "SELECT * FROM users WHERE username = \'" + req.body.username + "\'";\ndb.execute(query);');
  const [language, setLanguage] = useState('javascript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!code || code.trim() === '') return;
    
    setIsAnalyzing(true);
    setReport(null);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/analyze', {
        language,
        code,
        context: { skillLevel: 'intermediate' }
      });
      
      setReport(response.data.data);
    } catch (err) {
      setError('Analysis failed. Ensure your Node.js backend is running on port 3000.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-blue-400">
          <ShieldAlert size={32} />
          CodeSentinel
        </h1>
        <p className="text-slate-400 mt-2">AI-Powered Vulnerability & Quality Analysis Engine</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Code Input & Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-slate-900 p-3 rounded-t-lg border border-slate-700 border-b-0">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
              <Code size={18} /> Source Code
            </h2>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div className="border border-slate-700 rounded-b-lg overflow-hidden shadow-inner" data-color-mode="dark">
            <CodeEditor
              value={code}
              language={language}
              placeholder="Please enter code..."
              onChange={(evn) => setCode(evn.target.value)}
              padding={16}
              style={{
                fontSize: 14,
                backgroundColor: "#0f172a", // Match app background
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                minHeight: '450px'
              }}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`py-3 rounded-lg font-bold tracking-wide transition-all shadow-lg ${
              isAnalyzing 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-900/50'
            }`}
          >
            {isAnalyzing ? 'Running Neural Analysis (Ollama)...' : 'Analyze Code'}
          </button>
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50 mt-2">
              <ServerCrash size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Results Dashboard */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl flex flex-col">
          {report ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Score Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Overall</span>
                  <span className="text-3xl font-bold text-white">{report.scores.overall || '--'}</span>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Security</span>
                  <span className={`text-3xl font-bold ${report.scores.security < 60 ? 'text-red-400' : 'text-green-400'}`}>
                    {report.scores.security}
                  </span>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Quality</span>
                  <span className={`text-3xl font-bold ${report.scores.quality < 60 ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {report.scores.quality}
                  </span>
                </div>
              </div>

              {/* Vulnerabilities List */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold border-b border-slate-700 pb-2 mb-4 flex items-center gap-2 text-slate-200">
                  <Activity size={18} className="text-blue-400"/> Found Issues
                </h3>
                
                {(!report.vulnerabilities || report.vulnerabilities.length === 0) ? (
                  <div className="flex items-center gap-2 text-green-400 bg-green-950/30 border border-green-900/50 p-4 rounded-lg">
                    <CheckCircle size={20} /> 
                    <span className="font-medium">No vulnerabilities detected. Great job!</span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {report.vulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="bg-slate-800 p-4 rounded-lg border-l-4 border-red-500 shadow-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-red-400">{vuln.type || 'Vulnerability'}</span>
                          <span className="text-xs bg-slate-900 text-slate-300 border border-slate-700 px-2 py-1 rounded font-mono">
                            Line {vuln.line || '?'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{vuln.description}</p>
                        {vuln.suggestion && (
                          <div className="bg-[#0f172a] p-3 rounded border border-slate-700 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                            {vuln.suggestion}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Feedback */}
              {report.feedback && (
                <div className="mt-auto pt-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Developer Feedback</h3>
                  <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-lg">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {report.feedback}
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[450px]">
              <ShieldAlert size={64} className="mb-6 opacity-20 text-slate-400" />
              <p className="text-lg">Awaiting Code Submission</p>
              <p className="text-sm mt-2 opacity-70">Submit code to generate your security and quality report.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}