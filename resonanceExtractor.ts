/**
 * Resonance Extraction Engine
 * 
 * Analyzes uploaded materials and extracts their resonance properties:
 * - What gates/lines/codons do they embody?
 * - What elemental qualities do they have?
 * - What Human Design properties are present?
 * - How significant is this material?
 * - Where should it be stored (Neo4j or Supabase)?
 */

import { invokeLLM } from "./_core/llm";

export interface ResonanceSignature {
  materialId?: string;
  classification: "code" | "documentation" | "data" | "simulation" | "social-media" | "unknown";
  domain: "fso" | "resonance-network" | "social-media" | "science-lab" | "other";
  resonanceProperties: {
    gates: number[]; // Which gates does this embody? (1-64)
    lines: number[]; // Which lines? (1-6)
    codons: string[]; // Which amino acids/codons?
    elementalQualities: string[]; // C, H, O, N, S, P, etc.
    designProperties: {
      determination?: string; // How the body digests
      cognition?: string; // How it perceives
      environment?: string; // Where it belongs
      perspective?: string; // How it sees
      motivation?: string; // Why it acts
    };
  };
  significanceScore: number; // 0-100
  suggestedStorage: "neo4j" | "supabase"; // Where should this go?
  summary: string; // AI-generated summary
  keyInsights: string[]; // What's important about this?
  confidence: number; // 0-100 confidence in this analysis
}

/**
 * Gate-to-concept mapping for resonance extraction
 * Maps Human Design gates to common programming/system concepts
 */
