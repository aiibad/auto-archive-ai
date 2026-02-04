"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import pdf from "pdf-parse";

/**
 * ARCHIVE: Processes document content via AI and saves to database.
 * Handles PDF text extraction and Image Vision analysis.
 */
export async function archiveDocument(fileUrl: string, base64Data?: string) {
  try {
    let contentToAnalyze = "";

    // 1. CONTENT EXTRACTION LOGIC
    if (fileUrl.toLowerCase().endsWith(".pdf")) {
      // Fetch the PDF and extract raw text so the AI doesn't have to "guess"
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      const data = await pdf(Buffer.from(buffer));
      // Use the first 3000 characters to stay within token limits while capturing context
      contentToAnalyze = data.text.trim().substring(0, 3000);
    }

    const messages: any[] = [
      { 
        role: "system", 
        content: `You are a professional document analyzer. 
        Categorize the document into: Receipt, ID, or Work.
        - ID: Government identification, passports, or licenses.
        - Receipt: Bills, invoices, or transaction records.
        - Work: Everything else, including Q&A documents, reports, or resumes.
        
        Provide a detailed 2-3 sentence summary based ONLY on the actual text provided. 
        If you see questions and answers, summarize the subject matter of the questions.
        Respond ONLY in JSON format with keys "category" and "summary".` 
      }
    ];

    // 2. CHOOSE ANALYSIS MODE (Vision for Images, Text for PDFs/Links)
    if (base64Data && !fileUrl.toLowerCase().endsWith(".pdf")) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze this document image accurately:" },
          { 
            type: "image_url", 
            image_url: { url: `data:image/jpeg;base64,${base64Data}` } 
          }
        ]
      });
    } else {
      messages.push({ 
        role: "user", 
        content: contentToAnalyze 
          ? `Analyze this extracted text: ${contentToAnalyze}`
          : `Analyze this document URL: ${fileUrl}` 
      });
    }

    // 3. AI COMPLETION
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", 
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for factual accuracy
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
        summary: aiResponse.summary || "Document archived successfully.", 
        category: finalCategory 
      },
    });

    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Archive Error:", error);
    
    // Fallback: Save with generic category if AI fails
    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: "Analysis unavailable. Document archived manually.", 
        category: "General" 
      },
    });
    
    revalidatePath("/");
    return { success: false, error: error.message };
  }
}

/**
 * DELETE: Removes a document record from the database.
 * Used by the DocumentCard component.
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