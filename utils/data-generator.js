// utils/data-generator.js
// Data generation utilities for creating realistic test data

import { randomInt, randomChoice } from './helpers.js';

/**
 * Sample course IDs (will be populated from actual API responses)
 * In a real scenario, these would be fetched dynamically
 */
export const sampleCourseIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10
];

/**
 * Sample section indices
 */
export const sampleSectionIndices = [0, 1, 2, 3, 4];

/**
 * Generate realistic course enrollment data
 * @param {number} courseId - Course ID to enroll in
 * @returns {Object} - Enrollment payload (user_id added by test function)
 */
export function generateEnrollmentData(courseId = null) {
  return {
    course_id: courseId || randomChoice(sampleCourseIds),
    // user_id will be added by test function from auth response
  };
}

/**
 * Generate course progress update data
 * @param {number} courseId - Course ID
 * @param {number} sectionIndex - Section index (unused, kept for compatibility)
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Object} - Progress update payload matching API schema
 */
export function generateProgressData(courseId = null, sectionIndex = null, progress = null) {
  return {
    course_id: courseId || randomChoice(sampleCourseIds),
    progress: progress !== null ? progress : randomInt(10, 100), // API schema: course_id + progress (0-100)
  };
}

/**
 * Generate quiz completion data
 * @param {number} courseId - Course ID
 * @param {number} sectionIndex - Section index
 * @param {number} score - Quiz score (0-100)
 * @returns {Object} - Quiz completion payload
 */
export function generateQuizCompletionData(courseId = null, sectionIndex = null, score = null) {
  return {
    course_id: courseId || randomChoice(sampleCourseIds),
    section_index: sectionIndex !== null ? sectionIndex : randomChoice(sampleSectionIndices),
    score: score !== null ? score : randomInt(60, 100),
    completed: true,
    completion_date: new Date().toISOString(),
  };
}

/**
 * Generate topic filter parameters
 * @returns {Object} - Topic filter parameters
 */
export function generateTopicFilters() {
  const filters = {
    page: randomInt(1, 3),
    limit: randomChoice([10, 20, 50]),
  };
  
  // Randomly add additional filters
  if (Math.random() > 0.5) {
    filters.category = randomChoice(['programming', 'design', 'business', 'marketing']);
  }
  
  return filters;
}

/**
 * Generate course filter parameters
 * @returns {Object} - Course filter parameters
 */
export function generateCourseFilters() {
  const filters = {
    page: randomInt(1, 5),
    limit: randomChoice([10, 20, 30]),
  };
  
  // Randomly add additional filters
  if (Math.random() > 0.5) {
    filters.sort = randomChoice(['popular', 'recent', 'rating']);
  }
  
  return filters;
}

/**
 * Create a realistic user journey sequence
 * @returns {Array} - Array of steps in user journey
 */
export function generateUserJourney() {
  return [
    { action: 'browse_topics', weight: 1 },
    { action: 'browse_courses', weight: 0.8 },
    { action: 'view_course_details', weight: 0.6 },
    { action: 'enroll', weight: 0.4 },
    { action: 'update_progress', weight: 0.7 },
    { action: 'complete_quiz', weight: 0.5 },
  ];
}

/**
 * Get random course ID from pool
 * @returns {number} - Random course ID
 */
export function getRandomCourseId() {
  return randomChoice(sampleCourseIds);
}

/**
 * Get random section index
 * @returns {number} - Random section index
 */
export function getRandomSectionIndex() {
  return randomChoice(sampleSectionIndices);
}

/**
 * Generate realistic enrollment scenario with user behavior patterns
 * @returns {Object} - Complete enrollment scenario
 */
export function generateEnrollmentScenario() {
  const userTypes = ['beginner', 'intermediate', 'advanced', 'casual'];
  const userType = randomChoice(userTypes);
  
  const scenarios = {
    beginner: {
      coursePreference: [1, 2, 3], // Easier courses
      progressPattern: 'slow', // More time per section
      quizAttempts: 2, // May retry quizzes
    },
    intermediate: {
      coursePreference: [4, 5, 6, 7],
      progressPattern: 'moderate',
      quizAttempts: 1,
    },
    advanced: {
      coursePreference: [8, 9, 10],
      progressPattern: 'fast',
      quizAttempts: 1,
    },
    casual: {
      coursePreference: sampleCourseIds,
      progressPattern: 'irregular', // May skip sections
      quizAttempts: 1,
    },
  };
  
  const scenario = scenarios[userType];
  return {
    userType: userType,
    coursePreference: scenario.coursePreference,
    progressPattern: scenario.progressPattern,
    quizAttempts: scenario.quizAttempts,
    enrollmentDate: new Date().toISOString(),
  };
}

