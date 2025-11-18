import React, { useEffect } from "react";
import { Question } from "../Questions/QuestionTable";
import { getPastContest } from "../../service/contestApi";

export const PastContest = () => {
	const [pastContest, setPastContest] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState(null);
	const [currentPage, setCurrentPage] = React.useState(1);
	const [totalPages, setTotalPages] = React.useState(1);
	const [selected, setSelected] = React.useState([0]);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		setError(null);
		getPastContest((currentPage - 1) * 5, 5, selected)
			.then(({ documents, total }) => {
				if (!mounted) return;
				if (documents) {
					setPastContest(documents);
					setTotalPages(Math.ceil(total / 5));
				} else {
					setPastContest([]);
					setTotalPages(0);
				}
			})
			.catch((err) => {
				console.error("Error fetching past contests:", err);
				if (mounted) setError(err?.message || String(err));
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [currentPage, selected]);
	if (loading) return <div id="past-contest">Loading past contests...</div>;
	if (error)
		return (
			<div id="past-contest" className="text-center text-red-400">
				Error loading past contests: {error}
			</div>
		);
	return (
		<div>
			<div id="past-contest">
				{pastContest && pastContest.length > 0 ? (
					<Question
						questions={pastContest}
						title={"PAST CONTESTS"}
						paginationData={{ currentPage, setCurrentPage, totalPages }}
						platformsSelected={{ selected, setSelected }}
					/>
				) : (
					<div className="text-center text-gray-400 py-8">
						<h3 className="text-xl font-semibold">PAST CONTESTS</h3>
						<p className="mt-2">No past contests found.</p>
					</div>
				)}
			</div>
		</div>
	);
};
