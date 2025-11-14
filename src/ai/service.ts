import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const TRANSLATION_SYSTEM_PROMPT = `Return only the transformed SRT file with no additional text, explanations, or formatting.

For every subtitle block:
1. Keep the index number and timestamp line exactly as they appear
2. For each text line, detect the language and format as follows:
   - Cantonese text: (yue) <original text>
   - Mandarin text: (zh) <original text>
   - English text: (en) <original text>
   - Follow each non-English line with the English translation on the next line: (en) <accurate English translation>
   - If the line is english just put (en) without (yue) or (zh) after it.
   - If the text is in parentheses for a backing vocal, add it to the end of the Cantonese or Mandarin line.

Formatting rules:
- NO space after (yue) and (zh) tags
- Include ONE space after (en) tags
- Put English translations on separate lines after the original text
- Preserve all original punctuation and spacing within text content
- Maintain the exact blank line separation between subtitle blocks
- Skip processing of completely empty text lines

Language detection:
- Cantonese: Traditional Chinese characters commonly used in Hong Kong/Cantonese contexts
- Mandarin: Simplified or Traditional Chinese characters in mainland/Taiwan contexts
- English: Latin alphabet text

Translation requirements:
- ENSURE ALL TIMESTAMPS ARE IN THE FORMAT HH:MM:SS,MMM --> HH:MM:SS,MMM
- Provide natural, contextually appropriate English translations
- Maintain the tone and meaning of the original text
- Preserve any cultural nuances when possible`;

export async function openAIRequestChunking(
  input: string,
  systemPrompt: string,
  chunkSize: number = 1250
): Promise<string> {
  // Split input into paragraphs (by \n\n)
  const paragraphs = input.split("\n\n");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if (
      (currentChunk.length ? currentChunk.length + 2 : 0) + para.length >
      chunkSize
    ) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = para;
    } else {
      if (currentChunk) {
        currentChunk += "\n\n";
      }
      currentChunk += para;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  let result = "";
  for (let i = 0; i < chunks.length; i++) {
    // Optionally: log processing info
    // console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    const chunkResult = await openAIRequest(chunks[i], systemPrompt);
    if (result) result += "\n\n";
    result += chunkResult;
  }
  return result;
}

export async function openAIRequest(
  input: string,
  systemPrompt: string
): Promise<string> {
  const { text } = await generateText({
    model: openai("gpt-4.1-mini"), // use Vercel AI Gateway
    prompt: `${systemPrompt}\n\n${input}`,
  });
  return text;
}
