import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://backend.vinelms.com";

export async function GET(request, { params }) {
  const { slug } = params;

  try {
    const backendUrl = `${API_BASE_URL}/api/public/legal-pages/${slug}`;

    const res = await fetch(backendUrl, {
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Failed to fetch legal page", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching legal page:", error);
    return NextResponse.json(
      { message: "Server error fetching legal page" },
      { status: 500 }
    );
  }
}
