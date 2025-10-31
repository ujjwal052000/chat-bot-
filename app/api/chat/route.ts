import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing messages" }), { status: 400 })
    }

    const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    const apiKey = (rawKey || "").trim()
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server missing GEMINI_API_KEY/GOOGLE_API_KEY" }),
        { status: 500 },
      )
    }

    // Lazy import to avoid bundling if not used
    const { GoogleGenerativeAI } = await import("@google/generative-ai")

    const genAI = new GoogleGenerativeAI(apiKey)
    // Use tuples: [sdkModel, restModel]
    const modelCandidates = [
      ["models/gemini-2.5-pro", "gemini-2.5-pro"]
    ] as const

    const systemPreamble =
      "You are Cool Buddy, a helpful, concise assistant inside a web chat. Respond clearly."

    // Build a single user prompt from history for simplicity
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n")

    const prompt = `${systemPreamble}\n\n${conversationText}`

    // Try SDK with full name ('models/gemini-2.5-pro')
    let lastError: any = null
    for (const [sdkModel] of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: sdkModel })
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        })
        const text = result.response.text()
        return new Response(
          JSON.stringify({ reply: text, provider: `sdk:${sdkModel}` }),
          { headers: { "Content-Type": "application/json" } },
        )
      } catch (err) {
        lastError = err
      }
    }

    // Fallback to REST with short name ('gemini-2.5-pro')
    for (const [, restModel] of modelCandidates) {
      const restUrl =
        "https://generativelanguage.googleapis.com/v1/models/" +
        encodeURIComponent(restModel) +
        ":generateContent?key=" +
        encodeURIComponent(apiKey)
      const restBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }
      const restRes = await fetch(restUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restBody),
      })
      const restJson: any = await restRes.json().catch(() => ({}))
      if (restRes.ok) {
        const text = restJson?.candidates?.[0]?.content?.parts?.[0]?.text || ""
        return new Response(
          JSON.stringify({ reply: text, provider: `rest:${restModel}` }),
          { headers: { "Content-Type": "application/json" } },
        )
      }
      lastError = new Error(
        `REST error ${restRes.status}: ${restJson?.error?.message || JSON.stringify(restJson) || "unknown"}`,
      )
      console.error("[REST Error Detail]", restJson)
    }

    throw lastError || new Error("All providers/models failed")
  } catch (err: any) {
    console.error("/api/chat error", err)
    const detail = err?.message || err?.toString?.() || "Unknown error"
    // New: Always respond with error details
    return new Response(
      JSON.stringify({ error: "Failed to generate response", detail, stack: err?.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function GET() {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing Gemini API key" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    const json = await response.json();
    return new Response(JSON.stringify(json, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: response.status,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch models", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


