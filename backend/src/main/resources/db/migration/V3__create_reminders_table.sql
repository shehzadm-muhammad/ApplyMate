CREATE TABLE reminders (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    title VARCHAR(200) NOT NULL,

    company VARCHAR(200) NOT NULL,

    type VARCHAR(30) NOT NULL,

    due_at TIMESTAMP WITH TIME ZONE NOT NULL,

    notes TEXT NOT NULL,

    completed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_reminders_user
        FOREIGN KEY (user_id)
        REFERENCES app_users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_reminders_user
    ON reminders(user_id);

CREATE INDEX idx_reminders_due_at
    ON reminders(due_at);

CREATE INDEX idx_reminders_completed
    ON reminders(completed);