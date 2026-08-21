import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccountFromToken, compatibilityScore, lifestyleTags } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, matchId } = body || {};

    const account = await getAccountFromToken(base44, token);
    if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!matchId) return Response.json({ error: 'Match ID required' }, { status: 400 });

    const matches = await base44.asServiceRole.entities.Match.filter({ id: matchId });
    if (!matches || matches.length === 0) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }
    const match = matches[0];
    if (match.account1 !== account.id && match.account2 !== account.id) {
      return Response.json({ error: 'Not your match' }, { status: 403 });
    }

    const otherProfileId = match.account1 === account.id ? match.profile2Id : match.profile1Id;
    const otherAccountId = match.account1 === account.id ? match.account2 : match.account1;

    const profiles = await base44.asServiceRole.entities.Profile.filter({ id: otherProfileId });
    const otherProfile = profiles && profiles.length > 0 ? profiles[0] : null;

    const myProfiles = await base44.asServiceRole.entities.Profile.filter({ accountId: account.id });
    const myProfile = myProfiles && myProfiles.length > 0 ? myProfiles[0] : null;

    const numbers = await base44.asServiceRole.entities.PhoneNumber.filter({ matchId });
    const myNumber = (numbers || []).find((n) => n.accountId === account.id);
    const otherNumber = (numbers || []).find((n) => n.accountId === otherAccountId);

    return Response.json({
      matchId,
      otherProfile: otherProfile ? {
        name: otherProfile.name, photoUrl: otherProfile.photoUrl,
        city: otherProfile.city, accommodationType: otherProfile.accommodationType, course: otherProfile.course,
        tags: lifestyleTags(otherProfile),
        compatibility: myProfile ? compatibilityScore(myProfile, otherProfile) : null,
      } : null,
      myNumber: myNumber ? myNumber.number : null,
      otherNumber: myNumber && otherNumber ? otherNumber.number : null,
      bothSubmitted: !!(myNumber && otherNumber),
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}