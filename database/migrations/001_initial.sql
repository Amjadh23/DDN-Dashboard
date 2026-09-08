BEGIN;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS supplied;
CREATE SCHEMA IF NOT EXISTS demo;

CREATE TABLE core.organisation (
  id text PRIMARY KEY, name_bm text NOT NULL, name_en text NOT NULL,
  effective_from date NOT NULL, effective_to date, status text NOT NULL,
  responsibility_status text NOT NULL CHECK(responsibility_status IN ('explicitly assigned','policy-listed','functionally inferred','requires stakeholder validation')),
  CHECK(effective_to IS NULL OR effective_to > effective_from)
);
CREATE TABLE core.geography (
  id text PRIMARY KEY, name text NOT NULL, boundary_version text NOT NULL, source text NOT NULL,
  approved boolean NOT NULL DEFAULT false, geom geometry(MultiPolygon,4326) NOT NULL,
  CHECK(ST_IsValid(geom))
);
CREATE INDEX geography_geom ON core.geography USING gist(geom);
CREATE TABLE core.dimension (
  kind text NOT NULL CHECK(kind IN ('time','population','substance','programme','facility','partner','forum')),
  id text NOT NULL, version text NOT NULL, name_bm text NOT NULL, effective_from date NOT NULL,
  effective_to date, metadata jsonb NOT NULL DEFAULT '{}', PRIMARY KEY(kind,id,version)
);
CREATE TABLE core.indicator (
  code text NOT NULL, version text NOT NULL, teras int NOT NULL CHECK(teras BETWEEN 1 AND 5),
  effective_from date NOT NULL, definition jsonb NOT NULL,
  PRIMARY KEY(code,version), CHECK(definition ?& ARRAY['code','name','nameEn','purpose','evidence','numerator','denominator','formula','unit','direction','dimensions','cadence','freshness','source','owner','qualityRules','target','suppression','interpretation','version'])
);
CREATE TABLE core.publication (
  id text PRIMARY KEY, organisation text NOT NULL, geography text NOT NULL, teras int NOT NULL CHECK(teras BETWEEN 1 AND 5),
  origin text NOT NULL CHECK(origin IN ('supplied','synthetic')), official boolean NOT NULL DEFAULT false,
  version int NOT NULL CHECK(version > 0), definition_version text NOT NULL, period date NOT NULL,
  submission_id text, predecessor text REFERENCES core.publication(id), reason text NOT NULL CHECK(length(reason)>0),
  created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(NOT (origin='synthetic' AND official)), CHECK(origin<>'supplied' OR submission_id IS NULL)
);
CREATE TABLE demo.observation (
  id text PRIMARY KEY, code text NOT NULL, definition_version text NOT NULL, publication_id text NOT NULL REFERENCES core.publication(id),
  organisation text NOT NULL, geography text NOT NULL, teras int NOT NULL CHECK(teras BETWEEN 1 AND 5),
  sensitivity text NOT NULL DEFAULT 'demo' CHECK(sensitivity='demo'), period date NOT NULL,
  value numeric CHECK(value >= 0), state text NOT NULL CHECK(state IN ('value','unknown','not-collected','not-applicable','suppressed')),
  denominator numeric CHECK(denominator >= 0), unit text NOT NULL, boundary_version text NOT NULL,
  source text NOT NULL, source_key text NOT NULL, metadata jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(code,definition_version) REFERENCES core.indicator(code,version),
  UNIQUE(publication_id,source_key), CHECK((state='value') = (value IS NOT NULL))
);
CREATE TABLE supplied.observation (LIKE demo.observation INCLUDING ALL);
ALTER TABLE supplied.observation DROP CONSTRAINT observation_sensitivity_check;
ALTER TABLE supplied.observation ALTER COLUMN sensitivity SET DEFAULT 'public-aggregate';
ALTER TABLE supplied.observation ADD CHECK(sensitivity='public-aggregate');
ALTER TABLE supplied.observation ADD FOREIGN KEY(publication_id) REFERENCES core.publication(id);
ALTER TABLE supplied.observation ADD FOREIGN KEY(code,definition_version) REFERENCES core.indicator(code,version);