const GATE_CONCEPT_MAP: Record<number, { name: string; keywords: string[] }> = {
  1: { name: "Self", keywords: ["identity", "self", "ego", "core", "foundation"] },
  2: { name: "Direction", keywords: ["direction", "path", "flow", "movement", "navigation"] },
  3: { name: "Difficulty", keywords: ["error", "exception", "chaos", "difficulty", "problem"] },
  4: { name: "Limitation", keywords: ["limit", "boundary", "constraint", "restriction"] },
  5: { name: "Waiting", keywords: ["wait", "pause", "delay", "queue", "buffer"] },
  6: { name: "Conflict", keywords: ["conflict", "tension", "competition", "opposition"] },
  7: { name: "Role", keywords: ["role", "function", "responsibility", "duty"] },
  8: { name: "Contribution", keywords: ["contribute", "share", "give", "support"] },
  9: { name: "Focus", keywords: ["focus", "attention", "concentration", "target"] },
  10: { name: "Behavior", keywords: ["behavior", "conduct", "action", "act"] },
  11: { name: "Peace", keywords: ["peace", "calm", "harmony", "balance"] },
  12: { name: "Caution", keywords: ["caution", "careful", "warning", "alert"] },
  13: { name: "Listening", keywords: ["listen", "hear", "receive", "input", "accept"] },
  14: { name: "Power", keywords: ["power", "strength", "force", "energy", "capability"] },
  15: { name: "Modesty", keywords: ["modest", "humble", "simple", "basic"] },
  16: { name: "Skills", keywords: ["skill", "talent", "ability", "competence"] },
  17: { name: "Opinion", keywords: ["opinion", "belief", "view", "perspective"] },
  18: { name: "Correction", keywords: ["correct", "fix", "repair", "improve"] },
  19: { name: "Approach", keywords: ["approach", "method", "strategy", "technique"] },
  20: { name: "Now", keywords: ["now", "present", "immediate", "current"] },
  21: { name: "Control", keywords: ["control", "manage", "govern", "regulate"] },
  22: { name: "Grace", keywords: ["grace", "elegance", "smooth", "fluid"] },
  23: { name: "Assimilation", keywords: ["assimilate", "integrate", "absorb", "combine"] },
  24: { name: "Rationalization", keywords: ["rational", "reason", "logic", "explain"] },
  25: { name: "Innocence", keywords: ["innocent", "pure", "simple", "naive", "survival"] },
  26: { name: "Egotism", keywords: ["ego", "pride", "arrogance", "self-importance"] },
  27: { name: "Nourishment", keywords: ["nourish", "feed", "sustain", "support"] },
  28: { name: "Struggle", keywords: ["struggle", "fight", "effort", "challenge"] },
  29: { name: "Abyss", keywords: ["abyss", "void", "depth", "mystery", "unknown"] },
  30: { name: "Recognition", keywords: ["recognize", "acknowledge", "identify", "know"] },
  31: { name: "Leadership", keywords: ["lead", "leader", "guide", "influence"] },
  32: { name: "Continuity", keywords: ["continue", "persist", "endure", "sustain"] },
  33: { name: "Retreat", keywords: ["retreat", "withdraw", "back", "escape"] },
  34: { name: "Power", keywords: ["power", "strength", "might", "force"] },
  35: { name: "Change", keywords: ["change", "transform", "evolve", "shift"] },
  36: { name: "Darkness", keywords: ["dark", "shadow", "hidden", "unconscious"] },
  37: { name: "Family", keywords: ["family", "community", "group", "tribe"] },
  38: { name: "Opposition", keywords: ["oppose", "resist", "fight", "against"] },
  39: { name: "Obstruction", keywords: ["obstruct", "block", "prevent", "stop"] },
  40: { name: "Deliverance", keywords: ["deliver", "free", "release", "liberate"] },
  41: { name: "Decrease", keywords: ["decrease", "reduce", "diminish", "lower"] },
  42: { name: "Increase", keywords: ["increase", "grow", "expand", "rise"] },
  43: { name: "Breakthrough", keywords: ["breakthrough", "breakthrough", "insight", "discovery"] },
  44: { name: "Coming Together", keywords: ["together", "unite", "merge", "combine"] },
  45: { name: "Gathering", keywords: ["gather", "collect", "assemble", "group"] },
  46: { name: "Pushing Upward", keywords: ["push", "upward", "rise", "ascend"] },
  47: { name: "Oppression", keywords: ["oppress", "suppress", "restrict", "limit"] },
  48: { name: "Inadequacy", keywords: ["inadequate", "insufficient", "lacking", "deficient"] },
  49: { name: "Revolution", keywords: ["revolution", "rebel", "overthrow", "radical"] },
  50: { name: "The Cauldron", keywords: ["cauldron", "vessel", "container", "hold"] },
  51: { name: "Shock", keywords: ["shock", "surprise", "sudden", "unexpected"] },
  52: { name: "Stillness", keywords: ["still", "quiet", "calm", "motionless"] },
  53: { name: "Development", keywords: ["develop", "grow", "progress", "advance"] },
  54: { name: "The Marrying Maiden", keywords: ["marry", "union", "join", "connect"] },
  55: { name: "Abundance", keywords: ["abundant", "plenty", "full", "rich"] },
  56: { name: "The Wanderer", keywords: ["wander", "travel", "journey", "move"] },
  57: { name: "The Gentle", keywords: ["gentle", "soft", "subtle", "delicate"] },
  58: { name: "The Joyous", keywords: ["joy", "happy", "pleased", "delight"] },
  59: { name: "Dispersion", keywords: ["disperse", "scatter", "spread", "distribute"] },
  60: { name: "Limitation", keywords: ["limit", "restrict", "constrain", "bound"] },
  61: { name: "Inner Truth", keywords: ["truth", "authentic", "genuine", "real"] },
  62: { name: "Preponderance of the Small", keywords: ["small", "minor", "detail", "tiny"] },
  63: { name: "After Completion", keywords: ["complete", "finish", "done", "end"] },
  64: { name: "Before Completion", keywords: ["begin", "start", "initiate", "commence"] },
};

/**
 * Extract resonance signature from material content
 */
