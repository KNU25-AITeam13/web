/*
  Warnings:

  - You are about to drop the column `amount` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `calcium` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `carbohydrate` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `cholesterol` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `className` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `iron` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `kalium` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `kcal` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `magnesium` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `natrium` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `phosphorus` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `sugar` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `transfat` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `zinc` on the `MealItemAnalysis` table. All the data in the column will be lost.
  - Added the required column `foodName` to the `MealItemAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealItemAnalysis" DROP COLUMN "amount",
DROP COLUMN "calcium",
DROP COLUMN "carbohydrate",
DROP COLUMN "cholesterol",
DROP COLUMN "classId",
DROP COLUMN "className",
DROP COLUMN "fat",
DROP COLUMN "iron",
DROP COLUMN "kalium",
DROP COLUMN "kcal",
DROP COLUMN "magnesium",
DROP COLUMN "natrium",
DROP COLUMN "phosphorus",
DROP COLUMN "protein",
DROP COLUMN "sugar",
DROP COLUMN "transfat",
DROP COLUMN "zinc",
ADD COLUMN     "calciumMg" DOUBLE PRECISION,
ADD COLUMN     "caloriesKcal" DOUBLE PRECISION,
ADD COLUMN     "carbsG" DOUBLE PRECISION,
ADD COLUMN     "cholesterolMg" DOUBLE PRECISION,
ADD COLUMN     "dietaryFiberG" DOUBLE PRECISION,
ADD COLUMN     "fatG" DOUBLE PRECISION,
ADD COLUMN     "foodName" TEXT NOT NULL,
ADD COLUMN     "ironMg" DOUBLE PRECISION,
ADD COLUMN     "massG" DOUBLE PRECISION,
ADD COLUMN     "proteinG" DOUBLE PRECISION,
ADD COLUMN     "saturatedFatG" DOUBLE PRECISION,
ADD COLUMN     "sodiumMg" DOUBLE PRECISION,
ADD COLUMN     "sugarsG" DOUBLE PRECISION,
ADD COLUMN     "vitaminAUg" DOUBLE PRECISION,
ADD COLUMN     "vitaminCMg" DOUBLE PRECISION,
ADD COLUMN     "volumeMl" DOUBLE PRECISION,
ADD COLUMN     "waterG" DOUBLE PRECISION;
