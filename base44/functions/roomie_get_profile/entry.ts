import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccountFromToken } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token } = body || {};

    const account = await getAccountFromToken(base44, token);
    if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.asServiceRole.entities.Profile.filter({ accountId: account.id });
    return Response.json({ profile: profiles && profiles.length > 0 ? profiles[0] : null });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}