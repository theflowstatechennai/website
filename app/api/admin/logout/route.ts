import { NextRequest, NextResponse } from 'next/server';
import { clearAuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  return clearAuthResponse(response);
}
