export default function Disclaimer() {
  return (
    <aside className="disclaimer" aria-label="Medical disclaimer">
      <span className="disclaimer-mark" aria-hidden="true">
        i
      </span>
      <p>
        <strong>For informational use only.</strong> This MVP is not a medical
        device and cannot diagnose skin cancer. It does not replace evaluation
        by a qualified healthcare professional. If you have a skin concern,
        consult a clinician.
      </p>
    </aside>
  )
}
