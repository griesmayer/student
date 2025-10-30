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

async function addStudent(name, course) {
  const statusEl = document.getElementById("status");
  try {
    const res = await fetch("/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, course }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchStudents();
    statusEl.textContent = "Student added.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error while added a student: ${err.message}`;
  }
}

async function addClick() {
    const nameInput   = document.getElementById("student-name");
    const name = nameInput.value.trim();
    const courseInput = document.getElementById("student-course");
    const course = courseInput.value.trim();
    const button = document.getElementById("add-btn");
    const statusEl = document.getElementById("status");

    if (!name || !course) {
      statusEl.textContent = "Name and course required.";
      return;
    }

    button.disabled = true;
    await addStudent(name, course);
    button.disabled = false;

    nameInput.value = "";
    courseInput.value = "";
    nameInput.focus();
}

// When page is loaded the fetchStudents is called
window.addEventListener("DOMContentLoaded", fetchStudents);