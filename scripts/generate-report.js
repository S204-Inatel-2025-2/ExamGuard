import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateTestReport() {
  const vitestCoverage = JSON.parse(fs.readFileSync(path.join(__dirname, '../coverage/coverage-final.json'), 'utf8'));
  const cypressReports = path.join(__dirname, '../cypress/reports/html');
  
  // Create report directory if it doesn't exist
  const reportDir = path.join(__dirname, '../test-report');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    unitTests: {
      coverage: {
        statements: vitestCoverage.total.statements.pct,
        branches: vitestCoverage.total.branches.pct,
        functions: vitestCoverage.total.functions.pct,
        lines: vitestCoverage.total.lines.pct
      }
    },
    e2eTests: {
      reportPath: cypressReports
    }
  };

  // Write report to file
  fs.writeFileSync(
    path.join(reportDir, 'test-summary.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>ExamGuard Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .coverage-section { margin: 20px 0; }
    .metric { margin: 10px 0; }
    .metric span { font-weight: bold; }
    .links { margin-top: 30px; }
    .timestamp { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ExamGuard Test Report</h1>
    <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
  </div>

  <div class="coverage-section">
    <h2>Unit Test Coverage</h2>
    <div class="metric">Statements: <span>${report.unitTests.coverage.statements}%</span></div>
    <div class="metric">Branches: <span>${report.unitTests.coverage.branches}%</span></div>
    <div class="metric">Functions: <span>${report.unitTests.coverage.functions}%</span></div>
    <div class="metric">Lines: <span>${report.unitTests.coverage.lines}%</span></div>
  </div>

  <div class="coverage-section">
    <h2>E2E Test Results</h2>
    <p>Detailed E2E test results can be found in: <code>${report.e2eTests.reportPath}</code></p>
  </div>

  <div class="links">
    <p><a href="../coverage/index.html">View Detailed Coverage Report</a></p>
    <p><a href="../cypress/reports/html/index.html">View Detailed E2E Test Report</a></p>
  </div>
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