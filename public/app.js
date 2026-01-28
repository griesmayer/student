let editingId = null;

async function fetchStudents() {
    const statusEl = document.getElementById("status");
    const tbody = document.querySelector("#students-table tbody");

    try {
        statusEl.textContent = "Lade Daten…";
        const res = await fetch("/students");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const students = await res.json();

        tbody.innerHTML = "";
        for (const s of students) {
            const tr = document.createElement("tr");

            const tdId = document.createElement("td");
            tdId.textContent = s.id;

            const tdName = document.createElement("td");
            const tdCourse = document.createElement("td");
            const tdActions = document.createElement("td");

            if (editingId === s.id) {
                // Edit mode
                const nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.value = s.name;
                nameInput.className = "input-sm";

                const courseInput = document.createElement("input");
                courseInput.type = "text";
                courseInput.value = s.course;
                courseInput.className = "input-sm";

                tdName.appendChild(nameInput);
                tdCourse.appendChild(courseInput);

                const saveBtn = document.createElement("button");
                saveBtn.textContent = "Speichern";
                saveBtn.className = "save-btn";

                saveBtn.onclick = async () => {
                    if (!nameInput.value.trim() || !courseInput.value.trim()) {
                        document.getElementById("status").textContent =
                            "Name und Kurs erforderlich.";
                        return;
                    }
                    try {
                        await updateStudent(s.id, {
                            name: nameInput.value.trim(),
                            course: courseInput.value.trim(),
                        });
                        editingId = null;
                        await fetchStudents();
                        statusEl.textContent = "Änderungen gespeichert.";
                    } catch (e) {
                        statusEl.textContent = e.message;
                    }
                };

                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Abbrechen";
                cancelBtn.className = "cancel-btn";
                cancelBtn.onclick = async () => {
                    editingId = null;
                    await fetchStudents();
                };

                tdActions.append(saveBtn, " ", cancelBtn);
            } else {
                // View mode
                tdName.textContent = s.name;
                tdCourse.textContent = s.course;

                const editBtn = document.createElement("button");
                editBtn.textContent = "Bearbeiten";
                editBtn.className = "edit-btn";
                editBtn.onclick = () => {
                    editingId = s.id;
                    fetchStudents();
                };

                const delBtn = document.createElement("button");
                delBtn.textContent = "Löschen";
                delBtn.className = "delete-btn";
                delBtn.onclick = async () => {
                    // 1. Synchroner Blocker (Confirm) - Das Browser-Warning ignorieren wir hier bewusst
                    if (!confirm(`Student ${s.name} wirklich löschen?`)) {
                        return;
                    }

                    try {
                        // Optionale UX: Button während des Vorgangs sperren
                        delBtn.disabled = true;

                        // 2. Erste Abhängigkeit: Löschen abwarten
                        // deleteStudent sollte idealerweise einen Error werfen, wenn res.ok false ist
                        await deleteStudent(s.id);

                        // 3. Zweite Abhängigkeit: Erst wenn gelöscht wurde, Liste neu laden
                        await fetchStudents();

                        statusEl.textContent =
                            "Erfolgreich gelöscht und Liste aktualisiert.";
                        console.log("Reihenfolge eingehalten: Delete -> Fetch");
                    } catch (e) {
                        console.error("Fehler im Ablauf:", e);
                        statusEl.textContent = `Fehler: ${e.message}`;
                    } finally {
                        // Button wieder freigeben, falls er noch im DOM ist
                        if (delBtn) delBtn.disabled = false;
                    }
                };
                tdActions.append(editBtn, " ", delBtn);
            }

            tr.append(tdId, tdName, tdCourse, tdActions);
            tbody.appendChild(tr);
        }

        statusEl.textContent = `Geladen: ${students.length} Studenten`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Fehler beim Laden der Daten.";
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

async function deleteStudent(id) {
    const statusEl = document.getElementById("status");
    const res = await fetch(`/students/${id}`, { method: "DELETE" });
    if (res.status === 204) {
        statusEl.textContent = `Student ${id} removed.`;
    } else if (res.status === 401) {
        throw new Error("Nicht eingeloggt.");
    } else {
        throw new Error(res.status || `HTTP ${res.status}`);
    }
}

async function updateStudent(id, data) {
    const res = await fetch(`/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || `HTTP ${res.status}`);
    }
}

async function addClick() {
    const nameInput = document.getElementById("student-name");
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
