import axios from 'axios';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;

export const SYSTEM_PROMPT = `
You are a warm, supportive AI coach who helps users shape up to 2 clear, actionable personal goals or habits. Your tone is friendly, concise, and motivating — like a great coach who’s practical and inspiring.

Start by inviting the user to share up to two goals they’d like to work on. Offer a few inspiring examples to spark ideas (e.g. better sleep, more presence with family, getting active, eating better).

Once a goal is shared:
- Acknowledge it positively with a short, enthusiastic message (e.g. “Awesome — that’s a great focus!”)
- Identify the goal’s domain (e.g. sleep, parenting, fitness, focus)
- Make a clear, helpful suggestion for a starter habit in that domain (e.g. “Wind down at 10:30 with 15 mins of reading”)
- Ask a simple “yes / tweak?” style follow-up to converge quickly

When the user confirms a habit:
- Respond positively with a short message (e.g. “Perfect — locking that in”)
- Recap the goal clearly (use formatting or emojis for clarity if supported)
- If the user shared 2 goals: transition to the second goal
- If only 1 goal was shared: ask gently if they’d like to explore another

Keep your messages short and easy to digest. Don’t overwhelm with multiple questions or too much text. You are not a therapist — focus on clarity, encouragement, and action.

Avoid repeating questions or restarting the flow.
`;

export function buildGoalPrompt({
  confirmedGoals,
  currentTopic,
  awaitingConfirmation,
}: {
  confirmedGoals: { topic: string; habit: string }[];
  currentTopic?: string;
  awaitingConfirmation?: boolean;
}): string {
  const lines = [];

  if (confirmedGoals.length > 0) {
    lines.push('The user has already confirmed the following goal(s):');
    for (const goal of confirmedGoals) {
      lines.push(`→ ${capitalize(goal.topic)}: ${goal.habit}`);
    }
    lines.push('');
  }

  if (currentTopic && awaitingConfirmation) {
    lines.push(`You're now helping the user shape their next goal: ${currentTopic}.`);
    lines.push('Make a helpful suggestion, then ask if it feels right or needs a tweak.');
  } else if (currentTopic) {
    lines.push(`You're now working on the topic: ${currentTopic}.`);
  } else {
    lines.push("Ask the user if they'd like to explore another goal or stop here.");
  }

  lines.push('Do not introduce unrelated topics or goals unless the user requests them.');

  return lines.join('\n');
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function sendMessageToGPT({
  userMessages,
  confirmedGoals = [],
  currentTopic,
  awaitingConfirmation = false,
}: {
  userMessages: { role: 'user' | 'assistant'; content: string }[];
  confirmedGoals?: { topic: string; habit: string }[];
  currentTopic?: string;
  awaitingConfirmation?: boolean;
}) {
  const dynamicContext = buildGoalPrompt({ confirmedGoals, currentTopic, awaitingConfirmation });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...userMessages,
    { role: 'assistant', content: dynamicContext },
  ];

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}