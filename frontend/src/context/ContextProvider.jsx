import { UserContext } from "./userContext.js";

export const UserContextProvider = ({ children, fingerprint }) => {
	return (
		<UserContext.Provider value={{ fingerprint }}>
			{children}
		</UserContext.Provider>
	);
};
