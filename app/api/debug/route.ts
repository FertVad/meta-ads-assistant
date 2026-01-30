import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    META_APP_ID: process.env.META_APP_ID?.substring(0, 5) + '***',
    META_APP_SECRET: process.env.META_APP_SECRET ? '***set***' : 'NOT SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    META_REDIRECT_URI: process.env.META_REDIRECT_URI,
  });
}
