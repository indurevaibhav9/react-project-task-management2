import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const FEATURES = [
  {
    title: "Project Management",
    desc: "Create, plan and track projects with deadlines, owners and team assignments.",
  },
  {
    title: "Kanban Task Board",
    desc: "Drag-and-drop tasks across To-Do, In-Progress and Done — lightweight and fast.",
  },
  {
    title: "Gantt & Timelines",
    desc: "Visualise project timelines, map tasks to dates and spot schedule risks early.",
  },
  {
    title: "Comments & Files",
    desc: "Discuss tasks with threaded comments and attach files — stored by task.",
  },
];

const PROJECT_PREVIEWS = [
  { id: "p1", title: "E-Commerce Website", subtitle: "React + .NET", tasks: 18, members: 6, due: "2026-01-30" },
  { id: "p2", title: "Mobile Banking App", subtitle: "iOS/Android", tasks: 12, members: 5, due: "2026-03-05" },
  { id: "p3", title: "Marketing Redesign", subtitle: "SEO & UX", tasks: 8, members: 3, due: "2025-12-20" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", title: "Product Manager", quote: "Organised workflows & clear timelines — our team shipped faster." },
  { name: "Aarav Mehta", title: "Senior Developer", quote: "The kanban board is intuitive and reliable. File attachments really help." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">

      {/* HERO */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Manage projects, tasks and timelines — without the noise
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              A focused toolset for teams that want clarity and speed. Plan with Gantt charts, move work with Kanban,
              and collaborate with comments and attachments — all in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center px-6 py-3 rounded-md bg-gray-900 text-white font-medium shadow-sm">
                Get started — free
              </Link>
              <Link to="/about" className="inline-flex items-center px-6 py-3 rounded-md border border-gray-300 bg-white text-gray-900">
                Learn more
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <span className="mr-3">Trusted by teams at startups and enterprises</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Preview: Kanban */}
            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Kanban Preview</div>
                <div className="text-xs text-gray-400">Live board</div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded p-2 min-h-[120px]">
                  <div className="text-xs font-semibold mb-2">To-Do</div>
                  <div className="space-y-2">
                    <div className="p-2 bg-white border rounded text-sm">Setup product schema</div>
                    <div className="p-2 bg-white border rounded text-sm">Design checkout flow</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-2 min-h-[120px]">
                  <div className="text-xs font-semibold mb-2">In-Progress</div>
                  <div className="space-y-2">
                    <div className="p-2 bg-white border rounded text-sm">Payment gateway integration</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-2 min-h-[120px]">
                  <div className="text-xs font-semibold mb-2">Done</div>
                  <div className="space-y-2">
                    <div className="p-2 bg-white border rounded text-sm">Auth flow</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">Interact with the full board from the Board page.</div>
              </div>
            </div>

            {/* Preview: Gantt */}
            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Gantt Preview</div>
                <div className="text-xs text-gray-400">Timeline view</div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-sm font-medium">Project timeline</div>
                <div className="w-full bg-gray-100 rounded overflow-hidden h-12 relative">
                  {/* simple bars */}
                  <div className="absolute left-6 top-2 h-8 bg-blue-600 rounded" style={{ width: "40%" }} />
                  <div className="absolute left-48 top-6 h-4 bg-green-500 rounded" style={{ width: "25%" }} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">Adjust timelines in the Gantt view.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Core features</h2>
          <p className="mt-2 text-gray-600 max-w-2xl">Tools designed to make team collaboration predictable and fast.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5 bg-white border rounded-lg shadow-sm">
                <div className="text-lg font-semibold">{f.title}</div>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Project previews */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Project showcase</h3>
            <Link to="/dashboard/projects" className="text-sm text-gray-700">View all projects</Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROJECT_PREVIEWS.map(p => (
              <div key={p.id} className="p-5 bg-white border rounded-lg hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{p.title}</div>
                  <div className="text-xs text-gray-400">{p.subtitle}</div>
                </div>
                <div className="mt-3 text-sm text-gray-600">Tasks: {p.tasks} • Members: {p.members}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Due {p.due}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-12">
          <h3 className="text-xl font-bold">Trusted by teams</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {TESTIMONIALS.map(t => (
              <blockquote key={t.name} className="p-6 bg-white border rounded-lg">
                <p className="text-gray-700">“{t.quote}”</p>
                <div className="mt-3 text-sm font-semibold">{t.name} <span className="text-gray-400">• {t.title}</span></div>
              </blockquote>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 mb-8">
          <div className="p-8 bg-gradient-to-r from-white to-gray-50 border rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xl font-bold">Ready to organize your work?</div>
              <div className="text-sm text-gray-600 mt-1">Create a free account and start tracking projects today.</div>
            </div>
            <div className="flex gap-3">
              <Link to="/register" className="px-5 py-3 rounded bg-gray-900 text-white">Create account</Link>
              <Link to="/projects" className="px-5 py-3 rounded border">Browse projects</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-bold">Skedulo</div>
            <div className="text-sm text-gray-500 mt-2">Plan, collaborate and deliver. Built for teams that ship.</div>
          </div>

          <div className="text-sm text-gray-700">
            <div className="font-semibold mb-2">Product</div>
            <ul className="space-y-1">
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/tasks">Tasks</Link></li>
              <li><Link to="/board">Board</Link></li>
              <li><Link to="/gantt">Gantt</Link></li>
            </ul>
          </div>

          <div className="text-sm text-gray-700">
            <div className="font-semibold mb-2">Company</div>
            <ul className="space-y-1">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contactus">Contact</Link></li>
              <li><Link to="/register">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t text-center text-xs text-gray-500 py-4">© {new Date().getFullYear()} Skedulo — All rights reserved</div>
      </footer>
    </div>
  );
}