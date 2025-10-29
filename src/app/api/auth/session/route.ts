import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function POST(request: NextRequest) {
  const {idToken} = await request.json();

  if (!idToken) {
    return NextResponse.json({error: 'ID token is required'}, {status: 400});
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  cookies().set('__session', idToken, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
  });

  return NextResponse.json({status: 'success'});
}

export async function DELETE() {
  cookies().delete('__session');
  return NextResponse.json({status: 'success'});
}
