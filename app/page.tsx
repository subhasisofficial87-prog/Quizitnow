'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizInput } from '@/components/quiz/QuizInput';
import { useAuth } from '@/components/auth/AuthProvider';
import { authService } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQuiz = async (topic: string) => {
    setIsGenerating(true);
    try {
      console.log('[Home] Generating quiz for topic:', topic);

      // Call the Gemini API endpoint
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate quiz');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      console.log('[Home] Quiz generated successfully, redirecting to display page');

      // Store quiz in sessionStorage for display page
      sessionStorage.setItem('generatedQuiz', JSON.stringify(data.quiz));

      // Navigate to quiz display page
      router.push('/quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold gradient-text">QuizItNow</h1>
          <nav className="flex gap-4 items-center">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <span className="text-gray-700 text-sm">{user.email}</span>
                    <a
                      href="/history"
                      className="px-4 py-2 text-gray-700 hover:text-sky-blue font-semibold transition-colors"
                    >
                      📊 History
                    </a>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-semibold"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/auth/login"
                      className="px-4 py-2 text-gray-700 hover:text-sky-blue font-semibold transition-colors"
                    >
                      Sign In
                    </a>
                    <a
                      href="/auth/signup"
                      className="px-4 py-2 bg-sky-blue text-white rounded hover:bg-sky-600 transition-colors font-semibold"
                    >
                      Sign Up
                    </a>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Instant AI Quizzes</span>
            <br />
            <span className="text-gray-900">from Any Topic</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Generate comprehensive AI-powered quizzes in seconds from topics, PDFs, or photos.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 my-12 max-w-4xl mx-auto">
            {[
              { icon: '⚡', title: 'Instant Generation', desc: 'Create quizzes in seconds' },
              { icon: '🤖', title: 'AI-Powered', desc: 'Advanced AI ensures quality' },
              { icon: '📊', title: '31 Questions', desc: 'Mixed difficulty levels' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Quiz Input Section */}
          <div className="max-w-2xl mx-auto">
            <QuizInput onGenerateClick={handleGenerateQuiz} isLoading={isGenerating} />
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 border-t border-gray-200">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Enter Input', desc: 'Topic, PDF, or photo' },
              { step: '2', title: 'AI Generates', desc: '31 unique questions' },
              { step: '3', title: 'Learn & Review', desc: 'Study with answers' },
              { step: '4', title: 'Take Quiz', desc: 'Timed test mode' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-sky-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container text-center">
          <p>© 2024 QuizItNow. Building the future of learning.</p>
        </div>
      </footer>
    </div>
  );
}
