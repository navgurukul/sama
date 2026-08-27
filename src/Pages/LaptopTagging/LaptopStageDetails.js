import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  FormControlLabel,
  Stack,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchLaptopData,
  fetchStageGateLogs,
  fetchLaptopStageRuns,
  fetchStageMap,
  fetchStageRunResponses,
} from '../../components/OPS/LaptopTable/api';
import StageRunModal from './StageRunModal';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  try {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);
    return dt.toLocaleString();
  } catch (error) {
    return String(value);
  }
};

const HIDDEN_GATE_RULE_CODES = new Set([
  'STAGE2_FAILS_WITH_RESOLUTION',
  'STAGE2_NO_UNRESOLVED_REPAIR_REQUIRED',
]);

const LaptopStageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [laptop, setLaptop] = useState(null);
  const [stageMap, setStageMap] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [responses, setResponses] = useState([]);
  const [gateLogs, setGateLogs] = useState([]);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [expandedResponseId, setExpandedResponseId] = useState(null);

  const gateLogsByRun = useMemo(() => {
    const grouped = new Map();
    (gateLogs || []).forEach((log) => {
      const runId = Number(log.runId);
      if (!Number.isFinite(runId)) return;
      if (!grouped.has(runId)) grouped.set(runId, []);
      grouped.get(runId).push(log);
    });
    return grouped;
  }, [gateLogs]);

  const selectedRunGateLogs = useMemo(() => {
    if (!selectedRun?.runId) return [];
    return (gateLogsByRun.get(Number(selectedRun.runId)) || []).filter(
      (log) => !HIDDEN_GATE_RULE_CODES.has(String(log.ruleCode || '').toUpperCase())
    );
  }, [gateLogsByRun, selectedRun]);

  const currentStage = useMemo(() => {
    const currentCode = String(laptop?.Status || '').trim().toUpperCase();
    return stageMap.find((s) => String(s.stageCode || '').toUpperCase() === currentCode) || null;
  }, [laptop?.Status, stageMap]);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    setErrorText('');

    try {
      const [laptopData, mapData, runsData] = await Promise.all([
        fetchLaptopData({ idQuery: id, noCache: true }),
        fetchStageMap(),
        fetchLaptopStageRuns(id),
      ]);

      const laptops = Array.isArray(laptopData?.data)
        ? laptopData.data
        : (Array.isArray(laptopData) ? laptopData : []);

      const targetLaptop = laptops.find((row) => String(row.ID) === String(id)) || laptops[0] || null;
      setLaptop(targetLaptop);

      const stages = Array.isArray(mapData) ? mapData : [];
      setStageMap(stages);

      const history = Array.isArray(runsData) ? runsData : [];
      setRuns(history);

      const logsData = await fetchStageGateLogs({ laptopId: id });
      setGateLogs(Array.isArray(logsData) ? logsData : []);

      const firstRun = history[0] || null;
      setSelectedRun(firstRun);
    } catch (error) {
      console.error('Error loading laptop stage details:', error);
      setErrorText(String(error.message || error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const loadResponses = async () => {
      if (!selectedRun?.runId) {
        setResponses([]);
        return;
      }
      try {
        const data = await fetchStageRunResponses(selectedRun.runId);
        setResponses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading stage run responses:', error);
      }
    };

    loadResponses();
  }, [selectedRun]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/laptop-tagging')}>
          Back to Laptop Tagging
        </Button>
        <Button
          variant="contained"
          onClick={() => setStageModalOpen(true)}
          disabled={!laptop}
        >
          Run Stage Checklist
        </Button>
      </Stack>

      {errorText && <Alert severity="error" sx={{ mb: 2 }}>{errorText}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Laptop Stage Details</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">Serial</Typography>
                <Typography variant="subtitle1">{laptop?.ID || id}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Donor</Typography>
                <Typography variant="subtitle1">{laptop?.['Donor Company Name'] || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Current Stage</Typography>
                <Chip
                  label={laptop?.Status || 'N/A'}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                <Typography variant="subtitle2">{formatDateTime(laptop?.['Last Updated On'])}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Stage Progress</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {stageMap.map((stage) => {
                const isCurrent = Number(stage.stageId) === Number(currentStage?.stageId);
                return (
                  <Chip
                    key={stage.stageId}
                    label={`#${stage.stageId} ${stage.stageCode}`}
                    color={isCurrent ? 'success' : 'default'}
                    variant={isCurrent ? 'filled' : 'outlined'}
                  />
                );
              })}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Stage Run Timeline</Typography>
            <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
              <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Run ID</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Attempt</TableCell>
                  <TableCell>Outcome</TableCell>
                  <TableCell>Gate Log</TableCell>
                  <TableCell>Started By</TableCell>
                  <TableCell>Started At</TableCell>
                  <TableCell>Completed At</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">No stage runs yet</TableCell>
                  </TableRow>
                )}
                {runs.map((run) => {
                  const runLogs = gateLogsByRun.get(Number(run.runId)) || [];
                  const orderedLogs = [...runLogs].sort((a, b) => {
                    const aTime = a?.evaluatedAt ? new Date(a.evaluatedAt).getTime() : 0;
                    const bTime = b?.evaluatedAt ? new Date(b.evaluatedAt).getTime() : 0;
                    return bTime - aTime;
                  });
                  const latestLog = orderedLogs[0] || null;
                  const mandatoryLog = orderedLogs.find((log) => log.ruleCode === 'MANDATORY_ITEMS_PASS') || null;
                  const details = mandatoryLog?.details || {};
                  const failedCount = Number(details?.mandatoryFailed || 0);
                  const missingCount = Number(details?.mandatoryMissing || 0);
                  const anyFailed = orderedLogs.some((log) => log.passed === false);
                  const hasIssues = failedCount > 0 || missingCount > 0 || anyFailed;

                  return (
                    <TableRow key={run.runId} selected={selectedRun?.runId === run.runId}>
                      <TableCell>{run.runId}</TableCell>
                      <TableCell>{run.stageCode}</TableCell>
                      <TableCell>{run.runNumber}</TableCell>
                      <TableCell>{run.outcome}</TableCell>
                      <TableCell>
                        {latestLog ? (
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip
                              size="small"
                              color={hasIssues ? 'error' : 'success'}
                              label={hasIssues ? 'Gate Failed' : 'Gate Passed'}
                            />
                            {hasIssues && (
                              <Typography variant="caption" color="text.secondary">
                                Failed: {failedCount}, Missing: {missingCount}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Not evaluated</Typography>
                        )}
                      </TableCell>
                      <TableCell>{run.startedBy || 'N/A'}</TableCell>
                      <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                      <TableCell>{formatDateTime(run.completedAt)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => setSelectedRun(run)}>
                          View Checklist
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedRun ? `Gate Failure Details (Run ${selectedRun.runId})` : 'Gate Failure Details'}
            </Typography>

            {selectedRunGateLogs.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No gate evaluations logged for selected run.
              </Typography>
            )}

            {selectedRunGateLogs.map((log) => {
              const details = log?.details || {};
              const failedItems = Array.isArray(details.failedMandatoryItems) ? details.failedMandatoryItems : [];
              const missingItems = Array.isArray(details.missingMandatoryItems) ? details.missingMandatoryItems : [];
              const hasIssues = failedItems.length > 0 || missingItems.length > 0 || log.passed === false;

              return (
                <Paper key={log.evaluationId} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 1 }}>
                    <Chip
                      size="small"
                      color={hasIssues ? 'error' : 'success'}
                      label={hasIssues ? 'FAILED' : 'PASSED'}
                    />
                    <Typography variant="body2">
                      Rule: {log.ruleCode} ({log.ruleName})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Evaluated: {formatDateTime(log.evaluatedAt)}
                    </Typography>
                  </Stack>

                  {failedItems.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="error">Failed Mandatory Items</Typography>
                      {failedItems.map((item) => (
                        <Typography key={`failed-${item.itemId}`} variant="body2" sx={{ mt: 0.5 }}>
                          [{item.sectionCode}] {item.itemCode}: {item.itemText}
                          {item.remark ? ` | Remark: ${item.remark}` : ''}
                          {item.evidenceUrl ? ` | Evidence: ${item.evidenceUrl}` : ''}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {missingItems.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="warning.main">Missing Mandatory Items</Typography>
                      {missingItems.map((item) => (
                        <Typography key={`missing-${item.itemId}`} variant="body2" sx={{ mt: 0.5 }}>
                          [{item.sectionCode}] {item.itemCode}: {item.itemText}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedRun ? `Checklist Responses (Run ${selectedRun.runId})` : 'Checklist Responses'}
            </Typography>
            <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
              <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Remark</TableCell>
                  <TableCell>Evidence URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No checklist responses for selected run</TableCell>
                  </TableRow>
                )}
                {responses.map((row) => {
                  const isFail = String(row.result || '').toUpperCase() === 'FAIL';
                  const isExpanded = expandedResponseId === row.responseId;
                  const subItems = Array.isArray(row.subItems) ? row.subItems : [];
                  const subChecks = Array.isArray(row.subChecks) ? row.subChecks : [];
                  const showSubChecklist = isExpanded && subItems.length > 0;
                  const evidenceFiles = Array.isArray(row.evidenceFiles)
                    ? row.evidenceFiles
                    : (row.evidenceUrl ? [{
                      url: row.evidenceUrl,
                      contentType: row.evidenceContentType || '',
                    }] : []);
                  return (
                    <React.Fragment key={row.responseId}>
                      <TableRow
                        hover
                        onClick={() => setExpandedResponseId(
                          isExpanded ? null : row.responseId
                        )}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{row.itemCode}</TableCell>
                        <TableCell
                          sx={isFail ? {
                            backgroundColor: (theme) => theme.palette.error.main,
                            color: (theme) => theme.palette.common.black,
                            fontWeight: 600,
                          } : undefined}
                        >
                          {row.result}
                        </TableCell>
                        <TableCell>{row.remark || 'N/A'}</TableCell>
                        <TableCell>
                          {evidenceFiles.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {evidenceFiles.map((file, index) => {
                                const url = file?.url || '';
                                const contentType = String(file?.contentType || '');
                                const isImage = contentType.toLowerCase().startsWith('image/')
                                  || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(url);
                                return (
                                  <Button
                                    key={`${row.responseId}-file-${index}`}
                                    size="small"
                                    variant="text"
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {isImage ? 'Preview' : 'Download'}
                                  </Button>
                                );
                              })}
                            </Box>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      {showSubChecklist && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 0 }}>
                            <Collapse in={showSubChecklist} timeout="auto" unmountOnExit>
                              <Box sx={{ pl: 2, py: 1 }}>
                                {subItems.map((text, index) => (
                                  <FormControlLabel
                                    key={`${row.responseId}-sub-${index}`}
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={Boolean(subChecks[index])}
                                        disabled
                                      />
                                    }
                                    label={text}
                                    sx={{ display: 'flex', alignItems: 'flex-start' }}
                                  />
                                ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      <StageRunModal
        open={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        laptopId={laptop?.ID || id || ''}
        currentStatus={laptop?.Status || ''}
        onCompleted={() => {
          setStageModalOpen(false);
          loadAll();
        }}
      />
    </Container>
  );
};

export default LaptopStageDetails;
