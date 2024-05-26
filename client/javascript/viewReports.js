const year = document.getElementById("year");

const submitButtonFines = document.getElementById("submitButtonFines");

const exportPdfButton = document.getElementById("exportPdf");

const exportCSVButton = document.getElementById("exportCsv");

const logo = document.getElementById("logo");

const logout = document.getElementById("logout");

logo.addEventListener("click", () => {
  window.location.href = "/";
});

logout.addEventListener("click", function () {
  //get request to /clear
  fetch("/clear")
    .then((res) => res.text())
    .then((data) => {
      console.log(data);
      window.location.href = "/";
    });
});

const dataToExportAsCSV = {};

// Function to convert array of objects to CSV format
function arrayToCSV(dataArray) {
  const csvRows = [];
  const headers = Object.keys(dataArray[0]);
  csvRows.push(headers.join(",")); // Add headers row

  for (const row of dataArray) {
    const values = headers.map((header) => row[header]);
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

// Function to download CSV file
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to handle CSV export for all data sections
function exportAllDataToCSV() {
  let csvContent = "";

  for (const section in dataToExportAsCSV) {
    csvContent += `Section: ${section}\n`;
    csvContent += arrayToCSV(dataToExportAsCSV[section]);
    csvContent += "\n\n";
  }

  downloadCSV(csvContent, "data.csv");
}

exportCSVButton.addEventListener("click", exportAllDataToCSV);

exportPdfButton.addEventListener("click", () => {
  // Export the issues chart as an image
  const canvasIssues = document.getElementById("chartIssues");
  const canvasImageIssues = canvasIssues.toDataURL("image/png", 1.0);

  const canvasAllFines = document.getElementById("chartAllFines");
  const canvasImageAllFines = canvasAllFines.toDataURL("image/png", 1.0);

  const canvasVisitors = document.getElementById("chartVisitors");
  const canvasImageVisitors = canvasVisitors.toDataURL("image/png", 1.0);

  const canvasFinesForUser = document.getElementById("chartFinesForUser");
  let canvasImageFinesForUser;

  //check if canvasfinesforuser is hidden, if its not hidden, export it as an image
  if (canvasFinesForUser.style.display !== "none") {
    canvasImageFinesForUser = canvasFinesForUser.toDataURL("image/png", 1.0);
  }

  // Generate the PDF using jsPDF
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape");
  pdf.addImage(canvasImageIssues, "PNG", 10, 10, 280, 150);
  pdf.addPage();
  pdf.addImage(canvasImageAllFines, "PNG", 10, 10, 280, 150);
  pdf.addPage();
  pdf.addImage(canvasImageVisitors, "PNG", 10, 10, 280, 150);

  if (canvasFinesForUser.style.display !== "none") {
    pdf.addPage();
    pdf.addImage(canvasImageFinesForUser, "PNG", 10, 10, 280, 150);
  }

  pdf.save("chart.pdf");
});

submitButtonFines.addEventListener("click", () => {
  const userCode = document.getElementById("userCode").value;
  const errorMessage = document.getElementById("errorFines");

  errorMessage.style.display = "none";

  console.log("userCode", userCode);

  if (userCode === "") {
    document.getElementById("chartFinesForUser").style.display = "none";

    errorMessage.style.display = "block";
    errorMessage.textContent = "Please enter a user code";
    return;
  }

  //Show canvas element
  document.getElementById("chartFinesForUser").style.display = "block";

  //Show loader
  document.getElementById("loaderSubmit").style.display = "block";

  fetch(
    `/api/reports/getFinesReport/${
      document.getElementById("year").value
    }/${userCode}`
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      //hide loader
      document.getElementById("loaderSubmit").style.display = "none";

      console.log(data);

      if (data.error == "User not found") {
        document.getElementById("chartFinesForUser").style.display = "none";

        errorMessage.style.display = "block";
        errorMessage.textContent = "User not found";
      } else if (data.error) {
        document.getElementById("chartFinesForUser").style.display = "none";

        errorMessage.style.display = "block";
        errorMessage.textContent = "An error occurred. Please try again later";
      }

      const ctxUserFines = document
        .getElementById("chartFinesForUser")
        .getContext("2d");

      const finesUserOutstanding = [];
      const finesUserNotOutstanding = [];

      for (let i = 0; i < data.fines.length; i++) {
        finesUserNotOutstanding.push(data.fines[i].notOutstanding);
        finesUserOutstanding.push(data.fines[i].outstanding);
      }

      console.log(finesUserOutstanding);
      console.log(finesUserNotOutstanding);

      new Chart(ctxUserFines, {
        type: "line",
        data: {
          labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          datasets: [
            {
              label: "Total number of unpaid fines for user",
              data: finesUserOutstanding,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              fill: false,
            },
            {
              label: "Total number of paid fines for user",
              data: finesUserOutstanding,
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        },
      });

      const sectionName = `finesForUser ` + `${userCode}`;

      const updatedFinesForUser = data.fines.map((item) => {
        const { _id, ...rest } = item;
        return { month: _id, ...rest };
      });

      dataToExportAsCSV[sectionName] = updatedFinesForUser;

      console.log("dataToExportAsCSV", dataToExportAsCSV);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
});

year.addEventListener("change", () => {
  var ctxallFinesChart = Chart.getChart("chartAllFines");
  var ctxIssuesChart = Chart.getChart("chartIssues");
  var ctxVisitorsChart = Chart.getChart("chartVisitors");

  //Destroy existing chart
  if (ctxallFinesChart) {
    console.log("All fines chart EXISTS");
    ctxallFinesChart.destroy();
  }
  if (ctxIssuesChart) {
    ctxIssuesChart.destroy();
  }
  if (ctxVisitorsChart) {
    ctxVisitorsChart.destroy();
  }

  fetchReports();
});

const fetchReports = async () => {
  //Hide all canvas elements when loading
  document.getElementById("chartAllFines").style.display = "none";
  document.getElementById("chartIssues").style.display = "none";
  document.getElementById("chartVisitors").style.display = "none";

  //Show loaders
  document.getElementById("loaderAllFines").style.display = "block";
  document.getElementById("loaderIssues").style.display = "block";
  document.getElementById("loaderVisitors").style.display = "block";

  await fetch(
    `/api/reports/getIssueVisitorFinesReport/${
      document.getElementById("year").value
    }`
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);

      const updatedFines = data.fines.map((item) => {
        const { _id, ...rest } = item;
        return { month: _id, ...rest };
      });

      const updatedIssues = data.issues.map((item) => {
        const { _id, ...rest } = item;
        return { month: _id, ...rest };
      });

      const updatedVisitors = data.visitors.map((item) => {
        const { _id, ...rest } = item;
        return { month: _id, ...rest };
      });

      dataToExportAsCSV.fines = updatedFines;
      dataToExportAsCSV.issues = updatedIssues;
      dataToExportAsCSV.visitors = updatedVisitors;

      console.log("dataToExportAsCSV", dataToExportAsCSV);

      //Hide loaders
      document.getElementById("loaderAllFines").style.display = "none";
      document.getElementById("loaderIssues").style.display = "none";
      document.getElementById("loaderVisitors").style.display = "none";

      //Show canvas elements
      document.getElementById("chartAllFines").style.display = "block";
      document.getElementById("chartIssues").style.display = "block";
      document.getElementById("chartVisitors").style.display = "block";

      const ctxallFines = document
        .getElementById("chartAllFines")
        .getContext("2d");
      const ctxIssues = document.getElementById("chartIssues").getContext("2d");
      const ctxVisitors = document
        .getElementById("chartVisitors")
        .getContext("2d");

      const finesDataOutStanding = [];
      const finesDataNotOutstanding = [];
      const issuesDataCompleted = [];
      const issuesDataNotCompleted = [];
      const visitorData = [];

      for (let i = 0; i < data.fines.length; i++) {
        finesDataNotOutstanding.push(data.fines[i].notOutstanding);
        finesDataOutStanding.push(data.fines[i].outstanding);
      }

      for (let i = 0; i < data.issues.length; i++) {
        issuesDataCompleted.push(data.issues[i].completed);
      }

      for (let i = 0; i < data.issues.length; i++) {
        issuesDataNotCompleted.push(data.issues[i].notCompleted);
      }

      for (let i = 0; i < data.visitors.length; i++) {
        visitorData.push(data.visitors[i].totalVisitors);
      }

      console.log(finesDataOutStanding);
      console.log(finesDataNotOutstanding);
      console.log(issuesDataCompleted);
      console.log(issuesDataNotCompleted);
      console.log(visitorData);

      new Chart(ctxallFines, {
        type: "line",
        data: {
          labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          datasets: [
            {
              label: "Total number of unpaid fines",
              data: finesDataOutStanding,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              fill: false,
            },
            {
              label: "Total number of paid fines",
              data: finesDataNotOutstanding,
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        },
      });

      new Chart(ctxIssues, {
        type: "line",
        data: {
          labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          datasets: [
            {
              label: "Completed Issues",
              data: issuesDataCompleted,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              fill: false,
            },
            {
              label: "Incomplete Issues",
              data: issuesDataNotCompleted,
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        },
      });

      new Chart(ctxVisitors, {
        type: "line",
        data: {
          labels: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          datasets: [
            {
              label: "Total number of visitors",
              data: visitorData,
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              fill: false,
            },
          ],
        },
      });
    })
    .catch((error) => {
      console.log("Error:", error);
    });
};

fetchReports();
