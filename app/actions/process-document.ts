"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function archiveDocument(fileUrl: string) {
  try {
    // UPDATED PROMPT: Giving the AI better instructions for file analysis
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        { 
          role: "system", 
          content: "You are a professional document analyzer. Review the document URL provided and categorize it as 'Receipt', 'ID', or 'Work'. Respond STRICTLY in the format: 'Category: Brief Summary'." 
        },
        { role: "user", content: `Analyze this document: ${fileUrl}` }
      ],
      temperature: 0.1,
    });

    const aiText = completion.choices[0].message.content || "General: No summary available.";
    let category = "General";
    let summary = aiText;

    if (aiText.includes(":")) {
      const parts = aiText.split(":");
      const extractedCat = parts[0].trim();
      const validCategories = ["Receipt", "ID", "Work"];
      if (validCategories.includes(extractedCat)) {
        category = extractedCat;
        summary = parts.slice(1).join(":").trim();
      }
    }

    // Save success record
    await db.document.create({
      data: { url: fileUrl, summary, category },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Archive Error:", error);
    
    // FALLBACK: Don't let the UI break; save it as 'General' if the AI fails
    await db.document.create({
      data: { url: fileUrl, summary: "Document archived successfully (AI analysis was unavailable).", category: "General" },
    });
    
    revalidatePath("/");
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(id: string) {
  try {
    await db.document.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
}