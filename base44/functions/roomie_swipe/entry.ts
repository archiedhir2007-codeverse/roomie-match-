import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccountFromToken } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, targetProfileId, action } = body || {};

    const account = await getAccountFromToken(base44, token);
    if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!targetProfileId || (action !== 'like' && action !== 'pass')) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const myProfiles = await base44.asServiceRole.entities.Profile.filter({ accountId: account.id });
    if (!myProfiles || myProfiles.length === 0) {
      return Response.json({ error: 'Complete your profile first' }, { status: 400 });
    }
    const myProfileId = myProfiles[0].id;

    const existingSwipe = await base44.asServiceRole.entities.Swipe.filter({
      swiperAccountId: account.id, targetProfileId,
    });
    if (!existingSwipe || existingSwipe.length === 0) {
      await base44.asServiceRole.entities.Swipe.create({
        swiperAccountId: account.id, targetProfileId, action,
      });
    } else {
      await base44.asServiceRole.entities.Swipe.update(existingSwipe[0].id, { action });
    }

    if (action !== 'like') return Response.json({ matched: false });

    const targetProfiles = await base44.asServiceRole.entities.Profile.filter({ id: targetProfileId });
    if (!targetProfiles || targetProfiles.length === 0) {
      return Response.json({ matched: false });
    }
    const targetProfile = targetProfiles[0];

    const mutual = await base44.asServiceRole.entities.Swipe.filter({
      swiperAccountId: targetProfile.accountId,
      targetProfileId: myProfileId,
      action: 'like',
    });

    if (mutual && mutual.length > 0) {
      const existingMatches = await base44.asServiceRole.entities.Match.filter({
        account1: account.id, account2: targetProfile.accountId,
      });
      const existingMatches2 = await base44.asServiceRole.entities.Match.filter({
        account1: targetProfile.accountId, account2: account.id,
      });
      if (existingMatches && existingMatches.length > 0) {
        return Response.json({ matched: true, matchId: existingMatches[0].id });
      }
      if (existingMatches2 && existingMatches2.length > 0) {
        return Response.json({ matched: true, matchId: existingMatches2[0].id });
      }

      const match = await base44.asServiceRole.entities.Match.create({
        account1: account.id, account2: targetProfile.accountId,
        profile1Id: myProfileId, profile2Id: targetProfileId,
      });
      return Response.json({ matched: true, matchId: match.id });
    }

    return Response.json({ matched: false });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}