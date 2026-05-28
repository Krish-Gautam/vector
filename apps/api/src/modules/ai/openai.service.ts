import { openai } from "../../data/openai.client.js";

export class OpenAIService {
  static async generateRoadmap(
    prompt: string
  ) {
    const response =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              "You are a roadmap generation AI.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        response_format: {
          type: "json_object",
        },
      });

    return response.choices[0]
      .message.content;
  }
}