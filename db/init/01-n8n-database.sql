-- Runs once, when the Postgres volume is created. n8n keeps its own workflows and
-- executions in a separate database so it never mixes with business data.
CREATE DATABASE n8n;
