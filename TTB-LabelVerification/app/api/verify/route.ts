import { NextRequest, NextResponse } from 'next/server';
import { extractLabelData } from '@/lib/extract';
import { validateLabel } from '@/lib/validate';
import type { ApplicationData } from '@/types/label';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const imageFile = formData.get('image') as File | null;
  const appDataRaw = formData.get('appData') as string | null;

  if (!imageFile || !appDataRaw) {
    return NextResponse.json({ error: 'Missing image or application data' }, { status: 400 });
  }

  let applicationData: ApplicationData;
  try {
    applicationData = JSON.parse(appDataRaw);
  } catch {
    return NextResponse.json({ error: 'Invalid application data JSON' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    const extracted = await extractLabelData(base64, mimeType);
    const processingTimeMs = Date.now() - startTime;
    const report = validateLabel(extracted, applicationData, processingTimeMs);

    return NextResponse.json({ extracted, report });
  } catch (error) {
    console.error('Verification error:', error);
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
