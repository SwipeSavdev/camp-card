# PHASE 4: PATH DEPENDENCIES REFACTORING - STRATEGY & EXECUTION

**Status:** **IN PROGRESS**
**Total References Found:** 58 absolute paths
**Refactoring Strategy:** 3-tier approach

---

## Path References Inventory

### Tier 1: Documentation Files (18 files, 27 references)
**Action:** Replace with relative path notation or placeholder

1. **TESTING_SETUP_COMPLETE.md** (1 ref)
 - Line 133: `<PROJECT_ROOT>/`
 - Type: Documentation
 - Strategy: Replace with `<PROJECT_ROOT>`

2. **BUTTON_FIXES_TESTING_GUIDE.md** (1 ref)
 - Line 13: `cd repos/camp-card-mobile`
 - Type: Command instruction
 - Strategy: Replace with `cd repos/camp-card-mobile`

3. **PHASE_1_INVENTORY_REPORT.md** (6 refs)
 - Lines 12, 44, 79, 108, 129, 142, 170, 183
 - Type: Inventory documentation
 - Strategy: Replace all with `<PROJECT_ROOT>/repos/...`

4. **PHASE_2_COMPATIBILITY_ANALYSIS.md** (2 refs)
 - Lines 17, 360, 383
 - Type: Analysis documentation
 - Strategy: Replace with relative notation

5. **PHASE_3_EXECUTION_REPORT.md** (2 refs)
 - Lines 132, 170
 - Type: Execution report
 - Strategy: Replace with `<PROJECT_ROOT>`

6. **WEB_PORTAL_SETUP_GUIDE.md** (1 ref)
 - Line 142: `cd repos/camp-card-web`
 - Type: Setup guide
 - Strategy: Replace with relative path

7. **MOCK_DATA_DELIVERY_SUMMARY.md** (1 ref)
 - Line 47
 - Type: Delivery summary
 - Strategy: Replace with relative path

8. **QUICK_START.md** (1 ref)
 - Line 30
 - Type: Quick start guide
 - Strategy: Replace with relative path

9. **WALLET_UI_FINALIZATION_COMPLETE.md** (1 ref)
 - Line 238
 - Type: Feature completion
 - Strategy: Replace with relative path

10. **PROJECT_COMPLETION_CHECKLIST.md** (1 ref)
 - Line 163
 - Type: Checklist
 - Strategy: Replace with relative path

11. **MOBILE_APP_GUIDE.md** (1 ref)
 - Line 182
 - Type: App guide
 - Strategy: Replace with relative path

12. **WALLET_DELIVERY_SUMMARY.md** (1 ref)
 - Line 394
 - Type: Delivery summary
 - Strategy: Replace with relative path

13. **SPRINT_1_1_COMPLETE.md** (1 ref)
 - Line 319
 - Type: Sprint summary
 - Strategy: Replace with relative path

14. **README_WALLET_UPDATE.md** (1 ref)
 - Line 112
 - Type: README
 - Strategy: Replace with relative path

15. **WALLET_QUICK_TEST_GUIDE.md** (1 ref)
 - Line 12
 - Type: Test guide
 - Strategy: Replace with relative path

16. **DEVELOPMENT_QUICK_START.md** (1 ref)
 - Line 24
 - Type: Development guide
 - Strategy: Replace with relative path

17. **DEPLOYMENT_TESTING_GUIDE.md** (3 refs)
 - Lines 8, 75, 152
 - Type: Testing guide
 - Strategy: Replace with relative paths

18. **DELIVERY_COMPLETE.md** (1 ref)
 - Line 150
 - Type: Delivery report
 - Strategy: Replace with relative path

19. **FINAL_PROJECT_STATUS.md** (1 ref)
 - Line 292
 - Type: Project status
 - Strategy: Replace with relative path

20. **BUILD_FIXES_SUMMARY.md** (1 ref)
 - Line 157
 - Type: Build summary
 - Strategy: Replace with relative path

21. **MANUAL_TESTING_GUIDE.md** (1 ref)
 - Line 13
 - Type: Testing guide
 - Strategy: Replace with relative path

22. **QUICK_ACCESS_DATA.md** (1 ref)
 - Line 213
 - Type: Quick reference
 - Strategy: Replace with relative path

23. **BUILD_COMPLETE.md** (1 ref)
 - Line 146
 - Type: Build report
 - Strategy: Replace with relative path

---

### Tier 2: Sub-repository Documentation (7 files, 7 references)

1. **repos/camp-card-docs/SETUP.md** (1 ref)
 - Line 58: `cd /Users/macbookpro/Documents/camp-card-mobile-app-v2`
 - Type: Setup guide (in sub-repo)
 - Strategy: Replace with relative `cd ../..`

2. **repos/camp-card-backend/docs/SETUP.md** (1 ref)
 - Line 58
 - Type: Setup guide (in sub-repo)
 - Strategy: Replace with relative `cd ../..`

3. **repos/camp-card-web/DEMO_QUICK_START.md** (1 ref)
 - Line 257
 - Type: Demo guide (in sub-repo)
 - Strategy: Replace with relative `cd ../..`

4. **repos/camp-card-web/MOCK_DATA_SETUP.md** (1 ref)
 - Line 346
 - Type: Setup guide (in sub-repo)
 - Strategy: Replace with relative `cd ../..`

