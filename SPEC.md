# Habit Run: Spec

A mobile-first habit tracker built like a roguelike. Each week is a **run**. Daily check-ins earn **gold**, the end of each week is a **boss** (the weekly targets), and beating the boss earns **relics** (passive perks). It's meant to be quick to log and to forgive bad weeks.

## Goals

- Build daily habits: exercise, reading, healthier eating.
- Logging a day takes under 10 seconds on a phone.
- The game layer keeps it fun, but a bad week never wipes out overall progress.

## Non-goals (for now)

- No accounts, server, or syncing between devices. Data lives on the phone.
- No calorie or macro counting. Food goals are simple yes/no check-ins.
- No app store. It's a PWA installed from the browser.

## Tech

- Plain HTML, CSS, and JavaScript. No framework or build step.
- Data saved in `localStorage` as one JSON object with a `schemaVersion` field.
- PWA: `manifest.json` plus a service worker so it can be installed to the home screen and works offline.
- Hosted on GitHub Pages.
- Mobile first: big tap targets, one-handed use, works at 375px wide.

## Habits (defaults, editable in Settings)

| ID | Category | Daily check-in | Gold |
|---|---|---|---|
| `workout` | Exercise | Worked out 30+ minutes | 10 |
| `reading` | Reading | Read 30+ pages | 10 |
| `water` | Food | Hit my water goal (default: 8 cups) | 5 |
| `whole_foods` | Food | Ate mostly whole foods, no processed snacks or fast food | 5 |
| `fiber` | Food | Had a high-fiber food at 2+ meals | 5 |

- Each habit can be checked off once per day.
- **Perfect day:** every habit checked gives +10 bonus gold.
- Habits can be added, edited, renamed, or archived. Archived habits keep their history.

## Days and weeks

- A day runs from local midnight to midnight.
- **Grace period:** yesterday can still be edited until noon today.
- A run lasts Monday through Sunday.

## The run loop

### 1. Run start (Monday, or the first open of the week)
- Show the run number, this week's **modifier**, and the boss targets.
- Optional **shop**: spend gold on consumables (see Shop).

### 2. Daily check-ins
- The main screen is today's habits as large toggle buttons.
- It shows gold earned today, the run's gold total, current streaks, and progress toward the boss.

### 3. Boss fight (end of the week)
Default weekly targets:
- Exercise: **5 / 7** days
- Reading: **5 / 7** days
- Food: **15 / 21** check-ins (3 food goals × 7 days)

The daily goal is still every day. The boss threshold leaves some slack so that one off day doesn't lose the week.

Outcomes:
- **Victory** (all targets met): +50 gold, then choose **1 of 3** random relics.
- **Partial** (2 of 3 targets met): +20 gold, no relic.
- **Defeat:** keep all gold earned that week. The run is recorded as a loss. Nothing else is lost.

When the week ends, a run summary screen appears the next time the app is opened.

## Relics

- Relics stay in the collection permanently. **Up to 3 can be equipped** at a time, and they can be swapped at the start of a run.
- Relics with a "once per run" effect reset each run.

Starting pool:

| Relic | Effect |
|---|---|
| Bookmark | One missed reading day per run doesn't break the reading streak |
| Second Wind | The first workout each run pays double gold |
| Canteen | Water check-ins pay +3 gold |
| Whole Grain | Fiber + whole foods on the same day: +5 gold |
| Iron Will | Lowers the exercise boss target by 1 day |
| Speed Reader | Every 3 reading days in a row: +15 gold |
| Lucky Coin | Relic choice shows 4 options instead of 3 |
| Comeback Kid | After a defeat, the next run starts with +30 gold |

## Weekly modifiers

One modifier is picked at random each run and shown at run start.

| Modifier | Effect |
|---|---|
| Library Week | Reading pays double gold |
| Iron Week | Workouts pay double gold |
| Clean Plate | Food check-ins pay double gold |
| Elite Boss | Exercise target +1, but victory offers a rare relic |
| Calm Week | No modifier |
| Gold Rush | Perfect-day bonus is +25 instead of +10 |

## Shop

Opens at run start. Spend gold on:

| Item | Cost | Effect |
|---|---|---|
| Streak Shield | 40 | Protects one streak from one missed day |
| Reroll | 30 | Reroll this week's modifier |
| Relic Reroll | 50 | Reroll the relic choice after a victory |

## Streaks

- Each habit has its own streak counter (consecutive days checked).
- Also track the best streak per habit and a **run win streak** (consecutive victories).

## Screens

1. **Today** (home): habit toggles, gold, streaks, boss progress bar
2. **Run**: current modifier, equipped relics, boss targets, days left
3. **Shop**: buy consumables (run start only)
4. **Run summary**: outcome, gold earned, relic choice
5. **History**: past runs (Run #N: victory/partial/defeat), calendar heatmap per habit
6. **Settings**: edit habits and targets, export/import data as JSON, reset

## Data model (sketch)

```json
{
  "schemaVersion": 1,
  "habits": [{ "id": "workout", "label": "Worked out 30+ min", "category": "exercise", "gold": 10, "archived": false }],
  "log": { "2026-11-02": ["workout", "reading", "water"] },
  "gold": 120,
  "relics": { "owned": ["bookmark"], "equipped": ["bookmark"] },
  "consumables": { "streakShield": 1 },
  "runs": [{ "number": 1, "weekStart": "2026-11-02", "modifier": "library_week", "outcome": "victory", "goldEarned": 210 }],
  "settings": { "bossTargets": { "exercise": 5, "reading": 5, "food": 15 } }
}
```

## Build milestones

**Weekend 1: core tracker (no game layer)**
- Today screen with habit toggles, saving to localStorage, Settings to edit habits
- Deploy to GitHub Pages and install on the phone
- Use it for a week before building anything else

**Weekend 2: roguelike layer**
- Gold, runs, the boss check, the run summary, relics and the relic choice

**Weekend 3: polish**
- Modifiers, shop, History screen with heatmaps, JSON export/import, offline support, daily reminder notification

## Acceptance checks

- A full day can be logged in under 10 seconds with one hand.
- Closing and reopening the app (or going offline) loses no data.
- Missing a whole week never reduces total gold or removes relics.
- Exporting data and importing it on a fresh install restores everything.
