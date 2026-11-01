import { Bot, webhookCallback } from "grammy";
import Groq from "groq-sdk";

const bot = new Bot(process.env.BOT_TOKEN!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "openai/gpt-oss-120b"; // or "openai/gpt-oss-20b" for faster replies

bot.command("start", (ctx) =>
  ctx.reply("Hi, I'm Zenitsu! Ask me anything and I'll answer using AI.")
);

bot.on("message:text", async (ctx) => {
  await ctx.replyWithChatAction("typing");

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Keep replies short.",
        },
        { role: "user", content: ctx.message.text },
      ],
      reasoning_effort: "low",
      max_completion_tokens: 1024,
    });

    let reply = completion.choices[0]?.message?.content?.trim() || "No reply.";

    // Telegram rejects messages longer than 4096 characters
    if (reply.length > 4000) {
      reply = reply.slice(0, 4000) + "...";
    }

    await ctx.reply(reply);
  } catch (err) {
    console.error("Groq error:", err);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
});

export default webhookCallback(bot, "https");