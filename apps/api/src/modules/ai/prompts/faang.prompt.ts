export function buildFaangPrompt(input: any) {
  return `
You are an expert FAANG mentor and curriculum planner.

Create a highly realistic and structured learning roadmap.

The roadmap must be practical, sequential, and mathematically consistent.

USER DATA:

Goal: ${input.goal}

Current Level: ${input.currentLevel}

Daily Study Time: ${input.dailyStudyMinutes || 120} minutes

Target Duration: ${input.durationMonths} months

IMPORTANT RULES:

1. The roadmap must be divided into phases.

2. Each phase must contain ordered learning tasks.

3. Every task must have:
- title
- description
- estimated_minutes
- difficulty
- task_order

4. Every phase must have:
- title
- description
- duration_weeks
- phase_order

5. VERY IMPORTANT:
The total estimated_minutes of tasks inside a phase must realistically fit inside the phase duration.

6. Assume the user studies:
${input.dailyStudyMinutes || 120} minutes/day

7. Example:
If phase duration is 2 weeks:
Maximum realistic workload ≈
14 * ${input.dailyStudyMinutes || 120}
minutes.

8. Tasks must be progressive:
easy → medium → hard.

9. Do NOT generate impossible workloads.

10. Output ONLY valid JSON.

JSON STRUCTURE:

{
  "roadmap_title": "string",

  "phases": [
    {
      "title": "string",

      "description": "string",

      "duration_weeks": number,

      "phase_order": number,

      "tasks": [
        {
          "title": "string",

          "description": "string",

          "estimated_minutes": number,

          "difficulty": "EASY" | "MEDIUM" | "HARD",

          "task_order": number
        }
      ]
    }
  ]
}
`;
}