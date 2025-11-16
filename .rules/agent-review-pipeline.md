# [How the Agent Review Pipeline Works]()

> Complete guide to the two-stage review pipeline used in SDD to ensure implementation completeness and code quality compliance with technical standards.

## [Overview]()

This section provides a high-level view of the two-stage review pipeline architecture, showing how developer-fullstack, feature-review and code-reviewer agents interact sequentially to validate both completeness and quality of implementations.

### When to use?
Apply this review pipeline for all feature implementations, bug fixes, and code changes before marking tasks as complete. Use Stage 1 (feature-review) to validate completeness against requirements, then Stage 2 (code-review) to validate quality against technical standards.

### When NOT to use?
Skip the formal review pipeline only for trivial documentation updates, configuration changes, or emergency hotfixes that require immediate deployment. However, these should still undergo review asynchronously after deployment.

### Example
See the Complete Flow diagram above showing the sequential progression from developer-fullstack through feature-review and code-review stages with feedback loops for corrections.

### Checklist
- [ ] All implementations go through Stage 1 (feature-review) first
- [ ] Only complete implementations proceed to Stage 2 (code-review)
- [ ] Incomplete or rejected implementations return to developer
- [ ] Both reviews must approve before marking task complete
- [ ] Review reports saved in ./todo/ folder with proper naming

### Troubleshooting
**Problem:** Unclear which stage to start at for bug fixes.
**Solution:** Always start at developer-fullstack, then proceed to Stage 1 (feature-review).

**Problem:** Code-review rejected but feature-review was complete.
**Solution:** Return to developer to fix violations, then restart at Stage 1 to ensure fixes maintain completeness.

### Best Practices
- Never skip stages - both completeness and quality validation are essential
- Keep review reports for audit trail and learning purposes
- Document context clearly when delegating to reviewers
- Use consistent naming for review reports (e.g., feature-review-products-api.md)
- Ensure developers read and understand review feedback before fixing

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

### When to use?
Reference this section when delegating tasks to understand which agent handles which responsibility. Use developer-fullstack for implementation, feature-review for completeness validation, and code-reviewer for quality validation.

### When NOT to use?
Don't consult this section for understanding the review flow itself - use the Overview and Review Pipeline sections instead. This section is purely for understanding individual agent capabilities and responsibilities.

### Example
See subsections below for detailed specifications of developer-fullstack, feature-review, and code-reviewer agents including their tools, workflows, and verdict criteria.

### Checklist
- [ ] Correct agent selected based on task type
- [ ] Agent has access to required tools (MCP, file operations)
- [ ] Agent location (.claude/agents/) known for reference
- [ ] Agent workflow understood before delegation
- [ ] Expected outputs and verdict criteria clear

### Troubleshooting
**Problem:** Agent doesn't have necessary tools for validation.
**Solution:** Check agent specification - may need to use different agent or manual validation.

**Problem:** Unclear which agent should handle a specific task.
**Solution:** developer-fullstack for coding, feature-review for completeness, code-reviewer for quality.

### Best Practices
- Always specify context and files when delegating to agents
- Provide task file path to feature-review for requirement comparison
- List all modified files clearly for both review agents
- Reference agent documentation files when in doubt about capabilities
- Ensure agents have completed their workflow before reading reports

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

### When to use?
Follow this detailed flow for every feature implementation to ensure systematic progression through both validation stages. Use as a checklist when orchestrating reviews as Scrum Master to ensure no steps are skipped.

### When NOT to use?
Don't follow this flow for understanding individual agent responsibilities - use the Agents Involved section instead. This flow is specifically for understanding the complete end-to-end review process.

### Example
See subsections below for Stage 1 (Feature Review) and Stage 2 (Code Review) detailed processes including delegation steps, validation criteria, and decision trees.

### Checklist
- [ ] Stage 1 completed before proceeding to Stage 2
- [ ] Feature-review report read and verdict identified
- [ ] Incomplete implementations return to developer
- [ ] Code-review only runs after feature-review approval
- [ ] Rejected code returns to developer then restarts at Stage 1
- [ ] Tasks marked complete only after both stages approve

### Troubleshooting
**Problem:** Code-review found issues, unsure whether to restart at Stage 1.
**Solution:** Always restart at Stage 1 (feature-review) after developer fixes to ensure completeness maintained.

**Problem:** Feature-review approved but developer made additional changes.
**Solution:** Restart at Stage 1 to validate new changes haven't broken completeness.

### Best Practices
- Always read review reports before making decisions
- Document context and files clearly when delegating
- Add TODO items for incomplete or rejected implementations
- Mark original task complete only after both reviews approve
- Keep review reports for historical record and learning
- Inform user of progress after each stage completion

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

### When to use?
Reference this example when learning the review pipeline flow or when unclear about how to handle specific scenarios like incomplete implementations or code quality violations. Use as a training reference for new team members.

### When NOT to use?
Don't use this example as a template for actual tasks - it's illustrative only. Each real implementation will have different requirements and issues. Use the Review Pipeline section for actual workflow guidance.

