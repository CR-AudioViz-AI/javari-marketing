export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('tiktok-developers-site-verification=NyWJKWegGV3ZSHSKAPlLeNC6P3TIBDdr', {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
