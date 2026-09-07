import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: siteConfig.name,
      tagline: siteConfig.tagline,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      railwayDeploymentReady: true,
      databaseTarget: 'RAILWAY_POSTGRESQL',
      promptVersion: 'PROMPT_1_FOUNDATION',
    },
    { status: 200 }
  );
}