### Example
See subsections below for Round 1 (incomplete implementation), Round 2 (complete but with quality issues), Round 3 (quality violations identified), and Round 4 (final approval) of a Products CRUD implementation.

### Checklist
- [ ] Example demonstrates complete flow through both review stages
- [ ] Shows handling of incomplete implementation (Stage 1 rejection)
- [ ] Shows handling of quality violations (Stage 2 rejection)
- [ ] Demonstrates feedback loop back to developer
- [ ] Shows successful completion after all fixes

### Troubleshooting
**Problem:** Real implementation doesn't match example flow exactly.
**Solution:** This is normal - use the example for understanding patterns, not as exact template.

**Problem:** Unsure how many rounds of review are normal.
**Solution:** Varies by complexity - aim for completeness and quality on first attempt through thorough preparation.

### Best Practices
- Study this example to understand the review pipeline mechanics
- Note how each review provides specific, actionable feedback
- Observe how fixes can require restarting at Stage 1
- Use this as reference for writing clear review reports
- Learn from the progression: preparation reduces review rounds

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

### When to use?
Consult this section before starting any role in the pipeline (Scrum Master, Developer, or Reviewer) to ensure you follow established best practices and avoid common mistakes.

### When NOT to use?
Don't use this section for learning the review pipeline flow - use the Review Pipeline section instead. This section provides optimization tips, not core workflow instructions.

### Example
See subsections below for specific best practices for Scrum Master, Developers, and Reviewers with actionable guidelines for each role.

### Checklist
- [ ] Role-specific best practices understood before starting work
- [ ] Scrum Master follows complete pipeline without skipping stages
- [ ] Developers read complete task and consult .rules before implementing
- [ ] Reviewers provide specific, actionable feedback with examples
- [ ] All roles maintain clear communication and documentation

### Troubleshooting
**Problem:** Reviews keep finding same types of issues repeatedly.
**Solution:** Developers should study .rules more thoroughly before implementation and learn from past review feedback.

**Problem:** Review feedback is vague and difficult to action.
**Solution:** Reviewers must cite specific rules, provide code examples, and be explicit about what needs to change.

### Best Practices
- Always consult role-specific guidelines before starting work
- Learn from past reviews to improve future implementations
- Maintain clear communication throughout the pipeline
- Document decisions and rationale in review reports
- Continuously update and refine best practices based on experience

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

### When to use?
Reference this section when saving review reports to ensure consistent naming and location. Use the context format guidelines when delegating to reviewers to specify report names.

### When NOT to use?
Don't use this section for understanding review content requirements - focus on agent-specific documentation for that. This section is purely about file naming and organization.

### Example
See examples below showing proper context format like "products-api", "user-authentication", "dashboard-analytics" using kebab-case to describe functionality.

### Checklist
- [ ] Review reports saved in ./todo/ directory
- [ ] Filenames follow pattern: feature-review-<context>.md or code-review-<context>.md
- [ ] Context uses kebab-case format
- [ ] Context clearly describes the functionality being reviewed
- [ ] Reports retained for audit trail and learning

### Troubleshooting
**Problem:** Difficulty finding review reports for specific features.
**Solution:** Use descriptive context names that clearly identify the feature (e.g., "payment-integration" not "task-123").

**Problem:** Review report naming inconsistent across team.
**Solution:** Always use kebab-case and follow the pattern: [review-type]-[context].md

### Best Practices
- Use descriptive context names that identify the feature, not task numbers
- Keep context concise but clear (2-4 words maximum)
- Maintain consistent kebab-case formatting
- Save all reports in ./todo/ for centralized access
- Don't delete reports - they serve as audit trail and learning resource
- Reference past reports when implementing similar features

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

### When to use?
Use this summary table as a quick reference when making decisions about next steps during the review pipeline. Consult when unsure which stage to proceed to based on review results.

### When NOT to use?
Don't use this summary for learning the detailed review process - read the complete sections above first. This is a reference tool for those already familiar with the pipeline.

### Example
See table below mapping each stage, agent, validation type, possible results, and corresponding next steps for the complete review pipeline flow.

### Checklist
- [ ] Current stage identified in table
- [ ] Review result/verdict determined
- [ ] Next step clearly identified from table
- [ ] Transition logic understood (when to loop back vs advance)
- [ ] Final goal: both completeness and compliance achieved

### Troubleshooting
**Problem:** Table shows multiple possible next steps for current situation.
**Solution:** Check the Result column carefully - next step depends on specific verdict (Complete/Incomplete, Approved/Rejected).

**Problem:** Unsure whether to loop back to Stage 1 or continue to Stage 2.
**Solution:** Only advance to Stage 2 if feature-review verdict is "Complete" (✅). All other cases return to developer.

### Best Practices
- Bookmark this summary for quick reference during reviews
- Ensure you understand the detailed sections before relying on summary
- Always verify verdict from actual review report, not assumptions
- Remember the final goal: both reviews must approve
- Use the summary to explain pipeline flow to stakeholders

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
