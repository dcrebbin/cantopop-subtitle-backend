import {
  AutomaticSpeechRecognitionArgs,
  InferenceClient,
} from "@huggingface/inference";
import fs from "fs";
// pub async fn sense_voice(
//   language: &str,
//   file_path: &str,
// ) -> Result<serde_json::Value, gradio::anyhow::Error> {
//   let api_key = env::var("MODEL_SCOPE_API_KEY").unwrap();
//   println!("API Key: {:?}", api_key);
//   let mut client_options = ClientOptions::default();
//   client_options.hf_token = Some(api_key);
//   let client = Client::new("https://langpalhuapeng-sensevoice.ms.show/", client_options)
//       .await
//       .map_err(|_| gradio::anyhow::Error::msg("Login failed"))?;

//   let output = client
//       .predict(
//           "/predict",
//           vec![
//               PredictionInput::from_file(file_path),
//               PredictionInput::from_value(language),
//           ],
//       )
//       .await
//       .map_err(|error| gradio::anyhow::Error::msg(error.to_string()))?;

//   let prediction = output.first().unwrap();
//   //save to file
//   let output_path = PathBuf::from("./lyrics").join(format!(
//       "output-{}.srt",
//       file_path
//           .split("./downloads/")
//           .last()
//           .unwrap()
//           .to_string()
//           .replace(".flac", "")
//   ));
//   let mut file = File::create(&output_path).map_err(SrtGenerationError::FileCreation)?;
//   file.write_all(
//       prediction
//           .clone()
//           .as_value()
//           .unwrap()
//           .to_string()
//           .as_bytes(),
//   )
//   .map_err(SrtGenerationError::FileCreation)?;

//   Ok(prediction.clone().as_value().unwrap())
// }

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
