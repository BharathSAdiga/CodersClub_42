# UDYOGA
### Beyond Credit. Beyond Barriers.

**AI-Powered Financial Intelligence & Resilience-Based Credit Assessment for India's MSMEs**

UDYOGA is an AI-powered financial intelligence platform designed to help India's Micro, Small, and Medium Enterprises (MSMEs) access fairer and more informed credit opportunities.

Traditional lending often relies heavily on credit history and conventional financial records. However, many small businesses are financially active and capable of repayment despite having limited or no formal credit history.

UDYOGA looks beyond conventional credit signals by analyzing business cash flow, financial resilience, transaction behavior, evidence quality, and repayment affordability.

Our goal is to help answer:

> Can this business repay? How much can it responsibly borrow? And what repayment structure would work best for its cash-flow cycle?

---

## The Problem

Millions of Indian MSMEs face barriers to formal credit because:

- They have limited or no formal credit history.
- Their financial activity may not be adequately represented by traditional credit scores.
- Irregular or seasonal cash flows make conventional EMI structures difficult.
- Lenders often lack a complete picture of business health and resilience.
- Financial documents can be fragmented, incomplete, or difficult to interpret.

A business should not be judged only by what its credit history says. Its actual financial behavior matters.

## Our Solution

UDYOGA transforms business financial data into an explainable financial intelligence profile.

The platform analyzes financial activity, evaluates repayment capacity, simulates potential business stress, and generates decision-support insights for lenders.

UDYOGA is designed to support responsible lending—not to blindly approve or reject businesses based on a single score.

---

## Key Features

### 1. Business Financial DNA

Builds a multidimensional view of business health using indicators such as:

- Cash-flow vitality
- Business continuity
- Trade reliability
- Financial resilience
- Evidence confidence

This helps lenders understand the business beyond a conventional credit score.

### 2. AI-Powered Specialist Agents

UDYOGA uses a coordinated agentic architecture to analyze different aspects of business financial health.

Specialist agents examine financial data, identify relevant patterns, evaluate resilience, support underwriting, and contribute to assessment narratives.

The agent workflow is designed to provide structured, explainable insights rather than a single opaque AI decision.

### 3. Cash-Flow Intelligence

Analyzes transaction activity to understand:

- Business inflows and outflows
- Revenue patterns
- Operating expenses
- Cash-flow trends
- Balance behavior
- Financial obligations

The objective is to understand the business's actual financial rhythm.

### 4. Transaction Network Analysis

Uses transaction relationships and graph-based analysis to explore patterns between counterparties.

Potential signals include:

- Concentration of transactions
- Repeated transaction relationships
- Circular-flow patterns
- Unusual network structures

These signals support further review and should not, by themselves, be treated as proof of fraud.

### 5. Financial Resilience & Stress Simulation

UDYOGA provides a financial stress-testing approach to understand how a business may respond to challenging conditions.

Possible scenarios include:

- Revenue decline
- Expense increase
- Delayed receivables
- Seasonal downturn
- Combined financial stress

The stress simulator helps evaluate whether a proposed repayment structure remains manageable under changing business conditions.

### 6. Repayment Affordability

The platform evaluates repayment capacity using cash-flow-based financial metrics.

**Cash Flow Available for Debt Service (CFADS)**

Operating cash inflows minus operating cash outflows and other priority obligations.

**Debt Service Coverage Ratio (DSCR)**

CFADS divided by total debt service.

These metrics help assess whether repayment obligations are supported by the business's financial activity.

### 7. Flexible Repayment Simulation

UDYOGA is designed to compare repayment structures that may better align with business cash flow, including:

- Standard EMI
- Revenue-linked repayment
- Seasonal repayment structures

The objective is to explore repayment terms that are more compatible with the business's earning pattern.

### 8. Explainable Underwriting

The platform supports transparent assessment outcomes with financial reasoning and evidence context.

Rather than relying only on a black-box score, UDYOGA aims to communicate:

- Why a business may qualify
- What repayment capacity is indicated
- Which risks or uncertainties were identified
- What additional evidence may be required
- What could improve the business's credit readiness

### 9. Lender Dashboard & Credit Assessment Memorandum

The lender interface brings together financial intelligence and assessment insights.

Key assessment views include:

- Sanction Terms
- Financial DNA Pulse
- Resilience Stress Matrix
- Evidence Triangulation
- Bank Narrative Memorandum

The platform is designed to support lender review and informed decision-making.

---

## How UDYOGA Works

