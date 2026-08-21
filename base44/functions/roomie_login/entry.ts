import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { verifySecret, generateToken } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const accounts = await base44.asServiceRole.entities.Account.filter({ email: email.toLowerCase() });
    if (!accounts || accounts.length === 0) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    const account = accounts[0];

    const ok = await verifySecret(password, account.passwordHash);
    if (!ok) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = generateToken();
    await base44.asServiceRole.entities.Account.update(account.id, {
      sessionToken: token, recoverAttempts: 0,
    });

    return Response.json({
      token, accountId: account.id, email: account.email, gender: account.gender,
      profileCompleted: !!account.profileCompleted,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}