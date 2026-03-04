CREATE TABLE IF NOT EXISTS company_registry (
  -- Document metadata
  doc_id            text PRIMARY KEY,        -- ИдДок
  date_created      date,                    -- ДатаСост
  date_included     date,                    -- ДатаВклМСП
  subject_kind      text,                    -- ВидСубМСП
  subject_category  text,                    -- КатСубМСП

  -- IP subject
  inn               text,                    -- ИННФЛ
  ogrnip            text,                    -- ОГРНИП
  last_name         text,                    -- Фамилия
  first_name        text,                    -- Имя
  middle_name       text,                    -- Отчество

  -- Location
  region_code       text,                    -- КодРегион

  -- Main OKVED
  okved_main_code   text,                    -- КодОКВЭД
  okved_main_name   text,                    -- НаимОКВЭД
  okved_version     text,                    -- ВерсОКВЭД

  -- Audit
  source_file       text,                    -- optional: which file this came from
  imported_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_registry_inn
  ON company_registry (inn);

CREATE INDEX IF NOT EXISTS idx_company_registry_region
  ON company_registry (region_code);

CREATE INDEX IF NOT EXISTS idx_company_registry_okved
  ON company_registry (okved_main_code);
