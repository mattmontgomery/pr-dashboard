import { NextResponse } from 'next/server';
import { hasEnvToken } from '@/app/lib/token';

export async function GET() {
  return NextResponse.json({
    hasToken: hasEnvToken(),
  });
}
