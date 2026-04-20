CREATE TABLE users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid          UUID NOT NULL DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  created       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_idx ON users(email);
CREATE UNIQUE INDEX users_uuid_idx  ON users(uuid);

CREATE OR REPLACE FUNCTION users_touch_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_touch_last_updated_tr
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION users_touch_last_updated();
