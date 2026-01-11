"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      userId: "demo-user",
      prompt: formData.get("prompt"),
    };

    try {
      console.log('Api Called');
      const res = await fetch("http://localhost:8001/api/start_campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to start campaign");

      const result = await res.json();
      router.push(`/campaign/${result.campaignId}`);
    } catch (err) {
      console.error(err);
      alert("Error starting campaign. Ensure backend is running.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-gray-200 bg-white flex items-center px-6 md:px-12">
        <div className="font-bold text-xl tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
            MARKETING MIND
          </span>
          <span className="text-gray-400 font-light ml-1">AI</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
          Creativity <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
            Without Chaos
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Describe your campaign idea, and we'll handle the strategy.
        </p>

        {/* Gradient Bar */}
        <div className="w-64 h-1.5 mx-auto mb-16 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500"></div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8 md:p-12 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-left">
                Campaign Prompt
              </label>
              <textarea
                name="prompt"
                required
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none min-h-[180px]"
                placeholder="e.g. Create a pre-launch social media campaign for a new organic energy drink targeting college students who need focus but hate the crash..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Initializing AI Agents...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Launch Campaign Analysis
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-8">
            Powered by LangGraph & Gemini Pro
          </p>
        </div>
      </div>
    </main>
  );
}
