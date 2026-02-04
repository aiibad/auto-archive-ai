"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function archiveDocument(fileUrl: string, base64Data?: string) {
  try {
    const messages: any[] = [
      { 
        role: "system", 
        content: `You are a document analyzer. Categorize into: Receipt, ID, or Work. 
        Rules: 
        - ID: Gov-issued IDs, Passports, Licenses.
        - Receipt: Invoices, bills, transaction slips.
        - Work: Reports, resumes, professional files.
        Respond ONLY in JSON: { "category": "...", "summary": "2-3 detailed sentences" }` 
      }
    ];

    if (base64Data) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Classify this image:" },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
        ]
      });
    } else {
      messages.push({ role: "user", content: `Analyze this document: ${fileUrl}` });
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    
    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: aiResponse.summary || "Archived successfully.", 
        category: aiResponse.category || "Work" 
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}