export interface AnalysisPrediction {
  label: string
  score: number
}

export interface AnalysisRecord {
  id: string
  imageUrl: string
  predictions: AnalysisPrediction[]
  createdAt: string
}

export interface AnalyzeApiResponse {
  status?: string
  image_url?: string
  analysis: unknown
  error?: string
  details?: string
}
