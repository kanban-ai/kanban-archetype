---
description: Maintain technical rules files in the ./.rules folder following standardized format and semantic search practices
tags: [documentation, rules, maintenance]
---

# Technical Rules Maintenance

This command manages the creation and maintenance of technical rules documentation in the `./.rules` folder, ensuring consistency, semantic indexing compatibility, and avoiding duplication.

---

## [File Naming Convention]()

All rule files must follow a question-based naming pattern to improve discoverability and semantic clarity.

**Format:** Use natural questions in lowercase with hyphens (kebab-case).

**Examples:**
- ✅ `how-to-create-use-case.md`
- ✅ `what-typescript-patterns-to-follow.md`
- ✅ `how-to-create-migration-backend.md`
- ❌ `usecase.md` (not descriptive)
- ❌ `TypeScript_Patterns.md` (wrong case)

**Why questions?** Question-based filenames align with how developers search for information and improve semantic indexing.

---

## [File Format Standard]()

All rule files MUST follow this standardized structure for proper semantic chunking and indexing.

### Required Structure

```markdown
# Document Title

<document description: 100-200 characters explaining the purpose>

## [Specific Subtitle 1]()

<section description: 200-400 characters explaining this specific topic>

### When to use?
<description: 200-400 characters>

### When NOT to use?
<description: 200-400 characters>

### Example
<code example or practical demonstration>

### Checklist
- [ ] Item 1
- [ ] Item 2

### Troubleshooting
Common issues and solutions

### Best Practices
Recommendations and tips
```

### Subtitle Format Rules

**MANDATORY:** All level-2 headings (`##`) MUST follow the pattern `## [Specific Title]()`

**Correct examples:**
- ✅ `## [Lean Use-Case Structure]()`
- ✅ `## [Advantages of Multiple Small Files]()`
- ✅ `## [Example: Calculate Balance with Use-Case]()`
- ✅ `## [Step 1: Define Use-Case Interfaces]()`

**Incorrect examples:**
- ❌ `## File Structure` (missing brackets and parentheses)
- ❌ `## [Example]` (missing parentheses)
- ❌ `## Best Practices` (missing brackets and parentheses)
- ❌ `## [Best Practices]()` (correct format but too generic - be more specific)

### Why This Format?

1. **Semantic Indexing:** The `./scripts/docs` indexing script uses regex to detect `## [text]()` blocks
2. **Chunk Size:** Each `##` section becomes a separate embedding chunk for semantic search
3. **Error Prevention:** Subtitles without this pattern cause "chunk too large" errors
4. **Search Quality:** Specific titles improve semantic search accuracy

---

## [Semantic Search Before Editing]()

ALWAYS use the MCP tool `search_project_docs` before adding or modifying rules to prevent duplication and maintain consistency.

### When to Search

1. **Before creating new files:** Check if similar content exists
2. **Before adding sections:** Verify the topic isn't already covered
3. **When updating content:** Find related documentation that may need updates
4. **When answering questions:** Locate the exact file and line number

### Search Query Examples

**Good queries (semantic):**
- "controller creation rules"
- "folder structure patterns"
- "naming conventions"
- "validation best practices"
- "how to create API endpoints"

**Poor queries (too broad):**
- "backend"
- "rules"
- "documentation"

### Search Workflow

```javascript
// 1. Search for existing content
mcp__docs-search__search_project_docs({
  query: "use-case validation patterns",
  limit: 5
})

// 2. Review results to avoid duplication

// 3. If content exists: update existing file
// 4. If content doesn't exist: create new file following format
```

---

## [File Encoding Requirements]()

All documentation files MUST use UTF-8 encoding to ensure compatibility and prevent character rendering issues.

**Requirements:**
- ✅ UTF-8 encoding without BOM
- ✅ LF line endings (Unix-style)
- ❌ NO UTF-16 or other encodings
- ❌ NO CRLF line endings (Windows-style)

---

## [SUMARIO.md Maintenance]()

The `SUMARIO.md` file is the central index and MUST be updated whenever rules are added, modified, or removed.

### Update Requirements

**Add new file:**
1. Add entry in appropriate category
2. List main sections with line references
3. Update statistics (total documents, total sections)
4. Update "last updated" date

**Modify existing file:**
1. Update section list if structure changed
2. Update section count if sections added/removed
3. Update "last updated" date

**Remove file:**
1. Remove entry from category
2. Update statistics
3. Update "last updated" date

