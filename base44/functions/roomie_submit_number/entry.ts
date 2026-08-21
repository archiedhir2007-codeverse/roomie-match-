import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccountFromToken } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, matchId, number } = body || {};

    const account = await getAccountFromToken(base44, token);
    if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!matchId || !number) {
      return Response.json({ error: 'Match ID and number are required' }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.Match.filter({ id: matchId });
    if (!matches || matches.length === 0) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }
    const match = matches[0];
    if (match.account1 !== account.id && match.account2 !== account.id) {
      return Response.json({ error: 'Not your match' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.PhoneNumber.filter({ matchId, accountId: account.id });
    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.PhoneNumber.update(existing[0].id, { number });
    } else {
      await base44.asServiceRole.entities.PhoneNumber.create({ matchId, accountId: account.id, number });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}