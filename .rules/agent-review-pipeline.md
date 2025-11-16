# [How the Agent Review Pipeline Works]()

> Complete guide to the two-stage review pipeline used in SDD to ensure implementation completeness and code quality compliance with technical standards.

## [Overview]()

This section provides a high-level view of the two-stage review pipeline architecture, showing how developer-fullstack, feature-review and code-reviewer agents interact sequentially to validate both completeness and quality of implementations.

The SDD system uses a **two-stage review pipeline** to ensure that every implementation is complete and complies with the project's technical standards.

### Complete Flow

```
┌─────────────────────┐
│ developer-fullstack │ ← Implements the feature
│  (implementation)   │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │feature-review│ ← STAGE 1: Validates COMPLETENESS (task requirements)
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ↓             ↓
INCOMPLETE    COMPLETE
    │             │
    │             ↓
    │      ┌────────────┐
    │      │code-review │ ← STAGE 2: Validates QUALITY (technical standards)
    │      └─────┬──────┘
    │            │
    │      ┌─────┴─────┐
    │      │           │
    ↓      ↓           ↓
┌─────────────┐   APPROVED
│  RETURN TO  │       │
│  developer  │       ↓
│   TO FIX    │   ✅ DONE
└─────────────┘
```

---

## [Agents Involved]()

Detailed description of each specialized agent's role, responsibilities, tools, workflow steps and use cases within the review pipeline.

### [1. developer-fullstack]()

**Responsibility:** Implement complete features (backend + frontend).

**Location:** `.claude/agents/developer-fullstack.md`

**Tools:**
- Read, Grep, Glob, Bash, Write, Edit
- MCP Postgres (validate database)
- MCP Redis (validate cache)
- MCP Docs Search (search technical patterns)

**Workflow:**
1. Analyzes the task requirements
2. Consults project technical rules (`.rules`)
3. Implements code (backend + frontend)
4. Runs build and tests
5. Validates with curl and database/cache queries

**When to use:**
- Create new features
- Fix bugs
- Complete incomplete implementations
- Fix code review violations

---

### [2. feature-review]()

**Responsibility:** Validate if implementation is **complete** and meets **task requirements**.

**Location:** `.claude/agents/feature-review.md`

**Tools:**
- Read, Grep, Glob, Write
- MCP Postgres (validate data)
- MCP Redis (validate cache)
- MCP Docs Search (search requirements)

**Workflow:**
1. Identifies review scope (reads task file)
2. Identifies implemented files
3. Reads all implemented files
4. Consults technical rules referenced in task (`.rules`)
5. Compares requirements vs implementation
6. Validates technically (database/cache if applicable)
7. Writes report `./todo/feature-review-<context>.md`

**Verdict Criteria:**

| Verdict | Criteria |
|---------|----------|
| ✅ **COMPLETE** | 0 critical, 0-1 high, ≥ 95% completeness |
| ⚠️ **INCOMPLETE - REVIEW NEEDED** | 0 critical, 2-3 high, 80-94% completeness |
| ❌ **INCOMPLETE - MISSING CRITICAL IMPLEMENTATION** | ≥ 1 critical OR > 3 high OR < 80% completeness |

**What it validates:**
- ✅ All mentioned endpoints implemented?
- ✅ All specified validations present?
- ✅ All required fields implemented?
- ✅ Database/cache integrations working?
- ✅ Frontend components implemented?

**Difference from code-review:**
- **feature-review:** Compares code vs task requirements
- **code-review:** Compares code vs project technical standards

---

### [3. code-reviewer]()

**Responsibility:** Validate if code follows **technical rules, architecture patterns, code style and best practices** defined in `.rules`.

**Location:** `.claude/agents/code-reviewer.md`

**Tools:**
- Read, Grep, Glob, Write
- MCP Postgres (validate data structure)
- MCP Redis (validate cache usage)
- MCP Docs Search (search technical rules)

**Workflow:**
1. Identifies files to be reviewed
2. Reads all files
3. Consults technical rules, architecture patterns and best practices in `.rules`
4. Compares code vs rules
5. Validates technically (database/cache if applicable)
6. Writes report `./todo/code-review-<context>.md`

**Verdict Criteria:**

| Verdict | Criteria |
|---------|----------|
| ✅ **APPROVED** | 0 critical, ≤ 2 high |
| ⚠️ **APPROVED WITH REMARKS** | 0 critical, 3-5 high |
| ❌ **REJECTED** | ≥ 1 critical OR > 5 high |

**Severities:**

**🔴 CRITICAL:**
- API without versioning `/v1/`
- API without `userId` validation
- SQL injection
- Hardcoded secrets
- Dates without UTC
- Missing authentication on protected routes

**🟡 HIGH:**
- Missing validations in DTOs
- Incomplete Swagger
- Inadequate error handling
- N+1 queries

