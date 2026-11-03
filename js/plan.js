// Daily plan: a specific workout and food targets for each day.
// Workout types follow a fixed rotation; the workout inside each type and the food picks
// are random, but never repeat anything from the last few days.
const Plan = (() => {
  const ROTATION = ['strength', 'cardio', 'strength', 'mobility'];
  const TYPE_LABELS = { strength: 'Strength', cardio: 'Cardio', mobility: 'Mobility' };

  const WORKOUTS = {
    strength: [
      { id: 'upper_push', title: 'Upper body push', detail: 'Push-ups 4 × as many as you can · Dumbbell shoulder press 3 × 10 · Chair dips 3 × 10 · Plank 3 × 45 s' },
      { id: 'upper_pull', title: 'Upper body pull', detail: 'Dumbbell rows 4 × 10 each side · Band pull-aparts 3 × 15 · Dumbbell curls 3 × 12 · Superman hold 3 × 30 s' },
      { id: 'lower', title: 'Lower body', detail: 'Goblet squats 4 × 12 · Reverse lunges 3 × 10 each leg · Glute bridges 3 × 15 · Calf raises 3 × 20' },
      { id: 'full_circuit', title: 'Full-body circuit', detail: '5 rounds: 10 squats · 10 push-ups · 10 dumbbell rows each side · 30 s plank' },
      { id: 'legs_core', title: 'Legs and core', detail: 'Bulgarian split squats 3 × 8 each leg · Dumbbell Romanian deadlifts 3 × 10 · Dead bugs 3 × 10 each side · Side plank 30 s each side' },
      { id: 'bands', title: 'Resistance band total body', detail: 'Band squats 3 × 15 · Band chest press 3 × 12 · Band rows 3 × 15 · Pallof press 3 × 10 each side' },
    ],
    cardio: [
      { id: 'easy_run', title: 'Easy run', detail: '30 minutes at a pace where you can still talk' },
      { id: 'intervals', title: 'Run intervals', detail: '5 min easy warm-up · 8 × (1 min hard, 90 s easy) · 5 min cool-down' },
      { id: 'tempo', title: 'Tempo run', detail: '10 min easy · 15 min comfortably hard · 5 min easy' },
      { id: 'bike', title: 'Bike ride', detail: '45 minutes at a steady effort, with a few hills if you have them' },
      { id: 'hike', title: 'Hike or hilly walk', detail: '45 minutes at a brisk pace, taking the hills' },
      { id: 'hiit', title: 'Bodyweight HIIT', detail: '20 min of 40 s on / 20 s off: jumping jacks · mountain climbers · squat jumps · high knees · burpees' },
    ],
    mobility: [
      { id: 'yoga', title: 'Yoga flow', detail: '30 minutes: sun salutations · warrior poses · pigeon · child’s pose' },
      { id: 'hips', title: 'Hips and hamstrings', detail: '3 rounds, 1 min each: 90/90 hip switches · World’s greatest stretch · Band hamstring stretch · Deep squat hold' },
      { id: 'walk_stretch', title: 'Walk and stretch', detail: '30 min brisk walk, then 10 min of full-body stretching' },
      { id: 'core_mobility', title: 'Core and mobility', detail: '3 rounds: Bird dogs 10 each side · Cat-cow 10 · Hollow hold 30 s · Thread the needle 8 each side' },
      { id: 'shoulders', title: 'Shoulders and upper back', detail: 'Band dislocates 3 × 12 · Wall slides 3 × 10 · Doorway chest stretch 1 min each side · then a 15 min walk' },
    ],
  };

  // Keyed by habit id.
  const FOODS = {
    whole_foods: {
      title: 'Whole foods',
      items: [
        { id: 'leafy', text: 'A leafy green: spinach, kale or arugula' },
        { id: 'crucifer', text: 'Broccoli, cauliflower or Brussels sprouts' },
        { id: 'orange_veg', text: 'An orange vegetable: sweet potato, carrots or squash' },
        { id: 'berries', text: 'Berries with breakfast or as a snack' },
        { id: 'fish', text: 'Salmon, sardines or another fatty fish' },
        { id: 'eggs_yogurt', text: 'Eggs or plain Greek yogurt for breakfast' },
        { id: 'nuts', text: 'A handful of nuts or seeds instead of a packaged snack' },
        { id: 'whole_grain', text: 'A whole grain: oats, quinoa or brown rice' },
        { id: 'colors', text: 'Three different colored vegetables' },
      ],
    },
    fiber: {
      title: 'High fiber',
      items: [
        { id: 'lentils', text: 'Lentils' },
        { id: 'beans', text: 'Black or kidney beans' },
        { id: 'chickpeas', text: 'Chickpeas or hummus' },
        { id: 'oats', text: 'Oatmeal' },
        { id: 'chia', text: 'Chia or ground flax seeds' },
        { id: 'raspberries', text: 'Raspberries or blackberries' },
        { id: 'pear_apple', text: 'A pear or apple, skin on' },
        { id: 'avocado', text: 'Avocado' },
        { id: 'split_pea', text: 'Split pea soup' },
        { id: 'whole_wheat', text: 'Whole-wheat pasta or bread' },
      ],
    },
  };

  // How many earlier days a pick must not repeat.
  const WORKOUT_MEMORY = 4;
  const FOOD_MEMORY = 2;

  function pick(pool, avoidIds) {
    const fresh = pool.filter((item) => !avoidIds.includes(item.id));
    const options = fresh.length ? fresh : pool;
    return options[Math.floor(Math.random() * options.length)];
  }

  function recentWorkouts(recent) {
    return recent.slice(0, WORKOUT_MEMORY).map((p) => p.workout?.id);
  }

  function recentFoods(recent, habitId) {
    return recent.slice(0, FOOD_MEMORY).map((p) => p.food?.[habitId]);
  }

  // recent: plans for earlier days, newest first.
  function generate(recent) {
    const lastStep = recent[0]?.workout?.step;
    const step = Number.isInteger(lastStep) ? (lastStep + 1) % ROTATION.length : 0;
    const type = ROTATION[step];
    const plan = {
      workout: { step, type, id: pick(WORKOUTS[type], recentWorkouts(recent)).id },
      food: {},
    };
    for (const [habitId, pool] of Object.entries(FOODS)) {
      plan.food[habitId] = pick(pool.items, recentFoods(recent, habitId)).id;
    }
    return plan;
  }

  // Re-pick one slot ('workout' or a food habit id). A swapped workout keeps its type
  // so the rotation stays on track.
  function swap(plan, slot, recent) {
    const next = structuredClone(plan);
    if (slot === 'workout') {
      next.workout.id = pick(WORKOUTS[plan.workout.type], [plan.workout.id, ...recentWorkouts(recent)]).id;
    } else if (FOODS[slot]) {
      next.food[slot] = pick(FOODS[slot].items, [plan.food[slot], ...recentFoods(recent, slot)]).id;
    }
    return next;
  }

  // What the plan asks of one habit, or null if the plan doesn't cover it.
  function forHabit(plan, habitId) {
    if (!plan) return null;
    if (habitId === 'workout') {
      const w = WORKOUTS[plan.workout?.type]?.find((x) => x.id === plan.workout.id);
      return w ? { slot: 'workout', heading: TYPE_LABELS[plan.workout.type], main: w.title, detail: w.detail } : null;
    }
    const pool = FOODS[habitId];
    const item = pool?.items.find((x) => x.id === plan.food?.[habitId]);
    return item ? { slot: habitId, heading: pool.title, main: item.text, detail: null } : null;
  }

  return { generate, swap, forHabit };
})();
