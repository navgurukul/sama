import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  completeStageRun,
  evaluateStageRun,
  fetchLaptopStageRuns,
  fetchStageRunResponses,
  fetchStageTemplate,
  startStageRun,
  submitChecklistResponses,
  uploadEvidenceFile,
} from '../../components/OPS/LaptopTable/api';

const toInt = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const StageRunModal = ({
  open,
  onClose,
  laptopId,
  currentStatus,
  onCompleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState({ stages: [], sections: [], items: [] });
  const [stageId, setStageId] = useState(null);
  const [activeRunId, setActiveRunId] = useState(null);
  const [responses, setResponses] = useState({});
  const [notes, setNotes] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [subChecks, setSubChecks] = useState({});
  const [uploadingItems, setUploadingItems] = useState({});

  const selectedStage = useMemo(
    () => (template.stages || []).find((stage) => Number(stage.stageId) === Number(stageId)) || null,
    [template.stages, stageId]
  );

  const stageItems = useMemo(() => {
    return (template.items || []).filter((item) => Number(item.stageId) === Number(stageId));
  }, [template.items, stageId]);

  const stageSections = useMemo(() => {
    return (template.sections || []).filter((section) => Number(section.stageId) === Number(stageId));
  }, [template.sections, stageId]);

  const groupedItems = useMemo(() => {
    const bySection = {};
    stageSections.forEach((section) => {
      bySection[section.sectionId] = {
        section,
        items: stageItems.filter((item) => item.sectionId === section.sectionId),
      };
    });
    return Object.values(bySection);
  }, [stageItems, stageSections]);

  const getSubChecklist = (item) => {
    if (!Array.isArray(item?.subItems)) return [];
    return item.subItems;
  };

  const isSubChecklistComplete = (itemId, subList) => {
    if (!subList || subList.length === 0) return true;
    const flags = subChecks[itemId] || [];
    return subList.every((_, index) => Boolean(flags[index]));
  };

  const isImageEvidence = (contentType, url) => {
    if (contentType && String(contentType).toLowerCase().startsWith('image/')) return true;
    if (!url) return false;
    return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|\.svg)$/i.test(String(url));
  };

  const buildEvidencePayload = (files) => {
    if (!Array.isArray(files) || files.length === 0) return '';
    return files
      .map((file) => file?.key || file?.url)
      .filter(Boolean);
  };

  const gateFailedCount = useMemo(() => {
    if (!evaluation?.gateRules) return 0;
    return evaluation.gateRules.filter((rule) => rule?.passed === false).length;
  }, [evaluation]);

  const failedGateLabels = useMemo(() => {
    if (!evaluation?.gateRules) return [];
    return evaluation.gateRules
      .filter((rule) => rule?.passed === false)
      .map((rule) => rule?.ruleName || rule?.ruleCode)
      .filter(Boolean);
  }, [evaluation]);

  const loadModalData = async () => {
    if (!open || !laptopId) return;
    setLoading(true);
    setErrorText('');
    setSuccessText('');
    setEvaluation(null);

    try {
      const [templateData, runsData] = await Promise.all([
        fetchStageTemplate(),
        fetchLaptopStageRuns(laptopId),
      ]);

      const stages = Array.isArray(templateData?.stages) ? templateData.stages : [];
      const sections = Array.isArray(templateData?.sections) ? templateData.sections : [];
      const items = Array.isArray(templateData?.items) ? templateData.items : [];
      setTemplate({ stages, sections, items });

      const stageRuns = Array.isArray(runsData) ? runsData : [];

      const currentStageCode = String(currentStatus || '').trim().toUpperCase();
      const defaultStage = stages.find((s) => String(s.stageCode || '').toUpperCase() === currentStageCode)
        || stages[0]
        || null;
      const defaultStageId = defaultStage ? toInt(defaultStage.stageId) : null;
      setStageId(defaultStageId);
      const currentRun = stageRuns.find(
        (run) => Number(run.stageId) === Number(defaultStageId) && run.outcome === 'IN_PROGRESS'
      );

      if (currentRun?.runId) {
        setActiveRunId(currentRun.runId);
        const existingResponses = await fetchStageRunResponses(currentRun.runId);
        const responseMap = {};
        const subCheckMap = {};
        const stageItemsForRun = (Array.isArray(items) ? items : [])
          .filter((item) => Number(item.stageId) === Number(defaultStageId));
        const subChecklistByItemId = new Map(
          stageItemsForRun.map((item) => [
            Number(item.itemId),
            Array.isArray(item.subItems) ? item.subItems : [],
          ])
        );
        (Array.isArray(existingResponses) ? existingResponses : []).forEach((row) => {
          const itemId = toInt(row.itemId);
          if (!itemId) return;
          responseMap[itemId] = {
            result: row.result || 'NA',
            remark: row.remark || '',
            evidenceUrl: row.evidenceUrl || '',
            evidenceKey: row.evidenceKey || '',
            evidenceContentType: row.evidenceContentType || '',
            evidenceFiles: Array.isArray(row.evidenceFiles) ? row.evidenceFiles : (row.evidenceUrl ? [{
              key: row.evidenceKey || '',
              url: row.evidenceUrl,
              contentType: row.evidenceContentType || '',
            }] : []),
          };
          const subList = subChecklistByItemId.get(itemId) || [];
          if (Array.isArray(row.subChecks) && row.subChecks.length > 0) {
            subCheckMap[itemId] = row.subChecks;
          } else if (String(row.result || '').toUpperCase() === 'PASS' && subList.length > 0) {
            subCheckMap[itemId] = subList.map(() => true);
          }
        });
        setResponses(responseMap);
        setSubChecks(subCheckMap);
        setExpandedItems({});
      } else {
        setActiveRunId(null);
        setResponses({});
        setExpandedItems({});
        setSubChecks({});
      }
    } catch (error) {
      console.error('Error loading stage modal data:', error);
      setErrorText(String(error.message || error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, laptopId]);

  const ensureActiveRun = async () => {
    if (activeRunId) return activeRunId;
    if (!laptopId || !stageId) return null;

    const saved = JSON.parse(localStorage.getItem('_AuthSama_') || '[]');
    const email = saved?.[0]?.email || 'system';
    const result = await startStageRun({
      laptopId,
      stageId,
      stageCode: selectedStage?.stageCode,
      startedBy: email,
      notes: notes || null,
    });
    const runId = result?.run?.run_id || result?.run?.runId;
    if (runId) {
      setActiveRunId(runId);
    }
    return runId || null;
  };

  const handleResponseChange = (itemId, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        result: prev[itemId]?.result || 'NA',
        remark: prev[itemId]?.remark || '',
        evidenceUrl: prev[itemId]?.evidenceUrl || '',
        evidenceKey: prev[itemId]?.evidenceKey || '',
        evidenceContentType: prev[itemId]?.evidenceContentType || '',
        evidenceFiles: prev[itemId]?.evidenceFiles || [],
        [field]: value,
      },
    }));
  };

  const handleEvidenceUpload = async (itemId, fileList) => {
    const files = Array.isArray(fileList)
      ? fileList
      : Array.from(fileList || []);
    if (!files.length) return;
    setUploadingItems((prev) => ({ ...prev, [itemId]: true }));
    setErrorText('');
    try {
      const uploads = await Promise.all(files.map((file) => uploadEvidenceFile(file)));
      setResponses((prev) => {
        const currentFiles = prev[itemId]?.evidenceFiles || [];
        const nextFiles = uploads.map((result) => ({
          key: result?.key || '',
          url: result?.url || '',
          contentType: result?.contentType || '',
        }));
        return {
          ...prev,
          [itemId]: {
            result: prev[itemId]?.result || 'NA',
            remark: prev[itemId]?.remark || '',
            evidenceUrl: nextFiles[0]?.url || prev[itemId]?.evidenceUrl || '',
            evidenceKey: nextFiles[0]?.key || prev[itemId]?.evidenceKey || '',
            evidenceContentType: nextFiles[0]?.contentType || prev[itemId]?.evidenceContentType || '',
            evidenceFiles: [...currentFiles, ...nextFiles],
          },
        };
      });
    } catch (error) {
      console.error('Error uploading evidence:', error);
      setErrorText(String(error.message || error));
    } finally {
      setUploadingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleToggleSubChecklist = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSubCheckToggle = (itemId, index, checked, subList) => {
    setSubChecks((prev) => {
      const next = { ...prev };
      const updated = Array.isArray(next[itemId]) ? [...next[itemId]] : [];
      updated[index] = checked;
      next[itemId] = updated;

      const allChecked = subList.every((_, idx) => Boolean(updated[idx]));
      if (!allChecked && String(responses[itemId]?.result || '').toUpperCase() === 'PASS') {
        setResponses((current) => ({
          ...current,
          [itemId]: {
            result: 'NA',
            remark: current[itemId]?.remark || '',
            evidenceUrl: current[itemId]?.evidenceUrl || '',
            evidenceKey: current[itemId]?.evidenceKey || '',
            evidenceContentType: current[itemId]?.evidenceContentType || '',
            evidenceFiles: current[itemId]?.evidenceFiles || [],
          },
        }));
      }

      return next;
    });
  };

  const handleSaveResponses = async () => {
    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      const runId = await ensureActiveRun();
      if (!runId) {
        setErrorText('Stage run cannot be started for this laptop.');
        return;
      }

      const payloadResponses = stageItems
        .map((item) => {
          const itemId = toInt(item.itemId);
          const sectionId = toInt(item.sectionId);
          const itemStageId = toInt(item.stageId);
          if (!itemId) return null;

          return {
            itemId,
            sectionId,
            stageId: itemStageId,
            result: responses[itemId]?.result || 'NA',
            remark: responses[itemId]?.remark || '',
            evidenceUrl: buildEvidencePayload(responses[itemId]?.evidenceFiles)
              || responses[itemId]?.evidenceKey
              || responses[itemId]?.evidenceUrl
              || '',
            subChecks: subChecks[itemId] || [],
            evidenceFiles: responses[itemId]?.evidenceFiles || [],
          };
        })
        .filter(Boolean);

      const saved = JSON.parse(localStorage.getItem('_AuthSama_') || '[]');
      const email = saved?.[0]?.email || 'system';
      await submitChecklistResponses({
        runId,
        responses: payloadResponses,
        respondedBy: email,
      });
      setSuccessText('Checklist responses saved.');
      await loadModalData();
    } catch (error) {
      console.error('Error saving responses:', error);
      setErrorText(String(error.message || error));
    } finally {
      setSaving(false);
    }
  };

  const handleRunStage = async () => {
    setSaving(true);
    setErrorText('');
    setSuccessText('');
    try {
      const runId = await ensureActiveRun();
      if (!runId) {
        setErrorText('Stage run cannot be started for this laptop.');
        return;
      }

      const payloadResponses = stageItems
        .map((item) => {
          const itemId = toInt(item.itemId);
          const sectionId = toInt(item.sectionId);
          const itemStageId = toInt(item.stageId);
          if (!itemId) return null;

          return {
            itemId,
            sectionId,
            stageId: itemStageId,
            result: responses[itemId]?.result || 'NA',
            remark: responses[itemId]?.remark || '',
            evidenceUrl: buildEvidencePayload(responses[itemId]?.evidenceFiles)
              || responses[itemId]?.evidenceKey
              || responses[itemId]?.evidenceUrl
              || '',
            subChecks: subChecks[itemId] || [],
            evidenceFiles: responses[itemId]?.evidenceFiles || [],
          };
        })
        .filter(Boolean);

      const saved = JSON.parse(localStorage.getItem('_AuthSama_') || '[]');
      const email = saved?.[0]?.email || 'system';
      await submitChecklistResponses({
        runId,
        responses: payloadResponses,
        respondedBy: email,
      });

      const evaluationResult = await evaluateStageRun(runId);
      const evalPayload = evaluationResult?.evaluation || null;
      setEvaluation(evalPayload);

      const result = await completeStageRun({
        runId,
        completedBy: email,
        verifierName: email,
        notes: notes || null,
      });
      const nextStageCode = result?.nextStageCode;
      const outcome = String(result?.outcome || '').toUpperCase();
      if (nextStageCode && outcome === 'FAIL') {
        setSuccessText(`Stage run failed gates. Laptop moved to ${nextStageCode} for rework flow.`);
      } else if (nextStageCode) {
        setSuccessText(`Stage run completed. Laptop moved to ${nextStageCode}.`);
      } else {
        setSuccessText('Stage run completed and laptop status updated.');
      }

      if (typeof onCompleted === 'function') {
        onCompleted();
      }
      await loadModalData();
    } catch (error) {
      console.error('Error running stage:', error);
      setErrorText(String(error.message || error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Stage Checklist Run</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Laptop ID: {laptopId || 'N/A'}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stage"
                  value={selectedStage ? `#${selectedStage.stageId} - ${selectedStage.stageCode}` : ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Run Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
            </Grid>

            {activeRunId && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Active Run ID: {activeRunId}
              </Typography>
            )}

            {groupedItems.map(({ section, items }) => (
              <Box key={section.sectionId} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {section.sectionName}
                </Typography>
                <Grid container spacing={2}>
                  {items.map((item) => (
                    <React.Fragment key={item.itemId}>
                      {(() => {
                        const subList = getSubChecklist(item);
                        const passLocked = subList && !isSubChecklistComplete(item.itemId, subList);
                        return (
                          <>
                      <Grid item xs={12} md={5}>
                        <Typography variant="body2">
                          {item.itemText} {item.isMandatory ? '*' : ''}
                        </Typography>
                        {subList && (
                          <Button
                            size="small"
                            onClick={() => handleToggleSubChecklist(item.itemId)}
                            sx={{ mt: 0.5, textTransform: 'none' }}
                          >
                            {expandedItems[item.itemId] ? 'Hide checklist' : 'Show checklist'}
                          </Button>
                        )}
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={responses[item.itemId]?.result || 'NA'}
                            onChange={(e) => handleResponseChange(item.itemId, 'result', e.target.value)}
                          >
                            <MenuItem value="PASS" disabled={Boolean(passLocked)}>PASS</MenuItem>
                            <MenuItem value="FAIL">FAIL</MenuItem>
                            <MenuItem value="NA">NA</MenuItem>
                          </Select>
                          {passLocked && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Complete the checklist to enable PASS.
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Remark"
                          value={responses[item.itemId]?.remark || ''}
                          onChange={(e) => handleResponseChange(item.itemId, 'remark', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            component="label"
                            disabled={Boolean(uploadingItems[item.itemId])}
                          >
                            {uploadingItems[item.itemId] ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              hidden
                              multiple
                              onChange={(event) => {
                                const nextFiles = event.target.files;
                                handleEvidenceUpload(item.itemId, nextFiles);
                                event.target.value = '';
                              }}
                            />
                          </Button>
                          {(responses[item.itemId]?.evidenceFiles || []).map((file, index) => (
                            <Button
                              key={`${item.itemId}-file-${index}`}
                              size="small"
                              variant="text"
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {isImageEvidence(file.contentType, file.url) ? 'Preview' : 'Download'}
                            </Button>
                          ))}
                        </Box>
                      </Grid>
                      {subList && (
                        <Grid item xs={12} sx={{ mt: 1 }}>
                          <Collapse in={Boolean(expandedItems[item.itemId])} timeout="auto" unmountOnExit>
                            <Box sx={{ pl: 2, pr: 1, pb: 1 }}>
                              {subList.map((text, index) => (
                                <FormControlLabel
                                  key={`${item.itemId}-${index}`}
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={Boolean(subChecks[item.itemId]?.[index])}
                                      onChange={(event) => handleSubCheckToggle(
                                        item.itemId,
                                        index,
                                        event.target.checked,
                                        subList
                                      )}
                                    />
                                  }
                                  label={text}
                                  sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          </Collapse>
                        </Grid>
                      )}
                          </>
                        );
                      })()}
                    </React.Fragment>
                  ))}
                </Grid>
              </Box>
            ))}

            {evaluation && (
              <Alert severity={evaluation.passed ? 'success' : 'warning'} sx={{ mt: 2 }}>
                Mandatory total: {evaluation.details?.mandatoryTotal || 0},
                passed: {evaluation.details?.mandatoryPassed || 0},
                failed: {evaluation.details?.mandatoryFailed || 0},
                missing: {evaluation.details?.mandatoryMissing || 0}
                {evaluation.gateRules ? `, gate rules failed: ${gateFailedCount}` : ''}
                {failedGateLabels.length > 0 ? ` | Failed rules: ${failedGateLabels.join(', ')}` : ''}
              </Alert>
            )}

            {errorText && <Alert severity="error" sx={{ mt: 2 }}>{errorText}</Alert>}
            {successText && <Alert severity="success" sx={{ mt: 2 }}>{successText}</Alert>}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Close</Button>
        <Button onClick={handleSaveResponses} disabled={saving || loading}>
          Save
        </Button>
        <Button variant="contained" onClick={handleRunStage} disabled={saving || loading}>
          Run Stage
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StageRunModal;
