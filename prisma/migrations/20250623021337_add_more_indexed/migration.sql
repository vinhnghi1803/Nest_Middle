-- CreateIndex
CREATE INDEX "Product_price_createdAt_idx" ON "Product"("price", "createdAt" DESC);
