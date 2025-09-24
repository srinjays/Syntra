import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

const categoryPrompts = {
  creative: `You are an expert at crafting creative prompts for AI tools. Transform the user's messy input into a well-structured, detailed prompt that will generate amazing creative content. Include specific details about style, mood, composition, colors, and artistic direction. Make it clear and actionable. Focus on visual elements, creative constraints, and desired aesthetic outcomes.`,

  coding: `You are an expert at crafting coding prompts for AI tools. Transform the user's messy input into a clear, technical prompt that specifies the programming language, framework, functionality, requirements, and any constraints. Include details about code structure, best practices, error handling, testing requirements, and expected output format. Be specific about technical specifications.`,

  business: `You are an expert at crafting business prompts for AI tools. Transform the user's messy input into a professional, strategic prompt that clearly defines the business context, objectives, target audience, constraints, KPIs, and desired outcomes. Include market context, competitive considerations, and measurable success criteria. Make it actionable and results-focused.`,

  academic: `You are an expert at crafting academic prompts for AI tools. Transform the user's messy input into a scholarly, well-structured prompt that specifies the academic level, subject area, research methodology, citation requirements, analytical framework, and depth required. Include specific academic standards, source requirements, and evaluation criteria. Make it precise and academically rigorous.`,
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

const modelConfigs = {
  groq: {
    model: groq("llama-3.3-70b-versatile"),
    maxTokens: 600,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  },
  openai: {
    model: openai("gpt-4o-mini"),
    maxTokens: 800,
    temperature: 0.6,
    topP: 0.95,
    frequencyPenalty: 0.2,
    presencePenalty: 0.1,
  },
}

const performanceMetrics = new Map<
  string,
  {
    totalRequests: number
    totalLatency: number
    successRate: number
    lastUsed: number
  }
>()

function updatePerformanceMetrics(model: string, latency: number, success: boolean) {
  const current = performanceMetrics.get(model) || {
    totalRequests: 0,
    totalLatency: 0,
    successRate: 0,
    lastUsed: 0,
  }

  current.totalRequests++
  current.totalLatency += latency
  current.successRate = (current.successRate * (current.totalRequests - 1) + (success ? 1 : 0)) / current.totalRequests
  current.lastUsed = Date.now()

  performanceMetrics.set(model, current)
}

function selectOptimalModel(input: string, userModel: string, category: string): string {
  // If user explicitly chose a model, respect their choice
  if (userModel && (userModel === "groq" || userModel === "openai")) {
    return userModel
  }

  // Intelligent selection based on input characteristics
  const inputLength = input.length
  const complexity = input.split(" ").length
  const hasSpecialRequirements = /\b(detailed|complex|comprehensive|thorough|in-depth)\b/i.test(input)

  // For complex academic or business prompts, prefer OpenAI
  if ((category === "academic" || category === "business") && (complexity > 20 || hasSpecialRequirements)) {
    return "openai"
  }

  // For simple creative or coding prompts, prefer Groq for speed
  if ((category === "creative" || category === "coding") && complexity < 15 && inputLength < 200) {
    return "groq"
  }

  // Default to Groq for speed and cost efficiency
  return "groq"
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let selectedModelName = "groq"
  let attemptCount = 0
  const maxAttempts = 3

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

    const { input, category, model = "auto" } = await request.json()

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

    selectedModelName = selectOptimalModel(input, model, category)

    console.log("[v0] Processing prompt optimization", {
      category,
      requestedModel: model,
      selectedModel: selectedModelName,
      inputLength: input.length,
      complexity: input.split(" ").length,
    })

    const optimizationPrompt = `Transform this messy user input into a perfectly optimized ${category} prompt:

"${input}"

OPTIMIZATION REQUIREMENTS:
- Make it clear, specific, and actionable
- Include all necessary context and requirements
- Structure it for maximum AI comprehension
- Add relevant constraints and success criteria
- Ensure it's 2-4 sentences but comprehensive
- Focus on ${category}-specific best practices

Return ONLY the optimized prompt, nothing else.`

    let lastError: Error | null = null

    while (attemptCount < maxAttempts) {
      try {
        attemptCount++
        const config = modelConfigs[selectedModelName as keyof typeof modelConfigs]

        console.log(`[v0] Attempt ${attemptCount} using ${selectedModelName}`)

        const { text } = await generateText({
          model: config.model,
          system: systemPrompt,
          prompt: optimizationPrompt,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          topP: config.topP,
          frequencyPenalty: config.frequencyPenalty,
          presencePenalty: config.presencePenalty,
        })

        const latency = Date.now() - startTime
        updatePerformanceMetrics(selectedModelName, latency, true)

        console.log("[v0] Successfully optimized prompt", {
          outputLength: text.length,
          latency: `${latency}ms`,
          model: selectedModelName,
          attempts: attemptCount,
        })

        return NextResponse.json({
          optimizedPrompt: text.trim(),
          metadata: {
            model: selectedModelName,
            category: category,
            timestamp: new Date().toISOString(),
            latency: latency,
            inputComplexity: input.split(" ").length,
            optimization: model === "auto" ? "intelligent" : "manual",
            attempts: attemptCount,
          },
        })
      } catch (error) {
        lastError = error as Error
        console.log(`[v0] Attempt ${attemptCount} failed with ${selectedModelName}:`, error)

        // If OpenAI fails due to quota/billing, immediately switch to Groq
        if (selectedModelName === "openai" && error instanceof Error) {
          if (
            error.message.includes("quota") ||
            error.message.includes("billing") ||
            error.message.includes("exceeded")
          ) {
            console.log("[v0] OpenAI quota exceeded, switching to Groq")
            selectedModelName = "groq"
            continue
          }
        }

        // If Groq fails, try OpenAI (unless we already tried it)
        if (selectedModelName === "groq" && attemptCount < maxAttempts) {
          console.log("[v0] Groq failed, trying OpenAI")
          selectedModelName = "openai"
          continue
        }

        // If we've tried both models, break
        if (attemptCount >= 2) {
          break
        }
      }
    }

    // If all attempts failed
    const latency = Date.now() - startTime
    updatePerformanceMetrics(selectedModelName, latency, false)

    console.error(
      `[v0] Error optimizing prompt: Failed after ${attemptCount} attempts. Last error:`,
      lastError?.message,
    )

    if (lastError?.message.includes("quota") || lastError?.message.includes("billing")) {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please try again later or contact support." },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: "Failed to optimize prompt after multiple attempts. Please try again." },
      { status: 500 },
    )
  } catch (error) {
    const latency = Date.now() - startTime
    updatePerformanceMetrics(selectedModelName, latency, false)

    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  const metrics = Object.fromEntries(
    Array.from(performanceMetrics.entries()).map(([model, data]) => [
      model,
      {
        ...data,
        averageLatency: Math.round(data.totalLatency / data.totalRequests),
        successRate: Math.round(data.successRate * 100),
      },
    ]),
  )

  return NextResponse.json({ metrics, timestamp: new Date().toISOString() })
}
