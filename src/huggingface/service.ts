import {
  AutomaticSpeechRecognitionArgs,
  InferenceClient,
} from "@huggingface/inference";
import fs from "fs";

export async function senseVoice(
  language: string,
  file_path: string
): Promise<string> {
  const apiKey = process.env.MODEL_SCOPE_API_KEY;
  const client = new InferenceClient(apiKey, {
    endpointUrl: "https://langpalhuapeng-sensevoice.ms.show/predict",
  });
  const args: AutomaticSpeechRecognitionArgs = {
    inputs: new Blob([fs.readFileSync(file_path)]),
    parameters: {
      language,
    },
  };
  const response = await client.automaticSpeechRecognition(args);
  if (!response.ok) {
    throw new Error(`Failed to sense voice: ${response.statusText}`);
  }
  return response.text;
}