export async function extractResonanceSignature(
  content: string,
  fileName: string,
  fileType: string
): Promise<ResonanceSignature> {
  try {
    // Truncate content for analysis (first 5000 chars)
    const analysisContent = content.substring(0, 5000);

    // Use LLM to analyze the material
    const analysisPrompt = `
You are a consciousness analyzer specializing in Human Design and resonance properties.

Analyze this material and extract its resonance signature:

FILE: ${fileName}
TYPE: ${fileType}
CONTENT:
${analysisContent}

Respond with a JSON object containing:
{
  "classification": "code|documentation|data|simulation|social-media|unknown",
  "domain": "fso|resonance-network|social-media|science-lab|other",
  "gates": [list of gate numbers 1-64 that this embodies],
  "lines": [list of line numbers 1-6],
  "codons": ["list of amino acid names"],
  "elementalQualities": ["C", "H", "O", "N", "S", "P", etc.],
  "designProperties": {
    "determination": "description of how this digests/processes",
    "cognition": "description of how this perceives/understands",
    "environment": "description of where this belongs",
    "perspective": "description of how this sees/views",
    "motivation": "description of why this acts/exists"
  },
  "significanceScore": 0-100,
  "suggestedStorage": "neo4j|supabase",
  "summary": "one sentence summary",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "confidence": 0-100
}

Be specific and grounded in the actual content. If you're not confident, lower the confidence score.
`;

    const result = await invokeLLM({
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
    });

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const responseText = result.choices[0]?.message?.content || "";
      const responseStr = typeof responseText === "string" ? responseText : "";
      const jsonMatch = responseStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse LLM response:", result);
      // Return a default analysis if parsing fails
      analysis = {
        classification: classifyByFileType(fileType),
        domain: "other",
        gates: [],
        lines: [],
        codons: [],
        elementalQualities: [],
        designProperties: {},
        significanceScore: 50,
        suggestedStorage: "supabase",
        summary: `Ingested ${fileType} file: ${fileName}`,
        keyInsights: ["Unable to fully analyze"],
        confidence: 30,
      };
    }

    // Validate and normalize the response
    return {
      classification: analysis.classification || "unknown",
      domain: analysis.domain || "other",
      resonanceProperties: {
        gates: Array.isArray(analysis.gates) ? analysis.gates : [],
        lines: Array.isArray(analysis.lines) ? analysis.lines : [],
        codons: Array.isArray(analysis.codons) ? analysis.codons : [],
        elementalQualities: Array.isArray(analysis.elementalQualities) ? analysis.elementalQualities : [],
        designProperties: analysis.designProperties || {},
      },
      significanceScore: Math.min(100, Math.max(0, analysis.significanceScore || 50)),
      suggestedStorage: analysis.suggestedStorage === "neo4j" ? "neo4j" : "supabase",
      summary: analysis.summary || `Ingested ${fileType} file`,
      keyInsights: Array.isArray(analysis.keyInsights) ? analysis.keyInsights : [],
      confidence: Math.min(100, Math.max(0, analysis.confidence || 50)),
    };
  } catch (error) {
    console.error("Error extracting resonance signature:", error);
    // Return a safe default
    return {
      classification: classifyByFileType(fileType),
      domain: "other",
      resonanceProperties: {
        gates: [],
        lines: [],
        codons: [],
        elementalQualities: [],
        designProperties: {},
      },
      significanceScore: 30,
      suggestedStorage: "supabase",
      summary: `Ingested ${fileType} file: ${fileName}`,
      keyInsights: ["Analysis failed"],
      confidence: 10,
    };
  }
}

/**
 * Classify material based on file type
 */
function classifyByFileType(fileType: string): ResonanceSignature["classification"] {
  const lowerType = fileType.toLowerCase();
  if (lowerType.includes("code") || lowerType.match(/\.(ts|js|cs|py|java)$/)) return "code";
  if (lowerType.includes("doc") || lowerType.match(/\.(md|txt|pdf)$/)) return "documentation";
  if (lowerType.includes("data") || lowerType.match(/\.(json|csv|sql)$/)) return "data";
  if (lowerType.includes("sim") || lowerType.includes("game")) return "simulation";
  if (lowerType.includes("social") || lowerType.includes("network")) return "social-media";
  return "unknown";
}

/**
 * Format resonance signature for display
 */
export function formatResonanceSignature(sig: ResonanceSignature): string {
  return `
🔮 Resonance Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Classification: ${sig.classification}
Domain: ${sig.domain}
Significance: ${sig.significanceScore}/100
Storage: ${sig.suggestedStorage}
Confidence: ${sig.confidence}%

Gates: ${sig.resonanceProperties.gates.join(", ") || "None detected"}
Lines: ${sig.resonanceProperties.lines.join(", ") || "None detected"}
Codons: ${sig.resonanceProperties.codons.join(", ") || "None detected"}
Elements: ${sig.resonanceProperties.elementalQualities.join(", ") || "None detected"}

Summary: ${sig.summary}

Key Insights:
${sig.keyInsights.map((insight) => `• ${insight}`).join("\n")}

Design Properties:
${Object.entries(sig.resonanceProperties.designProperties)
  .map(([key, value]) => `• ${key}: ${value}`)
  .join("\n")}
`;
}