**🟠 MEDIUM:**
- Inconsistent naming
- Files > 300 lines
- Use of `any`
- Duplicated code

**🔵 LOW:**
- Inconsistent formatting
- Unnecessary comments
- Poorly descriptive names

---

## [Review Pipeline: Detailed Flow]()

Step-by-step breakdown of the complete review process from implementation through both stages of validation, including decision trees and feedback loops for corrections.

### [Stage 1: Feature Review (Completeness)]()

Validation phase that compares implemented code against original task requirements to ensure all specified endpoints, validations, fields and integrations are present and functional.

**When:** After developer-fullstack completes implementation.

**Process:**

1. **Scrum Master delegates** to `feature-review`
   - Informs context (e.g. "products-api")
   - Informs task file (e.g. `./todo/task-products.md`)
   - Lists created/modified files

2. **Feature-review executes** complete workflow
   - Reads original task
   - Reads implemented files
   - Compares requirements vs code
   - Validates in database/cache (if applicable)
   - Writes report

3. **Scrum Master reads** `./todo/feature-review-<context>.md`

4. **Decision based on verdict:**

   **If ❌ INCOMPLETE or ⚠️ REVIEW NEEDED:**
   - Adds to TODO: `- [ ] Complete implementation - ./todo/feature-review-<context>.md`
   - Delegates IMMEDIATELY back to `developer-fullstack`
   - Developer fixes incompatibilities
   - **RETURNS to Stage 1 start** (validates completeness again)

   **If ✅ COMPLETE:**
   - Informs user that implementation is complete
   - **ADVANCES to Stage 2** (Code Review)

---

### [Stage 2: Code Review (Technical Quality)]()

Quality validation phase that compares implemented code against project technical standards, architecture patterns and best practices defined in .rules to ensure compliance and maintainability.

**When:** After feature-review approves (✅ COMPLETE).

**Process:**

1. **Scrum Master delegates** to `code-reviewer`
   - Informs context (e.g. "products-api")
   - Lists created/modified files

2. **Code-reviewer executes** complete workflow
   - Reads implemented files
   - Searches technical rules in `.rules`
   - Compares code vs rules
   - Validates in database/cache (if applicable)
   - Writes report

3. **Scrum Master reads** `./todo/code-review-<context>.md`

4. **Decision based on verdict:**

   **If ❌ REJECTED or ⚠️ APPROVED WITH REMARKS:**
   - Adds to TODO: `- [ ] Fix code review - ./todo/code-review-<context>.md`
   - Delegates IMMEDIATELY back to `developer-fullstack`
   - Developer fixes violations
   - **RETURNS to Stage 1** (needs to validate completeness after fixes)

   **If ✅ APPROVED:**
   - Marks original task as completed in TODO List
   - Informs user that code was approved
   - Proceeds with next tasks

---

## [Complete Execution Example]()

Real-world walkthrough of implementing a Products CRUD feature through multiple rounds of development and review, demonstrating how the pipeline catches incompleteness and quality issues.

### [Scenario: Implement Products CRUD]()

Practical example showing the complete lifecycle of a CRUD implementation including initial attempt, completeness validation failures, fixes, and quality review corrections.

**Task:** `./todo/task-products.md`

**Requirements:**
- Create complete REST API: GET, POST, PUT, DELETE
- Fields: name, description, price, category, stock
- Validations: name required, price > 0, stock ≥ 0
- Save to PostgreSQL
- List caching in Redis (5 min TTL)

---

### [Round 1: First Implementation]()

First development attempt showing common incompleteness issues like missing endpoints and fields, followed by feature-review rejection with detailed feedback.

**1. Developer-fullstack implements:**
- ✅ GET /v1/products
- ✅ POST /v1/products
- ❌ PUT /v1/products/:id (MISSING)
- ❌ DELETE /v1/products/:id (MISSING)
- ✅ Entity with fields: name, price
- ❌ Fields description, category, stock (MISSING)
- ✅ Validation: name required
- ❌ Price and stock validations (MISSING)

**2. Feature-review validates:**

Report: `./todo/feature-review-products-api.md`

```
Verdict: ❌ INCOMPLETE - MISSING CRITICAL IMPLEMENTATION
Completeness rate: 60%

Critical Incompatibilities:
- PUT endpoint not implemented
- DELETE endpoint not implemented
- Required fields missing: description, category, stock
- Price and stock validations missing
```

**3. Scrum Master:**
- Adds: `- [ ] Complete implementation - ./todo/feature-review-products-api.md`
- Delegates to developer-fullstack to fix

---

### [Round 2: Complete Implementation]()

Developer addresses completeness issues by implementing all missing endpoints, fields and validations, achieving full task coverage and passing feature-review.

**4. Developer-fullstack completes:**
- ✅ PUT /v1/products/:id (ADDED)
- ✅ DELETE /v1/products/:id (ADDED)
- ✅ Fields: description, category, stock (ADDED)
- ✅ Validations price > 0 and stock ≥ 0 (ADDED)

