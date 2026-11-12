import type { AnalysisRecord } from '../types'

interface HistoryListProps {
  records: AnalysisRecord[]
  onSelect: (record: AnalysisRecord) => void
  activeId?: string
}

export default function HistoryList({
  records,
  onSelect,
  activeId,
}: HistoryListProps) {
  return (
    <section className="history-section" aria-labelledby="history-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your activity</p>
          <h2 id="history-heading">Recent analyses</h2>
        </div>
        <span className="history-count">{records.length}</span>
      </div>
      {records.length === 0 ? (
        <p className="empty-history">
          Completed analyses will appear here on this device.
        </p>
      ) : (
        <ul className="history-list">
          {records.map((record) => (
            <li key={record.id}>
              <button
                className={`history-item${record.id === activeId ? ' history-item-active' : ''}`}
                type="button"
                aria-current={record.id === activeId ? 'true' : undefined}
                onClick={() => onSelect(record)}
              >
                <img src={record.imageUrl} alt="" className="history-thumb" />
                <span className="history-item-copy">
                  <strong>{record.predictions[0]?.label ?? 'Analysis'}</strong>
                  <time dateTime={record.createdAt}>
                    {new Date(record.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </span>
                <span className="history-arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
