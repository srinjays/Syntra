"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Sparkles,
  Wand2,
  CheckCircle,
  CloudLightning as Lightning,
  Brain,
  Github,
  Twitter,
  Mail,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

const categories = [
  { id: "creative", label: "Creative", icon: "🎨", description: "Art, writing, design prompts" },
  { id: "coding", label: "Coding", icon: "💻", description: "Programming and development" },
  { id: "business", label: "Business", icon: "📊", description: "Strategy, analysis, planning" },
  { id: "academic", label: "Academic", icon: "📚", description: "Research, learning, analysis" },
]

const aiTools = [{ name: "ChatGPT" }, { name: "Gemini" }, { name: "Groq" }, { name: "Perplexity" }]

const models = [
  {
    id: "auto",
    name: "Auto (Smart)",
    description: "AI selects optimal model • Best results",
    icon: Brain,
    badge: "Smart",
  },
  {
    id: "groq",
    name: "Groq (Fast)",
    description: "Lightning fast • Cost effective",
    icon: Lightning,
    badge: "Fast",
  },
  {
    id: "openai",
    name: "OpenAI (Quality)",
    description: "Higher quality • More detailed",
    icon: Brain,
    badge: "Quality",
  },
]

const categoryExamples = {
  creative: {
    example: "Write a story about a time traveler",
    optimized:
      "Create a compelling 500-word short story featuring a time traveler who discovers that changing the past has unexpected consequences. Include vivid descriptions, dialogue, and a twist ending that reveals the true nature of time travel.",
    tips: "Perfect for creative writing, storytelling, and artistic projects",
  },
  coding: {
    example: "Make a login form",
    optimized:
      "Create a responsive login form component using React and TypeScript with the following requirements: email/password validation, loading states, error handling, accessibility features (ARIA labels), and integration with a authentication API endpoint.",
    tips: "Ideal for development tasks, code generation, and technical documentation",
  },
  business: {
    example: "Analyze market trends",
    optimized:
      "Conduct a comprehensive market trend analysis for [specific industry] covering the following aspects: current market size, growth projections for next 3 years, key competitors, emerging opportunities, potential risks, and actionable recommendations for strategic positioning.",
    tips: "Great for business strategy, market research, and professional analysis",
  },
  academic: {
    example: "Explain quantum physics",
    optimized:
      "Provide a comprehensive explanation of quantum physics fundamentals suitable for undergraduate students, covering: wave-particle duality, quantum superposition, entanglement, uncertainty principle, and practical applications. Include relevant examples, analogies, and suggest further reading materials.",
    tips: "Perfect for research, learning, educational content, and academic writing",
  },
}

