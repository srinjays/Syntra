import { NextResponse } from "next/server"

export async function GET() {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        groq: process.env.GROQ_API_KEY ? "configured" : "missing",
        openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
      },
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json({ status: "unhealthy", error: "Health check failed" }, { status: 500 })
  }
}
