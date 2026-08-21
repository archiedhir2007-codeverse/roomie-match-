import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccountFromToken } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token } = body || {};

    const account = await getAccountFromToken(base44, token);
    if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const matches1 = await base44.asServiceRole.entities.Match.filter({ account1: account.id });
    const matches2 = await base44.asServiceRole.entities.Match.filter({ account2: account.id });
    const allMatches = [...(matches1 || []), ...(matches2 || [])];

    const result = [];
    for (const m of allMatches) {
      const otherProfileId = m.account1 === account.id ? m.profile2Id : m.profile1Id;
      const profiles = await base44.asServiceRole.entities.Profile.filter({ id: otherProfileId });
      const otherProfile = profiles && profiles.length > 0 ? profiles[0] : null;

      const numbers = await base44.asServiceRole.entities.PhoneNumber.filter({ matchId: m.id });
      const myNumber = (numbers || []).find((n) => n.accountId === account.id);
      const otherNumber = (numbers || []).find((n) => n.accountId !== account.id);

      result.push({
        matchId: m.id,
        otherProfile: otherProfile ? {
          name: otherProfile.name, photoUrl: otherProfile.photoUrl,
          city: otherProfile.city, accommodationType: otherProfile.accommodationType, course: otherProfile.course,
        } : null,
        myNumber: myNumber ? myNumber.number : null,
        otherNumber: myNumber && otherNumber ? otherNumber.number : null,
        bothSubmitted: !!(myNumber && otherNumber),
      });
    }

    return Response.json({ matches: result });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}