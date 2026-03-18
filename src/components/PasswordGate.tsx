import React, { useState } from 'react';

interface PasswordGateProps {
  onUnlock: () => void;
}

export default function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CRA expects env vars to be prefixed with REACT_APP_
  const expectedPassword =
    // Prefer CRA-exposed variable, but keep a fallback for local dev/config mismatches.
    process.env.REACT_APP_PASSWORD ||
    (process.env as unknown as { REANK_PASSWORD?: string }).REANK_PASSWORD ||
    'change-me-password';

  const handleSubmit = async () => {
    if (!password.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (password === expectedPassword) {
        onUnlock();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 border border-grey-200">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black leading-tight">
            Rerank
          </h1>
          <p className="text-xs sm:text-sm text-grey-500 mt-1">
            Powered by TextRank, LexRank, and BART
          </p>
        </div>

        <h2 className="text-lg font-semibold mb-2 text-black">
          Enter access password
        </h2>

        <p className="text-sm text-grey-600 mb-4">
          This summarization demo is lightly gated. Enter the shared password
          to continue.
        </p>

        <input
          type="password"
          className="w-full p-2 border border-grey-300 rounded-md mb-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-grey-400"
          placeholder="Enter access password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Access password"
        />

        {error && (
          <p className="text-sm text-red-500 mb-3" role="alert">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !password.trim()}
          className={`w-full py-2 rounded-md border ${
            isSubmitting || !password.trim()
              ? 'border-grey-300 bg-grey-100 text-grey-400 cursor-not-allowed'
              : 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
          } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium`}
          aria-label="Unlock Rerank"
        >
          {isSubmitting ? 'Checking...' : 'Unlock'}
        </button>

        <p className="mt-4 text-[11px] text-grey-400">
          Note: This is a frontend-only gate intended for light protection, not
          strong security.
        </p>
      </div>
    </div>
  );
}

