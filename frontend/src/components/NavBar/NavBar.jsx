"use client";
import React from "react";
import { NavLink } from "react-router-dom";

export function NavbarDemo() {
	return (
		<nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur supports-backdrop-filter:bg-slate-900/70">
			<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
				<div className="flex items-center gap-8">
					<NavLink
						to="https://campus-to-corporate.vercel.app"
						className="text-lg font-semibold tracking-wide text-slate-50"
					>
						CampusToCorporate
					</NavLink>
					<div className="hidden md:flex items-center gap-4 text-xs md:text-sm">
						<NavLink
							to="https://campus-to-corporate.vercel.app/leaderboard"
							className={({ isActive }) =>
								`transition-colors ${
									isActive
										? "text-cyan-300"
										: "text-slate-300 hover:text-cyan-300"
								}`
							}
						>
							Leaderboard
						</NavLink>
						<NavLink
							to="/contest"
							className={({ isActive }) =>
								`transition-colors ${
									isActive
										? "text-cyan-300"
										: "text-slate-300 hover:text-cyan-300"
								}`
							}
						>
							Contests
						</NavLink>
						<NavLink
							to="/code-analyser"
							className={({ isActive }) =>
								`transition-colors ${
									isActive
										? "text-cyan-300"
										: "text-slate-300 hover:text-cyan-300"
								}`
							}
						>
							Code Analyser
						</NavLink>
						<NavLink
							to="/similar-questions"
							className={({ isActive }) =>
								`transition-colors ${
									isActive
										? "text-cyan-300"
										: "text-slate-300 hover:text-cyan-300"
								}`
							}
						>
							Similar Qs
						</NavLink>
						<NavLink
							to="/notes"
							className={({ isActive }) =>
								`transition-colors ${
									isActive
										? "text-cyan-300"
										: "text-slate-300 hover:text-cyan-300"
								}`
							}
						>
							Notes
						</NavLink>
						<NavLink
							to="/pyqs"
							className={({ isActive }) =>
								`transition-colors ${
									isActive
										? "text-cyan-300"
										: "text-slate-300 hover:text-cyan-300"
								}`
							}
						>
							PYQs
						</NavLink>
						<NavLink
							to="/company-sheets"
							className={({ isActive }) =>
								`transition-colors ${
									isActive
										? "text-cyan-300"
										: "text-slate-300 hover:text-cyan-300"
								}`
							}
						>
							Company Sheets
						</NavLink>
					</div>
				</div>
			</div>
		</nav>
	);
}