/**
 * Generate time-of-day based load patterns (realistic traffic)
 * @returns {number} - Load multiplier based on time
 */
export function getTimeBasedLoadMultiplier() {
  const hour = new Date().getHours();
  
  // Peak hours: 9-12, 14-17, 19-22 (working hours + evening)
  if ((hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 17) || (hour >= 19 && hour <= 22)) {
    return 1.5; // 50% more load
  }
  // Off-peak hours: 1-6 (night time)
  if (hour >= 1 && hour <= 6) {
    return 0.3; // 70% less load
  }
  // Normal hours
  return 1.0;
}

/**
 * Generate realistic error scenarios for testing error handling
 * @returns {Object} - Error scenario
 */
export function generateErrorScenario() {
  const errorTypes = [
    { type: 'invalid_course_id', courseId: 999999, expected: 404 },
    { type: 'negative_progress', progress: -10, expected: 400 },
    { type: 'over_progress', progress: 150, expected: 400 },
    { type: 'invalid_section', sectionIndex: 999, expected: 404 },
    { type: 'duplicate_enrollment', expected: 409 },
    { type: 'missing_required_field', expected: 422 },
  ];
  
  return randomChoice(errorTypes);
}

/**
 * Generate course progression sequence (realistic learning path)
 * @param {number} numSections - Number of sections in course
 * @returns {Array} - Array of progress checkpoints
 */
export function generateCourseProgressionSequence(numSections = 5) {
  const progression = [];
  
  for (let i = 0; i < numSections; i++) {
    const sectionProgress = {
      sectionIndex: i,
      steps: [
        { action: 'start', progress: Math.floor((i / numSections) * 100) },
        { action: 'midpoint', progress: Math.floor(((i + 0.5) / numSections) * 100) },
        { action: 'quiz', progress: Math.floor(((i + 0.8) / numSections) * 100), score: randomInt(70, 100) },
        { action: 'complete', progress: Math.floor(((i + 1) / numSections) * 100) },
      ],
    };
    progression.push(sectionProgress);
  }
  
  return progression;
}

/**
 * Generate batch operations for load testing
 * @param {number} batchSize - Number of operations
 * @returns {Array} - Array of operations
 */
export function generateBatchOperations(batchSize = 10) {
  const operations = [];
  const operationTypes = ['enroll', 'progress', 'quiz', 'view'];
  
  for (let i = 0; i < batchSize; i++) {
    operations.push({
      type: randomChoice(operationTypes),
      courseId: getRandomCourseId(),
      timestamp: Date.now() + i * 100, // Stagger by 100ms
    });
  }
  
  return operations;
}

/**
 * Generate realistic user session data
 * @returns {Object} - User session information
 */
export function generateUserSession() {
  const sessionDuration = randomInt(5, 60); // 5-60 minutes
  const pagesVisited = randomInt(3, 20);
  const coursesViewed = randomInt(1, 5);
  
  return {
    sessionId: `session-${Date.now()}-${randomInt(1000, 9999)}`,
    duration: sessionDuration,
    pagesVisited: pagesVisited,
    coursesViewed: coursesViewed,
    interactions: Math.floor(pagesVisited * 1.5),
    hasEnrolled: Math.random() > 0.7, // 30% conversion rate
    hasCompletedQuiz: Math.random() > 0.5,
  };
}

/**
 * Generate realistic course search queries
 * @returns {Object} - Search parameters
 */
export function generateSearchQuery() {
  const searchTerms = [
    'python programming',
    'web development',
    'data science',
    'machine learning',
    'javascript',
    'react',
    'nodejs',
    'database design',
    'cloud computing',
    'cybersecurity',
  ];
  
  const filters = {
    query: randomChoice(searchTerms),
    level: randomChoice(['beginner', 'intermediate', 'advanced', '']),
    sort: randomChoice(['popular', 'recent', 'rating', 'title']),
    page: randomInt(1, 5),
    limit: randomChoice([10, 20, 30, 50]),
  };
  
  // Sometimes omit filters (realistic user behavior)
  if (Math.random() > 0.7) {
    delete filters.level;
  }
  if (Math.random() > 0.8) {
    delete filters.sort;
  }
  
  return filters;
}
