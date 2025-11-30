-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "profile" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Meal" (
    "mealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("mealId")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "mealItemId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("mealItemId")
);

-- CreateTable
CREATE TABLE "MealItemAnalysis" (
    "mealItemAnalysisId" TEXT NOT NULL,
    "mealItemId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "kcal" DOUBLE PRECISION NOT NULL,
    "carbohydrate" DOUBLE PRECISION NOT NULL,
    "sugar" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "calcium" DOUBLE PRECISION NOT NULL,
    "phosphorus" DOUBLE PRECISION NOT NULL,
    "natrium" DOUBLE PRECISION NOT NULL,
    "kalium" DOUBLE PRECISION NOT NULL,
    "magnesium" DOUBLE PRECISION NOT NULL,
    "iron" DOUBLE PRECISION NOT NULL,
    "zinc" DOUBLE PRECISION NOT NULL,
    "cholesterol" DOUBLE PRECISION NOT NULL,
    "transfat" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealItemAnalysis_pkey" PRIMARY KEY ("mealItemAnalysisId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Meal_userId_idx" ON "Meal"("userId");

-- CreateIndex
CREATE INDEX "MealItem_mealId_idx" ON "MealItem"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "MealItemAnalysis_mealItemId_key" ON "MealItemAnalysis"("mealItemId");

-- CreateIndex
CREATE INDEX "MealItemAnalysis_mealItemId_idx" ON "MealItemAnalysis"("mealItemId");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("mealId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItemAnalysis" ADD CONSTRAINT "MealItemAnalysis_mealItemId_fkey" FOREIGN KEY ("mealItemId") REFERENCES "MealItem"("mealItemId") ON DELETE RESTRICT ON UPDATE CASCADE;
