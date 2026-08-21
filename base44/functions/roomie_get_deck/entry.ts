import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccountFromToken, compatibilityScore, lifestyleTags } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token } = body || {};

    const account = await getAccountFromToken(base44, token);
    if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const myProfiles = await base44.asServiceRole.entities.Profile.filter({ accountId: account.id });
    const myProfile = myProfiles && myProfiles.length > 0 ? myProfiles[0] : null;
    if (!myProfile) return Response.json({ deck: [] });

    const sameGenderAccounts = await base44.asServiceRole.entities.Account.filter({ gender: account.gender });
    const accountIds = sameGenderAccounts.filter((a) => a.id !== account.id).map((a) => a.id);

    if (accountIds.length === 0) return Response.json({ deck: [] });

    const allProfiles = await base44.asServiceRole.entities.Profile.filter({ completed: true });
    const candidates = allProfiles.filter(
      (p) => accountIds.includes(p.accountId) && p.accountId !== account.id
    );

    const mySwipes = await base44.asServiceRole.entities.Swipe.filter({ swiperAccountId: account.id });
    const swipedIds = new Set((mySwipes || []).map((s) => s.targetProfileId));

    const deck = candidates
      .filter((p) => !swipedIds.has(p.id))
      .map((p) => ({
        profileId: p.id, accountId: p.accountId, name: p.name, photoUrl: p.photoUrl,
        age: p.age, city: p.city, accommodationType: p.accommodationType,
        genderDetail: p.genderDetail, course: p.course, semester: p.semester, bio: p.bio,
        tags: lifestyleTags(p), compatibility: compatibilityScore(myProfile, p),
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    return Response.json({ deck });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}