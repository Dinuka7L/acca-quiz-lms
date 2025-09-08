import { Quiz } from '../types/quiz';

export async function loadQuiz(path: string): Promise<Quiz> {
  const response = await fetch(`/quizzes/${path}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load quiz: ${path}`);
  }
  return response.json();
}

export async function loadAllQuizzes(): Promise<Quiz[]> {
  const quizPaths = [
    // Lesson quizzes
    'lessonQuizzes/OverviewOfITSystems',
    'lessonQuizzes/Hardware',
    'lessonQuizzes/Software',
    'lessonQuizzes/DataAndDatabases',
    'lessonQuizzes/NetworkingFundamentals',
    'lessonQuizzes/InformationSecurity',
    'lessonQuizzes/BusinessProcess',
    'lessonQuizzes/InformationSystemsDevelopment',
    'lessonQuizzes/EmergingTechnologiesInIT',
    'lessonQuizzes/PythonFundamentals',
    'lessonQuizzes/PythonOperators',
    'lessonQuizzes/PythonConditionalStatements',
    
    // Mock exam quizzes
    'mockExamQuizzes/mockFinalPart1',
    'mockExamQuizzes/mockFinalPart4'
  ];

  const quizzes = await Promise.all(
    quizPaths.map(path => loadQuiz(path))
  );

  return quizzes;
}

// Subject mapping for organizing quizzes
export const SUBJECT_MAPPING: Record<string, string[]> = {
  'ITC1370 - Information Technology For Business': [
    'quiz- lesson 01- Overiew of IT&S',
    'quiz-Computer Hardware',
    'quiz-software-03',
    'quiz-data-and-databases-1',
    'quiz- Networking and Communication',
    'quiz-Information Systems Security',
    'Business Process-Quiz',
    'quiz-Information Systems Development',
    'quiz-Emerging Technologies in IT',
    'quiz-python fundamentals',
    'python-operators-test',
    'quiz-conditional-statements-1',

    
  ],
  'Data Management': [
    
  ],
  'Networking & Security': [
  ],
  'Mock Final Exams': [
    'mock-Part 01 - Chapter 1',
    'mock-final-4'
  ]
};

export function getQuizzesBySubject(quizzes: Quiz[]): Record<string, Quiz[]> {
  const result: Record<string, Quiz[]> = {};
  
  Object.entries(SUBJECT_MAPPING).forEach(([subject, quizIds]) => {
    result[subject] = quizzes.filter(quiz => quizIds.includes(quiz.id));
  });
  
  return result;
}