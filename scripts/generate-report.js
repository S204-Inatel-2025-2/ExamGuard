import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyDirectory(src, dest) {
  if (fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function generateTestReport() {
  let vitestCoverage = null;  
  const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json'); 
  const cypressReports = path.join(__dirname, '../cypress/reports/html');
  
  const reportDir = path.join(__dirname, '../test-report');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  copyDirectory(path.join(__dirname, '../coverage'), path.join(reportDir, 'coverage'));
  copyDirectory(path.join(__dirname, '../cypress/reports/html'), path.join(reportDir, 'cypress/reports/html'));

  try {
    if (fs.existsSync(coveragePath)) {
      vitestCoverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    }
  } catch (error) {
    console.warn('Warning: Coverage data not found. Run tests with coverage first.');
  }

  const report = {
    timestamp: new Date().toISOString(),
    unitTests: {
      coverage: vitestCoverage ? {
        statements: vitestCoverage.total.statements.pct,
        branches: vitestCoverage.total.branches.pct,
        functions: vitestCoverage.total.functions.pct,
        lines: vitestCoverage.total.lines.pct
      } : 'No coverage data available. Run tests with coverage first.'
    },
    e2eTests: {
      reportPath: cypressReports
    }
  };

  fs.writeFileSync(
    path.join(reportDir, 'test-summary.json'),
    JSON.stringify(report, null, 2)
  );

  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>ExamGuard Test Report</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 40px;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .coverage-section { 
      margin: 20px 0;
      padding: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .metric { 
      margin: 10px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .metric span { 
      font-weight: bold;
      color: #2c3e50;
    }
    .links { 
      margin-top: 30px;
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .links a {
      display: inline-block;
      padding: 10px 20px;
      background: #0366d6;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.3s;
    }
    .links a:hover {
      background: #0255b3;
    }
    .disabled {
      padding: 10px 20px;
      background: #e9ecef;
      border-radius: 4px;
    }
    .timestamp { 
      color: #666; 
      font-size: 0.9em;
      margin-top: 10px;
    }
    code {
      background: #f6f8fa;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ExamGuard Test Report</h1>
    <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
  </div>

  <div class="coverage-section">
    <h2>Unit Test Coverage</h2>
    ${typeof report.unitTests.coverage === 'string' 
      ? `<p>${report.unitTests.coverage}</p>`
      : `<div class="metric">Statements: <span>${report.unitTests.coverage.statements}%</span></div>
         <div class="metric">Branches: <span>${report.unitTests.coverage.branches}%</span></div>
         <div class="metric">Functions: <span>${report.unitTests.coverage.functions}%</span></div>
         <div class="metric">Lines: <span>${report.unitTests.coverage.lines}%</span></div>`
    }
  </div>

  <div class="coverage-section">
    <h2>E2E Test Results</h2>
    <p>Detailed E2E test results can be found in: <code>${report.e2eTests.reportPath}</code></p>
  </div>

  <div class="links">
    ${fs.existsSync(path.join(__dirname, '../coverage/index.html')) 
      ? `<p><a href="./coverage/index.html" target="_blank">View Detailed Coverage Report</a></p>`
      : `<p class="disabled">Coverage Report Not Available - Run tests with coverage first</p>`
    }
    ${fs.existsSync(path.join(__dirname, '../cypress/reports/html/index.html'))
      ? `<p><a href="./cypress/reports/html/index.html" target="_blank">View Detailed E2E Test Report</a></p>`
      : `<p class="disabled">E2E Report Not Available - Run Cypress tests first</p>`
    }
  </div>
  <style>
    .disabled {
      color: #666;
      font-style: italic;
    }
  </style>
</body>
</html>
  `;

  fs.writeFileSync(
    path.join(reportDir, 'index.html'),
    htmlReport
  );

  console.log('Test report generated successfully!');
  console.log(`Report location: ${reportDir}`);
}

generateTestReport();