```text
MSME Business Profile
        |
        v
Financial Data & Bank Statement Upload
        |
        v
Transaction Processing
        |
        v
Cash-Flow Intelligence
        |
        v
Specialist Agent Analysis
        |
        v
Financial DNA & Resilience Assessment
        |
        v
Repayment Affordability Simulation
        |
        v
Explainable Underwriting Insights
        |
        v
Lender Dashboard & Assessment Report
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Data Visualization | Recharts |
| Backend | FastAPI |
| Data Validation | Pydantic |
| Financial Data Processing | Pandas, NumPy |
| Transaction Graph Analysis | NetworkX |
| Database | SQLite, SQLAlchemy |
| Agent Orchestration | Python asynchronous workflows |
| AI Integration | LLM-based structured interpretation and explanations |

---

## Getting Started

### Prerequisites

Install the following before running UDYOGA:

- Python
- Node.js and npm
- Git

Check your installation:

```bash
python --version
node --version
npm --version
```

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Set Up the Backend

Open a terminal in the project root directory.

Create a Python virtual environment:

**Windows:**

```bash
python -m venv .venv
```

Activate the environment:

```bash
.venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

If your backend requirements file is located elsewhere, use its actual path.

### 3. Set Up the Frontend

Open a terminal in the project root:

```bash
cd frontend
npm install
```

After installation, return to the project root directory:

```bash
cd ..
```

### 4. Run UDYOGA Using the Batch File

UDYOGA includes a Windows batch file that launches both the backend and frontend development servers together.

After completing the initial setup:

1. Open the UDYOGA project root folder.
2. Locate the application launch batch file.
3. Double-click the batch file to start the application.

Alternatively, run it from Command Prompt.

For example, if the batch file is named `run_udyoga.bat`:

```bash
run_udyoga.bat
```

The batch file starts the configured backend and frontend services.

Once both services are running, open the frontend URL displayed in the terminal. The default Vite development URL is commonly:

```text
http://localhost:5173
```

The backend API runs on the port configured in the project.

**Recommended:** Use the batch file to launch UDYOGA during development. It provides a convenient way to start both services without opening separate terminals and running each command manually.

Keep the terminal windows open while using the application. Closing the server windows may stop the application.

---

## Testing

UDYOGA should be tested through both automated tests and real browser workflows.

### Backend Tests

If the backend uses pytest:

```bash
pytest
```

### Frontend Checks

From the frontend directory:

```bash
npm run typecheck
npm run build
```

Use the scripts defined in your project's `package.json` if the command names differ.

### End-to-End Testing

Important workflows to test include:

- Borrower login and authentication
- Lender login and authentication
- Admin access
- Business profile creation
- Financial data upload
- Transaction persistence
- Financial analysis
- Specialist agent execution
- Financial stress simulation
- Lender dashboard review
- Credit assessment memorandum generation
- Role-based access control

Passing unit tests alone does not guarantee that the complete application workflow works correctly in the browser.

---

## Responsible AI & Data Protection

UDYOGA is designed with responsible financial intelligence in mind.

Our approach emphasizes:

- Explainable assessment outcomes
- Evidence provenance and confidence
- Separation of financial risk from missing evidence
- Human review for uncertain or sensitive decisions
- Role-based access control
- Purpose-aware handling of financial information
- Privacy-by-design principles

Uploaded financial documents may contain personal data. The platform should handle such information with appropriate consent, access restrictions, security, and retention practices in accordance with applicable data protection requirements, including India's Digital Personal Data Protection framework.

UDYOGA is a credit assessment and decision-support platform. Its outputs should be reviewed by authorized lending professionals and should not be treated as a guarantee of loan approval or repayment.

---

## Project Structure

The following is a representative project structure. The actual repository may contain additional modules.

```text
UDYOGA/
├── backend/
│   ├── agents/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/
├── README.md
└── .gitignore
```

---

## Project Vision

UDYOGA aims to make financial intelligence more accessible to India's underserved MSMEs.

By combining cash-flow analysis, financial resilience, transaction intelligence, explainable AI, and responsible underwriting, we envision a lending ecosystem where businesses can be evaluated on their financial reality—not only on their credit history.

**UDYOGA — Beyond Credit. Beyond Barriers.**

---

## Disclaimer

UDYOGA is a technology prototype intended for financial intelligence and credit assessment support.

Financial insights and assessment outputs are indicative and should not be considered financial, legal, or lending advice. Final lending decisions remain the responsibility of authorized financial institutions and lending professionals.
