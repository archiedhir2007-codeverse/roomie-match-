import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DEFAULT_QUESTION = 'What was your first school\'s name?';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email } = body || {};

    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

    const accounts = await base44.asServiceRole.entities.Account.filter({ email: email.toLowerCase() });
    // Always return a question to avoid account enumeration.
    const question = accounts && accounts.length > 0 ? accounts[0].securityQuestion : DEFAULT_QUESTION;
    return Response.json({ question });
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed' }, { status: 500 });
  }
}