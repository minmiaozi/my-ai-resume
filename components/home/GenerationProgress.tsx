"use client";

type GenerationProgressProps = {
  progress: number;
  hint: string;
  active: boolean;
};

export function GenerationProgress({ progress, hint, active }: GenerationProgressProps) {
  if (!active) return null;

  const value = Math.min(progress, 100);

  return (
    <div className="progress-wrap" role="status" aria-live="polite" aria-busy={progress < 100}>
      <div className="progress-meta">
        <span>{hint}</span>
        <span aria-hidden="true">{value}%</span>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label="Generation progress"
      >
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
