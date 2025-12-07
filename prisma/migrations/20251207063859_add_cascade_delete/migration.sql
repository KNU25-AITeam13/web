-- DropForeignKey
ALTER TABLE "MealItem" DROP CONSTRAINT "MealItem_mealId_fkey";

-- DropForeignKey
ALTER TABLE "MealItemAnalysis" DROP CONSTRAINT "MealItemAnalysis_mealItemId_fkey";

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("mealId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItemAnalysis" ADD CONSTRAINT "MealItemAnalysis_mealItemId_fkey" FOREIGN KEY ("mealItemId") REFERENCES "MealItem"("mealItemId") ON DELETE CASCADE ON UPDATE CASCADE;
