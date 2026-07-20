const { runSemgrep } = require('../services/semgrepRunner');
const { analyzeWithLLM } = require('../services/llmService');

async function handleAnalysisRequest(req, res) {
  try {
    const { code, language, context } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Required fields 'code' and 'language' missing." });
    }

    const skillLevel = context?.skillLevel || 'intermediate';

    // 1. Kick off structural static analytics
    const semgrepFindings = await runSemgrep(code, language);

    // 2. Hydrate LLM heuristics processing with source and static contexts
    const analysisReport = await analyzeWithLLM(code, language, skillLevel, semgrepFindings);

    // 3. Compute Composite Analytical Score using exact system weights
    const secWeight = analysisReport.scores?.security || 100;
    const corWeight = analysisReport.scores?.correctness || 100;
    const qWeight = analysisReport.scores?.quality || 100;

    const overallScore = Math.round((0.50 * secWeight) + (0.30 * corWeight) + (0.20 * qWeight));

    // 4. Merge results cleanly
    const finalPayload = {
      language,
      scores: {
        security: secWeight,
        correctness: corWeight,
        quality: qWeight,
        overall: overallScore
      },
      vulnerabilities: [
        ...semgrepFindings,
        ...(analysisReport.vulnerabilities || [])
      ],
      feedback: analysisReport.feedback || "Analysis completed with no specific structural variations found."
    };

    return res.status(200).json({
      status: "success",
      data: finalPayload
    });

  } catch (error) {
    console.error("CodeSentinel analysis lifecycle broke down:", error);
    return res.status(500).json({
      error: "Internal processing error occurred running code checks.",
      details: error.message
    });
  }
}

module.exports = { handleAnalysisRequest };