CREATE TABLE core.submission (
  id text PRIMARY KEY, organisation text NOT NULL, geography text NOT NULL, teras int NOT NULL CHECK(teras BETWEEN 1 AND 5),
  sensitivity text NOT NULL DEFAULT 'demo' CHECK(sensitivity='demo'), period date NOT NULL, template text NOT NULL, schema_version text NOT NULL,
  state text NOT NULL CHECK(state IN ('draft','quarantined','validating','invalid','validated','submitted','rejected','approved','published')),
  submitter text NOT NULL, reviewer text, publisher text, filename text NOT NULL, checksum text,
  storage_key text NOT NULL, scan_status text NOT NULL DEFAULT 'pending', attestation jsonb,
  review_reason text, revision_reason text, predecessor text REFERENCES core.publication(id),
  validation jsonb NOT NULL DEFAULT '{}', revision int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(reviewer IS NULL OR reviewer<>submitter),
  CHECK(state NOT IN ('submitted','approved','published') OR attestation IS NOT NULL),
  CHECK(state NOT IN ('approved','published') OR (reviewer IS NOT NULL AND length(review_reason)>0)),
  UNIQUE(organisation,checksum,predecessor)
);
CREATE TABLE core.job (
  id text PRIMARY KEY, submission_id text NOT NULL REFERENCES core.submission(id), kind text NOT NULL,
  state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','running','complete','failed','dead-letter')),
  attempts int NOT NULL DEFAULT 0, error_code text, locked_at timestamptz, finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(submission_id,kind)
);
CREATE TABLE core.audit (
  id text PRIMARY KEY, actor text NOT NULL, action text NOT NULL, object_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), result text NOT NULL, reason text NOT NULL,
  correlation_id text NOT NULL, organisation text NOT NULL DEFAULT 'shared'
);
CREATE TABLE core.action (
  id text PRIMARY KEY, organisation text NOT NULL, geography text NOT NULL, teras int NOT NULL,
  title text NOT NULL CHECK(length(title) BETWEEN 3 AND 180), owner text NOT NULL, due_date date NOT NULL,
  priority text NOT NULL CHECK(priority IN ('normal','high','urgent')), status text NOT NULL CHECK(status IN ('open','in-progress','review','closed')),
  evidence text, verified_by text, context jsonb NOT NULL, classification text NOT NULL DEFAULT 'demo' CHECK(classification='demo'),
  created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), revision int NOT NULL DEFAULT 1,
  CHECK(status<>'closed' OR (length(evidence)>0 AND verified_by IS NOT NULL AND verified_by<>owner))
);
CREATE TABLE core.note (
  id text PRIMARY KEY, organisation text NOT NULL, geography text NOT NULL, teras int NOT NULL,
  context jsonb NOT NULL, kind text NOT NULL CHECK(kind IN ('note','decision')), body text NOT NULL CHECK(length(body) BETWEEN 3 AND 2000),
  classification text NOT NULL DEFAULT 'demo' CHECK(classification='demo'), created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE core.saved_view (
  id text PRIMARY KEY, title text NOT NULL, actor text NOT NULL, organisation text NOT NULL, context jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE core.export (
  id text PRIMARY KEY, actor text NOT NULL, organisation text NOT NULL, context jsonb NOT NULL, checksum text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, classification text NOT NULL
);
CREATE TABLE core.session (
  id text PRIMARY KEY, actor text NOT NULL, expires_at timestamptz NOT NULL, revoked boolean NOT NULL DEFAULT false
);

CREATE FUNCTION core.prevent_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'immutable record: append a new version'; END; $$;
CREATE TRIGGER immutable_audit BEFORE UPDATE OR DELETE ON core.audit FOR EACH ROW EXECUTE FUNCTION core.prevent_mutation();
CREATE TRIGGER immutable_publication BEFORE UPDATE OR DELETE ON core.publication FOR EACH ROW EXECUTE FUNCTION core.prevent_mutation();
CREATE TRIGGER immutable_indicator BEFORE UPDATE OR DELETE ON core.indicator FOR EACH ROW EXECUTE FUNCTION core.prevent_mutation();
CREATE TRIGGER immutable_supplied BEFORE UPDATE OR DELETE ON supplied.observation FOR EACH ROW EXECUTE FUNCTION core.prevent_mutation();
CREATE TRIGGER immutable_demo BEFORE UPDATE OR DELETE ON demo.observation FOR EACH ROW EXECUTE FUNCTION core.prevent_mutation();

CREATE FUNCTION core.scope_allowed(org text, geo text, pillar int, classification text) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT (current_setting('app.organisation',true)='*' OR org='shared' OR org=current_setting('app.organisation',true))
    AND ('*'=ANY(string_to_array(current_setting('app.geographies',true),',')) OR geo=ANY(string_to_array(current_setting('app.geographies',true),',')))
    AND pillar::text=ANY(string_to_array(current_setting('app.teras',true),','))
    AND classification=ANY(string_to_array(current_setting('app.sensitivity',true),','))
$$;
ALTER TABLE demo.observation ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplied.observation ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.action ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.note ENABLE ROW LEVEL SECURITY;
CREATE POLICY demo_scope ON demo.observation USING(core.scope_allowed(organisation,geography,teras,sensitivity));
CREATE POLICY supplied_scope ON supplied.observation USING(core.scope_allowed(organisation,geography,teras,sensitivity));
CREATE POLICY submission_scope ON core.submission USING(core.scope_allowed(organisation,geography,teras,sensitivity));
CREATE POLICY action_scope ON core.action USING(core.scope_allowed(organisation,geography,teras,classification));
CREATE POLICY note_scope ON core.note USING(core.scope_allowed(organisation,geography,teras,classification));
GRANT USAGE ON SCHEMA core,demo,supplied TO dashboard_app;
GRANT SELECT ON ALL TABLES IN SCHEMA core,demo,supplied TO dashboard_app;
GRANT INSERT ON core.audit,core.publication,core.action,core.note,core.saved_view,core.export,core.submission,core.job,core.session,demo.observation TO dashboard_app;
GRANT UPDATE ON core.action,core.submission,core.job,core.session TO dashboard_app;
GRANT EXECUTE ON FUNCTION core.scope_allowed TO dashboard_app;
COMMIT;
