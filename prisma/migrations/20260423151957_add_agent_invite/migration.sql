-- CreateTable
CREATE TABLE "AgentInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'FIELD_AGENT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedById" TEXT,

    CONSTRAINT "AgentInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentInvite_email_key" ON "AgentInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AgentInvite_token_key" ON "AgentInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AgentInvite_claimedById_key" ON "AgentInvite"("claimedById");

-- AddForeignKey
ALTER TABLE "AgentInvite" ADD CONSTRAINT "AgentInvite_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
