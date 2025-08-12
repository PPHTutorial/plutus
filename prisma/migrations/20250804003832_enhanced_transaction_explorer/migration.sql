/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "apiUrl" TEXT,
ADD COLUMN     "blockHash" TEXT,
ADD COLUMN     "blockHeight" INTEGER,
ADD COLUMN     "blockTime" TIMESTAMP(3),
ADD COLUMN     "confirmations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BTC',
ADD COLUMN     "explorerUrl" TEXT,
ADD COLUMN     "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "gasPrice" TEXT,
ADD COLUMN     "gasUsed" INTEGER,
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "inputs" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "network" TEXT NOT NULL DEFAULT 'BTC',
ADD COLUMN     "nonce" INTEGER,
ADD COLUMN     "outputs" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "receiverAddress" TEXT NOT NULL DEFAULT '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
ADD COLUMN     "receiverEmail" TEXT,
ADD COLUMN     "senderAddress" TEXT NOT NULL DEFAULT '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "weight" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");
