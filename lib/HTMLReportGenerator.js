import fs from 'fs';
import path from 'path';

export default class HTMLReportGenerator {
  constructor(outputFilePath) {
    this.outputFilePath = outputFilePath;
    this.testResults = [];
    this.metadata = null;
  }

  // Helper to escape HTML so that any HTML tags in data are rendered as text
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async convertJSONFolderToHTML(folderPath) {
    try {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(folderPath, file);
          const jsonContent = await fs.promises.readFile(filePath, 'utf8');
          const parsedContent = JSON.parse(jsonContent);
          // Check if JSON contains metadata and testResults
          if (parsedContent.testResults && Array.isArray(parsedContent.testResults)) {
            if (!this.metadata && parsedContent.metadata) {
              this.metadata = parsedContent.metadata;
            }
            this.testResults.push(...parsedContent.testResults);
          } else if (Array.isArray(parsedContent)) {
            this.testResults.push(...parsedContent);
          }
        }
      }
      this.generateHTMLReport();
    } catch (error) {
      console.error('Error converting JSON to HTML:', error);
    }
  }

  // Embed a screenshot file as a base64 data URL.
  embedScreenshot(screenshotPath) {
    try {
      if (fs.existsSync(screenshotPath)) {
        const ext = path.extname(screenshotPath).toLowerCase();
        let mimeType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') {
          mimeType = 'image/jpeg';
        } else if (ext === '.gif') {
          mimeType = 'image/gif';
        }
        const imageData = fs.readFileSync(screenshotPath);
        const base64Image = imageData.toString('base64');
        return `data:${mimeType};base64,${base64Image}`;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  generateHTMLReport() {
    const summary = this.calculateSummaryStats();
    const passedPercentage = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(2) : '0.00';
    const failedPercentage = summary.total > 0 ? ((summary.failed / summary.total) * 100).toFixed(2) : '0.00';
    const metadata = this.metadata || {
      browserName: 'N/A',
      executionStartTime: 'N/A',
      executionEndTime: 'N/A',
      totalTimeInMinutes: 'N/A',
    };

    // Additional insights:
    const errorCount = this.testResults.filter(test => test.error).length;
    const suiteStats = {};
    this.testResults.forEach(test => {
      const suite = test.suiteName || "Unknown";
      if (!suiteStats[suite]) {
        suiteStats[suite] = { total: 0, passed: 0, failed: 0 };
      }
      suiteStats[suite].total++;
      if (test.status === 'PASSED') {
        suiteStats[suite].passed++;
      } else if (test.status === 'FAILED') {
        suiteStats[suite].failed++;
      }
    });
    const totalSuiteCount = Object.keys(suiteStats).length;
    const failedSuiteCount = Object.keys(suiteStats).filter(suite => suiteStats[suite].failed > 0).length;

    // Compute Unique Errors
    const uniqueErrors = {};
    this.testResults.forEach(test => {
      if (test.error) {
        const errMsg = test.error;
        uniqueErrors[errMsg] = (uniqueErrors[errMsg] || 0) + 1;
      }
    });
    const uniqueErrorsRows = Object.keys(uniqueErrors).map(errMsg => {
      return `<tr><td>${this.escapeHtml(errMsg)}</td><td>${uniqueErrors[errMsg]}</td></tr>`;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>UI Test Execution Report</title>
  <style>
    /* Global Styles & CSS Variables */
    :root {
      --background-color: #f2f2f2;
      --header-bg: linear-gradient(135deg, #2c3e50, #34495e);
      --header-text: #ecf0f1;
      --nav-bg: #34495e;
      --nav-btn-color: #ecf0f1;
      --nav-btn-hover: #1abc9c;
      --card-bg: #fff;
      --card-shadow: 0 2px 8px rgba(0,0,0,0.1);
      --card-hover-shadow: 0 4px 12px rgba(0,0,0,0.15);
      --text-color: #2c3e50;
      --subtext-color: #7f8c8d;
      --button-bg: #1abc9c;
      --button-bg-hover: #16a085;
      --table-border: #e0e0e0;
      --table-header-bg: #f7f7f7;
      --table-text: #2c3e50;
      --table-row-hover: #f5f5f5;
      --filter-menu-border: #ddd;
      --filter-menu-bg: #fff;
    }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: var(--background-color);
      transition: background-color 0.3s;
    }
    .header {
      background: var(--header-bg);
      color: var(--header-text);
      padding: 20px;
      text-align: center;
      position: relative;
    }
    .execution-subheader {
      font-size: 0.9em;
      color: var(--header-text);
      margin-top: 10px;
    }
    .nav {
      display: flex;
      justify-content: center;
      background-color: var(--nav-bg);
    }
    .nav button {
      background: none;
      border: none;
      color: var(--nav-btn-color);
      padding: 15px 30px;
      font-size: 1em;
      cursor: pointer;
      transition: background 0.3s;
    }
    .nav button:hover, .nav button.active {
      background-color: var(--nav-btn-hover);
    }
    .container {
      padding: 20px;
    }
    .tabcontent {
      display: none;
      animation: fadeIn 0.5s;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    /* Modern Dashboard Styles */
    #Dashboard {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 20px;
      box-shadow: var(--card-shadow);
      margin-bottom: 20px;
    }
    #Dashboard .cards-group h2 {
      text-align: center;
      margin-bottom: 20px;
      color: var(--text-color);
      font-size: 1.2em;
    }
    #Dashboard .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
    }
    #Dashboard .card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 20px;
      box-shadow: var(--card-shadow);
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    #Dashboard .card:hover {
      transform: translateY(-3px);
      box-shadow: var(--card-hover-shadow);
    }
    #Dashboard .card h3 {
      margin: 0 0 8px 0;
      font-size: 1em;
      color: var(--subtext-color);
    }
    #Dashboard .card p {
      margin: 0;
      font-size: 1.8em;
      color: var(--text-color);
      font-weight: bold;
    }
    /* Chart Container Styles */
    .charts-row {
      display: flex;
      justify-content: space-around;
      gap: 20px;
      margin-top: 20px;
      margin-bottom: 20px;
      flex-wrap: nowrap;
    }
    .chart-container {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 15px;
      box-shadow: var(--card-shadow);
      flex: 1;
      min-width: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chart-container canvas {
      display: block;
      margin: auto;
      width: 100%;
      height: 100%;
      max-height: 280px;
      max-width: 280px;
    }
    .expand-btn {
      margin-top: 10px;
      padding: 6px 12px;
      font-size: 0.9em;
      cursor: pointer;
      border: none;
      background-color: var(--button-bg);
      color: var(--header-text);
      border-radius: 4px;
      transition: background 0.3s;
    }
    .expand-btn:hover {
      background-color: var(--button-bg-hover);
    }
    /* Modern Test Details Styles */
    #TestDetails {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      margin-top: 20px;
    }
    #TestDetails table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 0.9em;
    }
    #TestDetails th, #TestDetails td {
      border: 1px solid var(--table-border);
      padding: 12px;
      text-align: left;
      color: var(--table-text);
    }
    #TestDetails th {
      background-color: var(--table-header-bg);
      font-weight: bold;
    }
    #TestDetails tbody tr:hover {
      background-color: var(--table-row-hover);
    }
    .filter-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      align-items: center;
    }
    .filter-group input {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      flex: 1;
    }
    .filter-group button {
      padding: 10px 15px;
      border: none;
      background-color: var(--button-bg);
      color: var(--header-text);
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .filter-group button:hover {
      background-color: var(--button-bg-hover);
    }
    /* Unique Errors Table */
    .unique-errors {
      margin-top: 30px;
    }
    .unique-errors h2 {
      text-align: center;
      color: var(--text-color);
    }
    #uniqueErrorsTable {
      width: 100%;
      border-collapse: collapse;
      margin: 0 auto;
    }
    #uniqueErrorsTable th, #uniqueErrorsTable td {
      border: 1px solid #bdc3c7;
      padding: 10px;
      text-align: center;
    }
    #uniqueErrorsTable th {
      background-color: #2980b9;
      color: #fff;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
    .passed { 
      background-color: #d4edda !important; 
    }
    .failed { 
      background-color: #f8d7da !important; 
    }
    /* Filter Menu Styles */
    .filter-icon {
      margin-left: 5px;
      cursor: pointer;
      font-size: 0.8em;
      color: #555;
    }
    .filter-menu {
      position: absolute;
      background: var(--filter-menu-bg);
      border: 1px solid var(--filter-menu-border);
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .filter-menu label {
      display: block;
      margin: 5px 0;
    }
    .filter-menu button {
      margin-top: 10px;
      padding: 6px 10px;
      border: none;
      background-color: var(--button-bg);
      color: var(--header-text);
      border-radius: 4px;
      cursor: pointer;
    }
    .thumbnail {
      max-width: 100px;
      cursor: pointer;
      transition: opacity 0.3s;
    }
    .thumbnail:hover {
      opacity: 0.8;
    }
    /* Modal Styles */
    .modal, .chart-modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.8);
    }
    .modal-content {
      margin: auto;
      display: block;
      max-width: 90%;
      max-height: 90%;
      position: relative;
    }
    /* Fullscreen expanded chart using full viewport */
    .chart-modal-content {
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 90vmin;
      height: 90vmin;
      position: relative;
    }
    .close, .chart-close {
      position: absolute;
      top: 20px;
      right: 30px;
      color: var(--header-text);
      font-size: 40px;
      font-weight: bold;
      cursor: pointer;
    }
    .error-cell {
      max-height: 150px;
      overflow-y: auto;
      white-space: normal;
      word-wrap: break-word;
    }
    .error-message {
      cursor: pointer;
      color: #e74c3c;
      text-decoration: underline;
    }
    .stack-trace {
      background-color: #f9f9f9;
      border: 1px solid #ccc;
      padding: 10px;
      margin-top: 5px;
      font-family: monospace;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }
    .suite-cell {
      text-align: center;
      font-weight: bold;
      vertical-align: middle;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
</head>
<body>
  <div class="header">
    <h1>UI Test Execution Report</h1>
    <div class="execution-subheader">
      <p>Browser Name: ${metadata.browserName} - Execution Start Time: ${metadata.executionStartTime} - Execution End Time: ${metadata.executionEndTime} - Total Execution Time (minutes): ${metadata.totalTimeInMinutes}</p>
    </div>
  </div>
  <div class="nav">
    <button class="tablinks" onclick="openTab(event, 'Dashboard')">Dashboard</button>
    <button class="tablinks" onclick="openTab(event, 'TestDetails')">Test Details</button>
  </div>
  <div class="container">
    <div id="Dashboard" class="tabcontent" style="display: block;">
      <!-- Overall Test Information Group -->
      <div class="cards-group">
        <h2>Overall Test Information</h2>
        <div class="cards">
          <div class="card" onclick="showAllTestDetails()" title="Click to view All Tests">
            <h3>Total Tests</h3>
            <p>${summary.total}</p>
          </div>
          <div class="card" onclick="filterByStatus('PASSED')" title="Click to view Passed Tests">
            <h3>Passed</h3>
            <p>${summary.passed}</p>
          </div>
          <div class="card" onclick="filterByStatus('FAILED')" title="Click to view Failed Tests">
            <h3>Failed</h3>
            <p>${summary.failed}</p>
          </div>
        </div>
      </div>
      <!-- Suite Information Group -->
      <div class="cards-group">
        <h2>Suite Information</h2>
        <div class="cards">
          <div class="card" title="Total Suites">
            <h3>Total Suites</h3>
            <p>${totalSuiteCount}</p>
          </div>
          <div class="card" onclick="filterByFailedSuites()" title="Click to view failed suites">
            <h3>Failed Suites</h3>
            <p>${failedSuiteCount}</p>
          </div>
        </div>
      </div>
      <!-- Charts Row (side-by-side) -->
      <div class="charts-row">
        <div class="chart-container">
          <canvas id="statusChart"></canvas>
          <button class="expand-btn" onclick="openChartModal('overall')">Expand Chart</button>
        </div>
        <div class="chart-container">
          <canvas id="suiteChart"></canvas>
          <button class="expand-btn" onclick="openChartModal('suite')">Expand Chart</button>
        </div>
      </div>
      <!-- Unique Errors Table -->
      <div class="unique-errors">
        <h2>Unique Errors Overview</h2>
        <table id="uniqueErrorsTable">
          <thead>
            <tr>
              <th>Error Message</th>
              <th>Occurrence</th>
            </tr>
          </thead>
          <tbody>
            ${uniqueErrorsRows}
          </tbody>
        </table>
      </div>
    </div>
    <div id="TestDetails" class="tabcontent">
      <div class="filter-group">
        <input type="text" id="filterSuiteDetails" placeholder="Search Suite Name..." onkeyup="applyFilters()">
        <button onclick="clearFilters()">Clear Filters</button>
      </div>
      <button onclick="exportTableToExcel('detailsTable', 'TestDetailsReport')" style="margin-bottom: 10px;">Export to Excel</button>
      <table id="detailsTable">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Suite Name <span class="filter-icon" onclick="openFilterMenu(event, 1)">&#x1F50D;</span></th>
            <th>Test Name <span class="filter-icon" onclick="openFilterMenu(event, 2)">&#x1F50D;</span></th>
            <th>Status <span class="filter-icon" onclick="openFilterMenu(event, 3)">&#x1F50D;</span></th>
            <th>Error <span class="filter-icon" onclick="openFilterMenu(event, 4)">&#x1F50D;</span></th>
            <th>Screenshot</th>
          </tr>
        </thead>
        <tbody>
          ${this.testResults.map(test => {
            let screenshotHTML = 'No Screenshot';
            if (test.screenshot) {
              const dataUrl = this.embedScreenshot(test.screenshot);
              if (dataUrl) {
                screenshotHTML = `<img src="${dataUrl}" class="thumbnail" alt="Screenshot for ${this.escapeHtml(test.testName)}" onclick="openModal(this.src)">`;
              }
            }
            return `<tr data-suite="${this.escapeHtml(test.suiteName || '')}" data-test-name="${this.escapeHtml(test.testName || '')}" data-status="${test.status || ''}" data-error="${this.escapeHtml(test.error || '')}">
                <td>${test.timestamp || ''}</td>
                <td class="suite-cell">${this.escapeHtml(test.suiteName || '')}</td>
                <td>${this.escapeHtml(test.testName || '')}</td>
                <td class="${test.status === 'PASSED' ? 'passed' : test.status === 'FAILED' ? 'failed' : ''}">${test.status || ''}</td>
                <td class="error-cell">${
                  test.error 
                    ? `<div class="error-message" onclick="toggleStack(this)">${this.escapeHtml(test.error)}</div>
                       <div class="stack-trace" style="display: none;">${this.escapeHtml(test.stack || '')}</div>`
                    : ''
                }</td>
                <td>${screenshotHTML}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Image Modal -->
  <div id="myModal" class="modal">
    <span class="close" onclick="closeModal()">&times;</span>
    <img class="modal-content" id="modalImage">
  </div>
  
  <!-- Chart Modal -->
  <div id="chartModal" class="chart-modal">
    <div class="chart-modal-content">
      <span class="chart-close" onclick="closeChartModal()">&times;</span>
      <canvas id="chartModalCanvas"></canvas>
    </div>
  </div>
  
  <script>
    // Global helper function to extract full text based on column index.
    function getCellText(row, colIndex) {
      if (Number(colIndex) === 1) {
        return row.dataset.suite || row.cells[1].textContent.trim();
      } else if (Number(colIndex) === 2) {
        return row.dataset.testName || row.cells[2].textContent.trim();
      } else if (Number(colIndex) === 3) {
        return row.dataset.status || row.cells[3].textContent.trim();
      } else if (Number(colIndex) === 4) {
        return row.dataset.error || (function() {
          const errorCell = row.cells[colIndex];
          if (errorCell) {
            const errorMessageDiv = errorCell.querySelector('.error-message');
            if (errorMessageDiv && errorMessageDiv.textContent.trim().length > 0) {
              return errorMessageDiv.textContent.trim();
            } else {
              return errorCell.textContent.trim() || "No Error";
            }
          }
          return "No Error";
        })();
      } else {
        return row.cells[colIndex] ? row.cells[colIndex].textContent.trim() : "";
      }
    }
    
    const suiteStats = ${JSON.stringify(suiteStats)};
    let activeFilters = {};
    let currentFilterMenu = null;
    let originalTableBody = '';
    let statusChartInstance, suiteChartInstance, modalChartInstance;
    
    function mergeSuiteCellsAdvanced() {
      const tbody = document.getElementById("detailsTable").tBodies[0];
      const allRows = Array.from(tbody.rows).filter(row => row.style.display !== "none");
      let i = 0;
      while (i < allRows.length) {
        const currentSuite = allRows[i].dataset.suite || "";
        let count = 1;
        let j = i + 1;
        while (j < allRows.length && (allRows[j].dataset.suite || "") === currentSuite) {
          count++;
          j++;
        }
        if (count > 1) {
          const firstRow = allRows[i];
          const suiteCell = firstRow.querySelector('.suite-cell');
          if (suiteCell) {
            suiteCell.rowSpan = count;
          }
          for (let k = i + 1; k < j; k++) {
            const cellToRemove = allRows[k].querySelector('.suite-cell');
            if (cellToRemove) {
              cellToRemove.parentNode.removeChild(cellToRemove);
            }
          }
        }
        i = j;
      }
    }
    
    function rebuildTableStructure() {
      document.getElementById("detailsTable").tBodies[0].innerHTML = originalTableBody;
    }
    
    function openTab(evt, tabName) {
      const tabcontent = document.getElementsByClassName("tabcontent");
      for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      const tablinks = document.getElementsByClassName("tablinks");
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
      }
      document.getElementById(tabName).style.display = "block";
      if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
      }
      if (tabName === 'Dashboard'){
        setTimeout(() => {
          drawChart();
          drawSuiteChart();
        }, 0);
      }
      mergeSuiteCellsAdvanced();
    }
    
    function applyFilters() {
      rebuildTableStructure();
      const suiteFilterText = document.getElementById("filterSuiteDetails").value.toUpperCase();
      const table = document.getElementById("detailsTable");
      const rows = table.tBodies[0].rows;
      for (let row of rows) {
        const suiteValue = (row.dataset.suite || "").toUpperCase();
        let textMatch = (suiteValue.indexOf(suiteFilterText) > -1);
        let columnMatch = true;
        for (let colIndex in activeFilters) {
          if (activeFilters[colIndex] && activeFilters[colIndex].length > 0) {
            const cellText = getCellText(row, colIndex);
            if (!activeFilters[colIndex].includes(cellText)) {
              columnMatch = false;
              break;
            }
          }
        }
        row.style.display = (textMatch && columnMatch) ? "" : "none";
      }
      mergeSuiteCellsAdvanced();
    }
    
    function clearFilters() {
      document.getElementById("filterSuiteDetails").value = "";
      activeFilters = {};
      rebuildTableStructure();
      applyFilters();
      mergeSuiteCellsAdvanced();
    }
    
    function openFilterMenu(event, colIndex) {
      event.stopPropagation();
      if (currentFilterMenu) {
        currentFilterMenu.remove();
        currentFilterMenu = null;
      }
      const menu = document.createElement('div');
      menu.className = 'filter-menu';
      
      // Add search input to filter the filter list
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search...';
      searchInput.style.width = '100%';
      searchInput.style.marginBottom = '10px';
      menu.appendChild(searchInput);
      
      // Create a container for the filter options
      const optionsContainer = document.createElement('div');
      
      // Use only visible rows in the current view for filtering options
      const table = document.getElementById("detailsTable");
      const rows = Array.from(table.tBodies[0].rows).filter(row => row.style.display !== "none");
      
      const uniqueValues = new Set();
      for (let row of rows) {
        uniqueValues.add(getCellText(row, colIndex));
      }
      const valuesArray = Array.from(uniqueValues).sort();
      
      valuesArray.forEach(value => {
        const label = document.createElement('label');
        label.className = 'filter-option';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        if (activeFilters[colIndex]) {
          checkbox.checked = activeFilters[colIndex].includes(value);
        } else {
          checkbox.checked = true;
        }
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + value));
        optionsContainer.appendChild(label);
      });
      
      menu.appendChild(optionsContainer);
      
      // Add search functionality to filter options
      searchInput.addEventListener('keyup', function() {
        const filterValue = searchInput.value.toLowerCase();
        const optionLabels = optionsContainer.querySelectorAll('.filter-option');
        optionLabels.forEach(label => {
          if (label.textContent.toLowerCase().includes(filterValue)) {
            label.style.display = '';
          } else {
            label.style.display = 'none';
          }
        });
      });
      
      const uncheckAllBtn = document.createElement('button');
      uncheckAllBtn.textContent = 'Uncheck All';
      uncheckAllBtn.onclick = function(e) {
        e.stopPropagation();
        const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(chk => chk.checked = false);
      };
      menu.appendChild(uncheckAllBtn);
      const applyBtn = document.createElement('button');
      applyBtn.textContent = 'Apply';
      applyBtn.onclick = function(e) {
        e.stopPropagation();
        applyFilterMenu(colIndex, menu);
      };
      menu.appendChild(applyBtn);
      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'Clear';
      clearBtn.style.marginLeft = '10px';
      clearBtn.onclick = function(e) {
        e.stopPropagation();
        clearFilterMenu(colIndex, menu);
      };
      menu.appendChild(clearBtn);
      document.body.appendChild(menu);
      currentFilterMenu = menu;
      const rect = event.target.getBoundingClientRect();
      menu.style.top = rect.bottom + window.scrollY + 'px';
      menu.style.left = rect.left + window.scrollX + 'px';
      menu.onclick = function(e) {
        e.stopPropagation();
      };
      document.addEventListener('click', closeCurrentFilterMenu);
    }
    
    function applyFilterMenu(colIndex, menu) {
      const checkboxes = menu.querySelectorAll('input[type="checkbox"]');
      const selectedValues = [];
      checkboxes.forEach(chk => {
        if (chk.checked) {
          selectedValues.push(chk.value);
        }
      });
      activeFilters[colIndex] = selectedValues;
      applyFilters();
      menu.remove();
      currentFilterMenu = null;
      document.removeEventListener('click', closeCurrentFilterMenu);
    }
    
    function clearFilterMenu(colIndex, menu) {
      activeFilters[colIndex] = [];
      applyFilters();
      menu.remove();
      currentFilterMenu = null;
      document.removeEventListener('click', closeCurrentFilterMenu);
    }
    
    function closeCurrentFilterMenu() {
      if (currentFilterMenu) {
        currentFilterMenu.remove();
        currentFilterMenu = null;
        document.removeEventListener('click', closeCurrentFilterMenu);
      }
    }
    
    function showAllTestDetails() {
      clearFilters();
      openTab(null, 'TestDetails');
    }
    
    function filterByStatus(status) {
      document.getElementById("filterSuiteDetails").value = "";
      activeFilters = {};
      rebuildTableStructure();
      activeFilters[3] = [status];
      applyFilters();
      openTab(null, 'TestDetails');
    }
    
    function filterByErrorTests() {
      rebuildTableStructure();
      const table = document.getElementById("detailsTable");
      const rows = table.tBodies[0].rows;
      for (let row of rows) {
        const cellText = getCellText(row, 4);
        row.style.display = cellText !== "No Error" ? "" : "none";
      }
      mergeSuiteCellsAdvanced();
      openTab(null, 'TestDetails');
    }
    
    function filterByFailedSuites() {
      rebuildTableStructure();
      const table = document.getElementById("detailsTable");
      const rows = table.tBodies[0].rows;
      const failedSuites = new Set();
      for (let row of rows) {
        if (row.dataset.status === 'FAILED' && row.dataset.suite) {
          failedSuites.add(row.dataset.suite);
        }
      }
      for (let row of rows) {
        const suiteName = row.dataset.suite;
        row.style.display = failedSuites.has(suiteName) ? "" : "none";
      }
      mergeSuiteCellsAdvanced();
      openTab(null, 'TestDetails');
    }
    
    function exportTableToExcel(tableID, filename = '') {
      var dataType = 'application/vnd.ms-excel';
      var tableSelect = document.getElementById(tableID);
      var clonedTable = tableSelect.cloneNode(true);
      clonedTable.querySelectorAll("thead tr").forEach(row => {
        row.deleteCell(-1);
      });
      clonedTable.querySelectorAll("tbody tr").forEach(row => {
        row.deleteCell(-1);
      });
      clonedTable.querySelectorAll("th .filter-icon").forEach(el => {
        el.remove();
      });
      var style = \`
      <style>
        table { border-collapse: collapse; width: 100%; }
        table, th, td { border: 1px solid #000; }
        th, td { padding: 8px; text-align: center; }
        th { background-color: #4CAF50; color: white; }
        td.passed { background-color: #d4edda; color: #155724; }
        td.failed { background-color: #f8d7da; color: #721c24; }
      </style>\`;
      var htmlContent = \`
<html>
<head>
<meta charset="UTF-8">
\${style}
</head>
<body>
\${clonedTable.outerHTML}
</body>
</html>\`;
      var downloadLink = document.createElement("a");
      document.body.appendChild(downloadLink);
      filename = filename ? filename + '.xls' : 'excel_data.xls';
      if (navigator.msSaveOrOpenBlob) {
        var blob = new Blob(['\\ufeff', htmlContent], { type: dataType });
        navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        downloadLink.href = 'data:' + dataType + ', ' + encodeURIComponent(htmlContent);
        downloadLink.download = filename;
        downloadLink.click();
      }
      document.body.removeChild(downloadLink);
    }
    
    function openModal(src) {
      const modal = document.getElementById("myModal");
      const modalImg = document.getElementById("modalImage");
      modal.style.display = "block";
      modalImg.src = src;
    }
    
    function closeModal() {
      document.getElementById("myModal").style.display = "none";
    }
    
    function openChartModal(type) {
      document.getElementById("chartModal").style.display = "block";
      const modalCanvas = document.getElementById("chartModalCanvas");
      const ctx = modalCanvas.getContext('2d');
      if (modalChartInstance) {
        modalChartInstance.destroy();
      }
      if (type === 'overall') {
        modalChartInstance = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Passed', 'Failed'],
            datasets: [{
              data: [${summary.passed}, ${summary.failed}],
              backgroundColor: ['#28a745', '#dc3545']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              datalabels: {
                color: '#fff',
                font: { weight: 'bold', size: 16 },
                formatter: function(value, context) {
                  let sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  let percentage = sum ? Math.round((value / sum) * 100) + '%' : '0%';
                  return percentage;
                }
              },
              title: { display: true, text: 'Overall Execution Status' },
              legend: { position: 'bottom' }
            }
          },
          plugins: [ChartDataLabels]
        });
      } else if (type === 'suite') {
        const suiteNames = Object.keys(suiteStats);
        const passPercentages = suiteNames.map(suite => {
          const stats = suiteStats[suite];
          return stats.total > 0 ? parseFloat((stats.passed / stats.total * 100).toFixed(2)) : 0;
        });
        const failPercentages = suiteNames.map(suite => {
          const stats = suiteStats[suite];
          return stats.total > 0 ? parseFloat((stats.failed / stats.total * 100).toFixed(2)) : 0;
        });
        modalChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: suiteNames,
            datasets: [
              { label: 'Passed %', data: passPercentages, backgroundColor: '#28a745' },
              { label: 'Failed %', data: failPercentages, backgroundColor: '#dc3545' }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Suite Level Pass/Fail Percentage' },
              legend: { position: 'bottom' },
              tooltip: {
                callbacks: {
                  title: function(context) {
                    return suiteNames[context[0].dataIndex];
                  }
                }
              }
            },
            scales: {
              x: { stacked: true, ticks: { font: { size: 12 } } },
              y: { stacked: true, beginAtZero: true, max: 100, ticks: { callback: function(value) { return value + '%'; } } }
            }
          }
        });
      }
    }
    
    function closeChartModal() {
      document.getElementById("chartModal").style.display = "none";
    }
    
    function toggleStack(elem) {
      const stackTraceDiv = elem.nextElementSibling;
      stackTraceDiv.style.display = stackTraceDiv.style.display === "none" ? "block" : "none";
    }
    
    document.addEventListener("DOMContentLoaded", function() {
      const tbody = document.getElementById("detailsTable").tBodies[0];
      originalTableBody = tbody.innerHTML;
      openTab(null, 'Dashboard');
      mergeSuiteCellsAdvanced();
    });
    
    function drawChart() {
      const canvas = document.getElementById('statusChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (statusChartInstance) {
        statusChartInstance.destroy();
      }
      statusChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Passed', 'Failed'],
          datasets: [{
            data: [${summary.passed}, ${summary.failed}],
            backgroundColor: ['#28a745', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 1,
          plugins: {
            datalabels: {
              color: '#fff',
              font: { weight: 'bold', size: 16 },
              formatter: function(value, context) {
                let sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                let percentage = sum ? Math.round((value / sum) * 100) + '%' : '0%';
                return percentage;
              }
            },
            title: { display: true, text: 'Overall Execution Status' },
            legend: { position: 'bottom' }
          }
        },
        plugins: [ChartDataLabels]
      });
    }
    
    function drawSuiteChart() {
      const canvas = document.getElementById('suiteChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (suiteChartInstance) {
        suiteChartInstance.destroy();
      }
      
      const MAX_SUITES_DISPLAYED = 10;
      const suiteNamesAll = Object.keys(suiteStats);
      let suiteNames = suiteNamesAll;
      let passPercentagesAll = suiteNamesAll.map(suite => {
        const stats = suiteStats[suite];
        return stats.total > 0 ? parseFloat((stats.passed / stats.total * 100).toFixed(2)) : 0;
      });
      let failPercentagesAll = suiteNamesAll.map(suite => {
        const stats = suiteStats[suite];
        return stats.total > 0 ? parseFloat((stats.failed / stats.total * 100).toFixed(2)) : 0;
      });
      
      if (suiteNamesAll.length > MAX_SUITES_DISPLAYED) {
          suiteNames = suiteNamesAll.slice(0, MAX_SUITES_DISPLAYED);
          passPercentagesAll = passPercentagesAll.slice(0, MAX_SUITES_DISPLAYED);
          failPercentagesAll = failPercentagesAll.slice(0, MAX_SUITES_DISPLAYED);
      }
      
      const maxLabelLength = 10;
      const truncatedNames = suiteNames.map(name => name.length > maxLabelLength ? name.slice(0, maxLabelLength) + '...' : name);
      const fontSize = suiteNames.length > 10 ? 10 : 12;
      
      suiteChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: truncatedNames,
          datasets: [
            { label: 'Passed %', data: passPercentagesAll, backgroundColor: '#28a745' },
            { label: 'Failed %', data: failPercentagesAll, backgroundColor: '#dc3545' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Suite Level Pass/Fail Percentage' },
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                title: function(context) {
                  return suiteNames[context[0].dataIndex];
                }
              }
            }
          },
          scales: {
            x: { stacked: true, ticks: { font: { size: fontSize } } },
            y: { stacked: true, beginAtZero: true, max: 100, ticks: { callback: function(value) { return value + '%'; } } }
          }
        }
      });
    }
  </script>
</body>
</html>
    `;
    fs.writeFileSync(this.outputFilePath, htmlContent, 'utf8');
    console.log(`HTML report successfully written to ${this.outputFilePath}`);
  }

  calculateSummaryStats() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(test => test.status === 'PASSED').length;
    const failed = this.testResults.filter(test => test.status === 'FAILED').length;
    return { total, passed, failed };
  }
}
