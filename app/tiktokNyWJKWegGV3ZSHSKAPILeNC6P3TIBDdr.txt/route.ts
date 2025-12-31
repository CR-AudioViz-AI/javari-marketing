import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('tiktokNyWJKWegGV3ZSHSKAPILeNC6P3TIBDdr', {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
