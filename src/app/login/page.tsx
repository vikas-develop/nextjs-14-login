'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface PuzzleData {
  question: string;
  answer: number;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  // Generate a new math puzzle
  const generatePuzzle = (): PuzzleData => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer: number;
    let question: string;
    
    switch (operator) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    return { question, answer };
  };

  // Initialize puzzle on component mount
  useEffect(() => {
    setPuzzle(generatePuzzle());
  }, []);

  // Refresh puzzle
  const refreshPuzzle = () => {
    setPuzzle(generatePuzzle());
    setPuzzleAnswer('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate puzzle first
    if (!puzzle || parseInt(puzzleAnswer) !== puzzle.answer) {
      setError('Please solve the puzzle correctly');
      refreshPuzzle();
      return;
    }
    
    try {
      await login(email, password, puzzle.question, puzzleAnswer);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      refreshPuzzle(); // Refresh puzzle on login failure
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* Puzzle Verification */}
            <div className="bg-gray-50 p-4 rounded-b-md border border-gray-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Verification
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono bg-white px-3 py-2 rounded border">
                      {puzzle?.question || 'Loading...'}
                    </span>
                    <span className="text-lg">=</span>
                    <input
                      type="number"
                      required
                      className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="?"
                      value={puzzleAnswer}
                      onChange={(e) => setPuzzleAnswer(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshPuzzle}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  title="Refresh puzzle"
                >
                  🔄
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 