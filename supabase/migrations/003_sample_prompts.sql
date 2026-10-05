-- ============================================================
-- OPTIONAL SEED — run this if you want two real prompts to test
-- Explore, Category, and Prompt Detail pages right away.
-- Safe to skip; Phase 6 (Admin Dashboard) lets you add real prompts
-- through a proper UI instead of SQL.
-- ============================================================

insert into prompts (
  title, slug, description, category_id, platform, prompt_type,
  master_prompt, negative_prompt, settings, how_to_use, pro_tips,
  featured, status
)
select
  'Google Veo 3 Cinematic Master Prompt',
  'google-veo-3-cinematic-master-prompt',
  'Create ultra-realistic cinematic AI videos with dynamic camera movement and natural lighting.',
  (select id from categories where slug = 'google-veo'),
  '🎬 Google Veo',
  'free',
  'Cinematic wide shot, golden hour lighting, slow dolly-in camera movement, 35mm lens depth of field, ultra-realistic skin texture and fabric detail, natural handheld micro-motion, film grain, color graded like a modern A24 drama.',
  'cartoonish, overexposed, flat lighting, shaky footage, low resolution, watermark',
  '{"duration":"15 sec","aspect_ratio":"9:16","quality":"4K","style":"Cinematic"}',
  '1. Paste the master prompt into Google Veo 3.
2. Adjust duration and aspect ratio for your platform.
3. Generate and review before publishing.',
  'Add a specific subject and setting before the style keywords for stronger results.',
  true,
  'published'
where not exists (select 1 from prompts where slug = 'google-veo-3-cinematic-master-prompt');

insert into prompts (
  title, slug, description, category_id, platform, prompt_type,
  master_prompt, negative_prompt, settings, how_to_use, pro_tips,
  featured, status
)
select
  'Grandpa Extreme Sports Viral Master Prompt',
  'grandpa-extreme-sports-viral-master-prompt',
  'Professional viral sports video prompt built for maximum watch-time and shares.',
  (select id from categories where slug = 'viral-reels'),
  '🔥 Kling AI',
  'premium',
  'PLACEHOLDER — real premium content goes here. This text is never sent to the browser until a user completes a verified unlock (Phase 4/5).',
  null,
  '{"duration":"20 sec","aspect_ratio":"9:16","quality":"4K","style":"Viral / High-Energy"}',
  '1. Paste into Kling AI after unlocking.
2. Keep the energy fast-paced for the first 2 seconds.',
  'Hook viewers in the first frame — pacing matters more than resolution.',
  false,
  'published'
where not exists (select 1 from prompts where slug = 'grandpa-extreme-sports-viral-master-prompt');
