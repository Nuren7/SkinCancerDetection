import type { AnalysisRecord } from '../types'

interface AnalysisResultProps {
  result: AnalysisRecord
}

function formatConfidence(score: number) {
  const percent = score <= 1 ? score * 100 : score
  return `${Math.max(0, Math.min(100, percent)).toFixed(1)}%`
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const sortedPredictions = [...result.predictions].sort(
    (first, second) => second.score - first.score,
  )

  return (
    <section className="result-card" aria-labelledby="result-heading">
      <div className="result-heading-row">
        <div>
          <p className="eyebrow">Analysis complete</p>
          <h2 id="result-heading">Classification results</h2>
        </div>
        <time className="result-date" dateTime={result.createdAt}>
          {new Date(result.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </time>
      </div>
      <div className="result-content">
        <img
          className="result-image"
          src={result.imageUrl}
          alt="Uploaded skin lesion"
        />
        <div className="prediction-list">
          {sortedPredictions.map((prediction) => (
            <div className="prediction" key={prediction.label}>
              <div className="prediction-label-row">
                <span>{prediction.label.replaceAll('_', ' ')}</span>
                <strong>{formatConfidence(prediction.score)}</strong>
              </div>
              <div
                className="confidence-track"
                role="meter"
                aria-label={`${prediction.label} confidence`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number.parseFloat(formatConfidence(prediction.score))}
              >
                <span
                  className="confidence-value"
                  style={{
                    width: formatConfidence(prediction.score),
                  }}
                />
              </div>
            </div>
          ))}
          <p className="result-note">
            Confidence scores reflect model output only and are not a diagnosis.
            Discuss any concerns with a healthcare professional.
          </p>
        </div>
      </div>
    </section>
  )
}
