import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

const categoryPrompts = {
  creative: `You are an expert at crafting creative prompts for AI tools. Transform the user's messy input into a well-structured, detailed prompt that will generate amazing creative content. Include specific details about style, mood, composition, colors, and artistic direction. Make it clear and actionable.`,

  coding: `You are an expert at crafting coding prompts for AI tools. Transform the user's messy input into a clear, technical prompt that specifies the programming language, framework, functionality, requirements, and any constraints. Include details about code structure, best practices, and expected output format.`,

  business: `You are an expert at crafting business prompts for AI tools. Transform the user's messy input into a professional, strategic prompt that clearly defines the business context, objectives, target audience, constraints, and desired outcomes. Make it actionable and results-focused.`,

  academic: `You are an expert at crafting academic prompts for AI tools. Transform the user's messy input into a scholarly, well-structured prompt that specifies the academic level, subject area, research requirements, citation needs, and analytical depth required. Make it precise and academically rigorous.`,
}

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute per IP

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  return ip
}

function checkRateLimit(key: string): { allowed: boolean; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, resetTime: now + RATE_LIMIT_WINDOW }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, resetTime: record.resetTime }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request)
    const { allowed, resetTime } = checkRateLimit(rateLimitKey)

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Reset": resetTime.toString(),
            "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    const { input, category, model = "groq" } = await request.json()

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Valid input text is required" }, { status: 400 })
    }

    if (input.length > 2000) {
      return NextResponse.json({ error: "Input text is too long (max 2000 characters)" }, { status: 400 })
    }

    if (!category || !categoryPrompts[category as keyof typeof categoryPrompts]) {
      return NextResponse.json({ error: "Valid category is required" }, { status: 400 })
    }

    const systemPrompt = categoryPrompts[category as keyof typeof categoryPrompts]

    let selectedModel
    if (model === "openai") {
      selectedModel = openai("gpt-4o-mini")
    } else {
      selectedModel = groq("llama-3.3-70b-versatile")
    }

    console.log("[v0] Processing prompt optimization", { category, model, inputLength: input.length })

    const { text } = await generateText({
      model: selectedModel,
      system: systemPrompt,
      prompt: `Transform this messy user input into a perfectly optimized prompt:

"${input}"

Return ONLY the optimized prompt, nothing else. Make it clear, specific, and actionable. The optimized prompt should be 2-4 sentences and include all necessary context and requirements.`,
      maxTokens: 500,
      temperature: 0.7,
    })

    console.log("[v0] Successfully optimized prompt", { outputLength: text.length })

    return NextResponse.json({
      optimizedPrompt: text.trim(),
      metadata: {
        model: model,
        category: category,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error optimizing prompt:", error)

    if (error instanceof Error) {
      if (error.message.includes("decommissioned") || error.message.includes("deprecated")) {
        return NextResponse.json(
          { error: "AI model temporarily unavailable. Please try the other model option." },
          { status: 503 },
        )
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "AI service temporarily unavailable. Please try again later or try the other model." },
          { status: 503 },
        )
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json({ error: "Request timeout. Please try again." }, { status: 408 })
      }
    }

    return NextResponse.json({ error: "Failed to optimize prompt. Please try again." }, { status: 500 })
  }
}
