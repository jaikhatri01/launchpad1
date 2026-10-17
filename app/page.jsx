
"use client";

import { useState } from "react";

const initialProjects = [
  {
    id: 1,
    name: "LaunchPad",
    category: "Product",
    description: "Build a workspace to turn ideas into launched projects.",
    progress: 35,
    status: "In progress",
    color: "purple"
  },
  {
    id: 2,
    name: "Market Research",
    category: "Research",
    description: "Understand users, competitors, and market opportunities.",
    progress: 70,
    status: "In progress",
    color: "blue"
  },
  {
    id: 3,
    name: "Brand Foundation",
    category: "Design",
    description: "Develop the identity and direction for a new venture.",
    progress: 100,
    status: "Completed",
    color: "orange"
  }
];

export default function Home() {
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    name: "",
    category: "Product",
    description: ""
  });

  const completed = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const average = projects.length
    ? Math.round(
        projects.reduce((sum, project) => sum + project.progress, 0) /
          projects.length
      )
    : 0;

  const visibleProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || project.status === filter;

    return matchesSearch && matchesFilter;
  });

  function addProject(event) {
    event.preventDefault();

    if (!form.name.trim()) return;

    setProjects([
      {
        id: Date.now(),
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || "Your new project starts here.",
        progress: 0,
        status: "In progress",
        color: "purple"
      },
      ...projects
    ]);

    setForm({
      name: "",
      category: "Product",
      description: ""
    });

    setShowForm(false);
  }

  function updateProgress(id, amount) {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== id) return project;

        const progress = Math.max(
          0,
          Math.min(100, project.progress + amount)
        );

        return {
          ...project,
          progress,
          status: progress === 100 ? "Completed" : "In progress"
        };
      })
    );
  }

  function deleteProject(id) {
    setProjects((current) =>
      current.filter((project) => project.id !== id)
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a href="#" className="brand">
          <span className="brand-mark">L</span>
          <span>launchpad<span className="brand-dot">.</span></span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <a className="nav-item active" href="#overview">
          <span>▦</span> Overview
        </a>
        <a className="nav-item" href="#projects">
          <span>◫</span> My projects
        </a>
        <a className="nav-item" href="#projects">
          <span>✓</span> Progress
        </a>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Big ideas start here.</strong>
            <p>Make your next move count.</p>
          </div>
          <div className="profile">
            <div className="avatar">U</div>
            <div>
              <strong>Your workspace</strong>
              <span>Project creator</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="topbar-right">
            <span className="status-dot" />
            <span className="online-label">Workspace active</span>
            <div className="avatar small">U</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">YOUR SPACE TO BUILD</div>
            <h1>Turn ideas into <span>action.</span></h1>
            <p className="welcome-copy">
              One place for your projects, your progress, and what comes next.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            <span>＋</span> New project
          </button>
        </section>

        {showForm && (
          <form className="project-form" onSubmit={addProject}>
            <div className="form-heading">
              <div>
                <h2>Create a project</h2>
                <p>Give your next idea a starting point.</p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <label>
              Project name
              <input
                required
                autoFocus
                placeholder="e.g. Launch my startup"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
              >
                <option>Product</option>
                <option>Business</option>
                <option>Research</option>
                <option>Design</option>
                <option>Personal</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                placeholder="What are you trying to achieve?"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>

            <button type="submit" className="primary-button">
              Create project →
            </button>
          </form>
        )}

        <section className="stats-grid" aria-label="Project statistics">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total projects</span>
              <span className="stat-icon purple-bg">◫</span>
            </div>
            <strong className="stat-number">{projects.length}</strong>
            <span className="stat-note">Projects in your workspace</span>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>In progress</span>
              <span className="stat-icon blue-bg">↗</span>
            </div>
            <strong className="stat-number">
              {projects.length - completed}
            </strong>
            <span className="stat-note">Ideas moving forward</span>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon green-bg">✓</span>
            </div>
            <strong className="stat-number">{completed}</strong>
            <span className="stat-note">Milestones achieved</span>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Average progress</span>
              <span className="stat-icon orange-bg">◷</span>
            </div>
            <strong className="stat-number">{average}%</strong>
            <span className="stat-note">Across all projects</span>
          </article>
        </section>

        <section className="projects-section" id="projects">
          <div className="section-heading">
            <div>
              <div className="eyebrow">YOUR WORKSPACE</div>
              <h2>Your projects</h2>
              <p>Keep the momentum going, one step at a time.</p>
            </div>
            <span className="project-count">
              {visibleProjects.length} projects
            </span>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                aria-label="Search projects"
                placeholder="Search your projects..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter projects"
              className="filter-select"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option>All</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="project-grid">
            {visibleProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-top">
                  <div className={`project-symbol ${project.color}`}>
                    {project.category === "Research"
                      ? "⌕"
                      : project.category === "Design"
                      ? "✳"
                      : project.category === "Business"
                      ? "↗"
                      : "◇"}
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => deleteProject(project.id)}
                    aria-label={`Delete ${project.name}`}
                    title="Delete project"
                  >
                    ×
                  </button>
                </div>

                <div className="project-category">{project.category}</div>
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>

                <div className="progress-label">
                  <span>Progress</span>
                  <strong>{project.progress}%</strong>
                </div>

                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={project.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${project.name} progress`}
                >
                  <div
                    className={`progress-fill ${project.color}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <div className="project-card-bottom">
                  <span
                    className={
                      project.status === "Completed"
                        ? "pill completed"
                        : "pill in-progress"
                    }
                  >
                    <span className="pill-dot" />
                    {project.status}
                  </span>

                  {project.progress < 100 && (
                    <button
                      className="update-button"
                      onClick={() => updateProgress(project.id, 10)}
                    >
                      +10%
                    </button>
                  )}
                </div>
              </article>
            ))}

            <button
              className="add-project-card"
              onClick={() => setShowForm(true)}
            >
              <span className="add-circle">＋</span>
              <strong>Start something new</strong>
              <span>Create your next project</span>
            </button>
          </div>

          {visibleProjects.length === 0 && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No projects found</h3>
              <p>Try another search or create a new project.</p>
            </div>
          )}
        </section>

        <footer className="footer">
          <span>LaunchPad © 2026</span>
          <span>Built for ideas that move forward.</span>
        </footer>
      </section>
    </main>
  );
}
