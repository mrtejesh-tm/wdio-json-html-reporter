import fs from 'fs';
import path from 'path';

export default class HTMLReportGenerator {
  constructor(outputFilePath) {
    this.outputFilePath = outputFilePath;
    this.testResults = [];
    this.metadata = null;
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
    // Removed errorCount card from dashboard; however, we compute unique errors for the table below.
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

    // Compute Unique Errors: a mapping from error message to occurrence count.
    const uniqueErrors = {};
    this.testResults.forEach(test => {
      if (test.error) {
        const errMsg = test.error;
        uniqueErrors[errMsg] = (uniqueErrors[errMsg] || 0) + 1;
      }
    });
    const uniqueErrorsRows = Object.keys(uniqueErrors).map(errMsg => {
      return `<tr><td>${errMsg}</td><td>${uniqueErrors[errMsg]}</td></tr>`;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>UI Test Execution Report</title>
  <style>
    /* Global Styles */
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      margin: 0; 
      padding: 0; 
      background-color: #f2f2f2; 
    }
    .header { 
      background-color: #2c3e50; 
      color: #ecf0f1; 
      padding: 20px; 
      text-align: center; 
    }
    .execution-subheader {
      background-color: #34495e;
      padding: 10px;
      font-size: 0.9em;
      text-align: center;
      color: #ecf0f1;
      margin-top: 10px;
    }
    .nav { 
      display: flex; 
      justify-content: center; 
      background-color: #34495e; 
    }
    .nav button { 
      background: none; 
      border: none; 
      color: #ecf0f1; 
      padding: 15px 30px; 
      font-size: 1em; 
      cursor: pointer; 
      transition: background 0.3s; 
    }
    .nav button:hover, 
    .nav button.active { 
      background-color: #1abc9c; 
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
    /* Cards Groups */
    .cards-group {
      margin-bottom: 30px;
    }
    .cards-group h2 {
      text-align: center;
      margin-bottom: 10px;
      color: #2c3e50;
    }
    /* Dashboard Cards */
    .cards {
      display: flex; 
      justify-content: center; 
      flex-wrap: wrap;
    }
    .card { 
      background: #fff; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      padding: 15px; 
      margin: 10px; 
      flex: 1 1 150px; 
      text-align: center; 
      cursor: pointer; 
      transition: transform 0.2s ease-in-out;
    }
    .card:hover { 
      transform: scale(1.02);
    }
    .card h3 { 
      margin: 0 0 8px 0; 
      font-size: 1em; 
      color: #7f8c8d; 
    }
    .card p { 
      margin: 0; 
      font-size: 1.5em; 
      color: #2c3e50; 
    }
    /* Chart Containers: arranged side by side */
    .charts-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .chart-container {
      width: 400px;
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .expand-btn {
      margin-top: 10px;
      padding: 5px 10px;
      font-size: 0.9em;
      cursor: pointer;
      border: none;
      background-color: #1abc9c;
      color: #fff;
      border-radius: 4px;
      transition: background 0.3s;
    }
    .expand-btn:hover {
      background-color: #16a085;
    }
    /* Unique Errors Table */
    .unique-errors {
      margin-top: 30px;
    }
    .unique-errors h2 {
      text-align: center;
      color: #2c3e50;
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
    /* Table Styles for Test Details */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      background: #fff; 
      margin-bottom: 20px; 
    }
    th, td { 
      border: 1px solid #bdc3c7; 
      padding: 10px; 
      min-width: 100px; 
      text-align: center; 
      word-break: break-word;
    }
    th { 
      background-color: #2980b9; 
      color: #fff; 
      position: relative;
    }
    tr:nth-child(even) { 
      background-color: #ecf0f1; 
    }
    .passed { 
      background-color: #d4edda !important; 
    }
    .failed { 
      background-color: #f8d7da !important; 
    }
    .filter-icon {
      margin-left: 5px;
      cursor: pointer;
      font-size: 0.8em;
      color: #ecf0f1;
    }
    .filter-menu {
      position: absolute;
      background: #fff;
      border: 1px solid #ccc;
      padding: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    .filter-menu label {
      display: block;
      margin: 5px 0;
    }
    .filter-menu button {
      margin-top: 10px;
    }
    .filter-group { 
      margin-bottom: 15px; 
    }
    .filter-group input { 
      padding: 8px; 
      width: 200px; 
      margin-right: 10px; 
      border: 1px solid #ccc; 
      border-radius: 4px; 
    }
    .thumbnail { 
      max-width: 100px; 
      cursor: pointer; 
      transition: 0.3s; 
    }
    .thumbnail:hover { 
      opacity: 0.8; 
    }
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
    .modal-content, .chart-modal-content {
      margin: auto; 
      display: block; 
      max-width: 90%; 
      max-height: 90%;
      position: relative;
    }
    .close, .chart-close {
      position: absolute; 
      top: 20px; 
      right: 30px; 
      color: #fff; 
      font-size: 40px; 
      font-weight: bold; 
      cursor: pointer; 
    }
    @media screen and (max-width: 600px) {
      .nav { 
        flex-direction: column; 
      }
      .filter-group input { 
        width: 100%; 
        margin-bottom: 10px; 
      }
      .chart-container {
        width: 100%;
        height: auto;
      }
      .charts-row {
        flex-direction: column;
      }
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
  <!-- Load Chart.js and the datalabels plugin -->
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
      <!-- Charts Row: Both charts side by side -->
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
        <button onclick="clearFilters()" style="margin-left: 10px;">Clear Filters</button>
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
                screenshotHTML = `<img src="${dataUrl}" class="thumbnail" alt="Screenshot for ${test.testName}" onclick="openModal(this.src)">`;
              }
            }
            return `<tr data-suite="${test.suiteName || ''}" data-test-name="${test.testName || ''}" data-status="${test.status || ''}">
                <td>${test.timestamp || ''}</td>
                <td class="suite-cell">${test.suiteName || ''}</td>
                <td>${test.testName || ''}</td>
                <td class="${test.status === 'PASSED' ? 'passed' : test.status === 'FAILED' ? 'failed' : ''}">${test.status || ''}</td>
                <td class="error-cell">${
                  test.error 
                    ? `<div class="error-message" onclick="toggleStack(this)">${test.error}</div>
                       <div class="stack-trace" style="display: none;">${test.stack || ''}</div>` 
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
            let cellText;
            if(Number(colIndex) === 1) {
              cellText = row.dataset.suite || "";
            } else if(Number(colIndex) === 2) {
              cellText = row.dataset.testName || "";
            } else if(Number(colIndex) === 3) {
              cellText = row.dataset.status || "";
            } else if(Number(colIndex) === 4) {
              const errorCell = row.cells[colIndex];
              const errorMessageDiv = errorCell ? errorCell.querySelector('.error-message') : null;
              cellText = errorMessageDiv ? errorMessageDiv.textContent.trim() : "No Error";
            } else {
              cellText = row.cells[colIndex] ? row.cells[colIndex].textContent.trim() : "";
            }
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
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = '<table><tbody>' + originalTableBody + '</tbody></table>';
      const rows = tempDiv.querySelectorAll('tbody tr');
      const uniqueValues = new Set();
      for (let row of rows) {
        let cellText;
        if (Number(colIndex) === 1) {
          cellText = row.dataset.suite || "";
        } else if(Number(colIndex) === 2) {
          cellText = row.dataset.testName || "";
        } else if(Number(colIndex) === 3) {
          cellText = row.dataset.status || "";
        } else if(Number(colIndex) === 4) {
          const errorCell = row.cells[colIndex];
          const errorMessageDiv = errorCell ? errorCell.querySelector('.error-message') : null;
          cellText = errorMessageDiv ? errorMessageDiv.textContent.trim() : "No Error";
        } else {
          cellText = row.cells[colIndex] ? row.cells[colIndex].textContent.trim() : "";
        }
        uniqueValues.add(cellText);
      }
      const valuesArray = Array.from(uniqueValues).sort();
      valuesArray.forEach(value => {
        const label = document.createElement('label');
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
        menu.appendChild(label);
      });
      const uncheckAllBtn = document.createElement('button');
      uncheckAllBtn.textContent = 'Uncheck All';
      uncheckAllBtn.onclick = function(e) {
        e.stopPropagation();
        const checkboxes = menu.querySelectorAll('input[type="checkbox"]');
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
        const errorCell = row.cells[4];
        if (errorCell && errorCell.textContent.trim() !== "") {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
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
            plugins: {
              datalabels: {
                color: '#fff',
                font: {
                  weight: 'bold',
                  size: 16
                },
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
            plugins: {
              title: { display: true, text: 'Suite Level Pass/Fail Percentage' },
              legend: { position: 'bottom' }
            },
            scales: {
              x: { stacked: true },
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
          responsive: false,
          plugins: {
            datalabels: {
              color: '#fff',
              font: {
                weight: 'bold',
                size: 16
              },
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
      const suiteNames = Object.keys(suiteStats);
      const passPercentages = suiteNames.map(suite => {
        const stats = suiteStats[suite];
        return stats.total > 0 ? parseFloat((stats.passed / stats.total * 100).toFixed(2)) : 0;
      });
      const failPercentages = suiteNames.map(suite => {
        const stats = suiteStats[suite];
        return stats.total > 0 ? parseFloat((stats.failed / stats.total * 100).toFixed(2)) : 0;
      });
      suiteChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: suiteNames,
          datasets: [
            { label: 'Passed %', data: passPercentages, backgroundColor: '#28a745' },
            { label: 'Failed %', data: failPercentages, backgroundColor: '#dc3545' }
          ]
        },
        options: {
          responsive: false,
          plugins: {
            title: { display: true, text: 'Suite Level Pass/Fail Percentage' },
            legend: { position: 'bottom' }
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true, max: 100, ticks: { callback: function(value) { return value + '%'; } } }
          }
        }
      });
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
