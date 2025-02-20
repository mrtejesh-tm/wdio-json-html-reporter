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
    /* Dashboard Cards */
    .cards { 
      display: flex; 
      justify-content: space-around; 
      margin-bottom: 30px; 
      flex-wrap: wrap; 
    }
    .card { 
      background: #fff; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
      padding: 20px; 
      margin: 10px; 
      flex: 1 1 250px; 
      text-align: center; 
      cursor: pointer; 
    }
    .card:hover { 
      opacity: 0.9; 
    }
    .card h2 { 
      margin: 0 0 10px 0; 
      font-size: 1.2em; 
      color: #7f8c8d; 
    }
    .card p { 
      margin: 0; 
      font-size: 2em; 
      color: #2c3e50; 
    }
    /* Center container for pass/fail percentages and chart */
    .percentages-chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .percentages {
      margin-bottom: 60px;
      font-size: 1.1em;
      text-align: center;
      display: flex;
      justify-content: center;
    }
    /* Centered Chart Container */
    .chart-container {
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Table Styles */
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
      cursor: pointer; 
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
    .sort-icon { 
      margin-left: 5px; 
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
    /* Filter styles for text input */
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
    /* Thumbnail and Modal */
    .thumbnail { 
      max-width: 100px; 
      cursor: pointer; 
      transition: 0.3s; 
    }
    .thumbnail:hover { 
      opacity: 0.8; 
    }
    .modal { 
      display: none; 
      position: fixed; 
      z-index: 1000; 
      padding-top: 100px; 
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
      max-height: 80%; 
    }
    .close { 
      position: absolute; 
      top: 50px; 
      right: 50px; 
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
    }
    /* Error cell styles */
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
  </style>
  <!-- Load Chart.js from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="header">
    <h1>UI Test Execution Report</h1>
    <div class="execution-subheader">
      <p>Browser Name: ${metadata.browserName} - Execution Start Time: ${metadata.executionStartTime} - Execution End Time: ${metadata.executionEndTime} - Total Execution Time (minutes): ${metadata.totalTimeInMinutes}</p>
    </div>
  </div>
  <div class="nav">
    <!-- Navigation: Dashboard and Test Details -->
    <button class="tablinks" onclick="openTab(event, 'Dashboard')">Dashboard</button>
    <button class="tablinks" onclick="openTab(event, 'TestDetails')">Test Details</button>
  </div>
  <div class="container">
    <!-- Dashboard Tab -->
    <div id="Dashboard" class="tabcontent" style="display: block;">
      <div class="cards">
        <!-- Total Tests card now navigates to Test Details tab -->
        <div class="card" onclick="showAllTestDetails()" title="Click to view All Tests">
          <h2>Total Tests</h2>
          <p>${summary.total}</p>
        </div>
        <div class="card" onclick="filterByStatus('PASSED')" title="Click to view Passed Tests">
          <h2>Passed</h2>
          <p>${summary.passed}</p>
        </div>
        <div class="card" onclick="filterByStatus('FAILED')" title="Click to view Failed Tests">
          <h2>Failed</h2>
          <p>${summary.failed}</p>
        </div>
      </div>
      
      <!-- Pass/Fail Percentages and Chart -->
      <div class="percentages-chart-container">
        <div class="percentages">
          <span style="margin-right: 20px;">Passed: ${passedPercentage}%</span>
          <span>Failed: ${failedPercentage}%</span>
        </div>
        <div class="chart-container">
          <canvas id="statusChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Test Details Tab -->
    <div id="TestDetails" class="tabcontent">
      <div class="filter-group">
        <input type="text" id="filterSuiteDetails" placeholder="Filter by Suite Name..." onkeyup="applyFilters()">
        <input type="text" id="filterTestDetails" placeholder="Filter by Test Name..." onkeyup="applyFilters()">
        <button onclick="clearFilters()" style="margin-left: 10px;">Clear Filters</button>
      </div>
      <button onclick="exportTableToExcel('detailsTable', 'TestDetailsReport')" style="margin-bottom: 10px;">Export to Excel</button>
      <table id="detailsTable">
        <thead>
          <tr>
            <th onclick="sortTable('detailsTable', 0, this)">Timestamp <span class="sort-icon"></span></th>
            <th onclick="sortTable('detailsTable', 1, this)">
              Suite Name <span class="sort-icon"></span>
              <span class="filter-icon" onclick="openFilterMenu(event, 1)">&#x1F50D;</span>
            </th>
            <th onclick="sortTable('detailsTable', 2, this)">
              Test Name <span class="sort-icon"></span>
              <span class="filter-icon" onclick="openFilterMenu(event, 2)">&#x1F50D;</span>
            </th>
            <th onclick="sortTable('detailsTable', 3, this)">
              Status <span class="sort-icon"></span>
              <span class="filter-icon" onclick="openFilterMenu(event, 3)">&#x1F50D;</span>
            </th>
            <th onclick="sortTable('detailsTable', 4, this)">
              Error <span class="sort-icon"></span>
              <span class="filter-icon" onclick="openFilterMenu(event, 4)">&#x1F50D;</span>
            </th>
            <th>Screenshot</th>
          </tr>
        </thead>
        <tbody>
          ${this.testResults
            .map(test => {
              let screenshotHTML = 'No Screenshot';
              if (test.screenshot) {
                const dataUrl = this.embedScreenshot(test.screenshot);
                if (dataUrl) {
                  screenshotHTML = `<img src="${dataUrl}" class="thumbnail" alt="Screenshot for ${test.testName}" onclick="openModal(this.src)">`;
                }
              }
              return `
              <tr>
                <td>${test.timestamp || ''}</td>
                <td>${test.suiteName && test.suiteName.toLowerCase() === 'suite1' ? '' : test.suiteName || ''}</td>
                <td>${test.testName || ''}</td>
                <td class="${test.status === 'PASSED' ? 'passed' : test.status === 'FAILED' ? 'failed' : ''}">${test.status || ''}</td>
                <td class="error-cell">${test.error ? `<div class="error-message" onclick="toggleStack(this)">${test.error}</div>
                      <div class="stack-trace" style="display: none;">${test.stack || ''}</div>` : ''}</td>
                <td>${screenshotHTML}</td>
              </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Modal for expanded image -->
  <div id="myModal" class="modal">
    <span class="close" onclick="closeModal()">&times;</span>
    <img class="modal-content" id="modalImage">
  </div>
  
  <script>
    // Global variables for filters, sorting and original table order.
    let activeFilters = {}; // e.g., {1: ['SuiteA', 'SuiteB'], 3: ['PASSED']}
    let sortDirections = {};
    let currentFilterMenu = null;
    let originalTableBody = '';

    // Tab functionality accepts null event.
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
      // If Dashboard is visible, delay drawing the chart slightly.
      if (tabName === 'Dashboard'){
        setTimeout(() => {
          drawChart();
        }, 0);
      }
    }
    
    // Sorting for tables.
    function sortTable(tableId, colIndex, headerElem) {
      sortDirections[tableId + colIndex] = !sortDirections[tableId + colIndex];
      const table = document.getElementById(tableId);
      const ths = table.querySelectorAll("th");
      ths.forEach(th => {
        const icon = th.querySelector(".sort-icon");
        if(icon) icon.textContent = "";
      });
      headerElem.querySelector(".sort-icon").textContent = sortDirections[tableId + colIndex] ? "▲" : "▼";
      const tbody = table.tBodies[0];
      const rows = Array.from(tbody.rows);
      rows.sort((a, b) => {
        const x = a.cells[colIndex].textContent.trim().toLowerCase();
        const y = b.cells[colIndex].textContent.trim().toLowerCase();
        if(x < y) return sortDirections[tableId + colIndex] ? -1 : 1;
        if(x > y) return sortDirections[tableId + colIndex] ? 1 : -1;
        return 0;
      });
      rows.forEach(row => tbody.appendChild(row));
    }
    
    // Combined Filtering: text inputs + column dropdown filters.
    function applyFilters() {
      const suiteFilterText = document.getElementById("filterSuiteDetails").value.toUpperCase();
      const testFilterText = document.getElementById("filterTestDetails").value.toUpperCase();
      const table = document.getElementById("detailsTable");
      const rows = table.tBodies[0].rows;
      for (let row of rows) {
        const suiteText = row.cells[1].textContent.toUpperCase();
        const testText = row.cells[2].textContent.toUpperCase();
        let textMatch = (suiteText.indexOf(suiteFilterText) > -1 && testText.indexOf(testFilterText) > -1);
        let columnMatch = true;
        for (let colIndex in activeFilters) {
          if (activeFilters[colIndex] && activeFilters[colIndex].length > 0) {
            let cellText = row.cells[colIndex].textContent.trim();
            if (!activeFilters[colIndex].includes(cellText)) {
              columnMatch = false;
              break;
            }
          }
        }
        row.style.display = (textMatch && columnMatch) ? "" : "none";
      }
    }
    
    // Clear Filters resets text inputs, active filters, sorting and restores original table order.
    function clearFilters() {
      document.getElementById("filterSuiteDetails").value = "";
      document.getElementById("filterTestDetails").value = "";
      activeFilters = {};
      sortDirections = {};
      const icons = document.querySelectorAll("#detailsTable th .sort-icon");
      icons.forEach(icon => icon.textContent = "");
      document.getElementById("detailsTable").tBodies[0].innerHTML = originalTableBody;
      applyFilters();
    }
    
    // Filter menu for column dropdown filtering.
    function openFilterMenu(event, colIndex) {
      event.stopPropagation();
      if (currentFilterMenu) {
        currentFilterMenu.remove();
        currentFilterMenu = null;
      }
      const menu = document.createElement('div');
      menu.className = 'filter-menu';
      const table = document.getElementById('detailsTable');
      const rows = table.tBodies[0].rows;
      const uniqueValues = new Set();
      for (let row of rows) {
        const cellText = row.cells[colIndex].textContent.trim();
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
    
    // Navigation: Total Tests card now resets filters/sorting and navigates to Test Details.
    function showAllTestDetails() {
      clearFilters();
      openTab(null, 'TestDetails');
    }
    
    // Navigation for filtering by status.
    function filterByStatus(status) {
      document.getElementById("filterSuiteDetails").value = "";
      document.getElementById("filterTestDetails").value = "";
      activeFilters = {};
      sortDirections = {};
      const icons = document.querySelectorAll("#detailsTable th .sort-icon");
      icons.forEach(icon => icon.textContent = "");
      document.getElementById("detailsTable").tBodies[0].innerHTML = originalTableBody;
      activeFilters[3] = [status]; // Column index 3 for Status.
      applyFilters();
      openTab(null, 'TestDetails');
    }
    
    // Modal for image expansion.
    function openModal(src) {
      const modal = document.getElementById("myModal");
      const modalImg = document.getElementById("modalImage");
      modal.style.display = "block";
      modalImg.src = src;
    }
    
    function closeModal() {
      document.getElementById("myModal").style.display = "none";
    }
    
    // Toggle display of stack trace.
    function toggleStack(elem) {
      const stackTraceDiv = elem.nextElementSibling;
      if (stackTraceDiv.style.display === "none") {
        stackTraceDiv.style.display = "block";
      } else {
        stackTraceDiv.style.display = "none";
      }
    }
    
    // On DOMContentLoaded, store original table body and set default tab.
    document.addEventListener("DOMContentLoaded", function() {
      const tbody = document.getElementById("detailsTable").tBodies[0];
      originalTableBody = tbody.innerHTML;
      openTab(null, 'Dashboard');
    });
    
    // Draw chart for Dashboard.
    function drawChart() {
      const canvas = document.getElementById('statusChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if(window.statusChartInstance) {
        window.statusChartInstance.destroy();
      }
      window.statusChartInstance = new Chart(ctx, {
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
            legend: { position: 'bottom' }
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
