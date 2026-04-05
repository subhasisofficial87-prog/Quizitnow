import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">QuizItNow</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
