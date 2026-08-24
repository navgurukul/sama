# Laptop Stage Workflow Redesign Plan

## 1. Goal
Build a stage-driven operations product where each laptop:
- Moves through predefined stages in strict order.
- Can only move forward after passing rules and checklist gates.
- Stores all run history, failures, and evidence.
- Shows current stage clearly in list view and detail pages.

This follows the requirements from:
- `ops_db_schema_report.docx`
- `Anshul - Questions.docx`

## 2. Canonical Stage Model
Use these stages as canonical values for `laptop_labeling.status`:
1. `RECEIVED`
2. `REFURBISHMENT_STARTED`
3. `REFURBISHMENT_COMPLETE`
4. `QC_APPROVED`
5. `QC_FAILED`
6. `DISPATCHED`
7. `UNDER_REPAIR`
8. `RETIRED`

`working` remains historical data only and is not used for stage progression.

## 3. Product Information Architecture (Frontend)

### A) Laptop Pipeline Board (new primary page)
Purpose: operational visibility.
- Group laptops by current stage.
- Show counts per stage, SLA breach count, blocked count.
- Filters: donor, NGO, stage, blocker status, date range.
- Clicking a laptop opens the detail page.

### B) Laptop Detail + Stage Timeline (new page)
Purpose: single source of truth for one laptop.
Sections:
- Header: serial, donor, current stage badge, SLA timer.
- Timeline: all stage runs (`run_number`, actor, verifier, outcome, timestamps).
- Active run card: current stage actions (checklist + gate evaluation).
- Failure history: prior gate failures and issue logs.

### C) Stage Run Workspace (modal or routed screen)
Purpose: execute one stage run end-to-end.
Flow:
1. Start run
2. Fill checklist responses
3. Evaluate gates
4. Complete run (if all blocking gates pass)

Must display:
- Mandatory items
- Blocking gate failures
- Evidence links
- Auto checks vs human checks

### D) Exceptions & Rework Queue (new page)
Purpose: monitor failures.
- Laptops in `QC_FAILED` or `UNDER_REPAIR`
- Failed rule, failure note, failed stage, last action by
- Quick action: create next run / reopen stage

### E) Audit & Logs (new page)
Purpose: traceability.
- Combined feed from stage runs, checklist responses, gate evaluations, status changes.
- Filter by laptop, stage, actor, date, outcome.

## 4. Backend Contract Alignment

### Existing endpoints already available
- `getStageTemplate`
- `getStageMap`
- `getLaptopStageRuns`
- `getStageRunResponses`
- `startStageRun`
- `submitChecklistResponses`
- `evaluateStageRun`
- `completeStageRun`

### API behavior rules
- Frontend must never set next stage directly.
- Frontend only calls `completeStageRun`; backend determines pass/fail and updates status.
- `stageId` is primary key in requests; `stageCode` is display/compatibility.

### Suggested next backend additions
1. `getLaptopStageSnapshot` (single call for detail page)
- Returns laptop + current run + pending gates + latest failures.

2. `getStageRunHistory` (paginated)
- For logs page and timeline.

3. `getFailedGateQueue`
- For exceptions dashboard.

4. `createIssueLog` / `resolveIssueLog`
- For resolution lifecycle.

## 5. UI Rules for Stage Progression
1. Only one active run per laptop per stage at a time.
2. `Complete Stage` is disabled until required checklist responses exist.
3. Gate evaluation result must be visible before completion.
4. If gate fails:
- Show failed rules inline.
- Keep stage unchanged.
- Mark run as `BLOCKED` or `FAIL`.
5. Re-run creates new `run_number`; never overwrite old run.

## 6. Redesign Phases (Recommended)

### Phase 1 (1 sprint)
- Replace current modal UX with Stage Run Workspace v1.
- Add Laptop Detail timeline page.
- Keep current table, but make status read-only stage badge + "Open Workspace".

### Phase 2 (1 sprint)
- Add Pipeline Board and Exceptions Queue.
- Add gate failure drill-down.

### Phase 3 (1 sprint)
- Add full Logs/Audit page + saved filters.
- Add SLA indicators and escalations.

## 7. Minimal Components to Build First
1. `StageBadge`
2. `LaptopStageTimeline`
3. `StageChecklistForm`
4. `GateEvaluationPanel`
5. `StageActionFooter`
6. `FailureReasonDrawer`

## 8. Data Mapping for Display
- Current stage: `laptop_labeling.status`
- Stage metadata: `stage_definition`
- Run history: `laptop_stage_run`
- Checklist definitions: `checklist_section`, `checklist_item`
- Checklist submissions: `checklist_response`
- Gate rules + outcomes: `stage_gate_rule`, `stage_gate_evaluation`

## 9. Acceptance Criteria
1. User can identify current stage for any laptop in under 2 clicks.
2. User cannot move to next stage without passing blocking gates.
3. Every fail has traceable reason (rule + item + actor + timestamp).
4. Re-runs are visible and ordered by `run_number`.
5. No direct/manual status jumps in frontend code.

## 10. Immediate Next Build Task
Implement **Laptop Detail + Stage Timeline page** first.
Reason:
- It becomes the foundation where checklist workspace, failures, and logs can plug in.
- It removes dependence on table-only editing and makes stage journey visible per laptop.