### SUMARIO.md Structure

```markdown
## [Category Name]()

### [File Name - `./filename.md`]()

- **Section 1** - Brief description (lines X-Y)
- **Section 2** - Brief description (lines A-B)
- **Key Topics** - Comma-separated list

## [📊 Statistics]()

- **Total documents**: X
- **Category 1**: Y documents (Z sections)
- **Category 2**: A documents (B sections)
- **Total sections**: N sections documented
```

---

## [Avoiding Duplication]()

Never add content that already exists in another `./.rules` file. Always verify first using semantic search.

### Duplication Check Process

1. **Search semantically:**
   ```javascript
   mcp__docs-search__search_project_docs({
     query: "topic you want to add",
     limit: 10
   })
   ```

2. **Review results:** Check if content already exists

3. **Decision:**
   - If exists: Update existing file or add cross-reference
   - If doesn't exist: Create new file following format

4. **Cross-references:** When topics overlap, add links between files
   ```markdown
   See also: [Related Topic](./related-file.md#section)
   ```

---

## [Response Format for Questions]()

When users ask questions about rules, respond with specific file paths and line numbers.

### Response Template

```
The information about [topic] is documented in:

**File:** `.rules/filename.md`
**Section:** [Section Name]() (lines X-Y)
**Summary:** Brief answer to the question

[Quote relevant content if needed]
```

### Example Response

```
The information about use-case structure is documented in:

**File:** `.rules/how-to-create-use-case-backend.md`
**Section:** [Lean Use-Case Structure]() (lines 45-78)
**Summary:** Use-cases should be thin orchestrators that delegate business logic to services.

Key points:
- No business logic in use-cases
- Validate input using class-validator
- Delegate to services for operations
```

---

## [Checklist for Rules Maintenance]()

**Before creating/updating files:**
- [ ] Searched for existing content using `search_project_docs`
- [ ] Verified no duplication exists
- [ ] File name follows question-based pattern (kebab-case)
- [ ] File uses UTF-8 encoding
- [ ] All `##` subtitles follow `## [Specific Title]()` format
- [ ] Subtitles are specific and contextual (not generic)
- [ ] Sections have appropriate descriptions (200-400 chars)
- [ ] Code examples are included where applicable
- [ ] Cross-references added for related topics

**After creating/updating files:**
- [ ] `SUMARIO.md` updated with new/modified content
- [ ] Statistics updated in `SUMARIO.md`
- [ ] "Last updated" date changed in `SUMARIO.md`
- [ ] File indexed properly (run `./scripts/docs/index.sh` if needed)

---

## [Best Practices]()

### For Writing Rules

1. **Be specific:** Use concrete examples and real code
2. **Be concise:** 200-400 character descriptions for sections
3. **Be practical:** Include when to use AND when NOT to use
4. **Be complete:** Add checklists, examples, and troubleshooting
5. **Be semantic:** Use descriptive titles that match how developers think

### For Organizing Content

1. **One topic per file:** Don't mix unrelated topics
2. **Logical sections:** Group related information under specific subtitles
3. **Progressive detail:** Start general, then go specific
4. **Cross-reference:** Link related topics instead of duplicating

### For Maintaining Quality

1. **Regular reviews:** Check for outdated information
2. **User feedback:** Update based on common questions
3. **Consistency:** Follow the same format across all files
4. **Indexing:** Ensure semantic search works correctly

---

## [Troubleshooting]()

### "Chunk too large" errors during indexing

**Cause:** Subtitle doesn't follow `## [text]()` format

**Solution:**
1. Check all `##` headings use `## [Specific Title]()`
2. Ensure no generic headings like `## Example` without brackets
3. Verify no missing parentheses `()`

### Search returns no results for known content

**Cause:** Content not indexed or query too broad

**Solution:**
1. Run `./scripts/docs/index.sh` to reindex
2. Use more specific semantic queries
3. Check file follows format standard

### Duplicate information found

**Cause:** Didn't search before adding content

**Solution:**
1. Always use `search_project_docs` first
2. Consolidate duplicate content into one file
3. Add cross-references where needed
4. Update `SUMARIO.md` to reflect changes

### SUMARIO.md out of sync

**Cause:** Forgot to update after changes

**Solution:**
1. Review all files in `./.rules`
2. Update entries for modified files
3. Recalculate statistics
4. Update "last updated" date
