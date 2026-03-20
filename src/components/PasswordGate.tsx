import React, { useEffect, useState } from 'react';

interface PasswordGateProps {
  onUnlock: () => void;
}

export default function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [wrongAttempt, setWrongAttempt] = useState(false);
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
  const showIncorrect = wrongAttempt;

  const handleSubmit = async () => {
    if (!password.trim()) return;

    setIsSubmitting(true);
    setWrongAttempt(false);

    try {
      if (password === expectedPassword) {
        onUnlock();
      } else {
        setWrongAttempt(true);
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

  const inputClassName = [
    'w-full p-2 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 transition-[border-color,box-shadow] duration-150',
    isCorrect
      ? 'border-green-500 ring-2 ring-green-500 focus:ring-green-500'
      : showIncorrect
        ? 'border-red-500 ring-2 ring-red-500 focus:ring-red-500'
        : 'border-grey-300 focus:ring-grey-400',
  ].join(' ');

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

        <div className="mb-3">
          <input
            type="password"
            className={inputClassName}
            placeholder="Enter access password"
            value={password}
            onChange={(e) => {
              const next = e.target.value;
              setPassword(next);

              if (wrongAttempt && next === expectedPassword) setWrongAttempt(false);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Access password"
            aria-invalid={showIncorrect || undefined}
          />
        </div>

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
      </div>
    </div>
  );
}
