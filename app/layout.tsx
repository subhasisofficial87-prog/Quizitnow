import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuizItNow - AI Quiz Generator',
  description: 'Generate quizzes from topics, PDFs, and images using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
