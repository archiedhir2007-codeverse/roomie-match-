import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccountFromToken } from '../../shared/roomieAuth.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, profile } = body || {};

    const account = await getAccountFromToken(base44, token);
    if (!account) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!profile || !profile.name || !profile.accommodationType) {
      return Response.json({ error: 'Name and accommodation type are required' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Profile.filter({ accountId: account.id });
    const payload = {
      accountId: account.id,
      name: profile.name,
      photoUrl: profile.photoUrl || '',
      age: profile.age || null,
      genderDetail: profile.genderDetail || 'Prefer not to say',
      city: profile.city || '',
      course: profile.course || '',
      semester: profile.semester || '',
      bio: profile.bio || '',
      accommodationType: profile.accommodationType,
      lateNights: !!profile.lateNights,
      lightOn: !!profile.lightOn,
      coolerAc: !!profile.coolerAc,
      guests: !!profile.guests,
      noise: !!profile.noise,
      preferredFloor: profile.preferredFloor || '',
      seater: profile.seater || '',
      healthIssues: profile.healthIssues || '',
      weeklyHolidays: profile.weeklyHolidays || [],
      nonNegotiables: profile.nonNegotiables || '',
      details: profile.details || {},
      completed: true,
    };

    let saved;
    if (existing && existing.length > 0) {
      saved = await base44.asServiceRole.entities.Profile.update(existing[0].id, payload);
    } else {
      saved = await base44.asServiceRole.entities.Profile.create(payload);
    }

    await base44.asServiceRole.entities.Account.update(account.id, { profileCompleted: true });

    return Response.json({ profile: saved, profileCompleted: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Save failed' }, { status: 500 });
  }
}