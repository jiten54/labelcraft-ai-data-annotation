import { Dataset, TextRecord, ImageRecord, SentimentLabel, TopicLabel, ContentReviewLabel } from '../types';

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'ds-text-codefeast-100',
    name: 'Codefeast NLP Benchmark (100 Records)',
    description: '100 synthetic text records designed for evaluating sentiment classification, topic categorization, and anomaly detection. Includes intentional test edge cases (missing text, duplicates, ambiguous sarcasm, conflicting labels).',
    type: 'text',
    createdDate: '2026-03-10',
    recordCount: 100,
    annotatedCount: 78,
    hasGoldStandard: true,
    isSynthetic: true
  },
  {
    id: 'ds-vision-benchmark-20',
    name: 'Codefeast Vision Multi-Object Dataset',
    description: 'Curated image dataset for scene categorization, quality audit, and object bounding box localization across workplace, technology, urban, and nature domains.',
    type: 'image',
    createdDate: '2026-03-12',
    recordCount: 20,
    annotatedCount: 15,
    hasGoldStandard: true,
    isSynthetic: false
  }
];

// Helper to create synthetic records
export const SAMPLE_TEXT_RECORDS: TextRecord[] = [
  // 1-10: Technology (Diverse Sentiments)
  {
    id: 'TX-001',
    datasetId: 'ds-text-codefeast-100',
    text: 'The new CI/CD pipeline deployment script reduced our build duration from 45 minutes down to 8 minutes. Absolutely game-changing efficiency.',
    sentiment: 'Positive',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T10:14:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Technology',
      contentReview: 'Relevant',
      explanation: 'Explicit positive praise ("game-changing") describing developer pipeline speedup.'
    }
  },
  {
    id: 'TX-002',
    datasetId: 'ds-text-codefeast-100',
    text: 'Database connection pool exhausted again under peak load. The memory leak in the connection handler was reported three weeks ago and remains unfixed.',
    sentiment: 'Negative',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T10:18:22Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Technology',
      contentReview: 'Relevant',
      explanation: 'Clear frustration regarding persistent unaddressed memory leak bug.'
    }
  },
  {
    id: 'TX-003',
    datasetId: 'ds-text-codefeast-100',
    text: 'The server cluster runs Ubuntu LTS 24.04 with kernel version 6.8.0-31-generic distributed over 12 virtual worker instances.',
    sentiment: 'Neutral',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T10:25:10Z',
    verifiedReference: {
      sentiment: 'Neutral',
      topic: 'Technology',
      contentReview: 'Relevant',
      explanation: 'Factual technical specification without sentiment.'
    }
  },
  {
    id: 'TX-004',
    datasetId: 'ds-text-codefeast-100',
    text: 'Oh wonderful, another mandatory security patch that resets all custom IDE keybindings and requires restarting docker five times.',
    sentiment: 'Negative',
    topic: 'Technology',
    contentReview: 'Relevant',
    isAmbiguous: true,
    notes: 'Sarcastic phrasing detected ("Oh wonderful"). Literal polarity positive, true sentiment strongly negative.',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T10:31:00Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Technology',
      contentReview: 'Relevant',
      explanation: 'Classic sarcastic inversion.'
    }
  },
  {
    id: 'TX-005',
    datasetId: 'ds-text-codefeast-100',
    text: 'The microservices architecture provides horizontal autoscaling, but debugging distributed tracing logs across 40 nodes is noticeably cumbersome.',
    sentiment: 'Neutral',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T10:35:45Z',
    verifiedReference: {
      sentiment: 'Neutral',
      topic: 'Technology',
      contentReview: 'Relevant',
      explanation: 'Balanced trade-off assessment between pros and cons.'
    }
  },
  {
    id: 'TX-006',
    datasetId: 'ds-text-codefeast-100',
    text: 'We switched our vector database to an in-memory HNSW index and our semantic search query latency dropped below 12 milliseconds.',
    sentiment: 'Positive',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T10:40:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Technology',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-007',
    datasetId: 'ds-text-codefeast-100',
    text: 'API rate limits triggered: Error 429 Too Many Requests returned for user token auth header.',
    sentiment: 'Neutral',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T10:42:00Z'
  },
  {
    id: 'TX-008',
    datasetId: 'ds-text-codefeast-100',
    text: 'Their customer support bot provided an invalid regex pattern that corrupted three configuration files. Completely unacceptable for enterprise software.',
    sentiment: 'Negative',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T10:45:12Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Technology',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-009',
    datasetId: 'ds-text-codefeast-100',
    text: 'The latest firmware update enables hardware-accelerated video decoding on ARM64 chips without noticeable battery drain.',
    sentiment: 'Positive',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T10:50:00Z'
  },
  {
    id: 'TX-010',
    datasetId: 'ds-text-codefeast-100',
    text: 'The GraphQL schema migration completed in staging. No deprecated fields remain in user query paths.',
    sentiment: 'Neutral',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T10:52:10Z'
  },

  // 11-20: Education & Learning
  {
    id: 'TX-011',
    datasetId: 'ds-text-codefeast-100',
    text: 'The interactive coding sandbox helped our first-year computer science cohort grasp recursive binary search trees in less than two lab sessions.',
    sentiment: 'Positive',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:00:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Education',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-012',
    datasetId: 'ds-text-codefeast-100',
    text: 'The university portal crashed right during registration hour for graduate seminar electives. Students were locked out with zero updates.',
    sentiment: 'Negative',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T11:05:00Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Education',
      contentReview: 'Relevant'
    }
  },
  // Intentional Edge Case 1: Duplicate ID
  {
    id: 'TX-012', // Intentional Duplicate ID test case
    datasetId: 'ds-text-codefeast-100',
    text: 'Duplicate record injection: The academic curriculum committee meets every second Tuesday of the term.',
    sentiment: 'Neutral',
    topic: 'Education',
    contentReview: 'Needs Review',
    isAmbiguous: true,
    notes: 'Warning: Record ID matches TX-012 from earlier in the batch. Suspected duplicate primary key.',
    status: 'Needs Review',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:08:00Z'
  },
  {
    id: 'TX-013',
    datasetId: 'ds-text-codefeast-100',
    text: 'The syllabus outlines 14 weekly modules, three midterm assessments, and a capstone laboratory presentation.',
    sentiment: 'Neutral',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:12:00Z'
  },
  {
    id: 'TX-014',
    datasetId: 'ds-text-codefeast-100',
    text: 'Prof. Vance explained quantum electrodynamics with such lucid visual metaphors that even non-majors in the lecture hall were mesmerized.',
    sentiment: 'Positive',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:15:30Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Education',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-015',
    datasetId: 'ds-text-codefeast-100',
    text: 'Textbook prices increased another 22% this semester despite the digital edition having DRM restrictions that prevent offline study.',
    sentiment: 'Negative',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T11:18:00Z'
  },
  // Intentional Edge Case 2: Missing Text Content
  {
    id: 'TX-016',
    datasetId: 'ds-text-codefeast-100',
    text: '', // Intentional empty string test case
    sentiment: undefined,
    topic: undefined,
    contentReview: 'Needs Review',
    isAmbiguous: true,
    notes: 'Record text payload is empty. Cannot determine sentiment or topic.',
    status: 'Needs Review'
  },
  {
    id: 'TX-017',
    datasetId: 'ds-text-codefeast-100',
    text: 'Standardized test results indicate a 4% variance between urban and rural district arithmetic proficiency metrics.',
    sentiment: 'Neutral',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:22:00Z'
  },
  {
    id: 'TX-018',
    datasetId: 'ds-text-codefeast-100',
    text: 'The mentor feedback was harsh, but it genuinely forced me to rethink my research methodology and write a significantly stronger dissertation.',
    sentiment: 'Positive',
    topic: 'Education',
    contentReview: 'Relevant',
    isAmbiguous: true,
    notes: 'Mixed sentiment: Mentions harsh critique initially, but expresses net positive gratitude and growth outcome.',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:26:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Education',
      contentReview: 'Relevant',
      explanation: 'Net attitude is positive acknowledging growth and grateful outcome.'
    }
  },
  {
    id: 'TX-019',
    datasetId: 'ds-text-codefeast-100',
    text: 'Accreditation guidelines mandate a minimum student-to-faculty ratio of 18:1 for accredited allied health degree programs.',
    sentiment: 'Neutral',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T11:30:00Z'
  },
  {
    id: 'TX-020',
    datasetId: 'ds-text-codefeast-100',
    text: 'The online certificate exam was revoked mid-session because the webcam proctor software mistakenly flagged my eyeglasses as an unauthorized device.',
    sentiment: 'Negative',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:33:00Z'
  },

  // 21-30: Healthcare & Medical
  {
    id: 'TX-021',
    datasetId: 'ds-text-codefeast-100',
    text: 'Following 8 weeks of targeted cardiac rehabilitation, the patient exhibited a 35% increase in VO2 max and reported zero recurrent angina episodes.',
    sentiment: 'Positive',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:40:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Healthcare',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-022',
    datasetId: 'ds-text-codefeast-100',
    text: 'Waiting over five hours in the emergency triage room with a fractured wrist while the receptionist ignored repeated pain complaints was appalling.',
    sentiment: 'Negative',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T11:45:00Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Healthcare',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-023',
    datasetId: 'ds-text-codefeast-100',
    text: 'Metformin hydrochloride tablets 500mg should be administered with evening meals to minimize gastrointestinal discomfort.',
    sentiment: 'Neutral',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:48:00Z',
    verifiedReference: {
      sentiment: 'Neutral',
      topic: 'Healthcare',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-024',
    datasetId: 'ds-text-codefeast-100',
    text: 'The surgical team was compassionate, attentive, and explained every step of the minimally invasive laparoscopic procedure before anesthesia.',
    sentiment: 'Positive',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T11:52:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Healthcare',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-025',
    datasetId: 'ds-text-codefeast-100',
    text: 'The pharmacy automated refill notification failed silently, resulting in an elderly diabetic patient missing critical basal insulin doses for two days.',
    sentiment: 'Negative',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T11:55:00Z'
  },
  {
    id: 'TX-026',
    datasetId: 'ds-text-codefeast-100',
    text: 'Serum creatinine levels remained steady at 0.9 mg/dL across three consecutive monthly blood panels.',
    sentiment: 'Neutral',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:00:00Z'
  },
  // Intentional Edge Case 3: Contradictory Label (Positive sentiment with Irrelevant content review & severe complaint)
  {
    id: 'TX-027',
    datasetId: 'ds-text-codefeast-100',
    text: 'The medical billing department sent three threatening collection notices for a copay that was settled on the day of the consultation!',
    sentiment: 'Positive', // Contradictory mistake to be caught by QA Engine!
    topic: 'Healthcare',
    contentReview: 'Irrelevant', // Contradictory flag
    status: 'Annotated',
    annotatedBy: 'annotator_03',
    annotatedAt: '2026-03-10T12:04:00Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Healthcare',
      contentReview: 'Relevant',
      explanation: 'Text contains severe customer distress; annotator mistakenly chose Positive.'
    }
  },
  {
    id: 'TX-028',
    datasetId: 'ds-text-codefeast-100',
    text: 'Pediatric vaccinations are administered in accordance with CDC immunisation schedule guidelines.',
    sentiment: 'Neutral',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:08:00Z'
  },
  {
    id: 'TX-029',
    datasetId: 'ds-text-codefeast-100',
    text: 'Great new wearable sensor! Though the companion phone app crashes every single time I try synchronizing sleep stages in the morning.',
    sentiment: 'Unclear',
    topic: 'Healthcare',
    contentReview: 'Needs Review',
    isAmbiguous: true,
    notes: 'Severely polarized comment: hardware praised ("Great new sensor"), software completely broken. Flagged for review.',
    status: 'Needs Review',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:12:00Z'
  },
  {
    id: 'TX-030',
    datasetId: 'ds-text-codefeast-100',
    text: 'Clinical phase III trial results published in the Lancet confirm 87% efficacy with mild transient adverse events.',
    sentiment: 'Positive',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:15:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Healthcare',
      contentReview: 'Relevant'
    }
  },

  // 31-40: Finance & Banking
  {
    id: 'TX-031',
    datasetId: 'ds-text-codefeast-100',
    text: 'Wire transfer arrived in Tokyo within 30 seconds with zero hidden foreign exchange markup fees. Best international banking experience ever.',
    sentiment: 'Positive',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:20:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Finance',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-032',
    datasetId: 'ds-text-codefeast-100',
    text: 'The investment broker charged an unexpected $65 maintenance penalty despite my portfolio meeting all published account minimums.',
    sentiment: 'Negative',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T12:24:00Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Finance',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-033',
    datasetId: 'ds-text-codefeast-100',
    text: 'The Federal Reserve benchmark interest rate remained unchanged at 5.25% following the Federal Open Market Committee meeting.',
    sentiment: 'Neutral',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:28:00Z',
    verifiedReference: {
      sentiment: 'Neutral',
      topic: 'Finance',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-034',
    datasetId: 'ds-text-codefeast-100',
    text: 'Our automated portfolio rebalancing algorithm delivered an annualized alpha of +4.2% while keeping drawdowns under 7%.',
    sentiment: 'Positive',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:32:00Z'
  },
  {
    id: 'TX-035',
    datasetId: 'ds-text-codefeast-100',
    text: 'The bank blocked my debit card while traveling abroad even though I submitted a travel notice three days in advance on their website.',
    sentiment: 'Negative',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T12:35:00Z'
  },
  {
    id: 'TX-036',
    datasetId: 'ds-text-codefeast-100',
    text: 'Quarterly dividends of $0.48 per common share will be payable on April 15 to shareholders of record on March 31.',
    sentiment: 'Neutral',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:38:00Z'
  },
  {
    id: 'TX-037',
    datasetId: 'ds-text-codefeast-100',
    text: 'Mortgage rates dropped slightly to 6.32% for standard 30-year fixed loan obligations according to Freddie Mac survey data.',
    sentiment: 'Neutral',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:41:00Z'
  },
  {
    id: 'TX-038',
    datasetId: 'ds-text-codefeast-100',
    text: 'Fraudulent transactions were flagged and refunded within 4 hours by the anti-fraud team. Superb response time.',
    sentiment: 'Positive',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:44:00Z'
  },
  {
    id: 'TX-039',
    datasetId: 'ds-text-codefeast-100',
    text: 'The credit card reward points devaluation cut redemption rates by 40% overnight without any advance advisory to cardholders.',
    sentiment: 'Negative',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T12:47:00Z'
  },
  {
    id: 'TX-040',
    datasetId: 'ds-text-codefeast-100',
    text: 'Audit reports indicate compliance with Sarbanes-Oxley internal control requirements for the financial year ended December 31.',
    sentiment: 'Neutral',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T12:50:00Z'
  },

  // 41-50: Entertainment & Media
  {
    id: 'TX-041',
    datasetId: 'ds-text-codefeast-100',
    text: 'The cinematic orchestral score and breathtaking visual effects in the third act left the entire IMAX audience completely spellbound.',
    sentiment: 'Positive',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T13:00:00Z',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Entertainment',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-042',
    datasetId: 'ds-text-codefeast-100',
    text: 'The video game launched with game-breaking physics glitches, server disconnection loops, and non-functional matchmaking queues.',
    sentiment: 'Negative',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T13:05:00Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Entertainment',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-043',
    datasetId: 'ds-text-codefeast-100',
    text: 'The documentary runs for 114 minutes and features archival interviews with eight recording engineers from Abbey Road Studios.',
    sentiment: 'Neutral',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T13:09:00Z',
    verifiedReference: {
      sentiment: 'Neutral',
      topic: 'Entertainment',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-044',
    datasetId: 'ds-text-codefeast-100',
    text: 'The acoustic concert venue delivered pristine sonic clarity from the front mezzanine seats down to the rear orchestra aisles.',
    sentiment: 'Positive',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T13:14:00Z'
  },
  {
    id: 'TX-045',
    datasetId: 'ds-text-codefeast-100',
    text: 'Streaming platform forced unskippable 90-second commercial interruptions into the middle of intense dialogue scenes.',
    sentiment: 'Negative',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T13:18:00Z'
  },
  {
    id: 'TX-046',
    datasetId: 'ds-text-codefeast-100',
    text: 'The film festival announced official selection screening dates beginning October 12 in Toronto and Vancouver.',
    sentiment: 'Neutral',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T13:21:00Z'
  },
  // Intentional Edge Case 4: Ambiguous Sarcasm / Irony
  {
    id: 'TX-047',
    datasetId: 'ds-text-codefeast-100',
    text: 'Truly a cinematic masterpiece if you enjoy watching cardboard cutout characters recite exposition for three uninterrupted hours.',
    sentiment: 'Negative',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    isAmbiguous: true,
    notes: 'Sarcasm: "cinematic masterpiece" used facetiously to describe boring wooden acting.',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T13:25:00Z',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Entertainment',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-048',
    datasetId: 'ds-text-codefeast-100',
    text: 'The multiplayer battle royale patch introduces a new snowstorm map variant, two sniper rifles, and vehicle balance tweaks.',
    sentiment: 'Neutral',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T13:28:00Z'
  },
  {
    id: 'TX-049',
    datasetId: 'ds-text-codefeast-100',
    text: 'Sublime stage performance by the London Symphony Orchestra performing Mahler Symphony No. 2.',
    sentiment: 'Positive',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T13:31:00Z'
  },
  // Intentional Edge Case 5: Gibberish spam / Irrelevant text
  {
    id: 'TX-050',
    datasetId: 'ds-text-codefeast-100',
    text: '!!! $$$ BUY WATCHES 50% OFF CLICK HERE WWW.SPAMMY-JUNK-LINK.XYZ $$$ !!!',
    sentiment: 'Unclear',
    topic: 'Other',
    contentReview: 'Irrelevant',
    isAmbiguous: false,
    notes: 'Bot spam advertisement; marked irrelevant for NLP training corpus.',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T13:35:00Z',
    verifiedReference: {
      sentiment: 'Unclear',
      topic: 'Other',
      contentReview: 'Irrelevant'
    }
  },

  // 51-60: Unannotated / Awaiting Annotation (for real user work!)
  {
    id: 'TX-051',
    datasetId: 'ds-text-codefeast-100',
    text: 'The solar panel array installed on our roof generated 32 kWh on a moderately overcast day, completely powering our heat pump.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Technology',
      contentReview: 'Relevant',
      explanation: 'Generates sufficient renewable energy exceeding baseline requirements.'
    }
  },
  {
    id: 'TX-052',
    datasetId: 'ds-text-codefeast-100',
    text: 'Flight delay caused a 6-hour layover without airline meal vouchers or hotel accommodations provided.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Other',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-053',
    datasetId: 'ds-text-codefeast-100',
    text: 'The municipal transit authority operates 45 hybrid buses along seven metropolitan express corridors.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Neutral',
      topic: 'Other',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-054',
    datasetId: 'ds-text-codefeast-100',
    text: 'My doctor listened attentively to all my post-surgery symptom logs and adjusted my prescription dosage immediately.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Healthcare',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-055',
    datasetId: 'ds-text-codefeast-100',
    text: 'The mobile banking app logs me out every 45 seconds while trying to verify two-factor SMS codes.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Finance',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-056',
    datasetId: 'ds-text-codefeast-100',
    text: 'The online linear algebra course provides step-by-step interactive proofs and automated grade feedback.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Education',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-057',
    datasetId: 'ds-text-codefeast-100',
    text: 'Quarterly inflation metrics rose by 0.2% month-over-month according to the Bureau of Labor Statistics.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Neutral',
      topic: 'Finance',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-058',
    datasetId: 'ds-text-codefeast-100',
    text: 'The streaming adaptation deleted the most emotionally significant plot arc from the original novel without any narrative replacement.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Entertainment',
      contentReview: 'Relevant'
    }
  },
  {
    id: 'TX-059',
    datasetId: 'ds-text-codefeast-100',
    text: 'Sure, paying $18 for a lukewarm latte and waiting 40 minutes in line is peak culinary excellence.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Negative',
      topic: 'Other',
      contentReview: 'Relevant',
      explanation: 'Sarcastic comment about overpriced beverage and poor service.'
    }
  },
  {
    id: 'TX-060',
    datasetId: 'ds-text-codefeast-100',
    text: 'The open-source repository received 450 pull request merges during the annual Hacktoberfest event.',
    status: 'Unlabeled',
    verifiedReference: {
      sentiment: 'Positive',
      topic: 'Technology',
      contentReview: 'Relevant'
    }
  },

  // 61-75: More synthetic records covering all topics
  {
    id: 'TX-061',
    datasetId: 'ds-text-codefeast-100',
    text: 'Automated blood pressure cuff cuff inflates smoothly and syncs with Apple HealthKit flawlessly.',
    sentiment: 'Positive',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:00:00Z'
  },
  {
    id: 'TX-062',
    datasetId: 'ds-text-codefeast-100',
    text: 'The insurance claim for emergency dental extraction was rejected due to pre-existing condition exclusions.',
    sentiment: 'Negative',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T14:04:00Z'
  },
  {
    id: 'TX-063',
    datasetId: 'ds-text-codefeast-100',
    text: 'Clinical trial protocols require double-blind placebo randomization for all stage 2 participants.',
    sentiment: 'Neutral',
    topic: 'Healthcare',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:07:00Z'
  },
  {
    id: 'TX-064',
    datasetId: 'ds-text-codefeast-100',
    text: 'The university career center held an engineering expo with over 90 hiring tech companies.',
    sentiment: 'Positive',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:10:00Z'
  },
  {
    id: 'TX-065',
    datasetId: 'ds-text-codefeast-100',
    text: 'Classroom projectors in the science hall have burned-out bulbs and haven\'t been serviced since last autumn.',
    sentiment: 'Negative',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T14:14:00Z'
  },
  {
    id: 'TX-066',
    datasetId: 'ds-text-codefeast-100',
    text: 'The academic semester concludes with exams scheduled from December 8 through December 19.',
    sentiment: 'Neutral',
    topic: 'Education',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:18:00Z'
  },
  {
    id: 'TX-067',
    datasetId: 'ds-text-codefeast-100',
    text: 'Zero-commission stock trading platform executed my index ETF purchase order in under 200 milliseconds.',
    sentiment: 'Positive',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:22:00Z'
  },
  {
    id: 'TX-068',
    datasetId: 'ds-text-codefeast-100',
    text: 'Excessive overdraft penalty of $38 applied after a 50-cent debit discrepancy was cleared.',
    sentiment: 'Negative',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T14:25:00Z'
  },
  {
    id: 'TX-069',
    datasetId: 'ds-text-codefeast-100',
    text: 'Treasury yields on 10-year notes settled at 4.18% in late afternoon bond trading.',
    sentiment: 'Neutral',
    topic: 'Finance',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:29:00Z'
  },
  {
    id: 'TX-070',
    datasetId: 'ds-text-codefeast-100',
    text: 'Soundtrack album debuted at number one on Spotify global top 50 within 24 hours of streaming release.',
    sentiment: 'Positive',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:32:00Z'
  },
  {
    id: 'TX-071',
    datasetId: 'ds-text-codefeast-100',
    text: 'The animated film sequel completely discarded character development in favor of mindless toy product placement.',
    sentiment: 'Negative',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T14:35:00Z'
  },
  {
    id: 'TX-072',
    datasetId: 'ds-text-codefeast-100',
    text: 'The theatrical production runs Wednesdays through Sundays with matinee shows on Saturday afternoon.',
    sentiment: 'Neutral',
    topic: 'Entertainment',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:38:00Z'
  },
  {
    id: 'TX-073',
    datasetId: 'ds-text-codefeast-100',
    text: 'The ergonomic mechanical keyboard with low-profile tactile switches eradicated my wrist strain after long typing days.',
    sentiment: 'Positive',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:42:00Z'
  },
  {
    id: 'TX-074',
    datasetId: 'ds-text-codefeast-100',
    text: 'Bluetooth headphone connection stutters violently whenever crossing street intersections with high radio frequency traffic.',
    sentiment: 'Negative',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T14:45:00Z'
  },
  {
    id: 'TX-075',
    datasetId: 'ds-text-codefeast-100',
    text: 'The USB-C specification supports power delivery negotiation up to 240 watts across certified e-marker cables.',
    sentiment: 'Neutral',
    topic: 'Technology',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T14:48:00Z'
  },

  // 76-85: Synthetic test records with edge cases & QA review states
  {
    id: 'TX-076',
    datasetId: 'ds-text-codefeast-100',
    text: 'The customer service representative answered politely, however they lacked the clearance to refund the fraudulent charge.',
    sentiment: 'Unclear',
    topic: 'Finance',
    contentReview: 'Needs Review',
    isAmbiguous: true,
    notes: 'Polite agent vs unhelpful outcome. Borderline Neutral or Negative.',
    status: 'Needs Review',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T14:52:00Z'
  },
  // Intentional Edge Case 6: Incomplete annotation (Sentiment selected, topic missing)
  {
    id: 'TX-077',
    datasetId: 'ds-text-codefeast-100',
    text: 'Our hospital network introduced AI triage software that flags acute sepsis indicators in patient telemetry 4 hours sooner.',
    sentiment: 'Positive',
    topic: undefined, // Missing topic! QA engine should flag this!
    contentReview: 'Relevant',
    status: 'In Progress',
    annotatedBy: 'annotator_03',
    annotatedAt: '2026-03-10T14:55:00Z'
  },
  {
    id: 'TX-078',
    datasetId: 'ds-text-codefeast-100',
    text: 'The newly repaved highway bicycle lane significantly reduced near-miss incidents with turning trucks.',
    sentiment: 'Positive',
    topic: 'Other',
    contentReview: 'Relevant',
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T15:00:00Z'
  },
  {
    id: 'TX-079',
    datasetId: 'ds-text-codefeast-100',
    text: 'Trash collection trucks skipped our entire residential street for three consecutive pickup cycles during summer heat.',
    sentiment: 'Negative',
    topic: 'Other',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-10T15:05:00Z'
  },
  {
    id: 'TX-080',
    datasetId: 'ds-text-codefeast-100',
    text: 'The city council public budget hearing is scheduled for Thursday evening at 7:00 PM at City Hall.',
    sentiment: 'Neutral',
    topic: 'Other',
    contentReview: 'Relevant',
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-10T15:10:00Z'
  },

  // 81-100: Generated complete records to reach full 100 benchmark
  ...Array.from({ length: 20 }, (_, i) => {
    const idx = 81 + i;
    const topics: TopicLabel[] = ['Technology', 'Education', 'Healthcare', 'Finance', 'Entertainment', 'Other'];
    const sentiments: SentimentLabel[] = ['Positive', 'Negative', 'Neutral', 'Unclear'];
    const topic = topics[i % topics.length];
    const sentiment = sentiments[i % sentiments.length];
    const isUnlabeled = idx > 90;

    const sampleSentences: Record<TopicLabel, Record<SentimentLabel, string>> = {
      Technology: {
        Positive: `Automated test coverage on commit #${idx} prevented a regression in the payment webhooks.`,
        Negative: `The operating system patch #${idx} caused external monitor flickering and bluetooth pairing timeouts.`,
        Neutral: `System package manager updated 24 dependency libraries to LTS point releases.`,
        Unclear: `The build passed on Linux worker #${idx} but threw an unhandled null pointer on Darwin without stacktrace.`
      },
      Education: {
        Positive: `Students in cohort #${idx} scored an average of 92% on their final practical lab evaluations.`,
        Negative: `The online lecture video for module #${idx} cut off 20 minutes before the end of the derivation.`,
        Neutral: `Textbook readings for unit #${idx} cover chapters 4 and 5 on historical methodology.`,
        Unclear: `Some tutors recommended the textbook for test #${idx} while others claimed it contained superseded nomenclature.`
      },
      Healthcare: {
        Positive: `Patient #${idx} regained normal motor reflex response after completing two months of neuro-physiotherapy.`,
        Negative: `Prescription delivery #${idx} arrived with broken tamper seals and missing refrigeration ice packs.`,
        Neutral: `Electrocardiogram lead placement conforms to standard 12-lead precordial positions.`,
        Unclear: `The diagnostic biomarker for sample #${idx} showed slight elevation but remains below clinical cutoff threshold.`
      },
      Finance: {
        Positive: `Refinancing loan agreement #${idx} shaved 1.8% off our monthly interest payments.`,
        Negative: `The trading platform froze for 12 minutes during the market open on morning #${idx}.`,
        Neutral: `Annual audit report #${idx} details operating expenditures across all regional branches.`,
        Unclear: `Foreign transaction conversion on statement #${idx} applied varying currency rates across identical days.`
      },
      Entertainment: {
        Positive: `The remastered soundtrack for episode #${idx} brings stunning clarity to the acoustic strings.`,
        Negative: `The season finale #${idx} rushed through unresolved character plotlines with abrupt exposition.`,
        Neutral: `The musical production runs twice daily throughout the national touring season #${idx}.`,
        Unclear: `The cinematography in scene #${idx} was praised by critics but criticized by casual streaming viewers.`
      },
      Other: {
        Positive: `Community volunteer initiative #${idx} planted over 300 shade trees along the pedestrian boulevard.`,
        Negative: `Potholes along arterial avenue #${idx} damaged the front suspension of multiple commuter cars.`,
        Neutral: `The regional climate assessment recorded 42mm of precipitation during the monitoring period.`,
        Unclear: `Municipal election survey #${idx} indicated split voter preferences within margin of error.`
      }
    };

    const text = sampleSentences[topic][sentiment];

    return {
      id: `TX-${idx.toString().padStart(3, '0')}`,
      datasetId: 'ds-text-codefeast-100',
      text,
      sentiment: isUnlabeled ? undefined : sentiment,
      topic: isUnlabeled ? undefined : topic,
      contentReview: isUnlabeled ? undefined : ('Relevant' as ContentReviewLabel),
      status: isUnlabeled ? ('Unlabeled' as const) : ('Annotated' as const),
      annotatedBy: isUnlabeled ? undefined : 'annotator_01',
      annotatedAt: isUnlabeled ? undefined : '2026-03-10T16:00:00Z',
      verifiedReference: {
        sentiment,
        topic,
        contentReview: 'Relevant' as ContentReviewLabel
      }
    };
  })
];

