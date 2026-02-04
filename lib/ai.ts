import OpenAI from "openai";

export const openai = new OpenAI({
  // This tells the SDK to talk to DeepSeek instead of OpenAI
  baseURL: "https://api.deepseek.com", 
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function askDeepSeek(prompt: string) {
  const response = await openai.chat.completions.create({
    // Use 'deepseek-chat' for general tasks or 'deepseek-reasoner' for R1
    model: "deepseek-chat", 
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ],
  });

  return response.choices[0].message.content;
}