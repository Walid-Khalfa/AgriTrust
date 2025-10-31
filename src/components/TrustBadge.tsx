import React from 'react';

interface TrustBadgeProps {
  score: number | null | undefined;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ score }) => {
  if (score === null || score === undefined) {
    return null;
  }

  const getScoreColor = (s: number): string => {
    if (s > 85) return 'bg-green-600';
    if (s > 60) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white ${getScoreColor(score)}`}>
        <div className="text-center">
          <div className="text-3xl font-bold">{score}</div>
          <div className="text-xs font-medium">/ 100</div>
        </div>
      </div>
      <div className="mt-2 text-sm font-semibold text-gray-700">AI TRUST SCORE</div>
    </div>
  );
};
