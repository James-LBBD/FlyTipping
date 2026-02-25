interface ConfidenceIndicatorProps {
  label: string;
  value: number; // 0-1
  className?: string;
}

export default function ConfidenceIndicator({
  label,
  value,
  className = ''
}: ConfidenceIndicatorProps) {
  const getConfidenceLevel = (): {
    color: 'green' | 'yellow' | 'red';
  } => {
    if (value >= 0.8) return { color: 'green' };
    if (value >= 0.6) return { color: 'yellow' };
    return { color: 'red' };
  };

  const { color } = getConfidenceLevel();

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <span className='text-xs text-gray-500'>{label}</span>
      <div className='flex items-center gap-2'>
        <div className='w-20 bg-gray-200 rounded-full h-1.5'>
          <div
            className={`h-1.5 rounded-full transition-all ${
              color === 'green'
                ? 'bg-[#00703c]'
                : color === 'yellow'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${value * 100}%` }}
          />
        </div>
        <span className='text-xs text-gray-500 font-medium tabular-nums w-8 text-right'>
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  );
}
