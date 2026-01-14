import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function fetchServerData(endpoint) {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            cache: "no-store", // Ensure fresh data
        });

        if (!res.ok) {
            // console.error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}
