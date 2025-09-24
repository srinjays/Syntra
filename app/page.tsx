"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Sparkles, Wand2, CheckCircle, Zap, CloudLightning as Lightning, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const categories = [
  { id: "creative", label: "Creative", icon: "🎨", description: "Art, writing, design prompts" },
  { id: "coding", label: "Coding", icon: "💻", description: "Programming and development" },
  { id: "business", label: "Business", icon: "📊", description: "Strategy, analysis, planning" },
  { id: "academic", label: "Academic", icon: "📚", description: "Research, learning, analysis" },
]

const aiTools = [{ name: "ChatGPT" }, { name: "Gemini" }, { name: "Groq" }, { name: "Perplexity" }]

const models = [
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

export default function PromptOptimizer() {
  const [input, setInput] = useState("")
  const [category, setCategory] = useState("creative")
  const [selectedModel, setSelectedModel] = useState("groq")
  const [optimizedPrompt, setOptimizedPrompt] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SYNTRA
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Transform your messy ideas into perfectly structured AI prompts. Get better results from any AI tool with
            optimized, professional prompts.
          </p>
        </div>

        {/* AI Tools Compatibility Section */}
        <Card className="mb-6 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Compatible with All Major AI Tools
            </CardTitle>
            <CardDescription>
              Use your optimized prompts across any AI platform for consistent, professional results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aiTools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{tool.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Universal Compatibility
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Choose AI Model
            </CardTitle>
            <CardDescription>Select the AI model that best fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => {
                const IconComponent = model.icon
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                      selectedModel === model.id ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        <h3 className="font-medium">{model.name}</h3>
                      </div>
                      <Badge
                        variant={selectedModel === model.id ? "default" : "secondary"}
                        className={selectedModel === model.id ? "bg-primary" : ""}
                      >
                        {model.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Choose Your Category
            </CardTitle>
            <CardDescription>Select the type of prompt you want to optimize for better results</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={category} onValueChange={setCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Raw Idea</CardTitle>
            <CardDescription>
              Enter your messy, incomplete, or vague prompt. Don't worry about structure - we'll fix it!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Example: make me something cool for my website header that looks modern and has good colors..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-32 resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">{input.length} characters</p>
              <Button onClick={optimizePrompt} disabled={isOptimizing || !input.trim()} className="min-w-32">
                {isOptimizing ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize Prompt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        {optimizedPrompt && (
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Optimized Prompt
                  </CardTitle>
                  <CardDescription>Your polished, professional prompt ready to use</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {categories.find((c) => c.id === category)?.label}
                  </Badge>
                  <Badge variant="outline">{models.find((m) => m.id === selectedModel)?.badge}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="bg-muted/50 rounded-lg p-4 pr-12 border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{optimizedPrompt}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Pro tip:</strong> Copy this optimized prompt and paste it into any AI tool above for much
                  better results!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>SYNTRA • Built for better AI interactions • Transform any idea into a perfect prompt</p>
        </div>
      </div>
    </div>
  )
}
