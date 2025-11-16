# TODO List - Documentation Structure Review

This list contains all `.md` files from the `.rules` folder that needed to be reviewed to ensure all `##` blocks follow the recommended structure: `## [Specific Title]()`.

## Files Reviewed ✅

All files have been successfully updated to follow the standardized format!

- [x] `.rules/how-to-create-api-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/typescript-patterns-standards.md` - ✅ Structure reviewed and updated
- [x] `.rules/backend-technology-stack.md` - ✅ Structure reviewed and updated
- [x] `.rules/frontend-technology-stack.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-create-use-case-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-authentication-works.md` - ✅ Structure reviewed and updated
- [x] `.rules/agent-review-pipeline.md` - ✅ Structure reviewed and updated
- [x] `.rules/backend-module-folder-structure.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-create-migration-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-create-typeorm-entity-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-document-swagger-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-use-data-validation-api-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-test-use-cases-jest-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-version-api-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-handle-dates-backend-frontend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-setup-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-main-file-works-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/scalable-implementation-pattern-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/migration-commands-packagejson-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-api-key-authentication-works.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-integrate-external-api-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-use-rabbitmq-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-use-redis-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-use-scheduler-bull-redis-backend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-consume-api-frontend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-create-common-components-frontend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-routing-works-frontend.md` - ✅ Structure reviewed and updated
- [x] `.rules/how-to-setup-frontend.md` - ✅ Structure reviewed and updated
- [x] `.rules/react-component-naming-pattern-frontend.md` - ✅ Structure reviewed and updated

**Note:** `.rules/SUMMARY.md` was excluded from updates as it serves as an index file.

## Standardized Format Applied

**Required format:** `## [Specific Title]()`

**Correct examples:**
- ✅ `## [Lean Use-Case Structure]()`
- ✅ `## [Step 1: Define Use-Case Interfaces]()`
- ✅ `## [Example: Calculate Balance with Use-Case]()`

**Incorrect examples:**
- ❌ `## File Structure` (missing brackets and parentheses)
- ❌ `## [Example]` (missing parentheses)
- ❌ `## Best Practices` (missing brackets and parentheses)

## Complete Format Requirements

All files now comply with:

1. **Document description**: 100-200 characters in `<document description: ...>` format
2. **Section titles**: All `##` headings use `## [Specific Contextual Title]()` format
3. **Section descriptions**: 200-400 characters in `<section description: ...>` format
4. **Required subsections** for each major section:
   - `### When to use?` (200-400 characters)
   - `### When NOT to use?` (200-400 characters)
   - `### Example` (code examples or demonstrations)
   - `### Checklist` (actionable items)
   - `### Troubleshooting` (common issues and solutions)
   - `### Best Practices` (recommendations and tips)

## Total

**29 files** reviewed and updated ✅

**Date completed:** 2025-11-16

## Next Steps

- [ ] Run `./scripts/docs/index.sh` to reindex documentation for semantic search
- [ ] Verify semantic search works correctly with updated format
- [ ] Update SUMMARY.md if needed to reflect any structural changes
