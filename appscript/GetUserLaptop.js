function LaptopGetRequest(e) {
  const startMs = Date.now();
  const params = (e && e.parameter) ? e.parameter : {};

  // Query parameters for filtering
  const idQuery = (params.idQuery || '').toString().toLowerCase();
  const macQuery = (params.macQuery || '').toString().toLowerCase();
  const assignQuery = (params.assignQuery || '').toString().toLowerCase();
  const workingFilter = (params.workingFilter || '').toString().toLowerCase();
  const statusFilter = (params.statusFilter || '').toString().toLowerCase();
  const majorIssueFilter = (params.majorIssueFilter || '').toString().toLowerCase();
  const minorIssueFilter = (params.minorIssueFilter || '').toString().toLowerCase();
  const allocatedToFilter = (params.allocatedToFilter || '').toString().toLowerCase();

  // Optional params for pagination and output shaping
  const page = parseInt(params.page || '', 10);
  const limit = parseInt(params.limit || '', 10);
  const includeMeta = (params.includeMeta || '') === '1';
  const includeBarcode = params.includeBarcode === '1';
  const fieldsParam = (params.fields || '').trim();

  const hasPagination = Number.isFinite(page) && Number.isFinite(limit) && page > 0 && limit > 0;
  const offset = hasPagination ? (page - 1) * limit : 0;
  const hasFilters = !!(
    idQuery || macQuery || assignQuery ||
    (workingFilter && workingFilter !== 'all') ||
    (statusFilter && statusFilter !== 'all') ||
    (majorIssueFilter && majorIssueFilter !== 'all') ||
    (minorIssueFilter && minorIssueFilter !== 'all') ||
    allocatedToFilter
  );

  const sheet = SpreadsheetApp.openById('1Hvx_Lne4-gf-sCs7_KAItV8xEQaIcCAp5WRmfph1HcM')
    .getSheetByName('Laptop Labeling');
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 1 || lastCol < 1) {
    const emptyOutput = includeMeta
      ? { data: [], total: 0, page: hasPagination ? page : 1, limit: hasPagination ? limit : 0 }
      : [];
    return ContentService.createTextOutput(JSON.stringify(emptyOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const headerIndex = {};
  headers.forEach((header, index) => {
    headerIndex[header] = index;
  });

  const selectedFields = fieldsParam
    ? fieldsParam.split(',').map((field) => field.trim()).filter((field) => field && headerIndex[field] !== undefined)
    : headers;
  const selectedIndices = selectedFields.map((field) => headerIndex[field]);

  const idIndex = headerIndex.ID;
  const macIndex = headerIndex['Mac address'];
  const statusIndex = headerIndex.Status;
  const workingIndex = headerIndex.Working;
  const majorIssuesIndex = headerIndex['Major Issues'];
  const minorIssuesIndex = headerIndex['Minor Issues'];
  const allocatedToIndex = headerIndex['Allocated To'];

  const cache = CacheService.getScriptCache();
  const canUseQueryCache = true;
  const cacheKey = canUseQueryCache ? [
    'laptopGetV2',
    page,
    limit,
    includeMeta ? '1' : '0',
    includeBarcode ? '1' : '0',
    fieldsParam || '*',
    idQuery || '-',
    macQuery || '-',
    assignQuery || '-',
    workingFilter || '-',
    statusFilter || '-',
    majorIssueFilter || '-',
    minorIssueFilter || '-',
    allocatedToFilter || '-',
  ].join('|') : null;

  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached) {
      Logger.log('LaptopGetRequest cache hit in ' + (Date.now() - startMs) + 'ms');
      return ContentService.createTextOutput(cached)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  const buildRowObject = (row) => {
    const obj = {};
    for (let i = 0; i < selectedFields.length; i += 1) {
      obj[selectedFields[i]] = row[selectedIndices[i]];
    }

    if (includeBarcode) {
      const idValue = idIndex !== undefined ? row[idIndex] : undefined;
      const macValue = macIndex !== undefined ? row[macIndex] : undefined;
      if (idValue) {
        obj.barcodeUrl = 'https://barcode.tec-it.com/barcode.ashx?data=' +
          encodeURIComponent(idValue) + '&code=Code128&dpi=96';
      } else if (macValue) {
        obj.barcodeUrl = 'https://barcode.tec-it.com/barcode.ashx?data=' +
          encodeURIComponent(macValue) + '&code=Code128&dpi=96';
      }
    }

    return obj;
  };

  const totalRows = Math.max(lastRow - 1, 0);

  // Fast path: no filters + pagination reads only the requested row window.
  if (!hasFilters && hasPagination) {
    const startIndex = Math.min(offset, totalRows);
    const endIndex = Math.min(offset + limit, totalRows);
    const rowCount = Math.max(endIndex - startIndex, 0);

    const rows = rowCount > 0
      ? sheet.getRange(2 + startIndex, 1, rowCount, lastCol).getValues()
      : [];
    const results = rows.map(buildRowObject);
    const output = includeMeta
      ? { data: results, total: totalRows, page, limit }
      : results;

    const payload = JSON.stringify(output);
    if (cacheKey) {
      try {
        cache.put(cacheKey, payload, 60);
      } catch (err) {
        Logger.log('LaptopGetRequest cache put skipped: ' + err);
      }
    }

    Logger.log('LaptopGetRequest fast path in ' + (Date.now() - startMs) + 'ms');
    return ContentService.createTextOutput(payload)
      .setMimeType(ContentService.MimeType.JSON);
  }

  const allRows = totalRows > 0
    ? sheet.getRange(2, 1, totalRows, lastCol).getValues()
    : [];

  const matchesRow = (row) => {
    // id/mac/assign work as OR text search among the supplied queries
    const hasTextSearch = !!(idQuery || macQuery || assignQuery);
    let textMatched = false;

    if (idQuery && idIndex !== undefined) {
      const idValue = row[idIndex];
      if (idValue && idValue.toString().toLowerCase().includes(idQuery)) textMatched = true;
    }
    if (macQuery && macIndex !== undefined) {
      const macValue = row[macIndex];
      if (macValue && macValue.toString().toLowerCase().includes(macQuery)) textMatched = true;
    }
    if (assignQuery && statusIndex !== undefined) {
      const statusValue = row[statusIndex];
      if (statusValue && statusValue.toString().toLowerCase().includes(assignQuery)) textMatched = true;
    }

    if (hasTextSearch && !textMatched) {
      return false;
    }

    if (workingFilter && workingFilter !== 'all' && workingIndex !== undefined) {
      const workingValue = row[workingIndex];
      if (!workingValue || workingValue.toString().toLowerCase() !== workingFilter) {
        return false;
      }
    }

    if (statusFilter && statusFilter !== 'all' && statusIndex !== undefined) {
      const statusValue = row[statusIndex];
      if (!statusValue || statusValue.toString().toLowerCase() !== statusFilter) {
        return false;
      }
    }

    if (majorIssueFilter && majorIssueFilter !== 'all' && majorIssuesIndex !== undefined) {
      const majorValue = (row[majorIssuesIndex] || '').toString().toLowerCase();
      if (!majorValue.includes(majorIssueFilter)) {
        return false;
      }
    }

    if (minorIssueFilter && minorIssueFilter !== 'all' && minorIssuesIndex !== undefined) {
      const minorValue = (row[minorIssuesIndex] || '').toString().toLowerCase();
      if (!minorValue.includes(minorIssueFilter)) {
        return false;
      }
    }

    if (allocatedToFilter && allocatedToIndex !== undefined) {
      const allocatedValue = (row[allocatedToIndex] || '').toString().toLowerCase();
      if (allocatedValue !== allocatedToFilter) {
        return false;
      }
    }

    return true;
  };

  const results = [];
  let matchedCount = 0;

  if (!hasFilters) {
    // No filters, no pagination: preserve old behavior by returning full dataset.
    for (let i = 0; i < allRows.length; i += 1) {
      results.push(buildRowObject(allRows[i]));
    }
  } else {
    for (let i = 0; i < allRows.length; i += 1) {
      const row = allRows[i];
      if (!matchesRow(row)) continue;

      matchedCount += 1;
      if (!hasPagination || (matchedCount > offset && results.length < limit)) {
        results.push(buildRowObject(row));
      }
    }
  }

  const total = hasFilters ? matchedCount : totalRows;
  const output = includeMeta
    ? { data: results, total: total, page: hasPagination ? page : 1, limit: hasPagination ? limit : results.length }
    : results;

  const payload = JSON.stringify(output);
  if (cacheKey) {
    try {
      cache.put(cacheKey, payload, 60);
    } catch (err) {
      Logger.log('LaptopGetRequest cache put skipped: ' + err);
    }
  }

  Logger.log('LaptopGetRequest full path in ' + (Date.now() - startMs) + 'ms');
  return ContentService.createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}
