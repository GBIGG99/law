
// Implemented missing service functions and updated models to follow latest guidelines.
import { GoogleGenAI, GenerateContentResponse, Type, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { type SearchParams, type SearchResult, type Source, SearchType, DateRange, PartialSearchResult, TimelineEvent, JudgeSummary, JudgeDetail, DocumentAnalysisResult, CaseStatus, CaseType, Jurisdiction, CrossReferenceResult, NarrativeMapResult, AdversarialStrategy, NarrativeNode, NarrativeLink, StrategicTelemetry } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeParseJSON = <T>(text: string | undefined): T | null => {
    if (!text) return null;
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let start = -1;
    if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) start = firstBrace;
    else if (firstBracket !== -1) start = firstBracket;
    if (start !== -1) cleaned = cleaned.substring(start);
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    let end = -1;
    if (lastBrace !== -1 && lastBracket !== -1) end = Math.max(lastBrace, lastBracket);
    else if (lastBrace !== -1) end = lastBrace;
    else if (lastBracket !== -1) end = lastBracket;
    if (end !== -1) cleaned = cleaned.substring(0, end + 1);
    try {
        return JSON.parse(cleaned) as T;
    } catch (e) {
        return null;
    }
};

const buildPrompt = (params: SearchParams): string => {
  const { query, partyName, caseNumber, jurisdiction } = params;
  
  let missionStatement = `You are the "Denver Court Copilot" — a world-class legal strategist and Chess Master.

YOUR OUTPUT PROTOCOL (MAXIMUM READABILITY):
1. **LARGE PRINT ARCHITECTURE**: Use clear H1 (#) and H2 (##) headers.
2. **THE TACTICAL SUMMARY**: Start with a "TACTICAL BRIEF" (2-3 sentences) in bold.
3. **EXPLANATORY GAP**: Use bullet points with a space between each for maximum vertical scanability.
4. **THE ACTION LIST**: Provide a numbered "IMMEDIATE MANEUVERS" section with clear, simple instructions.
5. **DENVER LOCALIZATION**: Reference specific Denver courthouse locations or local C.R.C.P. rules.

TONE: Authoritative, elite, calm, and protective of the user's rights.

Analyze the following strategic query: "${query}".`;

  if (partyName) missionStatement += `\nFocusing on party: ${partyName}.`;
  if (caseNumber) missionStatement += `\nSpecific case target: ${caseNumber}.`;
  if (jurisdiction && jurisdiction !== 'all') missionStatement += `\nLimiting scope to: ${jurisdiction}.`;

  return missionStatement + `\n\nHeader: Tactical Intelligence Summary\nSection: The Adversarial Landscape\nSection: Pro-Se Tactical Advantages\nSection: Denver Procedural Checklist`;
};

const generateStrategicTelemetry = async (query: string, summary: string): Promise<StrategicTelemetry> => {
    const prompt = `Perform a high-speed neural audit on the legal query: "${query}". 
    Analyze case complexity, threat vectors, pro-se readiness, and strategic factors based on the following context.
    Context: ${summary.substring(0, 3000)}

    Output JSON with:
    - 'readinessScore' (0-100)
    - 'complexityIndex' (1-10)
    - 'strategicFactors' (Object with 'evidence', 'procedural', 'jurisdictional', 'resource', 'opponentVulnerability' as numbers 1-10)
    - 'threatMatrix' (array of 5 items with 'label', 'impact' 1-10, 'probability' 1-10).`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        readinessScore: { type: Type.NUMBER },
                        complexityIndex: { type: Type.NUMBER },
                        strategicFactors: {
                            type: Type.OBJECT,
                            properties: {
                                evidence: { type: Type.NUMBER },
                                procedural: { type: Type.NUMBER },
                                jurisdictional: { type: Type.NUMBER },
                                resource: { type: Type.NUMBER },
                                opponentVulnerability: { type: Type.NUMBER }
                            },
                            required: ['evidence', 'procedural', 'jurisdictional', 'resource', 'opponentVulnerability']
                        },
                        threatMatrix: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    impact: { type: Type.NUMBER },
                                    probability: { type: Type.NUMBER }
                                },
                                required: ['label', 'impact', 'probability']
                            }
                        }
                    },
                    required: ['readinessScore', 'complexityIndex', 'threatMatrix', 'strategicFactors']
                }
            }
        });
        return safeParseJSON<StrategicTelemetry>(response.text) || { 
          readinessScore: 50, 
          complexityIndex: 5, 
          threatMatrix: [],
          strategicFactors: { evidence: 5, procedural: 5, jurisdictional: 5, resource: 5, opponentVulnerability: 5 }
        };
    } catch {
        return { 
          readinessScore: 50, 
          complexityIndex: 5, 
          threatMatrix: [],
          strategicFactors: { evidence: 5, procedural: 5, jurisdictional: 5, resource: 5, opponentVulnerability: 5 }
        };
    }
};

