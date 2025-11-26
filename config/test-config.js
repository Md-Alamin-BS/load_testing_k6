export const config = {
  baseUrl: __ENV.BASE_URL || 'https://api.polanji.com',
  websiteUrl: __ENV.WEBSITE_URL || 'https://www.polanji.com',
  
  user: {
    email: __ENV.USER_EMAIL || 'performancetest07@gmail.com',
    password: __ENV.USER_PASSWORD || 'user123456',
  },
  
  database: {
    host: __ENV.DB_HOST || '206.189.138.9',
    name: __ENV.DB_NAME || 'smart_learning',
    user: __ENV.DB_USER || 'postgres',
    password: __ENV.DB_PASSWORD || '5wyil5uYsr1W',
  },
  
  testMetadata: {
    runId: __ENV.RUN_ID || `run-${Date.now()}`,
    testType: __ENV.TEST_TYPE || 'load',
    environment: __ENV.ENVIRONMENT || 'dev',
  },
  
  endpoints: {
    login: '/log_in',
    topics: '/topics',
    enroll: '/enroll',
    courses: '/courses',
    updateProgress: '/courses/update_progress',
    quizComplete: (courseId, sectionIndex) => `/courses/${courseId}/sections/${sectionIndex}/quiz-complete`,
  },
  
  http: {
    timeout: '30s',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // 95% of requests under 2s, 99% under 3s; Error rate < 5%; Min 0.5 req/sec
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>0.5'],
  },
  
  scenarios: {
    load: {
      vus: 10,
      duration: '2m',
      gracefulStop: '30s',
    },
    stress: {
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 15 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulStop: '30s',
    },
    soak: {
      vus: 5,
      duration: '3m',
      gracefulStop: '30s',
    },
    spike: {
      stages: [
        { duration: '10s', target: 5 },
        { duration: '20s', target: 20 },
        { duration: '10s', target: 5 },
        { duration: '20s', target: 0 },
      ],
      gracefulStop: '30s',
    },
  },
};

export default config;
