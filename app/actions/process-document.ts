"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function archiveDocument(fileUrl: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        { 
          role: "system", 
          content: "Respond STRICTLY in the format 'Category: Summary'. Categories: Receipt, ID, or Work." 
        },
        { role: "user", content: `Analyze: ${fileUrl}` }
      ],
      temperature: 0.1,
    });

    const aiText = completion.choices[0].message.content || "General: No summary.";
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

    await db.document.create({
      data: { url: fileUrl, summary, category },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Archive Error:", error);
    await db.document.create({
      data: { url: fileUrl, summary: "AI analysis failed.", category: "Error" },
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