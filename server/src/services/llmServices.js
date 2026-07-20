const { OpenAI } = require('openai');

const localClient = new OpenAI({
  baseURL: process.env.LLM_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama-local', 
});

async function analyzeWithLLM(code, language, skillLevel, semgrepFindings) {
  const systemPrompt = `You are CodeSentinel, an expert secure coding auditor and system architect.
Analyze the source code for vulnerabilities, logical correctness, algorithmic efficiency, and quality issues.

CRITICAL: You must return ONLY a raw valid JSON object. Do not wrap it in markdown block fences like \\\`\\\`\\\`json. Do not include conversational text or explanations outside the JSON structure.

The JSON object must match this schema exactly:
{
  "scores": {
    "security": 50,
    "correctness": 80,
    "quality": 75
  },
  "vulnerabilities": [
    {
      "severity": "Critical|High|Medium|Low",
      "type": "Naming convention or vulnerability class",
      "line": 12,
      "description": "Clear explanation of the finding",
      "suggestion": "Secure alternative code snippet inline",
      "source": "LLM"
    }
  ],
  "feedback": "A high-quality paragraph of targeted improvement feedback suitable for an explicit ${skillLevel} level developer."
}`;

  const userPrompt = `Language: ${language}
User Experience Context: ${skillLevel}

Source Code:
${code}

Static Analysis Insights:
${JSON.stringify(semgrepFindings, null, 2)}

Perform the analysis and output the pristine JSON object now.`;

  const response = await localClient.chat.completions.create({
    model: process.env.LLM_MODEL || 'qwen2.5-coder:1.5b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
  });

  const rawContent = response.choices[0].message.content.trim();

  try {
    const parsedJsonString = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '')
      .trim();
      
    return JSON.parse(parsedJsonString);
  } catch (err) {
    console.error("Local LLM failed to return structural JSON. Raw capture:", rawContent);
    throw new Error("Failed to extract a structured analysis block from the local model pipeline.");
  }
}

module.exports = { analyzeWithLLM };