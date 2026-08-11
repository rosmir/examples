import OpenAI from 'openai';
import type { ExtractedLabel } from '@/types/label';

const EXTRACTION_PROMPT = `You are an expert at reading alcohol beverage labels for TTB (Alcohol and Tobacco Tax and Trade Bureau) compliance review.

Analyze this label image and extract the following fields EXACTLY as they appear on the label. Return ONLY a valid JSON object — no markdown, no code fences.

Fields to extract:
- brand_name: The primary brand name shown on the label
- class_type: Class and type designation (e.g. "Kentucky Straight Bourbon Whiskey")
- abv: Alcohol content as shown (e.g. "45% Alc./Vol." or "90 Proof")
- net_contents: Net contents/volume (e.g. "750 mL")
- bottler_name: Name of bottler, distiller, brewer, or importer
- bottler_address: Full address of bottler/producer as printed
- country_of_origin: Country of origin if shown, otherwise null
- warning_statement: The COMPLETE government warning statement, copied character-for-character including all capitalization and punctuation
- extraction_notes: Brief notes on image quality, partial visibility, or ambiguities — null if none

Return null for any field not visible on the label.`;

export async function extractLabelData(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedLabel> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const params = {
    model: 'gpt-4o-mini' as const,
    max_tokens: 1200,
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: EXTRACTION_PROMPT },
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'high' as const,
            },
          },
        ],
      },
    ],
  };

  // retry up to 3 times on TPM rate-limit; each window resets within ~8s
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await openai.chat.completions.create(params);
      break;
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429 && attempt < 2) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 8000));
      } else {
        throw err;
      }
    }
  }

  const content = response!.choices[0].message.content;
  if (!content) throw new Error('Empty response from GPT-4o');
  return JSON.parse(content) as ExtractedLabel;
}
