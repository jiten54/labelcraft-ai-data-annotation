# LabelCraft AI — Data Annotation & Quality Assurance Platform
<img width="1910" height="865" alt="Screenshot 2026-10-16 034845" src="https://github.com/user-attachments/assets/504e4bb9-0a7b-4cc8-a293-326ed068b1de" />
<img width="1920" height="872" alt="Screenshot 2026-10-16 034947" src="https://github.com/user-attachments/assets/fa7666f9-61ee-4731-bc9d-c9384772e9e3" />

A data annotation platform for labeling text and image datasets, validating records, reviewing uncertain annotations, and evaluating annotation quality.

## Overview

LabelCraft AI is a portfolio project designed to demonstrate practical data annotation and quality assurance workflows used in AI and machine learning projects.

The platform helps annotators organize datasets, apply consistent labels, identify incomplete or ambiguous records, and maintain reliable annotation records through structured review processes.

The project focuses on accuracy, consistency, attention to detail, and following annotation guidelines.

## Key Features

- **Dataset Management:** Import and validate CSV and JSON datasets.
- **Text Annotation:** Classify text by sentiment, topic, and content relevance.
- **Image Annotation:** Categorize images and flag corrupted or unclear content.
- **Annotation Guidelines:** Provide clear labeling definitions and examples.
- **Quality Assurance:** Identify missing labels, invalid values, duplicate IDs, and inconsistent records.
- **Manual Review Queue:** Review uncertain annotations and record correction decisions.
- **Gold-Standard Evaluation:** Compare annotations with verified reference labels.
- **Annotation Metrics:** Calculate accuracy, precision, recall, F1-score, and confusion matrices when reference data is available.
- **Audit Trail:** Track annotation changes and reviewer decisions.
- **Data Export:** Export annotated datasets and quality reports in CSV and JSON formats.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Data Processing | Pandas |
| Database | SQLite |
| Charts | Recharts |
| Frontend Testing | Vitest |
| Backend Testing | Pytest |

## Project Workflow

1. Import a dataset.
2. Validate the input structure and required fields.
3. Review the annotation guidelines.
4. Label each record using the appropriate categories.
5. Flag unclear or incomplete records.
6. Run automated quality checks.
7. Review and correct flagged annotations.
8. Evaluate results against verified reference labels, when available.
9. Export the completed dataset and quality report.

## Annotation Categories

### Text Annotation

- Sentiment: Positive, Negative, Neutral, Unclear
- Topic: Technology, Education, Healthcare, Finance, Entertainment, Other
- Content relevance: Relevant, Irrelevant, Needs Review

### Image Annotation

- Image category classification
- Image quality review
- Unclear or corrupted image identification
- Optional bounding-box annotation

## Quality Assurance

The platform is designed to identify:

- Missing or invalid annotations
- Duplicate record identifiers
- Incomplete data
- Inconsistent labels
- Ambiguous examples
- Records requiring manual verification

Automated checks support quality control but do not replace human judgment. Semantic accuracy should be evaluated using reviewed examples and verified reference labels.

## Installation

### Prerequisites

- Node.js 20 or later
- Python 3.10 or later
- Git

### Backend Setup

```bash
git clone https://github.com/jiten54/labelcraft-ai-data-annotation.git
cd labelcraft-ai-data-annotation

python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

**Linux/macOS:**

```bash
source .venv/bin/activate
```

Install backend dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Adjust the application module path if the final source code uses a different structure.

### Frontend Setup

Open a second terminal:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Testing

Run backend tests:

```bash
pytest
```

Run frontend tests:

```bash
npm test
```

Use the commands defined in `package.json` if the project's test scripts have different names.

## Example Use Case

An annotator receives a text record with an unclear sentiment. Instead of forcing an incorrect label, the annotator selects **Unclear**, adds a note, and sends the record for review.

The reviewer checks the guidelines, makes a decision, and records the correction. The final dataset preserves the annotation status and relevant review history.

## Dataset and Evaluation

Sample datasets should be clearly identified as synthetic demonstration data.

Evaluation metrics must be calculated from actual test results. When verified reference labels are unavailable, the application should show that evaluation has not yet been performed rather than displaying invented accuracy figures.

## Screenshots

Add screenshots of the working application here:

- Dashboard
- Dataset import and validation
- Text annotation workspace
- Image annotation workspace
- Quality assurance dashboard
- Exported annotation report

## Future Improvements

- Multi-user annotation and reviewer roles
- Inter-annotator agreement measurement
- Advanced image bounding-box tools
- More annotation task types
- Batch processing for larger datasets
- Improved reporting and audit controls

## Relevance to Data Annotation

This project demonstrates practical workflows related to:

- Text and image labeling
- Categorization and tagging
- Data accuracy and consistency
- Guideline-based annotation
- Error identification and review
- Dataset validation
- Documentation and quality assurance

## Disclaimer

This is an independent portfolio project and is not affiliated with Codefeast or any other employer. Sample data and illustrative examples must not be represented as real client work.

## Author

**Jiten Moni Das**

GitHub: https://github.com/jiten54

---

*Built to demonstrate structured data annotation, quality control, and dataset management skills for entry-level AI data operations roles.*
