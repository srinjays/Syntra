import { NextResponse } from "next/server"

const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  categoryBreakdown: {
    creative: 0,
    coding: 0,
    business: 0,
    academic: 0,
  },
  modelUsage: {
    groq: 0,
    openai: 0,
  },
}

export async function GET() {
  return NextResponse.json(stats)
}

export async function POST(request: Request) {
  try {
    const { category, model, success } = await request.json()

    stats.totalRequests++

    if (success) {
      stats.successfulRequests++
    } else {
      stats.failedRequests++
    }

    if (category && stats.categoryBreakdown[category as keyof typeof stats.categoryBreakdown] !== undefined) {
      stats.categoryBreakdown[category as keyof typeof stats.categoryBreakdown]++
    }

    if (model && stats.modelUsage[model as keyof typeof stats.modelUsage] !== undefined) {
      stats.modelUsage[model as keyof typeof stats.modelUsage]++
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 })
  }
}
