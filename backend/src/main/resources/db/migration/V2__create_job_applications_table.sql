CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    job_url TEXT NOT NULL DEFAULT '',
    company VARCHAR(200) NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL DEFAULT '',
    salary VARCHAR(200) NOT NULL DEFAULT '',

    status VARCHAR(30) NOT NULL,

    notes TEXT NOT NULL DEFAULT '',
    job_description TEXT NOT NULL DEFAULT '',
    required_skills TEXT NOT NULL DEFAULT '',
    benefits TEXT NOT NULL DEFAULT '',
    recruiter VARCHAR(200) NOT NULL DEFAULT '',

    application_deadline DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_job_applications_user
        FOREIGN KEY (user_id)
        REFERENCES app_users (id)
        ON DELETE CASCADE,

    CONSTRAINT chk_job_applications_company_not_blank
        CHECK (btrim(company) <> ''),

    CONSTRAINT chk_job_applications_job_title_not_blank
        CHECK (btrim(job_title) <> ''),

    CONSTRAINT chk_job_applications_status
        CHECK (
            status IN (
                'SAVED',
                'APPLIED',
                'ASSESSMENT',
                'INTERVIEW',
                'OFFER',
                'REJECTED'
            )
        )
);

CREATE INDEX idx_job_applications_user_created_at
    ON job_applications (user_id, created_at DESC);

CREATE INDEX idx_job_applications_user_status
    ON job_applications (user_id, status);

CREATE INDEX idx_job_applications_user_deadline
    ON job_applications (user_id, application_deadline)
    WHERE application_deadline IS NOT NULL;