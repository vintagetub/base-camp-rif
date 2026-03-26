// ---------------------------------------------------------------------------
// Conversation Insights Logger
// Captures anonymized conversation patterns for analysis
// ---------------------------------------------------------------------------

export interface ConversationInsight {
  sessionId: string;
  timestamp: string;
  channel: string;
  messageCount: number;
  toolsUsed: string[];
  productsViewed: string[];
  productsQuoted: string[];
  categoriesExplored: string[];
  brandsExplored: string[];
  searchQueries: string[];
  bidSize: number;
  topics: string[];
}

const insightsBuffer: ConversationInsight[] = [];

export function logInsight(insight: ConversationInsight) {
  insightsBuffer.push(insight);

  console.log("[Insight]", JSON.stringify({
    timestamp: insight.timestamp,
    channel: insight.channel,
    messageCount: insight.messageCount,
    toolsUsed: insight.toolsUsed,
    productsQuoted: insight.productsQuoted.length,
    categoriesExplored: insight.categoriesExplored,
    brandsExplored: insight.brandsExplored,
    searchQueries: insight.searchQueries,
    bidSize: insight.bidSize,
    topics: insight.topics,
  }));
}

export function extractTopics(messages: Array<{ role: string; content: string }>): string[] {
  const topics: Set<string> = new Set();
  const allText = messages.map(m => m.content).join(" ").toLowerCase();

  if (allText.includes("ada") || allText.includes("accessible") || allText.includes("compliant")) topics.add("ada-accessibility");
  if (allText.includes("budget") || allText.includes("cheap") || allText.includes("affordable")) topics.add("budget-conscious");
  if (allText.includes("remodel") || allText.includes("renovation") || allText.includes("replace")) topics.add("remodel");
  if (allText.includes("new construction") || allText.includes("new build") || allText.includes("spec home")) topics.add("new-construction");
  if (allText.includes("multifamily") || allText.includes("apartment") || allText.includes("condo")) topics.add("multifamily");
  if (allText.includes("luxury") || allText.includes("premium") || allText.includes("high end")) topics.add("luxury");
  if (allText.includes("steam") || allText.includes("spa") || allText.includes("wellness")) topics.add("steam-spa");
  if (allText.includes("whirlpool") || allText.includes("jetted") || allText.includes("hydrotherapy")) topics.add("hydrotherapy");
  if (allText.includes("frameless")) topics.add("frameless-preference");
  if (allText.includes("compare") || allText.includes("versus") || allText.includes("vs")) topics.add("comparison-shopping");
  if (allText.includes("quote") || allText.includes("bid") || allText.includes("order")) topics.add("quote-building");

  return Array.from(topics);
}

export function getInsightsBuffer(): ConversationInsight[] {
  return [...insightsBuffer];
}
