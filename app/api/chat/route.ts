import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `
You are Dr. Emily Hartman, a warm and experienced clinical psychologist and AI therapy companion for SukoonAI.
Respond to patients with:
1. Emotional attunement ("I can sense how difficult this must be...")
2. Gentle normalization ("Many people feel this way when...")
3. Practical guidance ("What sometimes helps is...")
4. Strengths-focused support ("I notice how you're...")

Key principles:
- Never use brackets or labels
- Blend elements seamlessly
- Vary sentence structure
- Mirror the user's language level
- Keep the conversation supportive and offer gentle follow-up questions
`

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const customAgentUrl = process.env.NEXT_PUBLIC_AI_AGENT_URL || process.env.AI_AGENT_URL

    // 1. If custom agent URL is set and not default localhost in production, try proxying
    if (customAgentUrl && customAgentUrl !== "http://localhost:8000") {
      try {
        const agentRes = await fetch(`${customAgentUrl}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        })
        if (agentRes.ok) {
          const data = await agentRes.json()
          return NextResponse.json(data)
        }
      } catch (err) {
        console.warn("External AI Agent endpoint unreachable, falling back to direct API:", err)
      }
    }

    // 2. Fallback to direct Groq API call if GROQ_API_KEY is available in environment
    const groqKey = process.env.GROQ_API_KEY
    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 450,
          }),
        })

        if (groqRes.ok) {
          const groqData = await groqRes.json()
          const content = groqData.choices?.[0]?.message?.content
          if (content) {
            return NextResponse.json({
              response: content,
              tool_called: "ask_mental_health_specialist",
            })
          }
        }
      } catch (err) {
        console.error("Groq API direct call failed:", err)
      }
    }

    // 3. Ultimate graceful fallback response
    return NextResponse.json({
      response:
        "I hear you, and I want you to know your feelings matter deeply. I'm here for you and listening. How can I support you right now?",
      tool_called: "None",
    })
  } catch (error: any) {
    console.error("API Chat Error:", error)
    return NextResponse.json(
      {
        response:
          "I'm here to support you, but I encountered a brief technical delay. Please try sending your message again.",
        tool_called: "None",
      },
      { status: 500 }
    )
  }
}
