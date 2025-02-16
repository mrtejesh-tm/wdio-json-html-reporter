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
						// If metadata is available and not yet set, use it.
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
		// Use metadata if available, otherwise set default values
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
    /* Table Styles (in the browser) */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      background: #fff; 
      margin-bottom: 20px; 
    }
    th, td { 
      border: 1px solid #bdc3c7; 
      padding: 10px; 
      text-align: center; 
    }
    th { 
      background-color: #2980b9; 
      color: #fff; 
      cursor: pointer; 
    }
    /* We highlight every even row in the browser for clarity. 
       Note: This style won't be added to the EXPORTED table 
       to prevent color bleeding in Excel. */
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
    /* Filter styles */
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
    /* Centered Chart Container */
    .chart-container {
      width: 80px;
      height: 80px;
      margin: 0 auto;
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
    <button class="tablinks active" onclick="openTab(event, 'Dashboard')">Dashboard</button>
    <button class="tablinks" onclick="openTab(event, 'TestDetails')">Test Details</button>
  </div>
  <div class="container">
    <!-- Dashboard Tab -->
    <div id="Dashboard" class="tabcontent" style="display: block;">
      <div class="cards">
        <div class="card" onclick="navigateToTab('TestDetails')" title="Click to view Test Details">
          <h2>Total Tests</h2>
          <p>${summary.total}</p>
        </div>
        <div class="card" onclick="navigateToTab('TestDetails')" title="Click to view Test Details">
          <h2>Passed</h2>
          <p>${summary.passed}</p>
        </div>
        <div class="card" onclick="navigateToTab('TestDetails')" title="Click to view Test Details">
          <h2>Failed</h2>
          <p>${summary.failed}</p>
        </div>
      </div>
      <!-- Centered and fixed size pie chart -->
      <div class="chart-container">
        <canvas id="statusChart"></canvas>
      </div>
    </div>
    
    <!-- Test Details Tab -->
    <div id="TestDetails" class="tabcontent">
      <div class="filter-group">
        <input type="text" id="filterSuiteDetails" placeholder="Filter by Suite Name..." onkeyup="filterDetailsTable()">
        <input type="text" id="filterTestDetails" placeholder="Filter by Test Name..." onkeyup="filterDetailsTable()">
        <!-- Clear Filters Button -->
        <button onclick="clearFilters()" style="margin-left: 10px;">Clear Filters</button>
      </div>
      <!-- Export Button -->
      <button onclick="exportTableToExcel('detailsTable', 'TestDetailsReport')" style="margin-bottom: 10px;">Export to Excel</button>
      <table id="detailsTable">
        <thead>
          <tr>
            <th onclick="sortTable('detailsTable', 0, this)">Timestamp <span class="sort-icon"></span></th>
            <th onclick="sortTable('detailsTable', 1, this)">Suite Name <span class="sort-icon"></span></th>
            <th onclick="sortTable('detailsTable', 2, this)">Test Name <span class="sort-icon"></span></th>
            <th onclick="sortTable('detailsTable', 3, this)">Status <span class="sort-icon"></span></th>
            <th onclick="sortTable('detailsTable', 4, this)">Error <span class="sort-icon"></span></th>
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
                <td>${test.error || ''}</td>
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
    // Tab functionality
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
      evt.currentTarget.classList.add("active");
      if(tabName === 'Dashboard'){
        drawChart();
      }
    }
    
    // Navigate to a specific tab by simulating a click
    function navigateToTab(tabId) {
      const btn = document.querySelector("button[onclick*='" + tabId + "']");
      if(btn) {
        openTab({ currentTarget: btn }, tabId);
      }
    }
    
    // Draw pie chart for test status distribution using Chart.js
    function drawChart() {
      const ctx = document.getElementById('statusChart').getContext('2d');
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
    
    // Sorting for tables
    let sortDirections = {};
    function sortTable(tableId, colIndex, headerElem) {
      // Toggle sort direction
      sortDirections[tableId + colIndex] = !sortDirections[tableId + colIndex];
      const table = document.getElementById(tableId);
      
      // Clear any existing sort icons
      const ths = table.querySelectorAll("th");
      ths.forEach(th => {
        const icon = th.querySelector(".sort-icon");
        if(icon) icon.textContent = "";
      });
      
      // Set the new icon
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
    
    // Filtering for Test Details
    function filterDetailsTable() {
      const suiteFilter = document.getElementById("filterSuiteDetails").value.toUpperCase();
      const testFilter = document.getElementById("filterTestDetails").value.toUpperCase();
      const table = document.getElementById("detailsTable");
      const rows = table.tBodies[0].rows;
      for (let row of rows) {
        const suiteText = row.cells[1].textContent.toUpperCase();
        const testText = row.cells[2].textContent.toUpperCase();
        row.style.display = (suiteText.indexOf(suiteFilter) > -1 && testText.indexOf(testFilter) > -1) ? "" : "none";
      }
    }
    
    // Clear Filters
    function clearFilters() {
      document.getElementById("filterSuiteDetails").value = "";
      document.getElementById("filterTestDetails").value = "";
      filterDetailsTable();
    }
    
    // Export Test Details table to an Excel file with full HTML formatting
    // but omit the screenshot column from the Excel output.
    function exportTableToExcel(tableID, filename = ''){
      // IMPORTANT: This approach is actually exporting HTML as .xls,
      // which will trigger a mismatch warning in modern Excel.
      // If you want a "real" XLSX file, consider using a library like ExcelJS or SheetJS.
      
      const dataType = 'application/vnd.ms-excel';
      const originalTable = document.getElementById(tableID);
      
      // Clone the table so we can remove the screenshot column (last column) only in the exported version
      const tableClone = originalTable.cloneNode(true);
      
      // Remove screenshot column from the thead
      const theadRow = tableClone.querySelector('thead tr');
      if(theadRow && theadRow.cells.length > 5) {
        theadRow.deleteCell(5); // index 5 is the screenshot column
      }
      
      // Remove screenshot column from each row in the tbody
      const bodyRows = tableClone.querySelectorAll('tbody tr');
      bodyRows.forEach(row => {
        if(row.cells.length > 5) {
          row.deleteCell(5);
        }
      });
      
      let tableHTML = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
                      'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
                      'xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">';
      tableHTML += '<style>';
      tableHTML += 'table {width: 100%; border-collapse: collapse; background: #fff; margin-bottom: 20px;}';
      tableHTML += 'th, td {border: 1px solid #bdc3c7; padding: 10px; text-align: center;}';
      tableHTML += 'th {background-color: #2980b9; color: #fff;}';
      tableHTML += 'tr:nth-child(even) {background-color: #ecf0f1;}';
      tableHTML += '.passed { background-color: #d4edda !important; }';
      tableHTML += '.failed { background-color: #f8d7da !important; }';
      tableHTML += '</style></head><body>';
      tableHTML += tableClone.outerHTML;
      tableHTML += '</body></html>';
      
      // Use .xls extension (will cause mismatch warning) or rename to .html
      filename = filename ? filename + '.xls' : 'excel_data.xls';
      
      const blob = new Blob([tableHTML], { type: dataType });
      
      // For IE/Edge
      if(navigator.msSaveOrOpenBlob){
        navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        // Other browsers
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
    
    // Modal for image expansion
    function openModal(src) {
      const modal = document.getElementById("myModal");
      const modalImg = document.getElementById("modalImage");
      modal.style.display = "block";
      modalImg.src = src;
    }
    
    function closeModal() {
      document.getElementById("myModal").style.display = "none";
    }
    
    document.addEventListener("DOMContentLoaded", function() {
      // Initialize by showing the Dashboard tab and drawing the chart
      document.querySelector(".tablinks.active").click();
    });
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
