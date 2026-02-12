export interface CSVValidationError {
  row: number;
  message: string;
}

const VALID_CATEGORIES = ['Accounting', 'Analytics', 'Audit', 'Tax'];

export function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

export function validateCSVRow(row: any, rowNumber: number): CSVValidationError[] {
  const errors: CSVValidationError[] = [];

  if (!row.title || !row.title.trim()) {
    errors.push({ row: rowNumber, message: 'Title is required' });
  }

  if (!row.firmName || !row.firmName.trim()) {
    errors.push({ row: rowNumber, message: 'Firm name is required' });
  }

  if (!row.category || !VALID_CATEGORIES.includes(row.category)) {
    errors.push({
      row: rowNumber,
      message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  if (!row.location || !row.location.trim()) {
    errors.push({ row: rowNumber, message: 'Location is required' });
  }

  if (!row.postingUrl || !row.postingUrl.trim()) {
    errors.push({ row: rowNumber, message: 'Posting URL is required' });
  } else if (!row.postingUrl.startsWith('http://') && !row.postingUrl.startsWith('https://')) {
    errors.push({ row: rowNumber, message: 'Posting URL must start with http:// or https://' });
  }

  return errors;
}
