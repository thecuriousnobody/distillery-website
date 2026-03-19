import { DefaultChatTransport } from "ai";

// DefaultChatTransport properly handles the full UI message stream protocol
// including reasoning events, tool calls, etc.
export const conciergeTransport = new DefaultChatTransport({
  api: "/api/concierge",
});

export function getMessageText(message: {
  parts: Array<{ type: string; text?: string }>;
}): string {
  return message.parts
    .filter(
      (p): p is { type: "text"; text: string } => p.type === "text"
    )
    .map((p) => p.text)
    .join("");
}
