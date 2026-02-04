"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

// FIX: Use require for pdf-parse to avoid Turbopack/ESM build errors
const pdf = require("pdf-parse");

/**
 * ARCHIVE: Processes document content via AI and saves to database.
 */
export async function archiveDocument(fileUrl: string, base64Data?: string) {
  try {
    let contentToAnalyze = "";

    // 1. CONTENT EXTRACTION LOGIC
    if (fileUrl.toLowerCase().endsWith(".pdf")) {
      setStatusMessage("Extracting PDF text...");
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      // pdf-parse works with Buffers
      const data = await pdf(Buffer.from(buffer));
      contentToAnalyze = data.text.trim().substring(0, 3000);
    }

    const messages: any[] = [
      { 
        role: "system", 
        content: `You are a professional document analyzer. 
        Categorize the document into: Receipt, ID, or Work.
        - ID: Gov-issued cards/passports.
        - Receipt: Transaction slips/invoices.
        - Work: Q&A, reports, resumes, or generic docs.
        
        Provide a 2-3 sentence summary based ONLY on the actual text provided. 
        Respond ONLY in JSON format with keys "category" and "summary".` 
      }
    ];

    // 2. CHOOSE ANALYSIS MODE
    if (base64Data && !fileUrl.toLowerCase().endsWith(".pdf")) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze this image:" },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
        ]
      });
    } else {
      messages.push({ 
        role: "user", 
        content: contentToAnalyze 
          ? `Analyze this text content: ${contentToAnalyze}`
          : `Analyze this document: ${fileUrl}` 
      });
    }

    // 3. AI COMPLETION
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", 
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    
    // 4. DATABASE SYNC
    const validCategories = ["Receipt", "ID", "Work"];
    const finalCategory = validCategories.includes(aiResponse.category) 
      ? aiResponse.category 
      : "Work";

    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: aiResponse.summary || "Document archived.", 
        category: finalCategory 
      },
    });

    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Archive Error:", error);
    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: "Analysis failed. Content could not be parsed.", 
        category: "General" 
      },
    });
    revalidatePath("/");
    return { success: false, error: error.message };
  }
}

/**
 * DELETE: Removes a document record.
 */
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

// Helper to avoid build-time errors if called on client
function setStatusMessage(msg: string) {
  console.log(`[Status]: ${msg}`);
}