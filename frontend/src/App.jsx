import { Home } from "./components/Home/Home";
import Navbar from "./components/NavBar/NavBar";
import { Analytics } from "@vercel/analytics/react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useEffect, useState } from "react";
import { UserContextProvider } from "./context/ContextProvider";
import { Outlet } from "react-router-dom";
const fpPromise = FingerprintJS.load();

export const App = () => {
	const [fingerprint, setFingerprint] = useState("");
	useEffect(() => {
		const getFingerprint = async () => {
			const fp = await fpPromise;
			const result = await fp.get();
			localStorage.setItem("deviceFingerprint", result.visitorId);
			setFingerprint(result.visitorId);
		};
		if (localStorage.getItem("deviceFingerprint"))
			setFingerprint(localStorage.getItem("deviceFingerprint"));
		else getFingerprint();
	}, []);
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-200">
			<UserContextProvider fingerprint={fingerprint}>
				<Navbar />
				<div className="lg:px-12 px-5">
					<Outlet />
				</div>
				<Analytics />
			</UserContextProvider>
		</div>
	);
};
