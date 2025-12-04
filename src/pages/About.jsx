import React from "react";

export default function About() {
  return (
    <div className="w-screen min-h-[calc(100vh-80px)] bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center py-16 px-6">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-15 items-center">

        {/* ---------------- LEFT SIDE CONTENT ---------------- */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            About Us
          </h1>

          <p className="text-slate-600 leading-relaxed mb-6 text-justify">
            At <span className="font-semibold">Skedulo</span>, we aim to simplify
            scheduling, task management, and day-to-day operations by providing
            a seamless, intuitive digital experience.
          </p>

          <p className="text-slate-600 leading-relaxed mb-6 text-justify">
            Our platform is designed to help teams stay connected, informed, and
            productive — no matter where they are. With powerful features and a
            user-friendly interface, we make it easier to manage workflows,
            streamline communication, and boost efficiency.
          </p>

          <h3 className="text-xl font-bold mb-2">Our Mission</h3>
          <p className="text-slate-600 leading-relaxed mb-6 text-justify">
            Empower organizations with tools that save time, enhance
            collaboration, and help them operate smarter and faster.
          </p>

          <h3 className="text-xl font-bold mb-2">Our Vision</h3>
          <p className="text-slate-600 leading-relaxed text-justify">
            To become the most reliable and easy-to-use scheduling platform,
            trusted globally by teams of all sizes.
          </p>
        </div>

        {/* ---------------- RIGHT SIDE CARD / IMAGE ---------------- */}
        <div className="relative">
          <div className="bg-white rounded-2xl border-2 border-black/90 shadow-[8px_8px_0_rgba(0,0,0,0.85)] p-6">
            <img
              src="https://img.freepik.com/premium-photo/team-hands-collaboration-meeting-business-people-agreement-together-papers-work-office-group-employee-hand-teamwork-agree-pile-company-goal-strategy-plan_590464-85221.jpg?w=2000"
              alt="Team collaboration"
              className="rounded-xl w-full object-cover"
            />

            <p className="mt-4 text-sm text-slate-500 text-center">
              “Great teams are built when people collaborate seamlessly.”
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}