**5. Feature-review validates again:**

Report: `./todo/feature-review-products-api.md` (updated)

```
Verdict: ✅ COMPLETE
Completeness rate: 100%

All requirements implemented!
```

**6. Scrum Master:**
- Informs user: "Implementation complete!"
- **Advances to Code Review**

---

### [Round 3: Code Review (First Review)]()

First code-review attempt identifies quality violations like missing userId validation, incomplete Swagger documentation and cache invalidation issues.

**7. Code-reviewer validates:**

Report: `./todo/code-review-products-api.md`

```
Verdict: ⚠️ APPROVED WITH REMARKS
Critical violations: 0
High violations: 3

High Violations:
- API without userId validation on protected endpoints
- Missing Swagger documentation
- Cache without invalidation on create/update/delete
```

**8. Scrum Master:**
- Adds: `- [ ] Fix code review - ./todo/code-review-products-api.md`
- Delegates to developer-fullstack to fix
- **RETURNS to Stage 1** (feature-review)

---

### [Round 4: Quality Fixes]()

Final round where developer implements all quality improvements, passing both feature-review validation and code-review approval to complete the task successfully.

**9. Developer-fullstack fixes:**
- ✅ Adds userId validation on all endpoints
- ✅ Adds complete Swagger documentation
- ✅ Implements cache invalidation

**10. Feature-review validates:**
- Verdict: ✅ COMPLETE (nothing changed in requirements)

**11. Code-review validates again:**

Report: `./todo/code-review-products-api.md` (updated)

```
Verdict: ✅ APPROVED
Violations: 0 critical, 0 high

Code complies with technical standards!
```

**12. Scrum Master:**
- Marks task as completed: `- [x] Implement products CRUD - ./todo/task-products.md`
- Informs user: "Task completed! Feature Review: ✅ | Code Review: ✅"
- Proceeds to next task

---

## [Best Practices]()

Essential guidelines and recommendations for each role in the pipeline to maximize effectiveness and maintain code quality standards throughout the development process.

### [For Scrum Master (/execute command)]()

Guidelines for orchestrating the review pipeline, delegating tasks correctly, managing feedback loops and maintaining TODO list accuracy.

1. **Always follow the complete pipeline:**
   - developer → feature-review → code-review

2. **Never skip stages:**
   - Even if it's "just a small fix", validate completeness and quality

3. **Correction loop:**
   - If feature-review rejects: return to developer → feature-review again
   - If code-review rejects: return to developer → feature-review → code-review

4. **Keep TODO updated:**
   - Add correction tasks
   - Mark as completed ONLY after both reviews approve

---

### [For Developers]()

Best practices for implementing features to pass both review stages on first attempt, including thorough requirement analysis and technical rule consultation.

1. **Read the COMPLETE task before implementing**
2. **Consult `.rules` for technical rules, architecture patterns and best practices**
3. **Validate in database/cache with MCP before finishing**
4. **Run build and tests before marking as ready**

---

### [For Reviewers]()

Guidance for both feature-review and code-review agents on how to provide actionable feedback with specific examples and rule references.

**Feature Review:**
- Compare code vs task (not vs technical rules)
- Be specific: "Missing DELETE endpoint" not "Missing implementation"
- Document exactly what's missing

**Code Review:**
- Compare code vs technical rules in `.rules` (not vs task)
- Always cite the violated rule with path and line (e.g. `.rules/how-to-create-api-backend.md:145`)
- Provide correct code examples following the rules

---

## [Output Files]()

Documentation standards for review reports including location, naming conventions and context format examples to maintain consistency across all reviews.

All reports are saved in `./todo/`:

- `./todo/feature-review-<context>.md` - Completeness review
- `./todo/code-review-<context>.md` - Quality review

**Context format:** Use kebab-case, describe the functionality.

**Examples:**
- `products-api`
- `user-authentication`
- `dashboard-analytics`
- `payment-integration`

---

## [Summary]()

Quick reference table showing the complete pipeline flow with all possible outcomes and transitions between stages for rapid understanding of the process.

| Stage | Agent | Validates | Result | Next Step |
|-------|-------|-----------|--------|-----------|
| Implementation | developer-fullstack | - | Code created | → Feature Review |
| Stage 1 | feature-review | Completeness vs task | ✅ Complete | → Code Review |
| Stage 1 | feature-review | Completeness vs task | ❌ Incomplete | → Developer fixes → Stage 1 |
| Stage 2 | code-review | Quality vs rules (.rules) | ✅ Approved | → Task completed |
| Stage 2 | code-review | Quality vs rules (.rules) | ❌ Rejected | → Developer fixes → Stage 1 |

**Final Goal:** Ensure ALL delivered code is:
1. **Complete** (meets 100% of task requirements)
2. **Compliant** (follows 100% of technical rules, architecture patterns and best practices)
