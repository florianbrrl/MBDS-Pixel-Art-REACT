-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "theme_preference" VARCHAR(5) NOT NULL DEFAULT 'sys',
    "role" VARCHAR(10) NOT NULL DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pixel_boards" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "grid" JSONB NOT NULL,
    "cooldown" INTEGER NOT NULL DEFAULT 60,
    "allow_overwrite" BOOLEAN NOT NULL DEFAULT false,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "admin_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pixel_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pixel_history" (
    "board_id" UUID NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "color" CHAR(7) NOT NULL,
    "user_id" UUID,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pixel_history_pkey" PRIMARY KEY ("board_id","x","y","timestamp")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "pixel_boards" ADD CONSTRAINT "pixel_boards_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pixel_history" ADD CONSTRAINT "pixel_history_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "pixel_boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pixel_history" ADD CONSTRAINT "pixel_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
