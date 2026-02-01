import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import fs from "fs/promises";
import FormData from "form-data";

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

interface WhisperResponse {
  text: string;
  // You can add more fields if you need verbose_json output
}

export async function openAIWhisperRequest(
  video_id: string,
  model: "whisper-large-v2" | "whisper-large-v3",
  language: string = "zh"
): Promise<string> {
  // Determine endpoint and api key
  const endpoint =
    model === "whisper-large-v3"
      ? "https://api.groq.com/openai/v1/audio/transcriptions"
      : "https://api.openai.com/v1/audio/transcriptions";

  const api_key =
    model === "whisper-large-v3"
      ? process.env.GROQ_API_KEY
      : process.env.OPENAI_API_KEY;

  if (!api_key) {
    throw new Error(
      model === "whisper-large-v3"
        ? "GROQ_API_KEY must be set"
        : "OPENAI_API_KEY must be set"
    );
  }

  const fileBuffer = await fs.readFile(`./audio/${video_id}.flac`);

  const form = new FormData();
  form.append("file", fileBuffer, { filename: `${video_id}.flac` });

  if (model === "whisper-large-v3") {
    form.append("model", "whisper-large-v3");
    form.append("language", language);
  } else {
    form.append("model", "whisper-1");
    form.append("timestamp_granularities", "segment");
    form.append("language", language);
  }
  form.append("response_format", "verbose_json");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${api_key}`,
    },
    body: form as any,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Failed to transcribe audio: ${response.status} ${response.statusText}\n${errText}`
    );
  }

  const data: WhisperResponse = await response.json();
  return data.text;
}
