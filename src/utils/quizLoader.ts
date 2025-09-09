import { Quiz } from '../types/quiz';

// Cache for loaded quizzes to avoid repeated fetches
let quizCache: Quiz[] | null = null;

/**
 * Auto-discover and load all quiz JSON files from public/quizzes directory
 */
export async function loadAllQuizzes(): Promise<Quiz[]> {
  // Return cached quizzes if available
  if (quizCache) {
    return quizCache;
  }

  try {
    // Use import.meta.glob to get all JSON files in the quizzes directory
    const quizModules = import.meta.glob('/public/quizzes/**/*.json', { 
      as: 'url',
      eager: false 
    });

    const quizPromises = Object.entries(quizModules).map(async ([path, moduleLoader]) => {
      try {
        // Convert the path to a public URL
        const publicPath = path.replace('/public', '');
        const response = await fetch(publicPath);
        
        if (!response.ok) {
          console.warn(`Failed to load quiz from ${publicPath}: ${response.statusText}`);
          return null;
        }
        
        const quiz: Quiz = await response.json();
        
        // Validate required fields
        if (!quiz.id || !quiz.title || !Array.isArray(quiz.questions)) {
          console.warn(`Invalid quiz structure in ${publicPath}:`, quiz);
          return null;
        }
        
        return quiz;
      } catch (error) {
        console.error(`Error loading quiz from ${path}:`, error);
        return null;
      }
    });

    const loadedQuizzes = await Promise.all(quizPromises);
    
    // Filter out null values and cache the result
    quizCache = loadedQuizzes.filter((quiz): quiz is Quiz => quiz !== null);
    
    console.log(`Successfully loaded ${quizCache.length} quizzes`);
    return quizCache;
    
  } catch (error) {
    console.error('Error auto-discovering quizzes:', error);
    
    // Fallback to manual loading if auto-discovery fails
    return loadQuizzesManually();
  }
}

/**
 * Fallback manual loading method (keeps existing functionality as backup)
 */
async function loadQuizzesManually(): Promise<Quiz[]> {
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
    'lessonQuizzes/OverviewFinancialAccountingandReporting',
    'lessonQuizzes/DSC1371MeaningandScopeofStats',
    'lessonQuizzes/DSC1371DataandDataCollection',
    'lessonQuizzes/DSC1371PresentationofCategoricalData',
    'lessonQuizzes/DSC1371PresentationOfQuantitativeData',
    'lessonQuizzes/DSC1371SummaryMeasures',
    'lessonQuizzes/DSC1371ProbabilityTheory',
    'lessonQuizzes/DSC1371Probability2',
    'lessonQuizzes/DSC1371MIDSemesterExamination(Practice)',
    // Mock exam quizzes
    'mockExamQuizzes/mockFinalPart1',
    'mockExamQuizzes/mockFinalPart4'
  ];

  const quizzes = await Promise.all(
    quizPaths.map(path => loadQuiz(path).catch(error => {
      console.warn(`Failed to load quiz ${path}:`, error);
      return null;
    }))
  );

  return quizzes.filter((quiz): quiz is Quiz => quiz !== null);
}

/**
 * Load a single quiz from a path (kept for backward compatibility)
 */
export async function loadQuiz(path: string): Promise<Quiz> {
  const response = await fetch(`/quizzes/${path}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load quiz: ${path}`);
  }
  return response.json();
}

/**
 * Group quizzes by subject using the subject field from each quiz
 */
export function getQuizzesBySubject(quizzes: Quiz[]): Record<string, Quiz[]> {
  const result: Record<string, Quiz[]> = {};
  
  quizzes.forEach(quiz => {
    // Use the subject field from the quiz, or create a default based on category
    const subject = quiz.subject || (quiz.category === 'mockFinal' ? 'Mock Final Exams' : 'Other Quizzes');
    
    if (!result[subject]) {
      result[subject] = [];
    }
    
    result[subject].push(quiz);
  });
  
  // Sort quizzes within each subject by title
  Object.keys(result).forEach(subject => {
    result[subject].sort((a, b) => a.title.localeCompare(b.title));
  });
  
  return result;
}

/**
 * Get default gradient colors based on quiz category
 */
export function getDefaultGradientColors(category: 'lesson' | 'mockFinal'): [string, string, string, string] {
  if (category === 'mockFinal') {
    return ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6']; // Purple gradient
  }
  return ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']; // Blue gradient
}

/**
 * Generate Tailwind CSS gradient classes from color array
 */
export function generateGradientClasses(colors: [string, string, string, string]): string {
  return `bg-gradient-to-br from-[${colors[0]}] via-[${colors[1]}] via-[${colors[2]}] to-[${colors[3]}]`;
}

/**
 * Clear the quiz cache (useful for development or when quizzes are updated)
 */
export function clearQuizCache(): void {
  quizCache = null;
}