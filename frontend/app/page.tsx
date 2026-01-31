"use client";
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <GraduationCap className="h-8 w-8" />
            {/* Text Removed for Alignment */}
          </div>
          <div className="flex gap-4">
            <Link href="/auth"><button className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">Login</button></Link>
            <Link href="/auth"><button className="rounded-full bg-gray-900 px-6 py-2 text-white font-medium hover:bg-gray-800 transition shadow-sm">Get Started</button></Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-700">🚀 Powered by Advanced AI Agents</div>
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-700">Your Personal AI <br /> <span className="text-blue-600">Study Abroad Counsellor</span></h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600 animate-in fade-in slide-in-from-bottom-8 duration-700">Stop browsing endlessly. Our AI analyzes your profile, shortlists dream universities, and builds your entire application roadmap.</p>
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <Link href="/auth">
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:scale-105 transition">Start Free Assessment <ArrowRight className="h-5 w-5" /></button>
          </Link>
        </div>
      </main>
    </div>
  );
}