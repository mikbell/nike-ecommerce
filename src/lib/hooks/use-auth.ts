import { useState, useEffect } from "react";

interface User {
	id: string;
	email: string;
	name: string;
	// Add other user properties as needed
}

interface AuthState {
	user: User | null;
	isLoading: boolean;
}

export function useAuth(): AuthState {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simulate checking for existing authentication
		// Replace this with your actual authentication logic
		const checkAuth = async () => {
			try {
				// Here you would typically check for a stored token
				// and validate it with your authentication service
				const storedUser = localStorage.getItem("user");
				if (storedUser) {
					setUser(JSON.parse(storedUser));
				}
			} catch (error) {
				console.error("Error checking authentication:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	return {
		user,
		isLoading,
	};
}