const generateAdversarialStrategy = async (query: string, summary: string): Promise<AdversarialStrategy> => {
    const prompt = `Denver defense attorney strategic mode. 
    Predict opponent's next moves and countermeasures for: "${query}".
    Context: ${summary.substring(0, 4000)}

    Output JSON with 'prosecutorMoves', 'defenseCounters', and 'hiddenRisks'. Each array should have 3 items.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 16384 },
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    prosecutorMoves: { type: Type.ARRAY, items: { type: Type.STRING } },
                    defenseCounters: { type: Type.ARRAY, items: { type: Type.STRING } },
                    hiddenRisks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['prosecutorMoves', 'defenseCounters', 'hiddenRisks']
                }
            }
        });
        return safeParseJSON<AdversarialStrategy>(response.text) || { prosecutorMoves: [], defenseCounters: [], hiddenRisks: [] };
    } catch {
        return { prosecutorMoves: [], defenseCounters: [], hiddenRisks: [] };
    }
}

const generateFollowUpQuestions = async (query: string, summary: string): Promise<string[]> => {
    const prompt = `Generate 3 tactical follow-up questions for: "${query}". Context: ${summary.substring(0, 1000)}. Return JSON { "questions": [] }.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { questions: { type: Type.ARRAY, items: { type: Type.STRING } } } }
            }
        });
        const parsed = safeParseJSON<{ questions: string[] }>(response.text);
        return parsed?.questions || [];
    } catch { return []; }
}

const generateRelatedQueries = async (query: string): Promise<string[]> => {
    const prompt = `Generate 5 semantic search queries for: "${query}". Return JSON { "queries": [] }.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { queries: { type: Type.ARRAY, items: { type: Type.STRING } } } }
            }
        });
        const parsed = safeParseJSON<{ queries: string[] }>(response.text);
        return parsed?.queries || [];
    } catch { return []; }
}

const extractTimelineEvents = async (summary: string): Promise<TimelineEvent[]> => {
  const prompt = `Extract tactical chronological events from the text. Return JSON { "events": [{ "date": "", "description": "", "type": "", "citation": "" }] }. Context: ${summary.substring(0, 5000)}`;
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview', 
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      events: {
                          type: Type.ARRAY,
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  date: { type: Type.STRING },
                                  description: { type: Type.STRING },
                                  type: { type: Type.STRING, enum: ['filing', 'motion', 'court_date', 'ruling', 'other'] },
                                  citation: { type: Type.STRING }
                              }
                          }
                      }
                  }
              }
          }
      });
      const parsed = safeParseJSON<{ events: TimelineEvent[] }>(response.text);
      return parsed?.events || [];
  } catch { return []; }
};

const extractJudges = async (summary: string): Promise<JudgeSummary[]> => {
    const prompt = `Identify judicial officers mentioned. Return JSON { "judges": [{ "name": "" }] }. Context: ${summary.substring(0, 2000)}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { judges: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } } } } }
            }
        });
        const parsed = safeParseJSON<{ judges: JudgeSummary[] }>(response.text);
        return parsed?.judges || [];
    } catch { return []; }
};

export const searchWebWithGemini = async (params: SearchParams, onPartial: (partial: PartialSearchResult) => void): Promise<SearchResult> => {
    const prompt = buildPrompt(params);
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    const summary = response.text || "No intelligence synthesized.";
    const sources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Legal Reference'
    })).filter((s: any) => s.uri) || [];

    onPartial({ summary, sources });

    // Parallel background analysis for HUD visuals
    const [telemetry, adversarial, timeline, judges, followUps, related] = await Promise.all([
        generateStrategicTelemetry(params.query, summary),
        generateAdversarialStrategy(params.query, summary),
        extractTimelineEvents(summary),
        extractJudges(summary),
        generateFollowUpQuestions(params.query, summary),
        generateRelatedQueries(params.query)
    ]);

    return {
        summary,
        sources,
        telemetry,
        adversarialStrategy: adversarial,
        timelineEvents: timeline,
        identifiedJudges: judges,
        followUpQuestions: followUps,
        relatedQueries: related,
        isSummaryStreaming: false,
        isFollowUpQuestionsLoading: false,
        isRelatedQueriesLoading: false,
        isTimelineLoading: false,
        isIdentifiedJudgesLoading: false,
        isAdversarialLoading: false,
        isTelemetryLoading: false
    };
};

