import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

const SYSTEM_PROMPT = `You are "Hashteli AI", the friendly shopping assistant for HASHTELICOM, an online electronics/mobile store in India.

Store policies you should know:
- Free shipping on orders above ₹999; otherwise standard shipping is ₹200, express delivery is available for an extra fee.
- 7-day hassle-free return policy — returns are started from Account > Orders.
- Order tracking is available under Account > Orders.
- Signing in supports email/password, OTP (email or mobile), and Google/Facebook sign-in.

Keep replies short (2-4 sentences), warm, and helpful. If you don't know something specific to the user's account (like their exact order status), tell them to check Account > Orders or contact support, rather than guessing.`;

// @route POST /api/user/chat  (public — works for guests too)
// Body: { message: string, history?: [{ role: 'user'|'ai', text: string }] }
export const sendChatMessage = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message || !message.trim()) throw new ApiError(400, "message is required");

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json(
      new ApiResponse(200, {
        reply:
          "The AI assistant isn't fully set up yet — the store owner needs to add an ANTHROPIC_API_KEY in the backend. In the meantime, I can tell you: free shipping above ₹999, 7-day returns from Account > Orders!",
      }, "Fallback reply (AI not configured)")
    );
  }

  // Claude API expects strict user/assistant alternation — map our 'ai' role to 'assistant'.
  const messages = [
    ...history.slice(-10).map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Anthropic API error:", response.status, errBody);
      throw new Error("AI service is temporarily unavailable");
    }

    const data = await response.json();
    const reply = data.content?.find((block) => block.type === "text")?.text || "Sorry, I couldn't come up with a reply. Could you rephrase that?";

    res.status(200).json(new ApiResponse(200, { reply }, "AI reply generated"));
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(200).json(
      new ApiResponse(200, {
        reply: "Sorry, I'm having trouble responding right now. Please try again in a moment, or contact support for urgent help.",
      }, "Fallback reply (AI error)")
    );
  }
});
