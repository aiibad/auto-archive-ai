"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function archiveDocument(fileUrl: string, base64Data?: string) {
  try {
    let contentToAnalyze = "";

    // 1. PDF TEXT EXTRACTION
    if (fileUrl.toLowerCase().endsWith(".pdf")) {
      // Use require for the external package defined in next.config.js
      const pdf = require("pdf-parse");
      
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      
      // Extraction now works, providing real text like "Jr.kg practice paper"
      const data = await pdf(Buffer.from(buffer));
      contentToAnalyze = data.text.trim().substring(0, 3000); 
    }

    const messages: any[] = [
      { 
        role: "system", 
        content: `You are a document analyzer. Categorize into: Receipt, ID, or Work.
        - Work: Includes school papers, practice sheets, or reports.
        Respond ONLY in JSON format: { "category": "...", "summary": "..." }` 
      }
    ];

    // 2. DATA HAND-OFF TO AI
    messages.push({ 
      role: "user", 
      content: contentToAnalyze 
        ? `Analyze this content: ${contentToAnalyze}` 
        : `Analyze this document URL: ${fileUrl}` 
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    
    // 3. DATABASE SYNC
    const valid = ["Receipt", "ID", "Work"];
    const finalCategory = valid.includes(aiResponse.category) ? aiResponse.category : "Work";

    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: aiResponse.summary || "Archived.", 
        category: finalCategory 
      },
    });

    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Archive Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(id: string) {
  try {
    await db.document.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}