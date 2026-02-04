"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

/**
 * ARCHIVE: Analyzes and saves documents
 */
export async function archiveDocument(fileUrl: string, base64Data?: string) {
  try {
    const messages: any[] = [
      { 
        role: "system", 
        content: `You are a professional document classifier. 
        Identify the category based on these rules:
        - ID: Government identification like Passports or Licenses.
        - Receipt: Store transaction slips or bills.
        - Work: Professional documents, reports, or resumes.
        
        Provide a detailed 2-3 sentence summary. Respond ONLY in valid JSON format.` 
      }
    ];

    if (base64Data) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze this document image:" },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
        ]
      });
    } else {
      messages.push({ 
        role: "user", 
        content: `Analyze this document URL: ${fileUrl}` 
      });
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", 
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    const validCategories = ["Receipt", "ID", "Work"];
    const category = validCategories.includes(aiResponse.category) ? aiResponse.category : "Work";

    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: aiResponse.summary || "Document archived.", 
        category 
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Archive Error:", error);
    await db.document.create({
      data: { url: fileUrl, summary: "AI analysis unavailable.", category: "General" },
    });
    revalidatePath("/");
    return { success: false };
  }
}

/**
 * DELETE: Removes a document (Resolving Vercel Build Error)
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