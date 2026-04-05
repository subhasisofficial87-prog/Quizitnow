-- Create tables for QuizItNow application

-- Quiz attempts/results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('topic', 'pdf', 'image')),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  time_spent_seconds INTEGER NOT NULL,
  answers_json JSONB NOT NULL,
  questions_json JSONB NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_attempted_at ON quiz_results(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_attempted ON quiz_results(user_id, attempted_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own quiz results
CREATE POLICY quiz_results_user_policy ON quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own quiz results
CREATE POLICY quiz_results_insert_policy ON quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own quiz results
CREATE POLICY quiz_results_update_policy ON quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own quiz results
CREATE POLICY quiz_results_delete_policy ON quiz_results
  FOR DELETE
  USING (auth.uid() = user_id);
