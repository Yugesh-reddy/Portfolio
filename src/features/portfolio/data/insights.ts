import "server-only"

type ISODateString = string

type InsightsSummary = {
  unique_visitors: number
  total_sessions: number
  total_screen_views: number
}

type InsightsSeriesItem = {
  date: ISODateString
  unique_visitors: number
  total_sessions: number
}

type InsightsResponse = {
  summary: InsightsSummary
  series: InsightsSeriesItem[]
  startDate: ISODateString
  endDate: ISODateString
}

export async function getInsights(): Promise<InsightsResponse | null> {
  return null
}
