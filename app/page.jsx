
"use client";

import { useEffect, useMemo, useState } from "react";

const initialProjects = [
  {
    id: 1,
    name: "LaunchPad",
    category: "Product",
    description: "Build a workspace to turn ideas into launched projects.",
    color: "purple",
    tasks: [
      { id: 101, title: "Define the product requirements", status: "Completed", created: "2026-10-10" },
      { id: 102, title: "Build the dashboard", status: "In progress", created: "2026-10-12" },
      { id: 103, title: "Set up user authentication", status: "Open", created: "2026-10-15" },
    ],
  },
  {
    id: 2,
    name: "Market Research",
    category: "Research",
    description: "Understand users, competitors, and market opportunities.",
    color: "blue",
    tasks: [
      { id: 201, title: "Identify competitors", status: "Completed", created: "2026-10-09" },
      { id: 202, title: "Interview target users", status: "Completed", created: "2026-10-11" },
      { id: 203, title: "Summarise findings", status: "In progress", created: "2026-10-15" },
    ],
  },
  {
    id: 3,
    name: "Brand Foundation",
    category: "Design",
    description: "Develop the identity and direction for a new venture.",
    color: "orange",
    tasks: [
      { id: 301, title: "Choose brand direction", status: "Completed", created: "2026-10-08" },
      { id: 302, title: "Create initial concepts", status: "Completed", created: "2026-10-09" },
    ],
  },
];

const emptyForm = { name: "", category: "Product", description: "" };
const emptyTask = { title: "", status: "Open" };

function getMetrics(project) {
  const tasks = project.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const inProgress = tasks.filter(t => t.status === "In progress").length;
  const open = tasks.filter(t => t.status === "Open").length;

  return {
    total,
    completed,
    inProgress,
    open,
    progress: total ? Math.round((completed / total) * 100) : 0,
    inProgressPercent: total ? Math.round((inProgress / total) * 100) : 0,
    status: total > 0 && completed === total
      ? "Completed"
      : inProgress > 0 || completed > 0
        ? "In progress"
        : "Open",
  };
}

