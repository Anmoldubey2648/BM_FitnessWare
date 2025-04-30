// Meal plan data structure
const mealPlans = {
    ranges: [
        { min: 1000, max: 1100 },
        { min: 1101, max: 1200 },
        { min: 1201, max: 1300 },
        { min: 1301, max: 1400 },
        { min: 1401, max: 1500 },
        { min: 1501, max: 1600 },
        { min: 1601, max: 1700 },
        { min: 1701, max: 1800 },
        { min: 1801, max: 1900 },
        { min: 1901, max: 2000 },
        { min: 2001, max: 4000 }
    ],
    vegetarian: {
        breakfast: [
            { calories: 300, items: ['Oatmeal with fruits', 'Greek yogurt', 'Almonds'] },
            { calories: 350, items: ['Whole grain toast', 'Avocado', 'Eggs'] },
            { calories: 400, items: ['Smoothie bowl', 'Granola', 'Chia seeds'] }
        ],
        lunch: [
            { calories: 400, items: ['Quinoa bowl', 'Mixed vegetables', 'Tofu'] },
            { calories: 450, items: ['Lentil soup', 'Brown rice', 'Steamed vegetables'] },
            { calories: 500, items: ['Chickpea curry', 'Brown rice', 'Naan'] }
        ],
        dinner: [
            { calories: 450, items: ['Vegetable stir-fry', 'Brown rice', 'Tempeh'] },
            { calories: 500, items: ['Mushroom risotto', 'Green salad', 'Parmesan'] },
            { calories: 550, items: ['Sweet potato bowl', 'Black beans', 'Kale'] }
        ],
        snacks: [
            { calories: 150, items: ['Mixed nuts', 'Fruit'] },
            { calories: 200, items: ['Hummus', 'Vegetable sticks'] },
            { calories: 250, items: ['Protein bar', 'Banana'] }
        ]
    },
    nonVegetarian: {
        breakfast: [
            { calories: 350, items: ['Egg Bhurji with Paratha', 'Masala Chai', 'Mixed Fruit Bowl'] },
            { calories: 400, items: ['Chicken Keema Paratha', 'Mint Chutney', 'Curd'] },
            { calories: 450, items: ['Mutton Nihari with Kulcha', 'Mixed Pickle', 'Lassi'] }
        ],
        lunch: [
            { calories: 450, items: ['Chicken Biryani', 'Raita', 'Onion Salad'] },
            { calories: 500, items: ['Fish Curry', 'Steamed Rice', 'Cucumber Salad'] },
            { calories: 550, items: ['Mutton Rogan Josh', 'Jeera Rice', 'Papad'] }
        ],
        dinner: [
            { calories: 500, items: ['Tandoori Chicken', 'Rumali Roti', 'Dal Tadka'] },
            { calories: 550, items: ['Butter Chicken', 'Naan', 'Mixed Vegetable Curry'] },
            { calories: 600, items: ['Mutton Korma', 'Laccha Paratha', 'Mint Chutney'] }
        ],
        snacks: [
            { calories: 200, items: ['Chicken Tikka', 'Green Chutney'] },
            { calories: 250, items: ['Egg Roll', 'Masala Chai'] },
            { calories: 300, items: ['Keema Samosa', 'Tamarind Chutney'] }
        ]
    }
};

// Function to get meal plan based on BMR
function getMealPlan(bmr, isVegetarian) {
    // Find the appropriate range for the BMR
    const range = mealPlans.ranges.find(r => bmr >= r.min && bmr <= r.max);
    if (!range) {
        // If BMR is outside all ranges, use the closest range
        const closestRange = mealPlans.ranges.reduce((prev, curr) => {
            return Math.abs(curr.min - bmr) < Math.abs(prev.min - bmr) ? curr : prev;
        });
        return generateMealPlan(closestRange, bmr, isVegetarian);
    }
    return generateMealPlan(range, bmr, isVegetarian);
}

// Function to generate meal plan based on range and BMR
function generateMealPlan(range, bmr, isVegetarian) {
    const planType = isVegetarian ? mealPlans.vegetarian : mealPlans.nonVegetarian;
    const dailyCalories = bmr;
    
    // Calculate meal distribution
    const breakfast = Math.floor(dailyCalories * 0.3);
    const lunch = Math.floor(dailyCalories * 0.35);
    const dinner = Math.floor(dailyCalories * 0.25);
    const snacks = Math.floor(dailyCalories * 0.1);

    // Find the closest meal options for each time of day
    const findClosestMeal = (meals, targetCalories) => {
        return meals.reduce((prev, curr) => {
            return Math.abs(curr.calories - targetCalories) < Math.abs(prev.calories - targetCalories) ? curr : prev;
        });
    };

    return {
        breakfast: findClosestMeal(planType.breakfast, breakfast),
        lunch: findClosestMeal(planType.lunch, lunch),
        dinner: findClosestMeal(planType.dinner, dinner),
        snacks: findClosestMeal(planType.snacks, snacks)
    };
}

// Function to display meal plan with animations
function displayMealPlan(mealPlan, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !mealPlan) return;

    // Add fade-in animation class
    container.classList.add('fade-in');

    container.innerHTML = `
        <div class="meal-section transform transition-all duration-300 hover:scale-105">
            <h4 class="text-xl font-bold mb-2 text-green-400">Breakfast (${mealPlan.breakfast.calories} calories)</h4>
            <ul class="list-disc list-inside space-y-2">
                ${mealPlan.breakfast.items.map(item => `<li class="text-gray-300">${item}</li>`).join('')}
            </ul>
        </div>
        <div class="meal-section transform transition-all duration-300 hover:scale-105">
            <h4 class="text-xl font-bold mb-2 text-green-400">Lunch (${mealPlan.lunch.calories} calories)</h4>
            <ul class="list-disc list-inside space-y-2">
                ${mealPlan.lunch.items.map(item => `<li class="text-gray-300">${item}</li>`).join('')}
            </ul>
        </div>
        <div class="meal-section transform transition-all duration-300 hover:scale-105">
            <h4 class="text-xl font-bold mb-2 text-green-400">Dinner (${mealPlan.dinner.calories} calories)</h4>
            <ul class="list-disc list-inside space-y-2">
                ${mealPlan.dinner.items.map(item => `<li class="text-gray-300">${item}</li>`).join('')}
            </ul>
        </div>
        <div class="meal-section transform transition-all duration-300 hover:scale-105">
            <h4 class="text-xl font-bold mb-2 text-green-400">Snacks (${mealPlan.snacks.calories} calories)</h4>
            <ul class="list-disc list-inside space-y-2">
                ${mealPlan.snacks.items.map(item => `<li class="text-gray-300">${item}</li>`).join('')}
            </ul>
        </div>
    `;

    // Remove fade-in class after animation
    setTimeout(() => {
        container.classList.remove('fade-in');
    }, 1000);
}