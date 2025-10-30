async function fetchStudents() {
  const statusEl = document.getElementById("status");
  const tbody = document.querySelector("#students-table tbody");

  try {
    // Set the status
    statusEl.textContent = "Load data...";

    // Use the route to get the data
    const res = await fetch("/students");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Get an array of students
    const students = await res.json();

    // Clear the table
    tbody.innerHTML = "";

    // Add rows to the table
    for (const s of students) {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = s.id;

      const tdName = document.createElement("td");
      tdName.textContent = s.name;

      const tdCourse = document.createElement("td");
      tdCourse.textContent = s.course;

      tr.append(tdId, tdName, tdCourse);
      tbody.appendChild(tr);
    }

    statusEl.textContent = `Loaded: ${students.length} students`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error while loading the data.";
  }
}

// When page isloaded the fetchStudents is called
window.addEventListener("DOMContentLoaded", fetchStudents);