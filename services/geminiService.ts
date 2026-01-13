
// Implemented missing service functions and updated models to follow latest guidelines.
import { GoogleGenAI, GenerateContentResponse, Type, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { type SearchParams, type SearchResult, type Source, SearchType, DateRange, PartialSearchResult, TimelineEvent, JudgeSummary, JudgeDetail, DocumentAnalysisResult, CaseStatus, CaseType, Jurisdiction, CrossReferenceResult, NarrativeMapResult, AdversarialStrategy, NarrativeNode, NarrativeLink } from '../types';

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
  const { query, listCount, partyName, caseNumber, jurisdiction } = params;
  
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

  let prompt = `${missionStatement}

  ORGANIZATION REQUIREMENTS:
  - Header: Tactical Intelligence Summary
  - Section: The Adversarial Landscape (Prosecution Moves)
  - Section: Pro-Se Tactical Advantages (Defense Moves)
  - Section: Denver Procedural Checklist
  
  Use Bold for high-impact legal concepts.`;

  if (listCount && listCount > 0) prompt += ` Detail exactly ${listCount} high-leverage strategic points.`;

  return prompt;
};

const generateAdversarialStrategy = async (query: string, summary: string): Promise<AdversarialStrategy> => {
    const prompt = `Legendary Denver defense attorney mode. 
    Predict opponent's next 3 moves and countermeasures for: "${query}".
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

export const getJudgeDetails = async (judgeName: string): Promise<JudgeDetail> => {
  const prompt = `Strategic audit on Denver judge "${judgeName}". Focus on readability and clear sections. Assess the favorability and predictability of their ruling patterns. For each pattern, assign a 'riskLevel' (low, medium, or high) representing the danger to a typical defense case. Return JSON.`;
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', 
          contents: prompt,
          config: {
              tools: [{googleSearch: {}}], 
              thinkingConfig: { thinkingBudget: 32768 },
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      name: { type: Type.STRING },
                      tendencies: { type: Type.STRING },
                      notableCases: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { caseName: { type: Type.STRING }, outcome: { type: Type.STRING }, date: { type: Type.STRING } } } },
                      statistics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { totalCases: { type: Type.NUMBER }, convictionRate: { type: Type.STRING }, averageSentence: { type: Type.STRING }, caseLoad: { type: Type.STRING } } } },
                      rulingPatternsByCaseType: { 
                        type: Type.ARRAY, 
                        items: { 
                          type: Type.OBJECT, 
                          properties: { 
                            caseType: { type: Type.STRING }, 
                            pattern: { type: Type.STRING }, 
                            percentage: { type: Type.STRING },
                            riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                          } 
                        } 
                      },
                      averageTimeToDisposition: { type: Type.STRING },
                      sentencingData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { offense: { type: Type.STRING }, averageSentence: { type: Type.STRING } } } },
                      strategicInsights: { type: Type.STRING },
                  }
              }
          },
      });
      return safeParseJSON<JudgeDetail>(response.text) as JudgeDetail;
  } catch (error) { throw new Error(`Dossier retrieve failed for Judge ${judgeName}.`); }
};

export const generateSpeech = async (text: string): Promise<string> => {
  // Use a strictly focused prompt to avoid backend filtering or logic errors
  const speechPrompt = `Read the following briefing text clearly and authoritatively: ${text.substring(0, 1000)}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: speechPrompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS payload extraction failure.");
  return base64Audio;
};

export const analyzeDocument = async (base64Content: string, mimeType: string, fileName: string): Promise<DocumentAnalysisResult> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            {
                parts: [
                    { inlineData: { data: base64Content, mimeType } },
                    { text: `Deep strategic audit of "${fileName}". Focus on organized counters and actionable steps.` }
                ]
            }
        ],
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    fileName: { type: Type.STRING },
                    strategicSummary: { type: Type.STRING },
                    keyArguments: { type: Type.ARRAY, items: { type: Type.STRING } },
                    identifiedEntities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['judge', 'party', 'date', 'case_number', 'other'] },
                                value: { type: Type.STRING }
                            }
                        }
                    },
                    actionableInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['fileName', 'strategicSummary', 'keyArguments', 'identifiedEntities', 'actionableInsights']
            }
        }
    });
    return safeParseJSON<DocumentAnalysisResult>(response.text) || { 
        fileName, strategicSummary: 'Audit failure.', keyArguments: [], identifiedEntities: [], actionableInsights: [] 
    };
};

