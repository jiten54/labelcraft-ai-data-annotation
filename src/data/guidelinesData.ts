import { GuidelineRule } from '../types';

export const ANNOTATION_GUIDELINES: GuidelineRule[] = [
  {
    id: 'rule-sentiment-taxonomy',
    category: 'Sentiment',
    title: 'Sentiment Classification Taxonomy & Boundaries',
    description: 'Classify the overall emotional tone or attitude conveyed by the author towards the subject matter. Base decisions purely on stated textual evidence, not personal interpretation.',
    dos: [
      'Choose "Positive" when the author explicitly expresses approval, satisfaction, gratitude, delight, or endorsement.',
      'Choose "Negative" when the author expresses dissatisfaction, frustration, anger, disappointment, or criticism.',
      'Choose "Neutral" for objective reporting, technical specifications, factual statements, or balanced summaries without emotional valence.',
      'Choose "Unclear" only when the sentence is thoroughly contradictory, severed from context, or incomprehensible.'
    ],
    donts: [
      'Do NOT label mild constructive criticism as "Unclear" if the negative tone dominates.',
      'Do NOT assume exclamation marks automatically mean "Positive" (e.g. "This crashed again!" is Negative).',
      'Do NOT label polite refusals as "Positive" simply because polite words ("Please", "Thank you") were used.'
    ],
    examples: [
      {
        input: 'The new telemetry pipeline reduced our database query latency by 45%. Outstanding engineering work!',
        correctLabel: 'Positive',
        incorrectLabel: 'Neutral',
        rationale: 'Contains measurable objective success accompanied by explicit praise ("Outstanding engineering work!").'
      },
      {
        input: 'While the UI looks modern, the search indexing constantly times out on datasets larger than 10MB.',
        correctLabel: 'Negative',
        incorrectLabel: 'Neutral',
        rationale: 'The core functionality failure ("constantly times out") outweighs the cosmetic compliment, resulting in net negative customer sentiment.'
      },
      {
        input: 'The release scheduled for Friday includes patches for CVE-2024-8192 and database migration scripts.',
        correctLabel: 'Neutral',
        incorrectLabel: 'Positive',
        rationale: 'Factual release note without emotional slant or evaluative sentiment.'
      },
      {
        input: 'Yeah right, because losing 4 hours of unsaved work is exactly how I dreamed of spending my evening.',
        correctLabel: 'Negative (Sarcasm)',
        incorrectLabel: 'Positive',
        rationale: 'Clear sarcastic reversal. Annotators must recognize inverted literal phrasing expressing extreme frustration.'
      }
    ]
  },
  {
    id: 'rule-topic-taxonomy',
    category: 'Topic',
    title: 'Topic Classification & Domain Disambiguation',
    description: 'Assign each record to its primary thematic domain. If multiple domains intersect, classify according to the primary intended application or dominant subject.',
    dos: [
      'Assign "Technology" to software, computing hardware, AI, IT operations, programming, and digital devices.',
      'Assign "Education" to learning platforms, pedagogy, curriculum, academic courses, tutorials, and certifications.',
      'Assign "Healthcare" to clinical medicine, patient care, medical diagnostics, pharmaceuticals, and health wellness.',
      'Assign "Finance" to banking, accounting, market investments, cryptocurrencies, payroll, and fiscal policies.',
      'Assign "Entertainment" to movies, video gaming, streaming media, arts, and recreation.',
      'Assign "Other" only if the topic does not fit into any predefined category.'
    ],
    donts: [
      'Do NOT label medical software as purely "Technology" if the primary functional scope is clinical diagnostics (classify as Healthcare).',
      'Do NOT label ed-tech gamification as "Entertainment" if the core goal is instructional delivery (classify as Education).'
    ],
    examples: [
      {
        input: 'The deep learning CNN model detects early signs of diabetic retinopathy from fundus photographs with 94% sensitivity.',
        correctLabel: 'Healthcare',
        incorrectLabel: 'Technology',
        rationale: 'Although AI technology is employed, the fundamental domain and clinical impact is ophthalmic healthcare.'
      },
      {
        input: 'Our quarterly balance sheet shows an operating margin increase to 18.4% driven by lower cloud infrastructure spend.',
        correctLabel: 'Finance',
        incorrectLabel: 'Technology',
        rationale: 'Primary subject is financial corporate reporting and margin profitability.'
      }
    ]
  },
  {
    id: 'rule-content-review',
    category: 'Content Review',
    title: 'Content Review, Relevance & Flagging Protocol',
    description: 'Evaluate whether the record provides legitimate semantic value for dataset training or requires human auditor review.',
    dos: [
      'Mark "Relevant" for coherent, grammatically sensible text that addresses standard user interactions or real-world tasks.',
      'Mark "Irrelevant" for automated bot spam, gibberish strings, repeated filler characters, or foreign language noise outside dataset scope.',
      'Mark "Needs Review" when the record has missing crucial segments, disputed factual context, severe truncation, or contradictory cues.'
    ],
    donts: [
      'Do NOT delete or sanitize the original source text. The original record must remain unmodified in the storage layer.',
      'Do NOT approve records containing broken UTF-8 encoding or truncated tokens without adding an explanation note.'
    ],
    examples: [
      {
        input: 'asdfghjk qwerty 999999999999 test test test $$$',
        correctLabel: 'Irrelevant',
        incorrectLabel: 'Relevant',
        rationale: 'Gibberish sequence without communicative semantic content.'
      },
      {
        input: '[Data Truncated] ...and therefore the patient should be administered...',
        correctLabel: 'Needs Review',
        incorrectLabel: 'Relevant',
        rationale: 'Critical context has been truncated, posing high risk of misleading model inference.'
      }
    ]
  },
  {
    id: 'rule-image-classification',
    category: 'Image Classification',
    title: 'Image Categorization & Quality Assessment',
    description: 'Inspect visual assets for primary scene taxonomy, visual degradation, and clarity standards.',
    dos: [
      'Evaluate image clarity under standard display scaling before choosing quality flags.',
      'Flag "Blurry / Low Res" if edges are degraded such that object boundaries cannot be discerned.',
      'Mark "Corrupted / Unclear" if image artifacts, extreme compression noise, or broken render prevents reliable classification.'
    ],
    donts: [
      'Do NOT assume stylized photographic depth-of-field (bokeh) is a corrupted or low-resolution image.',
      'Do NOT leave annotations empty if an image fails to load; flag the record as corrupted.'
    ],
    examples: [
      {
        input: 'Photo showing high-contrast modern server racks with clean cable management in an enterprise data center.',
        correctLabel: 'Technology & Devices | High Quality',
        incorrectLabel: 'Workplace & Office | Acceptable',
        rationale: 'Primary focus is enterprise computing hardware; crisp sharpness and lighting warrants High Quality.'
      }
    ]
  },
  {
    id: 'rule-bounding-boxes',
    category: 'Bounding Boxes',
    title: 'Bounding Box Precision & Annotation Criteria',
    description: 'Ensure bounding boxes are tight, precise, and comprehensively envelop the target object without excess background margin.',
    dos: [
      'Draw the boundary tightly around all visible extremities of the target object.',
      'Include partially occluded objects if at least 30% of the key defining visual features are visible.',
      'Assign an accurate object label from the predefined taxonomy (Person, Vehicle, Device, Document, Furniture, Other).'
    ],
    donts: [
      'Do NOT include cast shadows unless the shadow is an inseparable part of the target entity geometry.',
      'Do NOT leave oversized bounding boxes with more than 15% extraneous background canvas.'
    ],
    examples: [
      {
        input: 'Annotating a laptop on an office desk',
        correctLabel: 'Box tightly framing laptop lid, keyboard, and chassis corners',
        incorrectLabel: 'Loose box covering desk surface and coffee mug',
        rationale: 'Precision bounding box requires isolating the device from the surrounding desk environment.'
      }
    ]
  },
  {
    id: 'rule-edge-cases',
    category: 'Edge Cases',
    title: 'Handling Missing, Corrupted, and Sarcastic Data',
    description: 'Standard operating procedures for unusual, conflicting, or malformed entries.',
    dos: [
      'Always document your reasoning in the "Notes" field when marking a record as Ambiguous or Needs Review.',
      'Cross-reference the QA Engine warnings before marking a batch as complete.',
      'Verify that identical or duplicate records in the dataset are labeled consistently.'
    ],
    donts: [
      'Never guess randomly on 50/50 ambiguous cases without flagging them for senior review.',
      'Never ignore duplicate ID alerts from the Dataset Manager.'
    ],
    examples: [
      {
        input: 'Record with duplicate ID "TX-012" and differing text content',
        correctLabel: 'Flag as Duplicate ID in QA Engine',
        incorrectLabel: 'Silently overwrite',
        rationale: 'Duplicate IDs corrupt database primary key constraints and must be resolved by data engineering.'
      }
    ]
  }
];
