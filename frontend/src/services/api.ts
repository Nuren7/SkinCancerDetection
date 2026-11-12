import type {
  AnalysisPrediction,
  AnalysisRecord,
} from '../types'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parsePredictions(analysis: unknown): AnalysisPrediction[] {
  const candidate = Array.isArray(analysis)
    ? analysis
    : isRecord(analysis)
      ? analysis.predictions ?? analysis.results ?? analysis
      : []

  const entries = Array.isArray(candidate) ? candidate : [candidate]

  return entries.flatMap((entry): AnalysisPrediction[] => {
    if (!isRecord(entry) || typeof entry.label !== 'string') return []

    const rawScore = entry.score ?? entry.confidence
    if (typeof rawScore !== 'number' || !Number.isFinite(rawScore)) return []

    return [{ label: entry.label, score: rawScore }]
  })
}

export async function analyzeImage(
  file: File,
  imageUrl: string,
): Promise<AnalysisRecord> {
  const body = new FormData()
  body.append('file', file)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body,
    })
  } catch {
    throw new Error(
      'Unable to reach the analysis service. Check that the API is running and try again.',
    )
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('The analysis service returned an unreadable response.')
  }

  if (!isRecord(payload)) {
    throw new Error('The analysis service returned an invalid response.')
  }

  const errorMessage =
    typeof payload.error === 'string'
      ? payload.error
      : typeof payload.details === 'string'
        ? payload.details
        : undefined
  if (!response.ok || errorMessage) {
    throw new Error(
      errorMessage ??
        `Analysis failed with status ${response.status}. Please try again.`,
    )
  }

  if (!('analysis' in payload)) {
    throw new Error('The analysis service returned an invalid response.')
  }

  const predictions = parsePredictions(payload.analysis)
  if (predictions.length === 0) {
    throw new Error(
      'The analysis service did not return any classification results.',
    )
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    imageUrl:
      typeof payload.image_url === 'string' && payload.image_url.length > 0
        ? payload.image_url
        : imageUrl,
    predictions,
    createdAt: new Date().toISOString(),
  }
}
