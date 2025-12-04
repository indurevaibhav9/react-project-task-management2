import React, { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", form);
  };

  return (
    <div className=" w-screen min-h-[calc(100vh-80px)] bg-linear-to-b from-slate-50 to-slate-100 flex items-center max-w-full justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* ---------------- LEFT SIDE ---------------- */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Contact Us
          </h1>
          <p className="text-slate-600 mb-6 leading-relaxed text-justify">
            Have questions, feedback, or want to collaborate?  
            We’d love to hear from you!  
            Reach out using the form or contact us directly.
          </p>

          <div className="space-y-4 text-slate-700">
            <div>
              <h3 className="font-semibold">📩 Email</h3>
              <p>support@skedulo-app.com</p>
            </div>

            <div>
              <h3 className="font-semibold">📞 Phone</h3>
              <p>+91 98765 43210</p>
            </div>

            <div>
              <h3 className="font-semibold">📍 Address</h3>
              <p>Pune, Maharashtra, India</p>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT SIDE FORM ---------------- */}
        <div className="relative">
          <div className="bg-white border-2 border-black/90 rounded-2xl shadow-[8px_8px_0_rgba(0,0,0,0.85)] p-8">
            
            <h2 className="text-2xl font-bold mb-3">Send us a message</h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="text-sm font-semibold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-md border border-black/40 px-4 py-3 mt-1 outline-none focus:ring-1 focus:ring-black/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-black/40 px-4 py-3 mt-1 outline-none focus:ring-1 focus:ring-black/30"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-semibold">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  className="w-full rounded-md border border-black/40 px-4 py-3 mt-1 outline-none focus:ring-1 focus:ring-black/30"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-semibold">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write your message..."
                  className="w-full rounded-md border border-black/40 px-4 py-3 mt-1 outline-none resize-none focus:ring-1 focus:ring-black/30 h-20"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-md font-semibold shadow-sm hover:opacity-90"
              >
                Send Message
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}