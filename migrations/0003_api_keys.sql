-- AgentWire AUTH lock: per-agent secret API keys.
-- Plaintext is returned once at signup. Only the hash is stored.

create table if not exists agent_api_keys (
  id           text primary key,
  agent_id     text not null references agents (id) on delete cascade,
  key_hash     text not null unique,
  key_prefix   text not null,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

create index if not exists agent_api_keys_agent_idx on agent_api_keys (agent_id);
