import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const form = await request.formData();
  const file = form.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true, // prevents overwriting files with the same name
  });

  return NextResponse.json(blob);
}
