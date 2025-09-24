"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Stats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  categoryBreakdown: {
    creative: number
    coding: number
    business: number
    academic: number
  }
  modelUsage: {
    groq: number
    openai: number
  }
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [health, setHealth] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([fetch("/api/stats"), fetch("/api/health")])

        const statsData = await statsRes.json()
        const healthData = await healthRes.json()

        setStats(statsData)
        setHealth(healthData)
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (!stats || !health) {
    return <div className="p-8">Loading admin dashboard...</div>
  }

  const successRate =
    stats.totalRequests > 0 ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1) : "0"

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SYNTRA Admin Dashboard</h1>
        <Badge variant={health.status === "healthy" ? "default" : "destructive"}>{health.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.failedRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Groq:</span>
                <Badge variant={health.services.groq === "configured" ? "default" : "destructive"} className="text-xs">
                  {health.services.groq}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">OpenAI:</span>
                <Badge
                  variant={health.services.openai === "configured" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {health.services.openai}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Usage</CardTitle>
            <CardDescription>Breakdown by prompt category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="flex justify-between">
                  <span className="capitalize">{category}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Usage</CardTitle>
            <CardDescription>AI model preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.modelUsage).map(([model, count]) => (
                <div key={model} className="flex justify-between">
                  <span className="capitalize">{model}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
