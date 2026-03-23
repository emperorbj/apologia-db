import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** MVP: stateless AI apologist — no chat persistence */
export const sendChat = async (request, response) => {
  try {
    const { question } = request.body;
    const userId = request.user?.userId;
    if (!userId || !question || typeof question !== "string") {
      return response.status(400).json({ error: "invalid input" });
    }

    const prompt = `You are a professional Christian apologist with expertise in theology and apologetics.
      Answer the following question in a clear, respectful, and biblically grounded manner.
      Format your response in Markdown, using headings, lists, and emphasis where appropriate.
      Question: ${question}`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    });
    const aiResponse = completion.choices?.[0]?.message?.content || "No answer generated.";

    return response.status(200).json({ answer: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    if (error.message?.includes("Quota exceeded")) {
      return response.status(429).json({ error: "API quota exceeded, please try again later" });
    }
    response.status(500).json({ error: "Internal server error" });
  }
};
