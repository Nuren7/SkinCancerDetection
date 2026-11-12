import { useEffect, useMemo, useState } from 'react'
import AnalysisResult from './components/AnalysisResult'
import Disclaimer from './components/Disclaimer'
import HistoryList from './components/HistoryList'
import ImageUploader from './components/ImageUploader'
import { analyzeImage } from './services/api'
import type { AnalysisRecord } from './types'
import './App.css'

const HISTORY_STORAGE_KEY = 'skin-analysis-history'

function isAnalysisRecord(item: unknown): item is AnalysisRecord {
  if (typeof item !== 'object' || item === null) return false

  const record = item as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.imageUrl === 'string' &&
    typeof record.createdAt === 'string' &&
    Number.isFinite(Date.parse(record.createdAt)) &&
    Array.isArray(record.predictions) &&
    record.predictions.every(
      (prediction) =>
        typeof prediction === 'object' &&
        prediction !== null &&
        typeof prediction.label === 'string' &&
        typeof prediction.score === 'number' &&
        Number.isFinite(prediction.score),
    )
  )
}

function loadHistory(): { records: AnalysisRecord[]; warning: string } {
  try {
    const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!saved) return { records: [], warning: '' }
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return { records: [], warning: '' }
    return {
      records: parsed.filter(isAnalysisRecord),
      warning: '',
    }
  } catch {
    return {
      records: [],
      warning: 'Saved analysis history could not be read in this browser.',
    }
  }
}

function App() {
  const [initialHistory] = useState(loadHistory)
  const [history, setHistory] = useState<AnalysisRecord[]>(
    initialHistory.records,
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisRecord | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [historyWarning, setHistoryWarning] = useState(initialHistory.warning)
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile],
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    setResult(null)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !previewUrl || isAnalyzing) return
    setIsAnalyzing(true)
    setError('')
    try {
      const analysis = await analyzeImage(selectedFile, previewUrl)
      setResult(analysis)
      const updatedHistory = [
        analysis,
        ...history.filter((record) => record.id !== analysis.id),
      ].slice(0, 20)
      setHistory(updatedHistory)
      try {
        window.localStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(updatedHistory),
        )
        setHistoryWarning('')
      } catch {
        setHistoryWarning(
          'Analysis completed, but history could not be saved in this browser.',
        )
      }
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : 'An unexpected error occurred. Please try again.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startNewAnalysis = () => {
    setSelectedFile(null)
    setResult(null)
    setError('')
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="site-name" href="/" aria-label="Skin Health home">
          Skin Health
        </a>
        <span className="header-label">Lesion analysis · MVP</span>
      </header>

      <div className="dashboard">
        <section className="intro">
          <p className="eyebrow">Skin health support</p>
          <h1>Skin lesion analysis</h1>
          <p>
            Upload a clear image to view an informational model analysis. Your
            results are not a diagnosis.
          </p>
        </section>

        <Disclaimer />

        <section className="panel" aria-labelledby="upload-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Image assessment</p>
              <h2 id="upload-heading">
                {result ? 'Your analysis' : 'Upload an image'}
              </h2>
            </div>
            {(selectedFile || result) && (
              <button
                className="text-button"
                type="button"
                onClick={startNewAnalysis}
              >
                Start new
              </button>
            )}
          </div>

          {!selectedFile && !result && (
            <ImageUploader onFileSelected={handleFileSelected} />
          )}

          {selectedFile && !result && (
            <div className="selected-file">
              <img
                className="selected-preview"
                src={previewUrl}
                alt="Selected skin lesion preview"
              />
              <div className="selected-file-copy">
                <strong>{selectedFile.name}</strong>
                <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                <button
                  className="text-button"
                  type="button"
                  disabled={isAnalyzing}
                  onClick={startNewAnalysis}
                >
                  Choose a different image
                </button>
              </div>
              <button
                className="button button-primary analyze-button"
                type="button"
                disabled={isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Analyzing…
                  </>
                ) : (
                  'Analyze image'
                )}
              </button>
            </div>
          )}

          {isAnalyzing && (
            <p className="status-message" role="status">
              Your image is being processed. This may take a moment.
            </p>
          )}
          {error && (
            <div className="error-message" role="alert">
              <p>{error}</p>
              {selectedFile && !isAnalyzing && (
                <button
                  className="text-button"
                  type="button"
                  onClick={handleAnalyze}
                >
                  Try again
                </button>
              )}
            </div>
          )}
          {result && <AnalysisResult result={result} />}
        </section>

        <HistoryList
          records={history}
          activeId={result?.id}
          onSelect={(record) => {
            setResult(record)
            setSelectedFile(null)
            setError('')
          }}
        />

        {historyWarning && (
          <p className="storage-warning" role="status">
            {historyWarning}
          </p>
        )}

        <footer className="site-footer">
          <span>Skin Health · Informational MVP</span>
          <span>Analysis history is stored locally in this browser.</span>
        </footer>
      </div>
    </main>
  )
}

export default App