export const askDocumentQuestion = async (analysis: DocumentAnalysisResult, question: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: ${JSON.stringify(analysis)}\n\nQuestion: ${question}`,
        config: {
            systemInstruction: "You are Denver Court Copilot. Provide clear, large-print-ready answers."
        }
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
                    { text: `Cross-reference "${fileAName}" vs "${fileBName}". Return JSON.` }
                ]
            }
        ],
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    fileAName: { type: Type.STRING },
                    fileBName: { type: Type.STRING },
                    overallCredibilityScore: { type: Type.NUMBER },
                    summaryOfDiscrepancies: { type: Type.STRING },
                    contradictions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                topic: { type: Type.STRING },
                                severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                                sourceAClaim: { type: Type.STRING },
                                sourceBClaim: { type: Type.STRING },
                                analysis: { type: Type.STRING }
                            }
                        }
                    }
                },
                required: ['fileAName', 'fileBName', 'overallCredibilityScore', 'summaryOfDiscrepancies', 'contradictions']
            }
        }
    });
    return safeParseJSON<CrossReferenceResult>(response.text) || { 
        fileAName, fileBName, overallCredibilityScore: 0, summaryOfDiscrepancies: 'Sync failure.', contradictions: [] 
    };
};

export const generateNarrativeMap = async (base64Content: string, mimeType: string, fileName: string): Promise<NarrativeMapResult> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            {
                parts: [
                    { inlineData: { data: base64Content, mimeType } },
                    { text: `Map narrative track for "${fileName}". Identify nodes, links, and dual-track timeline. Return JSON.` }
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
                                bradyFlag: { type: Type.STRING },
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
                                type: { type: Type.STRING, enum: ['explicit', 'inferred', 'contradiction'] },
                                evidence: { type: Type.STRING }
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
                                narrativeTrack: { type: Type.STRING, enum: ['prosecution', 'defense', 'undisputed'] },
                                citation: { type: Type.STRING }
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
};

export const searchWebWithGemini = async (params: SearchParams, onUpdate: (partialResult: PartialSearchResult) => void): Promise<SearchResult> => {
  const prompt = buildPrompt(params);
  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });

    let summary = "";
    let sources: Source[] = [];
    const sourceUris = new Set<string>();

    for await (const chunk of stream) {
      let chunkText = "";
      try { chunkText = chunk.text || ""; } catch (e) {}
      if (chunkText) summary += chunkText;
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const newSources = groundingChunks.map((c: any) => ({ title: c.web?.title || 'Unknown Source', uri: c.web?.uri || '#' })).filter((s: Source) => s.uri !== '#' && !sourceUris.has(s.uri));
        newSources.forEach(s => { sourceUris.add(s.uri); sources.push(s); });
      }
      onUpdate({ summary, sources: [...sources] });
    }
    
    onUpdate({ isSummaryStreaming: false, isFollowUpQuestionsLoading: true, isRelatedQueriesLoading: true, isTimelineLoading: true, isAdversarialLoading: true });
    
    const [followUpQuestions, relatedQueries, timelineEvents, adversarialStrategy] = await Promise.all([
        generateFollowUpQuestions(params.query, summary),
        generateRelatedQueries(params.query),
        extractTimelineEvents(summary),
        generateAdversarialStrategy(params.query, summary)
    ]);
    
    onUpdate({ followUpQuestions, relatedQueries, timelineEvents, adversarialStrategy, isFollowUpQuestionsLoading: false, isRelatedQueriesLoading: false, isTimelineLoading: false, isAdversarialLoading: false });
    
    return { summary: summary.trim(), sources, followUpQuestions, relatedQueries, timelineEvents, adversarialStrategy, isSummaryStreaming: false, isFollowUpQuestionsLoading: false, isRelatedQueriesLoading: false, isTimelineLoading: false, isIdentifiedJudgesLoading: false };
  } catch (error) { throw error; }
};
