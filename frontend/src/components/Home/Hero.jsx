import { ExternalLink, Link2 } from "lucide-react";
import { images } from "../../service/platformImg";
import { useNavigate } from "react-router-dom";
export const Hero = () => {
	const navigate = useNavigate();
	return (
		<section className="min-h-[75vh] flex items-center justify-center py-10">
			<div className="w-full max-w-6xl mx-auto grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
				<div className="space-y-6 text-center lg:text-left">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-200 shadow-sm backdrop-blur">
						<span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
						<span className="uppercase tracking-wide">
							Live contest tracker for serious coders
						</span>
					</div>

					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-b from-gray-50 via-gray-200 to-gray-500 bg-clip-text text-transparent leading-tight">
						All Coding Contests.
						<br className="hidden md:block" />
						<span className="text-gray-300/90"> One unified dashboard.</span>
					</h1>

					<p className="text-sm sm:text-base md:text-lg text-gray-300/80 max-w-xl mx-auto lg:mx-0">
						Stay ahead in the world of competitive programming. Track contests from Codeforces, LeetCode, AtCoder and more, all in one place—with smart filters and clean, distraction‑free views.
					</p>

					<div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
						<button
							onClick={() => {
								const el = document.getElementById("latest-contest");
								if (el) {
									el.scrollIntoView({ behavior: "smooth", block: "start" });
								}
							}}
							className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
						>
							<span>View upcoming contests</span>
							<ExternalLink size={16} />
						</button>
						<button
							onClick={() => {
								window.location.href = "https://practice.careerprep.tech";
							}}
							className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-100 hover:bg-white/10 hover:border-white/30 transition-colors"
						>
							<span>Practice Now</span>
							<Link2 size={16} />
						</button>
					</div>
				</div>

				<div className="relative">
					<div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/25 via-cyan-500/10 to-transparent blur-3xl" />
					<div className="relative rounded-3xl border border-white/10 bg-white/5 px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur">
						<p className="text-xs font-semibold tracking-wide text-gray-300/80 mb-4">
							Platforms we monitor
						</p>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{Object.entries(images).map(([key, image]) => (
								<div
									key={key}
									className="group flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900/40 px-3 py-2 shadow-sm transition-all hover:border-emerald-400/60 hover:bg-gray-900/80"
								>
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950/70">
										<img
											src={image}
											alt={key}
											className="h-5 w-5 object-contain"
										/>
									</div>
									<div className="flex flex-col items-start">
										<span className="text-xs font-semibold text-gray-100">
											{key}
										</span>
										<span className="text-[0.68rem] text-gray-400 group-hover:text-gray-300">
											Live schedule & reminders
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
