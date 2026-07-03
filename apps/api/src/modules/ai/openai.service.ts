import { openai } from "../../data/openai.client.js";
import { buildCircleDeterminationPrompt } from "./prompts/circle.prompt.js";

export class OpenAIService {
  static async generateRoadmap(
    prompt: string
  ) {
    const response =
      await openai.chat.completions.create({
        model: "gpt-5",

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

  static async determineCircleDetails(goalDescription: string, currentLevel: string) {
    const prompt = buildCircleDeterminationPrompt(goalDescription, currentLevel);
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a specialized AI that refines goals and names execution circles.",
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

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned empty response for circle determination");
    }

    return JSON.parse(content) as {
      refined_goal_title: string;
      circle_name: string;
      goal_category: string;
    };
  }

}