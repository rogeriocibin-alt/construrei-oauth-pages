-- Non-bank indicator: Osvaldo pending only, never added to Capital de Giro balances.
ALTER TABLE public.cr_working_capital_state_v1
ADD COLUMN IF NOT EXISTS pending_current_osvaldo numeric NOT NULL DEFAULT 0.00
CHECK (pending_current_osvaldo >= 0);