export default function Home() {
  const [projects, setProjects] = useState(initialProjects);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState("overview");
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [taskFilter, setTaskFilter] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    teamName: "",
    teamMembers: "",
    subscription: "Free",
    photo: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("launchpad-projects-v2");
      const savedProfile = localStorage.getItem("launchpad-profile-v2");

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setProjects(parsed.map(p => ({
            ...p,
            tasks: Array.isArray(p.tasks) ? p.tasks : [],
          })));
        }
      }

      if (savedProfile) setProfile(p => ({ ...p, ...JSON.parse(savedProfile) }));
    } catch {
      // Keep the default data if browser storage is unavailable.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("launchpad-projects-v2", JSON.stringify(projects));
      } catch {}
    }
  }, [projects, hydrated]);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("launchpad-profile-v2", JSON.stringify(profile));
      } catch {}
    }
  }, [profile, hydrated]);

  const enrichedProjects = useMemo(
    () => projects.map(p => ({ ...p, ...getMetrics(p) })),
    [projects]
  );

  const completedProjects = enrichedProjects.filter(p => p.status === "Completed").length;
  const activeProjects = enrichedProjects.filter(p => p.status === "In progress").length;
  const allTasks = projects.flatMap(p => p.tasks || []);
  const completedTasks = allTasks.filter(t => t.status === "Completed").length;
  const inProgressTasks = allTasks.filter(t => t.status === "In progress").length;
  const overallProgress = allTasks.length
    ? Math.round((completedTasks / allTasks.length) * 100)
    : 0;

  const visibleProjects = enrichedProjects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    return matchesSearch && (filter === "All" || p.status === filter);
  });

  const selectedProject = enrichedProjects.find(p => p.id === selectedId);
  const visibleTasks = selectedProject
    ? (selectedProject.tasks || []).filter(t =>
        taskFilter === "All" || t.status === taskFilter
      )
    : [];

  function addProject(event) {
    event.preventDefault();
    if (!form.name.trim()) return;

    const project = {
      id: Date.now(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || "Your new project starts here.",
      color: "purple",
      tasks: [],
    };

    setProjects(current => [project, ...current]);
    setForm(emptyForm);
    setShowForm(false);
    setSelectedId(project.id);
    setView("project");
  }

  function addTask(event) {
    event.preventDefault();
    if (!selectedProject || !taskForm.title.trim()) return;

    const task = {
      id: Date.now(),
      title: taskForm.title.trim(),
      status: taskForm.status,
      created: new Date().toISOString().slice(0, 10),
    };

    setProjects(current => current.map(p =>
      p.id === selectedId ? { ...p, tasks: [...(p.tasks || []), task] } : p
    ));

    setTaskForm(emptyTask);
    setShowTaskForm(false);
  }

  function updateTask(taskId, status) {
    setProjects(current => current.map(p =>
      p.id === selectedId
        ? {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t),
          }
        : p
    ));
  }

  function deleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;

    setProjects(current => current.map(p =>
      p.id === selectedId
        ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
        : p
    ));
  }

  function deleteProject(id) {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    setProjects(current => current.filter(p => p.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setView("projects");
    }
  }

  function openProject(id) {
    setSelectedId(id);
    setTaskFilter("All");
    setShowTaskForm(false);
    setView("project");
  }

  function navigate(nextView) {
    setView(nextView);
    setShowForm(false);
    setShowTaskForm(false);
  }

  const pageTitle = view === "profile"
    ? "Profile"
    : view === "project"
      ? selectedProject?.name || "Project"
      : view === "projects"
        ? "My projects"
        : "Overview";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("overview")}>
          <span className="brand-mark">L</span>
          <span>launchpad<span className="brand-dot">.</span></span>
        </button>

        <p className="nav-label">WORKSPACE</p>
        <button className={`nav-item ${view === "overview" ? "active" : ""}`}
          onClick={() => navigate("overview")}>▦ &nbsp; Overview</button>
        <button className={`nav-item ${view === "projects" || view === "project" ? "active" : ""}`}
          onClick={() => navigate("projects")}>◫ &nbsp; My projects</button>
        <button className="nav-item" onClick={() => { setFilter("In progress"); navigate("projects"); }}>
          ↗ &nbsp; In progress
        </button>
        <button className="nav-item" onClick={() => navigate("profile")}>♙ &nbsp; My profile</button>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Big ideas start here.</strong>
            <p>Make your next move count.</p>
          </div>
          <button className="profile profile-button" onClick={() => navigate("profile")}>
            <div className="avatar">
              {profile.photo
                ? <img src={profile.photo} alt="Profile" />
                : (profile.name.trim()[0] || "U").toUpperCase()}
            </div>
            <div>
              <strong>{profile.name || "Your profile"}</strong>
              <span>{profile.teamName || "Set up your workspace"}</span>
            </div>
          </button>
        </div>
      </aside>

      <section className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {pageTitle}
          </div>
          <button className="topbar-right profile-button" onClick={() => navigate("profile")}>
            <span className="status-dot" />
            <span className="online-label">My account</span>
            <div className="avatar small">
              {profile.photo
                ? <img src={profile.photo} alt="Profile" />
                : (profile.name.trim()[0] || "U").toUpperCase()}
            </div>
          </button>
        </header>

        {view === "profile" ? (
          <section className="projects-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">YOUR ACCOUNT</div>
                <h2>Profile & team</h2>
                <p>Manage your personal and workspace information.</p>
              </div>
            </div>

            <form className="project-form" onSubmit={e => { e.preventDefault(); alert("Profile saved in this browser."); }}>
              <div className="profile-preview">
                <div className="avatar profile-large">
                  {profile.photo
                    ? <img src={profile.photo} alt="Profile" />
                    : (profile.name.trim()[0] || "U").toUpperCase()}
                </div>
                <label>
                  Profile photo URL
                  <input type="url" placeholder="https://example.com/photo.jpg"
                    value={profile.photo}
                    onChange={e => setProfile({ ...profile, photo: e.target.value })} />
                </label>
              </div>

              <label>Full name
                <input value={profile.name} placeholder="Your name"
                  onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </label>
              <label>Email address
                <input type="email" value={profile.email} placeholder="you@example.com"
                  onChange={e => setProfile({ ...profile, email: e.target.value })} />
              </label>
              <label>Phone number
                <input type="tel" value={profile.phone} placeholder="Phone number"
                  onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              </label>
              <label>Team name
                <input value={profile.teamName} placeholder="Your team"
                  onChange={e => setProfile({ ...profile, teamName: e.target.value })} />
              </label>
              <label>Team members
                <textarea rows={3} value={profile.teamMembers}
                  placeholder="Add team members' names or emails"
                  onChange={e => setProfile({ ...profile, teamMembers: e.target.value })} />
              </label>
              <label>Subscription
                <select value={profile.subscription}
                  onChange={e => setProfile({ ...profile, subscription: e.target.value })}>
                  <option>Free</option>
                  <option>Pro</option>
                  <option>Team</option>
                </select>
              </label>
              <button type="submit" className="primary-button">Save profile</button>
              <button type="button" className="secondary-button"
                onClick={() => alert("Real account sign-out will be enabled after authentication is connected.")}>
                Log out
              </button>
              <p className="form-hint">
                Profile details are saved in this browser only. Subscription selection is a display setting, not a payment.
              </p>
            </form>
          </section>
        ) : view === "project" && selectedProject ? (
          <section className="projects-section">
            <button className="secondary-button" onClick={() => navigate("projects")}>← All projects</button>

            <div className="welcome">
              <div>
                <div className="eyebrow">{selectedProject.category.toUpperCase()} PROJECT</div>
                <h1>{selectedProject.name}</h1>
                <p className="welcome-copy">{selectedProject.description}</p>
              </div>
              <button className="primary-button" onClick={() => setShowTaskForm(v => !v)}>
                + Add task
              </button>
            </div>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top"><span>Total tasks</span></div>
                <strong className="stat-number">{selectedProject.total}</strong>
              </article>
              <article className="stat-card">
                <div className="stat-top"><span>Open</span></div>
                <strong className="stat-number">{selectedProject.open}</strong>
              </article>
              <article className="stat-card">
                <div className="stat-top"><span>In progress</span></div>
                <strong className="stat-number">{selectedProject.inProgress}</strong>
                <span className="stat-note">{selectedProject.inProgressPercent}% of tasks</span>
              </article>
              <article className="stat-card">
                <div className="stat-top"><span>Completed</span></div>
                <strong className="stat-number">{selectedProject.completed}</strong>
                <span className="stat-note">{selectedProject.progress}% complete</span>
              </article>
            </section>

            <div className="progress-label">
              <span>Overall completion</span><strong>{selectedProject.progress}%</strong>
            </div>
            <div className="progress-track" role="progressbar"
              aria-valuenow={selectedProject.progress} aria-valuemin={0} aria-valuemax={100}>
              <div className={`progress-fill ${selectedProject.color}`}
                style={{ width: `${selectedProject.progress}%` }} />
            </div>

            {showTaskForm && (
              <form className="project-form" onSubmit={addTask}>
                <div className="form-heading">
                  <div><h2>Add a task</h2><p>Progress updates automatically from task status.</p></div>
                  <button type="button" className="close-button"
                    onClick={() => setShowTaskForm(false)}>×</button>
                </div>
                <label>Task name
                  <input required autoFocus value={taskForm.title}
                    placeholder="What needs to be done?"
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                </label>
                <label>Status
                  <select value={taskForm.status}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option>Open</option><option>In progress</option><option>Completed</option>
                  </select>
                </label>
                <button className="primary-button" type="submit">Create task</button>
              </form>
            )}

            <div className="toolbar">
              <h2>Tasks</h2>
              <select className="filter-select" value={taskFilter}
                onChange={e => setTaskFilter(e.target.value)}>
                <option>All</option><option>Open</option>
                <option>In progress</option><option>Completed</option>
              </select>
            </div>

            <div className="task-list">
              {visibleTasks.map(task => (
                <article className="task-row" key={task.id}>
                  <div className="task-main">
                    <strong>{task.title}</strong>
                    <span>Created: {task.created}</span>
                  </div>
                  <select aria-label={`Status for ${task.title}`}
                    className={`task-status status-${task.status.toLowerCase().replace(" ", "-")}`}
                    value={task.status}
                    onChange={e => updateTask(task.id, e.target.value)}>
                    <option>Open</option><option>In progress</option><option>Completed</option>
                  </select>
                  <button className="delete-button" onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}>×</button>
                </article>
              ))}
              {visibleTasks.length === 0 && (
                <div className="empty-state">
                  <h3>No tasks here yet</h3>
                  <p>Add a task or change the filter.</p>
                </div>
              )}
            </div>

            <button className="secondary-button" onClick={() => deleteProject(selectedProject.id)}>
              Delete project
            </button>
          </section>
        ) : (
          <>
            <section className="welcome">
              <div>
                <div className="eyebrow">YOUR SPACE TO BUILD</div>
                <h1>Turn ideas into <span>action.</span></h1>
                <p className="welcome-copy">
                  One place for your projects, your progress, and what comes next.
                </p>
              </div>
              <button className="primary-button" onClick={() => setShowForm(v => !v)}>
                + New project
              </button>
            </section>

            {showForm && (
              <form className="project-form" onSubmit={addProject}>
                <div className="form-heading">
                  <div><h2>Create a project</h2><p>Give your next idea a starting point.</p></div>
                  <button type="button" className="close-button"
                    onClick={() => setShowForm(false)}>×</button>
                </div>
                <label>Project name
                  <input required autoFocus value={form.name}
                    placeholder="e.g. Launch my startup"
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </label>
                <label>Category
                  <select value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Product</option><option>Business</option><option>Research</option>
                    <option>Design</option><option>Personal</option>
                  </select>
                </label>
                <label>Description
                  <textarea rows={3} value={form.description}
                    placeholder="What are you trying to achieve?"
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </label>
                <button type="submit" className="primary-button">Create project →</button>
              </form>
            )}

            <section className="stats-grid" aria-label="Project statistics">
              <button className="stat-card stat-clickable" onClick={() => { setFilter("All"); navigate("projects"); }}>
                <div className="stat-top"><span>Total projects</span><span className="stat-icon purple-bg">◫</span></div>
                <strong className="stat-number">{projects.length}</strong>
                <span className="stat-note">Click to view all projects →</span>
              </button>
              <button className="stat-card stat-clickable" onClick={() => { setFilter("In progress"); navigate("projects"); }}>
                <div className="stat-top"><span>In progress</span><span className="stat-icon blue-bg">↗</span></div>
                <strong className="stat-number">{activeProjects}</strong>
                <span className="stat-note">{inProgressTasks} tasks in progress</span>
              </button>
              <button className="stat-card stat-clickable" onClick={() => { setFilter("Completed"); navigate("projects"); }}>
                <div className="stat-top"><span>Completed projects</span><span className="stat-icon green-bg">✓</span></div>
                <strong className="stat-number">{completedProjects}</strong>
                <span className="stat-note">{completedTasks} tasks completed</span>
              </button>
              <article className="stat-card">
                <div className="stat-top"><span>Overall task progress</span><span className="stat-icon orange-bg">◷</span></div>
                <strong className="stat-number">{overallProgress}%</strong>
                <span className="stat-note">{allTasks.length} tasks across all projects</span>
              </article>
            </section>

            <section className="projects-section">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">YOUR WORKSPACE</div>
                  <h2>{view === "projects" ? "All projects" : "Your projects"}</h2>
                  <p>Open a project to manage its tasks and progress.</p>
                </div>
                <span className="project-count">{visibleProjects.length} projects</span>
              </div>

              <div className="toolbar">
                <div className="search-box">
                  <span>⌕</span>
                  <input aria-label="Search projects" placeholder="Search your projects..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select aria-label="Filter projects" className="filter-select"
                  value={filter} onChange={e => setFilter(e.target.value)}>
                  <option>All</option><option>Open</option>
                  <option>In progress</option><option>Completed</option>
                </select>
              </div>

              <div className="project-grid">
                {visibleProjects.map(project => (
                  <article className="project-card project-card-clickable"
                    key={project.id} role="button" tabIndex={0}
                    onClick={() => openProject(project.id)}
                    onKeyDown={e => { if (e.key === "Enter") openProject(project.id); }}>
                    <div className="project-card-top">
                      <div className={`project-symbol ${project.color}`}>
                        {project.category === "Research" ? "⌕"
                          : project.category === "Design" ? "✳"
                            : project.category === "Business" ? "↗" : "◇"}
                      </div>
                      <button className="delete-button" title="Delete project"
                        aria-label={`Delete ${project.name}`}
                        onClick={e => { e.stopPropagation(); deleteProject(project.id); }}>×</button>
                    </div>
                    <div className="project-category">{project.category}</div>
                    <h3>{project.name}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="progress-label">
                      <span>Task completion</span><strong>{project.progress}%</strong>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${project.color}`}
                        style={{ width: `${project.progress}%` }} />
                    </div>
                    <div className="project-card-bottom">
                      <span className={project.status === "Completed" ? "pill completed" : "pill in-progress"}>
                        <span className="pill-dot" />{project.status}
                      </span>
                      <span className="task-summary">
                        {project.completed}/{project.total} tasks done
                      </span>
                    </div>
                    <div className="project-open-hint">Open project →</div>
                  </article>
                ))}

                <button className="add-project-card" onClick={() => setShowForm(true)}>
                  <span className="add-circle">＋</span>
                  <strong>Start something new</strong>
                  <span>Create your next project</span>
                </button>
              </div>

              {visibleProjects.length === 0 && (
                <div className="empty-state">
                  <h3>No projects found</h3>
                  <p>Try another search or create a new project.</p>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="footer">
          <span>LaunchPad © 2026</span>
          <span>Built for ideas that move forward.</span>
        </footer>
      </section>
    </main>
  );
}
