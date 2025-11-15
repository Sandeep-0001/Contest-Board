import React, { useEffect } from "react";
import { Question } from "../Questions/QuestionTable";
import { getLastUpdatedDate, getLatestContest } from "../../service/contestApi";

export const UpcomingContest = () => {
	const [latestContest, setLatestContest] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState(null);
	const [currentPage, setCurrentPage] = React.useState(1);
	const [totalPages, setTotalPages] = React.useState(0);
	const [lastUpdated, setLastUpdated] = React.useState(new Date());
	const [selected, setSelected] = React.useState([0]);

	useEffect(() => {
		getLastUpdatedDate().then((date) => {
			if (date) {
				setLastUpdated(date);
			}
		});
	}, []);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		setError(null);
		getLatestContest((currentPage - 1) * 10, 10, selected)
			.then(({ documents, total }) => {
				if (!mounted) return;
				if (documents) {
					setLatestContest(documents);
					setTotalPages(Math.ceil(total / 10));
				} else {
					setLatestContest([]);
					setTotalPages(0);
				}
			})
			.catch((err) => {
				console.error("Error fetching latest contests:", err);
				if (mounted) setError(err?.message || String(err));
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [currentPage, selected]);

	if (loading) return <div id="latest-contest">Loading upcoming contests...</div>;
	if (error)
		return (
			<div id="latest-contest" className="text-center text-red-400">
				Error loading upcoming contests: {error}
			</div>
		);
	return (
		<div id="latest-contest">
			{latestContest && latestContest.length > 0 ? (
				<Question
					questions={latestContest}
					title={"UPCOMING CONTESTS"}
					footer={"Last Updated On : " + new Date(lastUpdated).toLocaleString()}
					platformsSelected={{ selected, setSelected }}
					paginationData={{ currentPage, setCurrentPage, totalPages }}
				/>
			) : (
				<div className="text-center text-gray-400 py-8">
					<h3 className="text-xl font-semibold">UPCOMING CONTESTS</h3>
					<p className="mt-2">No upcoming contests found.</p>
				</div>
			)}
		</div>
	);
};
