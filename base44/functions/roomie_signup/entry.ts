import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { isValidEmail, hashSecret, generateToken } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, password, securityQuestion, securityAnswer, gender } = body || {};

    if (!email || !password || !securityQuestion || !securityAnswer || !gender) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return Response.json({ error: 'Enter a valid email (e.g. you@example.com)' }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (gender !== 'Girl' && gender !== 'Boy') {
      return Response.json({ error: 'Please select Girl or Boy' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Account.filter({ email: email.toLowerCase() });
    if (existing && existing.length > 0) {
      return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashSecret(password);
    const securityAnswerHash = await hashSecret(securityAnswer);
    const token = generateToken();

    const account = await base44.asServiceRole.entities.Account.create({
      email: email.toLowerCase(),
      passwordHash, securityQuestion, securityAnswerHash, gender,
      sessionToken: token, recoverAttempts: 0, profileCompleted: false,
    });

    return Response.json({
      token, accountId: account.id, email: account.email, gender: account.gender, profileCompleted: false,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}