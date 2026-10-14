import { useEffect, useMemo, useState } from "react";
import api from "./api.js";

const emptyForm = { name: "", course: "", year: "", email: "" };

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong.";
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  async function loadStudents() {
    setLoading(true);
    try {
      const response = await api.get("/students");
      setStudents(response.data.data);
    } catch (error) {
      setNotice({ type: "error", text: `Could not load students: ${getErrorMessage(error)}` });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.name, student.course, String(student.year), student.email]
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [students, search]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    if (form.name.trim().length < 2) return "Name must contain at least 2 characters.";
    if (!form.course.trim()) return "Please enter a course.";
    if (!form.year || !Number.isInteger(Number(form.year)) || Number(form.year) < 1 || Number(form.year) > 10) {
      return "Year must be a whole number between 1 and 10.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: "", text: "" });
    const validationError = validateForm();
    if (validationError) {
      setNotice({ type: "error", text: validationError });
      return;
    }

    const payload = {
      name: form.name.trim(),
      course: form.course.trim(),
      year: Number(form.year),
      email: form.email.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
        setNotice({ type: "success", text: "Student updated successfully." });
      } else {
        await api.post("/students", payload);
        setNotice({ type: "success", text: "Student added successfully." });
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(student) {
    setEditingId(student._id);
    setForm({
      name: student.name,
      course: student.course,
      year: String(student.year),
      email: student.email,
    });
    setNotice({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setNotice({ type: "", text: "" });
  }

  async function deleteStudent(student) {
    const confirmed = window.confirm(`Delete ${student.name}'s record? This cannot be undone.`);
    if (!confirmed) return;

    setNotice({ type: "", text: "" });
    try {
      await api.delete(`/students/${student._id}`);
      if (editingId === student._id) cancelEdit();
      setNotice({ type: "success", text: "Student deleted successfully." });
      await loadStudents();
    } catch (error) {
      setNotice({ type: "error", text: getErrorMessage(error) });
    }
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="hero-mark" aria-hidden="true">SMS</div>
        <div>
          <p className="eyebrow">COLLEGE PRACTICAL PROJECT</p>
          <h1>Student Management System</h1>
          <p className="hero-copy">Manage student records in one simple place.</p>
        </div>
        <div className="hero-count">
          <span>{students.length}</span>
          <small>Total students</small>
        </div>
      </header>

      {notice.text && (
        <div className={`notice ${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button className="notice-close" type="button" onClick={() => setNotice({ type: "", text: "" })} aria-label="Dismiss message">×</button>
        </div>
      )}

      <section className="panel form-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? "EDIT RECORD" : "NEW RECORD"}</p>
            <h2>{editingId ? "Update student" : "Add a student"}</h2>
          </div>
          <span className="step-badge">{editingId ? "Editing" : "01 / Form"}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Student name <span className="required">*</span>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Anu Kumar" maxLength="100" required />
            </label>
            <label>
              Course <span className="required">*</span>
              <input name="course" value={form.course} onChange={handleChange} placeholder="e.g. BSc Computer Science" maxLength="100" required />
            </label>
            <label>
              Year <span className="required">*</span>
              <select name="year" value={form.year} onChange={handleChange} required>
                <option value="">Select year</option>
                {[1, 2, 3, 4, 5].map((year) => <option key={year} value={year}>{year}{year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} year</option>)}
              </select>
            </label>
            <label>
              Email address <span className="required">*</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="student@example.com" maxLength="254" required />
            </label>
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "＋ Add student"}
            </button>
            {editingId && <button className="button secondary" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="panel records-panel">
        <div className="records-heading">
          <div>
            <p className="eyebrow">STUDENT DIRECTORY</p>
            <h2>All students <span className="count-pill">{filteredStudents.length}</span></h2>
          </div>
          <div className="search-box">
            <span aria-hidden="true">⌕</span>
            <input aria-label="Search students" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, course, year, email..." />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
          </div>
        </div>

        {loading ? (
          <div className="state-box"><span className="spinner" />Loading student records...</div>
        ) : students.length === 0 ? (
          <div className="state-box empty-state">
            <div className="empty-icon">▤</div>
            <h3>No students yet</h3>
            <p>Add your first student using the form above.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="state-box empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No matching students</h3>
            <p>Try another name, course, year, or email.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Student name</th><th>Course</th><th>Year</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td><span className="id-chip" title={student._id}>{student._id.slice(-6).toUpperCase()}</span></td>
                    <td><div className="student-name"><span className="avatar">{student.name.trim().charAt(0).toUpperCase()}</span><span>{student.name}</span></div></td>
                    <td>{student.course}</td>
                    <td><span className="year-chip">{student.year}</span></td>
                    <td><a className="email-link" href={`mailto:${student.email}`}>{student.email}</a></td>
                    <td><div className="row-actions">
                      <button className="icon-button edit-button" type="button" onClick={() => startEdit(student)} aria-label={`Edit ${student.name}`} title="Edit">Edit</button>
                      <button className="icon-button delete-button" type="button" onClick={() => deleteStudent(student)} aria-label={`Delete ${student.name}`} title="Delete">Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>Data is stored in MongoDB</span>
          <span>{filteredStudents.length} of {students.length} record{students.length === 1 ? "" : "s"}</span>
        </div>
      </section>
      <footer>Student Management System <span>•</span> React + Express + MongoDB</footer>
    </main>
  );
}