export default function PromptOptimizer() {
  const [input, setInput] = useState("")
  const [category, setCategory] = useState("creative")
  const [selectedModel, setSelectedModel] = useState("auto")
  const [optimizedPrompt, setOptimizedPrompt] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [optimizationMetadata, setOptimizationMetadata] = useState<any>(null)
  const { toast } = useToast()

  const optimizePrompt = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a prompt to optimize.",
        variant: "destructive",
      })
      return
    }

    setIsOptimizing(true)

    try {
      const response = await fetch("/api/optimize-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: input.trim(),
          category,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to optimize prompt")
      }

      const data = await response.json()
      setOptimizedPrompt(data.optimizedPrompt)
      setOptimizationMetadata(data.metadata)
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Optimized prompt copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      })
    }
  }

  const scrollToOptimizer = () => {
    console.log("[v0] Scrolling to optimizer section")
    const element = document.getElementById("optimizer")
    console.log("[v0] Found optimizer element:", element)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const scrollToCategories = () => {
    console.log("[v0] Scrolling to categories section")
    const element = document.getElementById("categories")
    console.log("[v0] Found categories element:", element)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="gradient-bg">
        {/* Navigation */}
        <nav className="border-b border-border/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                SYNTRA
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-16">
            <div className="mb-6">
              <h2 className="text-5xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                The fastest and most powerful platform for optimizing AI prompts
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
                Transform your messy ideas into perfectly structured AI prompts. Get better results from any AI tool
                with industry-leading optimization powered by advanced models.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToOptimizer} className="text-base px-8">
                Start optimizing
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToCategories}
                className="text-base px-8 bg-transparent"
              >
                View features
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-center mb-16">
            <p className="text-sm text-muted-foreground mb-8">Trusted by builders at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["OpenAI", "Anthropic", "Google", "Microsoft", "Meta"].map((company) => (
                <div key={company} className="text-lg font-medium text-muted-foreground">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl" id="optimizer">
        {/* AI Tools Compatibility Section */}
        <Card className="mb-8 border-primary/20" id="features">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6" />
              Compatible with All Major AI Tools
            </CardTitle>
            <CardDescription className="text-base">
              Use your optimized prompts across any AI platform for consistent, professional results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aiTools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-center p-6 bg-muted/30 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200 hover:bg-muted/50"
                >
                  <span className="text-sm font-medium text-foreground">{tool.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                Universal Compatibility
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Choose AI Model */}
        <Card className="mb-8 elegant-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              Choose AI Model
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Select the AI model that best fits your needs for optimal results
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {models.map((model) => {
                const IconComponent = model.icon
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`category-card p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedModel === model.id
                        ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${selectedModel === model.id ? "bg-primary/20" : "bg-muted/50"}`}
                        >
                          <IconComponent
                            className={`h-5 w-5 ${
                              selectedModel === model.id ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <h3 className="font-bold text-lg">{model.name}</h3>
                      </div>
                      <Badge
                        variant={selectedModel === model.id ? "default" : "secondary"}
                        className={`px-3 py-1 font-medium ${
                          selectedModel === model.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {model.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card className="mb-8 elegant-card purple-gradient-bg" id="categories">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              Choose Your Category
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Select the type of prompt you want to optimize for better, more targeted results
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`category-card p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    category === cat.id
                      ? "border-primary bg-gradient-to-br from-primary/15 to-primary/8 shadow-lg"
                      : "hover:border-primary/30"
                  }`}
                >
                  <div className="text-center space-y-3">
                    <div
                      className={`text-3xl p-3 rounded-2xl inline-block ${
                        category === cat.id ? "bg-primary/20" : "bg-muted/30"
                      }`}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{cat.label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected category highlight */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{categories.find((c) => c.id === category)?.icon}</div>
                <div>
                  <p className="font-semibold text-primary">
                    {categories.find((c) => c.id === category)?.label} Selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {categoryExamples[category as keyof typeof categoryExamples]?.tips}
                  </p>
                </div>
              </div>
            </div>

            {/* Category-specific example */}
            <div className="p-6 rounded-xl bg-muted/30 border border-border/50">
              <h4 className="font-semibold mb-3 text-primary">
                Example for {categories.find((c) => c.id === category)?.label}:
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Before (Raw idea):</p>
                  <div className="p-3 bg-muted/50 rounded-lg border text-sm">
                    "{categoryExamples[category as keyof typeof categoryExamples]?.example}"
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">After (Optimized):</p>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                    {categoryExamples[category as keyof typeof categoryExamples]?.optimized}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-8 elegant-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              Your Raw Idea
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your messy, incomplete, or vague prompt. Don't worry about structure - our AI will transform it into
              something amazing!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-6">
              <div className="relative">
                <Textarea
                  placeholder="Example: make me something cool for my website header that looks modern and has good colors and maybe some animations..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="premium-input min-h-40 resize-none text-base leading-relaxed rounded-2xl p-6 border-2"
                />
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-lg">
                  {input.length} characters
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>
                    Ready to optimize • {categories.find((c) => c.id === category)?.label} •{" "}
                    {models.find((m) => m.id === selectedModel)?.name}
                  </span>
                </div>
                <Button
                  onClick={optimizePrompt}
                  disabled={isOptimizing || !input.trim()}
                  className="min-w-48 h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isOptimizing ? (
                    <>
                      <Wand2 className="h-5 w-5 mr-3 animate-spin" />
                      Optimizing Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-3" />
                      Optimize My Prompt
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        {optimizedPrompt && (
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Optimized Prompt
                  </CardTitle>
                  <CardDescription>Your polished, professional prompt ready to use</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {categories.find((c) => c.id === category)?.label}
                  </Badge>
                  <Badge variant="outline">
                    {models.find((m) => m.id === optimizationMetadata?.model)?.badge || "Optimized"}
                  </Badge>
                  {optimizationMetadata?.latency && (
                    <Badge variant="secondary" className="text-xs">
                      {optimizationMetadata.latency}ms
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="bg-muted/50 rounded-xl p-6 pr-12 border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{optimizedPrompt}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="absolute top-3 right-3 h-8 w-8 p-0"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Pro tip:</strong> Copy this optimized prompt and paste it into any AI tool above for much
                  better results!
                  {optimizationMetadata?.optimization === "intelligent" && (
                    <span className="ml-2">
                      🤖 <strong>Smart selection:</strong> Used{" "}
                      {models.find((m) => m.id === optimizationMetadata.model)?.name} for optimal results.
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comprehensive Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">SYNTRA</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The fastest and most powerful platform for optimizing AI prompts. Transform any idea into a perfect
                prompt.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="mailto:hello@syntra.ai">
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  API
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Changelog
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Guides
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 SYNTRA. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Built with ❤️ for better AI interactions</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
