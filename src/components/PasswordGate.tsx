import React, { useEffect, useState } from 'react';

interface PasswordGateProps {
  onUnlock: () => void;
}

export default function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expectedPassword =
    process.env.REACT_APP_PASSWORD ||
    (process.env as unknown as { REANK_PASSWORD?: string }).REANK_PASSWORD ||
    'change-me-password';

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const isCorrect = password.trim().length > 0 && password === expectedPassword;
  const showIncorrect = !!error;

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
    <div className="fixed inset-0 bg-grey-50 flex items-center justify-center p-4 overflow-hidden">
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

        <div className="relative mb-3">
          <input
            type="password"
            className="w-full p-2 pr-10 border border-grey-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-grey-400"
            placeholder="Enter access password"
            value={password}
            onChange={(e) => {
              const next = e.target.value;
              setPassword(next);

              if (error && next === expectedPassword) setError(null);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Access password"
            aria-invalid={showIncorrect || undefined}
            aria-describedby={error ? 'password-gate-error' : undefined}
          />

          {isCorrect ? (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
              aria-hidden="true"
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path
                  d="M16.7 5.7c.4.4.4 1 0 1.4l-8.3 8.3c-.4.4-1 .4-1.4 0L3.3 11.7c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l2.3 2.3 7.6-7.6c.4-.4 1-.4 1.4 0Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          ) : showIncorrect ? (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
              aria-hidden="true"
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
                <path
                  d="M6.2 6.2a1 1 0 0 1 1.4 0L10 8.6l2.4-2.4a1 1 0 1 1 1.4 1.4L11.4 10l2.4 2.4a1 1 0 0 1-1.4 1.4L10 11.4l-2.4 2.4a1 1 0 0 1-1.4-1.4L8.6 10 6.2 7.6a1 1 0 0 1 0-1.4Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          ) : null}
        </div>

        {error && (
          <p
            id="password-gate-error"
            className="text-sm text-red-500 mb-3"
            role="alert"
          >
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

