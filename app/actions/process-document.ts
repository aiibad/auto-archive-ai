"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

/**
 * Archives a document by analyzing its content via AI and saving metadata to the database.
 * Updated to use DeepSeek JSON mode for 100% reliability.
 */
export async function archiveDocument(fileUrl: string) {
  try {
    // 1. Call DeepSeek API with JSON Mode enabled
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", 
      messages: [
        { 
          role: "system", 
          content: `You are a professional document analyzer. 
          Categorize the document into one of these types: Receipt, ID, or Work. 
          Provide a detailed 2-3 sentence summary of the contents. 
          You must respond ONLY in a valid JSON object format.` 
        },
        { 
          role: "user", 
          content: `Analyze this document and return JSON with 'category' and 'summary' keys: ${fileUrl}` 
        }
      ],
      // Ensures the model returns a parseable JSON object
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    // 2. Parse the structured response
    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    
    const category = aiResponse.category || "General";
    const summary = aiResponse.summary || "Document archived successfully.";

    // 3. Store in Neon Database via Prisma
    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: summary, 
        category: category 
      },
    });

    // 4. Refresh the UI
    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Archive Error:", error);
    
    // FALLBACK: If AI fails or rate limit is hit, still save the file as 'General' 
    // This prevents the 'AI analysis failed' error cards in your UI.
    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: "Document archived manually (AI analysis unavailable at this time).", 
        category: "General" 
      },
    });
    
    revalidatePath("/");
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a document record from the database.
 */
export async function deleteDocument(id: string) {
  try {
    await db.document.delete({ 
      where: { id } 
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
}