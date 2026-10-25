-- Run once in Supabase SQL Editor.
-- One payment reference can only ever create one unlock row,
-- even if the verify route and the webhook run at the same moment.
create unique index if not exists uniq_unlock_payment_ref
  on unlocks(payment_reference)
  where payment_reference is not null;
