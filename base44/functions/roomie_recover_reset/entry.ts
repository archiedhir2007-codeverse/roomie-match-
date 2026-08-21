
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { verifySecret, hashSecret } from '../../shared/roomieAuth.ts';

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 15 * 60 * 1000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, securityAnswer, newPassword } = body || {};

    if (!email || !securityAnswer || !newPassword) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const accounts = await base44.asServiceRole.entities.Account.filter({ email: email.toLowerCase() });
    if (!accounts || accounts.length === 0) {
      return Response.json({ error: 'Incorrect answer. Please try again.' }, { status: 401 });
    }
    const account = accounts[0];

    const now = Date.now();
    const lastAttempt = account.lastRecoverAttempt ? new Date(account.lastRecoverAttempt).getTime() : 0;
    const attempts = account.recoverAttempts || 0;

    if (attempts >= MAX_ATTEMPTS && now - lastAttempt < COOLDOWN_MS) {
      const mins = Math.ceil((COOLDOWN_MS - (now - lastAttempt)) / 60000);
      return Response.json({ error: `Too many attempts. Try again in ${mins} min.` }, { status: 429 });
    }

    const ok = await verifySecret(securityAnswer, account.securityAnswerHash);
    if (!ok) {
      const newAttempts = (now - lastAttempt) < COOLDOWN_MS ? attempts + 1 : 1;
      await base44.asServiceRole.entities.Account.update(account.id, {
        recoverAttempts: newAttempts,
        lastRecoverAttempt: new Date().toISOString(),
      });
      const remaining = Math.max(0, MAX_ATTEMPTS - newAttempts);
      return Response.json({ error: `Incorrect answer. ${remaining} attempt(s) left.` }, { status: 401 });
    }

    const passwordHash = await hashSecret(newPassword);
    const token = crypto.randomUUID() + crypto.randomUUID();
    await base44.asServiceRole.entities.Account.update(account.id, {
      passwordHash, sessionToken: token, recoverAttempts: 0,
    });

    return Response.json({ success: true, token });
  } catch (error) {
    return Response.json({ error: error.message || 'Reset failed' }, { status: 500 });
  }
}