5. **repos/camp-card-web/docs/SETUP.md** (1 ref)
 - Line 58
 - Type: Setup guide (in sub-repo)
 - Strategy: Replace with relative `cd ../..`

6. **repos/camp-card-mobile/LIVE_MVP_GUIDE.md** (2 refs)
 - Lines 4, 72
 - Type: Guide (in sub-repo)
 - Strategy: Replace with relative paths

---

### Tier 3: Build Artifacts & Logs (4 entries, 24 references)

1. **logs/campcard.log** (8 duplicate entries)
 - Generated log file (automated, non-editable)
 - Strategy: Monitor only, regenerate on next build
 - Impact: NO ACTION - these are runtime artifacts

---

## Refactoring Strategy

### Phase 4a: Documentation Refactoring (Root Level)

**Objective:** Replace absolute paths with standardized placeholders

**Standard Replacements:**
- Pattern: `/Users/macbookpro/Documents/camp-card-mobile-app-v2`
- Replacement: `<PROJECT_ROOT>`
- Usage in docs: "Navigate to `<PROJECT_ROOT>/repos/camp-card-mobile`"

**Command Instructions Replacement:**
- Pattern: `cd repos/camp-card-X`
- Replacement: `cd repos/camp-card-X` (assuming execution from project root)

### Phase 4b: Sub-Repository Documentation Refactoring

**Objective:** Use relative paths for navigation between repos

**Standard Replacements:**
- From `repos/camp-card-mobile/`: Use `cd ../../` to project root
- From `repos/camp-card-web/`: Use `cd ../../` to project root
- From `repos/camp-card-backend/`: Use `cd ../../` to project root

### Phase 4c: Build Configuration Updates (Future)

**Note:** Not in scope for Phase 4a-4b (documentation focus)
- Docker `WORKDIR` statements
- CI/CD pipeline path configurations
- Environment variable defaults
- These will be addressed in Phase 4c (build config)

---

## Implementation Plan

### Step 1: Backup & Prepare
- Create snapshot of all documentation
- List all 58 file-line locations

### Step 2: Root-Level Documentation (23 files)
- Replace `/Users/macbookpro/Documents/camp-card-mobile-app-v2` with `<PROJECT_ROOT>`
- Replace `cd repos/` with `cd repos/`

### Step 3: Sub-Repository Documentation (7 files)
- Update paths to use relative `../..` notation
- Ensure commands work from repo's local directory

### Step 4: Verify & Validate
- Scan for any remaining absolute paths
- Test path instructions in actual environment
- Verify all navigation commands work

---

## Files to Modify

### Category: Root Documentation (23 files)

Files requiring absolute path replacement:
1. TESTING_SETUP_COMPLETE.md
2. BUTTON_FIXES_TESTING_GUIDE.md
3. PHASE_1_INVENTORY_REPORT.md
4. PHASE_2_COMPATIBILITY_ANALYSIS.md
5. PHASE_3_EXECUTION_REPORT.md
6. WEB_PORTAL_SETUP_GUIDE.md
7. MOCK_DATA_DELIVERY_SUMMARY.md
8. QUICK_START.md
9. WALLET_UI_FINALIZATION_COMPLETE.md
10. PROJECT_COMPLETION_CHECKLIST.md
11. MOBILE_APP_GUIDE.md
12. WALLET_DELIVERY_SUMMARY.md
13. SPRINT_1_1_COMPLETE.md
14. README_WALLET_UPDATE.md
15. WALLET_QUICK_TEST_GUIDE.md
16. DEVELOPMENT_QUICK_START.md
17. DEPLOYMENT_TESTING_GUIDE.md
18. DELIVERY_COMPLETE.md
19. FINAL_PROJECT_STATUS.md
20. BUILD_FIXES_SUMMARY.md
21. MANUAL_TESTING_GUIDE.md
22. QUICK_ACCESS_DATA.md
23. BUILD_COMPLETE.md

### Category: Sub-Repository Documentation (7 files)

Files requiring relative path update:
1. repos/camp-card-docs/SETUP.md
2. repos/camp-card-backend/docs/SETUP.md
3. repos/camp-card-web/DEMO_QUICK_START.md
4. repos/camp-card-web/MOCK_DATA_SETUP.md
5. repos/camp-card-web/docs/SETUP.md
6. repos/camp-card-mobile/LIVE_MVP_GUIDE.md

### Category: Build Artifacts (Non-editable)

Files NOT modified (auto-generated):
- logs/campcard.log (Java Spring Boot startup logs)

---

## Success Criteria

 All 58 absolute path references identified
 Categorized into 3 refactoring tiers
 Strategy defined for each tier
 Zero remaining `/Users/macbookpro/Documents` paths
 All relative paths verified to work
 Build reproducibility improved
 New developers can follow guides from any machine

---

## Notes

- **Log Files:** The 24 references in `logs/campcard.log` are Java runtime logs generated during Spring Boot startup. These will be regenerated naturally on next backend run and are not manually edited.
- **Environment Isolation:** Using `<PROJECT_ROOT>` placeholder in documentation allows guides to be shared across different development machines.
- **Build Reproducibility:** Relative paths in setup guides ensure any developer can clone repo and follow setup instructions without modification.

---

**Next Action:** Execute Phase 4a - Root Documentation Refactoring (23 files)