export const getJudgeDetails = async (judgeName: string): Promise<JudgeDetail> => {
  const prompt = `Strategic audit on Denver judge "${judgeName}". Focus on predictability and ruling patterns. assigned a 'riskLevel' (low, medium, or high). Return JSON.`;
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', 
          contents: prompt,
          config: {
              tools: [{googleSearch: {}}], 
              thinkingConfig: { thinkingBudget: 32768 },
              responseMimeType: "application/json"
          },
      });
      return safeParseJSON<JudgeDetail>(response.text) as JudgeDetail;
  } catch (error) { throw new Error(`Dossier retrieve failed for Judge ${judgeName}.`); }
};

export const analyzeDocument = async (base64Content: string, mimeType: string, fileName: string): Promise<DocumentAnalysisResult> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            {
                parts: [
                    { inlineData: { data: base64Content, mimeType } },
                    { text: `Deep strategic audit of "${fileName}".` }
                ]
            }
        ],
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json"
        }
    });
    return safeParseJSON<DocumentAnalysisResult>(response.text) || { 
        fileName, strategicSummary: 'Audit failure.', keyArguments: [], identifiedEntities: [], actionableInsights: [] 
    };
};

export const askDocumentQuestion = async (analysis: DocumentAnalysisResult, question: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: ${JSON.stringify(analysis)}\n\nQuestion: ${question}`
    });
    return response.text || "Connection unstable.";
};

export const crossReferenceDocuments = async (
    fileABase64: string, fileAMime: string, fileAName: string,
    fileBBase64: string, fileBMime: string, fileBName: string
): Promise<CrossReferenceResult> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            {
                parts: [
                    { inlineData: { data: fileABase64, mimeType: fileAMime } },
                    { inlineData: { data: fileBBase64, mimeType: fileBMime } },
                    { text: `Cross-reference "${fileAName}" vs "${fileBName}".` }
                ]
            }
        ],
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json"
        }
    });
    return safeParseJSON<CrossReferenceResult>(response.text) || { 
        fileAName, fileBName, overallCredibilityScore: 0, summaryOfDiscrepancies: 'Sync failure.', contradictions: [] 
    };
};

export const generateNarrativeMap = async (base64Content: string, mimeType: string, fileName: string): Promise<NarrativeMapResult> => {
    const prompt = `Perform a Deep Narrative Reconstruction and Strategic Correlation on the document: "${fileName}".
    
    YOUR MISSION:
    Analyze the discovery material and reconstruct the chronological story of the case. 
    Identify all key entities (People, Locations, Assets, Events). 
    
    SPECIFIC MANDATE: 
    1. Look for EXCULPATORY EVIDENCE (Brady material) — facts that favor the defense or impeach prosecution witnesses.
    2. Flag CONTRADICTIONS — instances where witnesses or documents conflict on material facts.
    
    REQUIRED DATA STRUCTURE:
    - nodes: Array of entities with 'type' (person, location, asset, institution, event), 'label', 'description', and 'bradyFlag' (text if exculpatory, else null).
    - links: Relationships between nodes with 'label' and 'type' (explicit, inferred, contradiction).
    - timeline: Key events extracted chronologically with 'narrativeTrack' (prosecution, defense, undisputed).
    - strategicAssessment: A 2-3 sentence high-level analysis of case strength.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [
                {
                    parts: [
                        { inlineData: { data: base64Content, mimeType } },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        nodes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    label: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['person', 'location', 'asset', 'institution', 'event'] },
                                    description: { type: Type.STRING },
                                    bradyFlag: { type: Type.STRING, nullable: true },
                                    evidenceTags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    sourceCitation: { type: Type.STRING }
                                },
                                required: ['id', 'label', 'type']
                            }
                        },
                        links: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    source: { type: Type.STRING },
                                    target: { type: Type.STRING },
                                    label: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['explicit', 'inferred', 'contradiction'] }
                                },
                                required: ['source', 'target', 'label', 'type']
                            }
                        },
                        timeline: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['filing', 'motion', 'court_date', 'ruling', 'other'] },
                                    narrativeTrack: { type: Type.STRING, enum: ['prosecution', 'defense', 'undisputed'] }
                                },
                                required: ['date', 'description', 'type']
                            }
                        },
                        strategicAssessment: { type: Type.STRING }
                    },
                    required: ['nodes', 'links', 'timeline', 'strategicAssessment']
                }
            }
        });
        return safeParseJSON<NarrativeMapResult>(response.text) || { nodes: [], links: [], timeline: [], strategicAssessment: 'Mapping failure.' };
    } catch (e) {
        console.error("Narrative mapping engine fault:", e);
        return { nodes: [], links: [], timeline: [], strategicAssessment: 'Neural link interrupted during mapping.' };
    }
};