// Curated high quality image records for Vision Annotation workbench
export const SAMPLE_IMAGE_RECORDS: ImageRecord[] = [
  {
    id: 'IMG-001',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    title: 'Modern Developer Laptop & Code Display',
    dimensions: { width: 1200, height: 800 },
    category: 'Technology & Devices',
    quality: 'High Quality',
    isCorruptedOrUnclear: false,
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-12T09:30:00Z',
    notes: 'Clear laptop and coffee cup on wooden work desk. Good lighting and contrast.',
    boundingBoxes: [
      { id: 'bb-101', x: 22, y: 18, width: 56, height: 65, label: 'Laptop / Device', confidence: 0.98 },
      { id: 'bb-102', x: 79, y: 55, width: 14, height: 28, label: 'Coffee Cup / Mug', confidence: 0.94 }
    ],
    verifiedReference: {
      category: 'Technology & Devices',
      quality: 'High Quality',
      isCorruptedOrUnclear: false,
      explanation: 'Clear technology workplace composition.'
    }
  },
  {
    id: 'IMG-002',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    title: 'Contemporary Open-Plan Collaborative Office',
    dimensions: { width: 1200, height: 800 },
    category: 'Workplace & Office',
    quality: 'High Quality',
    isCorruptedOrUnclear: false,
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-12T09:45:00Z',
    notes: 'Spacious office environment with desks, chairs, and natural lighting.',
    boundingBoxes: [
      { id: 'bb-201', x: 15, y: 40, width: 70, height: 45, label: 'Desk / Furniture', confidence: 0.92 },
      { id: 'bb-202', x: 28, y: 35, width: 18, height: 35, label: 'Office Chair', confidence: 0.89 }
    ],
    verifiedReference: {
      category: 'Workplace & Office',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  },
  {
    id: 'IMG-003',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    title: 'Healthcare Doctor Reviewing Medical Tablet',
    dimensions: { width: 1200, height: 800 },
    category: 'Healthcare & Medical',
    quality: 'High Quality',
    isCorruptedOrUnclear: false,
    status: 'Approved',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-12T10:10:00Z',
    notes: 'Medical professional in lab coat holding tablet diagnostic interface.',
    boundingBoxes: [
      { id: 'bb-301', x: 25, y: 15, width: 45, height: 80, label: 'Person / Clinician', confidence: 0.97 },
      { id: 'bb-302', x: 42, y: 52, width: 28, height: 32, label: 'Medical Tablet / Device', confidence: 0.95 }
    ],
    verifiedReference: {
      category: 'Healthcare & Medical',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  },
  {
    id: 'IMG-004',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    title: 'Modern High-Rise Glass Skyscraper Architecture',
    dimensions: { width: 1200, height: 800 },
    category: 'Urban & Architecture',
    quality: 'High Quality',
    isCorruptedOrUnclear: false,
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-12T10:30:00Z',
    notes: 'Low angle architectural photography of glass skyscraper facades.',
    boundingBoxes: [
      { id: 'bb-401', x: 10, y: 5, width: 80, height: 90, label: 'Building / Skyscraper', confidence: 0.99 }
    ],
    verifiedReference: {
      category: 'Urban & Architecture',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  },
  {
    id: 'IMG-005',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    title: 'Wildlife Portrait - Lion in Natural Habitat',
    dimensions: { width: 1200, height: 800 },
    category: 'Nature & Animals',
    quality: 'High Quality',
    isCorruptedOrUnclear: false,
    status: 'Approved',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-12T10:45:00Z',
    notes: 'Male lion resting in grassland.',
    boundingBoxes: [
      { id: 'bb-501', x: 18, y: 15, width: 64, height: 75, label: 'Lion / Animal', confidence: 0.99 }
    ],
    verifiedReference: {
      category: 'Nature & Animals',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  },
  {
    id: 'IMG-006',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    title: 'Cybersecurity Server Rack Telemetry',
    dimensions: { width: 1200, height: 800 },
    category: 'Technology & Devices',
    quality: 'High Quality',
    isCorruptedOrUnclear: false,
    status: 'Annotated',
    annotatedBy: 'annotator_02',
    annotatedAt: '2026-03-12T11:00:00Z',
    notes: 'Data center server racks with LED status lights and patch cables.',
    boundingBoxes: [
      { id: 'bb-601', x: 10, y: 8, width: 80, height: 85, label: 'Server Rack', confidence: 0.96 }
    ]
  },
  {
    id: 'IMG-007',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    title: 'Web Coding Workspace with Coffee and Notepad',
    dimensions: { width: 1200, height: 800 },
    category: 'Technology & Devices',
    quality: 'High Quality',
    isCorruptedOrUnclear: false,
    status: 'Annotated',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-12T11:15:00Z',
    boundingBoxes: [
      { id: 'bb-701', x: 20, y: 15, width: 60, height: 70, label: 'Laptop / Screen', confidence: 0.95 }
    ]
  },
  // Intentional Edge Case: Blurry / Needs Review
  {
    id: 'IMG-008',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=300&q=20', // Deliberately small & low quality parameter
    title: 'Motion Blurred Night Urban Traffic Scene',
    dimensions: { width: 300, height: 200 },
    category: 'Urban & Architecture',
    quality: 'Blurry / Low Res',
    isCorruptedOrUnclear: true,
    status: 'Needs Review',
    annotatedBy: 'annotator_01',
    annotatedAt: '2026-03-12T11:30:00Z',
    notes: 'Severe motion blur and low resolution make vehicle license plates and edges unidentifiable. Flagged for review.',
    boundingBoxes: [],
    verifiedReference: {
      category: 'Urban & Architecture',
      quality: 'Blurry / Low Res',
      isCorruptedOrUnclear: true,
      explanation: 'Motion blur prevents object boundary localization.'
    }
  },
  // Unlabeled Image Records (Ready for annotator practice!)
  {
    id: 'IMG-009',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    title: 'Woman Engineer Working with Circuit Hardware',
    dimensions: { width: 1200, height: 800 },
    status: 'Unlabeled',
    boundingBoxes: [],
    verifiedReference: {
      category: 'Technology & Devices',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  },
  {
    id: 'IMG-010',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    title: 'Majestic Mountain Landscape with Pine Forest',
    dimensions: { width: 1200, height: 800 },
    status: 'Unlabeled',
    boundingBoxes: [],
    verifiedReference: {
      category: 'Nature & Animals',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  },
  {
    id: 'IMG-011',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    title: 'Team Workshop Around Conference Room Table',
    dimensions: { width: 1200, height: 800 },
    status: 'Unlabeled',
    boundingBoxes: [],
    verifiedReference: {
      category: 'Workplace & Office',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  },
  {
    id: 'IMG-012',
    datasetId: 'ds-vision-benchmark-20',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    title: 'Stethoscope and Physician Prescription Pad',
    dimensions: { width: 1200, height: 800 },
    status: 'Unlabeled',
    boundingBoxes: [],
    verifiedReference: {
      category: 'Healthcare & Medical',
      quality: 'High Quality',
      isCorruptedOrUnclear: false
    }
  }
];
