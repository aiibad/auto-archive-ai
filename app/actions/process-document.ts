"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

/**
 * Server Action to archive a document URL by analyzing it with AI 
 * and saving the results to the database.
 */
export async function archiveDocument(fileUrl: string) {
  try {
    // 1. Request AI Analysis from OpenRouter (using a free model)
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat:free",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that categorizes documents. Respond strictly in the format 'Category: Summary'. Categories must be one of: Receipt, ID, or Work." 
        },
        { 
          role: "user", 
          content: `Please analyze this document URL: ${fileUrl}` 
        }
      ],
      temperature: 0.3,
    });

    const aiText = completion.choices[0].message.content || "Uncategorized: No summary available.";
    
    // 2. Extract Category and Summary logic
    let category = "General";
    let summary = aiText;

    if (aiText.includes(":")) {
      const parts = aiText.split(":");
      category = parts[0].trim();
      summary = parts.slice(1).join(":").trim();
    }

    // 3. Save to Neon Database via the db singleton
    await db.document.create({
      data: {
        url: fileUrl,
        summary: summary,
        category: category,
      },
    });

    // 4. Refresh the page data to show the new entry
    revalidatePath("/");
    
    return { success: true };

  } catch (error: any) {
    console.error("Archive Error:", error);
    
    // Fallback: Still save the URL to the database even if the AI fails
    await db.document.create({
      data: {
        url: fileUrl,
        summary: "AI analysis failed. Please check your OpenRouter quota or connection.",
        category: "Error",
      },
    });

    revalidatePath("/");
    return { success: false, error: error.message };
  }
}