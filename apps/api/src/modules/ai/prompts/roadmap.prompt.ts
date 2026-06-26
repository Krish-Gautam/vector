// persona.service.ts
import { openai } from "../../../data/openai.client.js";

export interface GoalPersona {
  mentor: string;
  focusAreas: string;
  successMetric: string;
}

const GOAL_PERSONAS: Record<string, GoalPersona> = {
  faang: {
    mentor: "expert FAANG engineer and technical interview coach",
    focusAreas: "Data Structures, Algorithms, System Design, and Behavioral interviews",
    successMetric: "passing FAANG-level technical interviews",
  },
  dsa: {
    mentor: "competitive programming expert and DSA specialist",
    focusAreas: "Arrays, Trees, Graphs, Dynamic Programming, and Problem Solving patterns",
    successMetric: "mastering Data Structures and Algorithms from fundamentals to advanced",
  },
  competitive_exam: {
    mentor: "exam strategist and subject matter expert",
    focusAreas: "syllabus coverage, mock tests, weak area improvement, and time management",
    successMetric: "clearing the target competitive exam with a high score",
  },
  startup: {
    mentor: "full-stack engineer and product development coach",
    focusAreas: "system architecture, product thinking, shipping fast, and scaling",
    successMetric: "building and launching a production-ready product",
  },
};

const KNOWN_KEYS = Object.keys(GOAL_PERSONAS) as Array<keyof typeof GOAL_PERSONAS>;

function getStaticPersona(goal: string): GoalPersona | null {
  const key = goal.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return GOAL_PERSONAS[key] ?? null;
}

// ---- STEP 1: classify into a known bucket, using Structured Outputs ----

const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    matchedKey: {
      type: "string",
      enum: [...KNOWN_KEYS, "none"],
    },
    examName: {
      type: ["string", "null"],
    },
  },
  required: ["matchedKey", "examName"],
  additionalProperties: false,
};

const CLASSIFY_SYSTEM_PROMPT = `You classify a user's learning goal into one of these known categories, or "none" if it genuinely doesn't fit:

- "faang": cracking FAANG/big-tech software engineering interviews specifically.
- "dsa": purely learning/mastering Data Structures & Algorithms as a skill.
- "competitive_exam": clearing ANY competitive/government/academic exam — GATE, UPSC, CAT, JEE, NEET, GRE, GMAT, bank exams, civil services, state PSCs, and any other national/state-level exam not explicitly named here.
- "startup": building/shipping/launching a product or startup.
- "none": doesn't meaningfully fit any of the above.

If matchedKey is "competitive_exam" and a specific exam is named or implied, set examName to that exam's name (e.g. "GATE"). Otherwise set examName to null.`;

interface ClassificationResult {
  matchedKey: string;
  examName: string | null;
}

async function classifyGoal(goal: string): Promise<ClassificationResult> {
  const response = await openai.responses.create({
    model: "gpt-5",
    instructions: CLASSIFY_SYSTEM_PROMPT,
    input: `Goal: ${goal}`,
    max_output_tokens: 150,
    text: {
      format: {
        type: "json_schema",
        name: "goal_classification",
        schema: CLASSIFY_SCHEMA,
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text.trim());
  return parsed as ClassificationResult;
}

// ---- STEP 2: freeform generation, only when nothing matched ----

const PERSONA_SCHEMA = {
  type: "object",
  properties: {
    mentor: { type: "string" },
    focusAreas: { type: "string" },
    successMetric: { type: "string" },
  },
  required: ["mentor", "focusAreas", "successMetric"],
  additionalProperties: false,
};

const PERSONA_SYSTEM_PROMPT = `You convert a user's learning goal into a structured mentor persona.

Rules:
- Infer intent from vague, casual, or misspelled input.
- Keep each field concise.
- Be domain specific.`;

async function generatePersona(goal: string): Promise<GoalPersona> {
  const response = await openai.responses.create({
    model: "gpt-5",
    instructions: PERSONA_SYSTEM_PROMPT,
    input: `Goal: ${goal}`,
    max_output_tokens: 300,
    text: {
      format: {
        type: "json_schema",
        name: "goal_persona",
        schema: PERSONA_SCHEMA,
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text.trim());

  if (!parsed.mentor || !parsed.focusAreas || !parsed.successMetric) {
    throw new Error("Persona JSON missing required fields");
  }

  return parsed as GoalPersona;
}

// ---- PUBLIC ENTRY POINT ----

export async function derivePersona(goal: string): Promise<GoalPersona> {
  const staticMatch = getStaticPersona(goal);
  if (staticMatch) return staticMatch;

  const { matchedKey, examName } = await classifyGoal(goal);

  if (matchedKey !== "none" && KNOWN_KEYS.includes(matchedKey as any)) {
    const base = GOAL_PERSONAS[matchedKey];

    if (matchedKey === "competitive_exam" && examName) {
      return {
        mentor: `${examName} exam strategist and subject matter expert`,
        focusAreas: `${examName} syllabus coverage, mock tests, weak area improvement, and time management`,
        successMetric: `clearing ${examName} with a high score/rank`,
      };
    }

    return base;
  }

  return generatePersona(goal);
}
export async function buildRoadmapPrompt(input: {
  goal: string;
  currentLevel: string;
  dailyHours?: number;
  durationMonths: number;
}): Promise<string> {
  const dailyMinutes = (input.dailyHours ?? 2) * 60;

  const totalAvailableMinutes = input.durationMonths * 30 * dailyMinutes;

  const minimumRequiredMinutes = Math.floor(totalAvailableMinutes * 0.85);

   const persona: GoalPersona = await derivePersona(input.goal);

  return `
You are an ${persona.mentor}.

Create a highly realistic and structured learning roadmap focused on ${persona.focusAreas}.

The roadmap must be practical, sequential, mathematically consistent, and fully utilize the user's available study time.

The end goal is ${persona.successMetric}.

USER DATA:
- Goal: ${input.goal}
- Current Level: ${input.currentLevel}
- Daily Study Time: ${dailyMinutes} minutes
- Target Duration: ${input.durationMonths} months

WORKLOAD REQUIREMENTS:
- Total available study minutes: ${totalAvailableMinutes}
- Minimum required roadmap minutes: ${minimumRequiredMinutes}
- Maximum roadmap minutes: ${totalAvailableMinutes}

CRITICAL RULES:
1. Divide the roadmap into sequential phases.
2. Each phase must have:
   - title
   - description
   - duration_weeks
   - phase_order

3. Each task must have:
   - title
   - description
   - estimated_minutes
   - difficulty
   - task_order

4. Tasks must progress:
   EASY → MEDIUM → HARD

5. Phase workload constraint:
   - Available minutes per phase =
     duration_weeks × 7 × ${dailyMinutes}

   - Total task estimated_minutes in a phase
     MUST NOT exceed available minutes.

6. Roadmap workload constraint:
   - Sum of estimated_minutes across ALL tasks
     MUST be between
     ${minimumRequiredMinutes}
     and
     ${totalAvailableMinutes}

7. Generate enough tasks to cover the full duration.

8. Do NOT create placeholder tasks.

9. Do NOT create overly large tasks.
   Break learning into smaller practical tasks.

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
`.trim();
}
