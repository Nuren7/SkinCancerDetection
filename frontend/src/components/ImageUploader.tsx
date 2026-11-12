import { useRef, useState } from 'react'

interface ImageUploaderProps {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUploader({
  onFileSelected,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const selectFile = (file?: File) => {
    setError('')
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('The image must be smaller than 10 MB.')
      return
    }
    onFileSelected(file)
  }

  return (
    <div>
      <div
        className={`upload-zone${isDragging ? ' upload-zone-active' : ''}${disabled ? ' upload-zone-disabled' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault()
          if (event.currentTarget === event.target) setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          if (!disabled) selectFile(event.dataTransfer.files[0])
        }}
      >
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          aria-label="Choose a skin image"
          onChange={(event) => {
            selectFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <span className="upload-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="upload-title">Select an image to begin</p>
        <p className="upload-copy">
          Drag and drop a skin lesion image here, or choose a file from your
          device.
        </p>
        <button
          className="button button-secondary"
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Choose image
        </button>
        <p className="upload-hint">JPG, PNG, or WebP · Maximum 10 MB</p>
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
