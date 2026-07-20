const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const os = require('os');

async function runSemgrep(code, language) {
  const extensionMap = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    java: 'java',
    c: 'c',
    cpp: 'cpp'
  };

  const fileExtension = extensionMap[language] || 'txt';
  const fileName = `scan_${crypto.randomUUID()}.${fileExtension}`;
  const filePath = path.join(os.tmpdir(), fileName);

  try {
    await fs.writeFile(filePath, code);

    return await new Promise((resolve) => {
      // --config=auto automatically fetches matching rulesets based on file signature
      const command = `semgrep --config=auto --json ${filePath}`;
      
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        try {
          if (!stdout || stdout.trim() === "") {
            return resolve([]);
          }

          const result = JSON.parse(stdout);
          if (!result.results) return resolve([]);

          const findings = result.results.map(issue => ({
            severity: issue.extra.severity === 'ERROR' ? 'High' : 'Medium',
            type: issue.check_id.split('.').pop(),
            line: issue.start.line,
            description: issue.extra.message,
            source: 'Semgrep'
          }));
          
          resolve(findings);
        } catch (parseError) {
          // If Semgrep isn't installed locally, log it and fail open so the LLM pipeline can run
          console.warn("Semgrep parsing skipped or execution failed. Falling back strictly to LLM.");
          resolve([]);
        }
      });
    });
  } catch (err) {
    console.error("File tracking error in Semgrep runner:", err);
    return [];
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
}

module.exports = { runSemgrep };