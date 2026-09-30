# Build: Cubs Baseball IQ

Build a polished, mobile-first single-page React + TypeScript web application called **Cubs Baseball IQ**.

This is an interactive defensive baseball teaching tool for a coach-pitch 8U team. Parents will open a URL with their child and use short animated scenarios and quizzes to teach defensive positioning, situational awareness, backup responsibilities, cutoffs, force plays, and decision-making.

This is NOT intended to be a realistic baseball video game.

Think of it as an **interactive animated defensive whiteboard + Baseball IQ trainer**.

The application should teach a deterministic defensive system defined by the coach. Do NOT use AI or dynamically invent baseball assignments at runtime.

---

# 1. Core Coaching Philosophy

The primary mental model is:

**BALL → BASE → BACKUP**

Every defensive player should learn:

1. Where is the ball?
2. What base or area am I responsible for?
3. Who or what am I backing up?

Use these principles throughout the application:

- The ball only needs one kid. The play needs everybody.
- Know where the next play is.
- Cover your base.
- Back up throws.
- Outfielders get the ball back to the infield.
- Hit the cutoff player.
- SS and 2B share responsibility for second base.
- Pitcher has backup responsibilities after the ball is hit.
- Catcher protects home and communicates.
- Do not throw the baseball just because you have it.
- If there is no realistic play and runners have stopped: **HOLD THE BALL.**
- Prevent unnecessary extra bases.
- Know the difference between a force play and a tag play.

The goal is NOT advanced baseball strategy.

The goal is to create simple, repeatable responsibilities that 7- and 8-year-old players can understand and execute.

---

# 2. Technology

Use:

- React
- TypeScript
- Vite
- SVG for the baseball field
- CSS animations or Framer Motion
- No backend for v1
- No authentication
- No database
- All roster, lineup, rules, scenarios, and teaching content stored locally
- Responsive/mobile-first
- Excellent experience on iPhone and iPad
- Desktop support

Architecture should allow a backend and multiple teams to be introduced later without rewriting the scenario engine.

---

# 3. Defensive Alignment

This team plays 10 defenders using FOUR outfielders.

Positions:

- C
- P
- 1B
- 2B
- SS
- 3B
- LF
- LCF
- RCF
- RF

Do NOT assume standard MLB three-outfielder positioning.

Visually approximate:

                    LCF       RCF

              LF                   RF


                     SS     2B

                3B       P       1B


                         C

The SVG baseball field should be the primary visualization.

---

# 4. Roster

Seed the application with this roster:

- Braxton Baker
- Leif Beardslee
- Joshua Berlin
- Everett Brazell
- Nico Canderan
- Jackson Dennis
- Luke Edwards
- Sebastian Gentry
- Leonardo Hall
- Lucas Kaszanits
- Kameron Kirkland
- Dawson Lauer

Use first names on the field.

Store full names internally.

---

# 5. Lineups

Support four defensive innings.

Each inning contains:

- 10 defensive players
- 2 bench players

Positions:

C
P
1B
2B
SS
3B
LF
LCF
RCF
RF
BENCH
BENCH

Create clean editable placeholder lineups initially.

DO NOT invent historical Cubs lineups if exact values are not provided.

I will update the lineup data later.

Example model:

interface DefensiveLineup {
  inning: number;
  positions: Record<DefensivePosition, PlayerId>;
  bench: PlayerId[];
}

The lineup is important because the defensive engine should operate on POSITIONS, not individual players.

Example:

Scenario determines:

2B → COVER_SECOND

Then the current inning's lineup determines which actual player is playing 2B.

This separation is critical.

---

# 6. Architecture: Separate Baseball Logic from Rendering

Do NOT encode baseball knowledge directly inside React components or the SVG field.

Use this conceptual pipeline:

GAME STATE
    ↓
BALL LOCATION / TYPE
RUNNERS
OUTS
    ↓
DEFENSIVE RULE ENGINE
    ↓
POSITION ASSIGNMENTS
    ↓
CURRENT INNING LINEUP
    ↓
PLAYER ASSIGNMENTS
    ↓
ANIMATION ENGINE
    ↓
SVG FIELD

For example:

resolveScenario({
  event: "GROUND_BALL_SS",
  runners: ["1B"],
  outs: 0
});

might return:

{
  SS: FIELD_BALL,
  "2B": COVER_SECOND,
  "1B": COVER_FIRST,
  "3B": COVER_THIRD,
  LF: BACKUP_LEFT_SIDE,
  LCF: BACKUP_SECOND,
  RCF: BACKUP_SECOND,
  RF: BACKUP_FIRST,
  P: BACKUP_PLAY,
  C: COVER_HOME
}

The rendering layer should know NOTHING about why those assignments exist.

It simply receives movement destinations and renders them.

---

# 7. Suggested Project Structure

Use something similar to:

src/

  data/
    players.ts
    lineups.ts
    lessons.ts
    scenarios.ts

  baseball/
    types.ts
    coordinates.ts
    assignments.ts
    defensiveRules.ts
    scenarioResolver.ts
    teachingRules.ts

  animation/
    animationEngine.ts
    animationTypes.ts

  components/
    BaseballField/
    PlayerMarker/
    RunnerMarker/
    Baseball/
    ScenarioControls/
    TeachingPanel/
    QuizOverlay/
    ScorePanel/
    PlayerSelector/
    InningSelector/
    CoachLineupEditor/

  pages/
    Home/
    Lesson/
    Practice/
    Coach/

Keep components small and reusable.

---

# 8. Baseball Field Coordinate System

Use normalized coordinates rather than hard-coded pixels.

Example:

type Coordinate = {
  x: number;
  y: number;
};

The SVG viewBox can use:

0 0 100 100

Define standard locations such as:

HOME
FIRST_BASE
SECOND_BASE
THIRD_BASE
MOUND

and normal starting coordinates for:

C
P
1B
2B
SS
3B
LF
LCF
RCF
RF

Also define tactical destinations such as:

BACKUP_FIRST
BACKUP_SECOND_LEFT
BACKUP_SECOND_RIGHT
BACKUP_THIRD
BACKUP_HOME
SS_CUTOFF_LEFT
SECOND_BASE_CUTOFF_RIGHT
LEFT_FIELD_BALL
RIGHT_FIELD_BALL

Keep these coordinates centralized.

---

# 9. Defensive Assignment Types

Create reusable assignment types.

Examples:

FIELD_BALL
COVER_FIRST
COVER_SECOND
COVER_THIRD
COVER_HOME
BACKUP_FIRST
BACKUP_SECOND
BACKUP_THIRD
BACKUP_HOME
CUTOFF
RELAY
BACKUP_FIELDER
HOLD_POSITION
HOLD_BALL
WATCH_RUNNER

Each assignment should support:

- destination
- action
- short label
- kid-friendly explanation
- animation timing
- optional teaching emphasis

Example:

{
  action: "COVER_SECOND",
  destination: SECOND_BASE,
  label: "Cover 2nd",
  explanation:
    "The shortstop is fielding the ball, so you cover second."
}

---

# 10. Core Defensive Rules

Implement the initial defensive teaching system below.

These rules are intentionally simplified for 8U baseball.

## Ground Ball to SS

SS:
- Field ball.

2B:
- Cover second when there is a runner/force opportunity there.

1B:
- Cover first.

3B:
- Protect third.

LF:
- Back up left side / third-base side.

LCF:
- Move toward backup responsibility around second.

RCF:
- Move toward middle/right-side backup.

RF:
- Back up first.

P:
- Transition into backup responsibility instead of standing on mound.

C:
- Protect home and communicate.

If runner is on first:

Teach that second base may be the force play.

However, also reinforce:

**Take the realistic out. Do not make a dangerous throw simply because a force exists.**

---

# 11. Ground Ball to 2B

2B:
- Field ball.

SS:
- Cover second when appropriate.

1B:
- Cover first.

3B:
- Protect third.

RF:
- Back up first/right side.

RCF:
- Back up right-center/second-base area.

LCF:
- Move toward second-base backup.

P:
- Transition into appropriate backup responsibility.

C:
- Protect home.

Major teaching point:

**SS and 2B share second base.**

Ball to SS → 2B covers.

Ball to 2B → SS covers.

This should be one of the most visually emphasized lessons in the app.

---

# 12. Ground Ball to 3B

3B:
- Field ball.

SS:
- Protect/cover the vacated third-base area when appropriate.

1B:
- Cover first.

LF:
- Back up third/left side.

P:
- Transition into backup responsibility.

Other players maintain appropriate base/backup responsibilities.

For young players, emphasize the sure out at first unless a very obvious force play exists.

---

# 13. Ground Ball to 1B

Teach two variations.

Variation A:

First baseman fields ball near first and can reach bag.

1B:
- Field ball.
- Get the out at first.

Variation B:

First baseman must move away from first to field ball.

P:
- COVER FIRST.

This should be a prominent quiz scenario.

Question:

"The first baseman had to leave the bag to get the ball. You're the pitcher. Where do you go?"

Correct answer:

FIRST BASE

---

# 14. Outfield: Ball to LF

LF:
- Field ball.

LCF:
- Back up LF.

SS:
- Primary cutoff / relay target for the left side.

3B:
- Cover third.

2B:
- Cover second.

1B:
- Cover first.

C:
- Cover home.

P:
- Move toward likely backup responsibility.

Other OF:
- Move toward appropriate backup/coverage areas rather than standing still.

Major teaching point:

**Get the ball back to the infield. Hit the cutoff.**

Do not encourage 8U outfielders to attempt unnecessarily long hero throws.

---

# 15. Outfield: Ball to RF

RF:
- Field ball.

RCF:
- Back up RF.

2B:
- Primary cutoff / relay target on right side.

SS:
- Cover second.

1B:
- Cover first.

3B:
- Cover third.

C:
- Cover home.

P:
- Transition toward appropriate backup responsibility.

Major teaching point:

**Get it in. Hit the cutoff.**

---

# 16. Backup Responsibilities

These should have dedicated teaching scenarios.

## Throw to First

RF moves behind first base.

Show WHY.

Correct version:

Throw gets past 1B.

RF is backing up.

Ball is stopped.

Runner cannot easily advance.

Incorrect demonstration:

RF remains stationary.

Throw gets past 1B.

Runner advances.

Teaching text:

**Backing up a throw prevents extra bases.**

---

## Throw to Third

LF moves behind third.

Same teaching structure.

Question example:

"You're playing left field. A throw is coming to third. Where should you go?"

Correct destination:

Behind third base.

---

## Throw Home

Pitcher backs up catcher/home.

Animate pitcher moving behind home plate.

Teaching point:

**The pitcher doesn't watch the play. The pitcher protects against the overthrow.**

---

# 17. HOLD THE BALL

This is one of the MOST IMPORTANT concepts in the application.

Create dedicated scenarios where:

- runner has reached a base
- runner has stopped
- defender has possession
- there is no realistic out available

FREEZE the animation.

Ask:

**WHAT SHOULD YOU DO?**

Choices:

THROW TO 2ND

THROW TO 1ST

HOLD THE BALL ✋

Correct:

HOLD THE BALL

Celebrate the choice.

Display:

**YES! KEEP THE RUNNER THERE.**

Explanation:

"There is no play. An unnecessary throw can give the runner another base."

Also allow a teaching demonstration where the wrong throw is animated:

- defender throws unnecessarily
- ball gets away
- runner advances

Then reset and show the correct decision.

This concept should appear repeatedly throughout the app.

---

# 18. Force vs Tag

Create a highly visual lesson.

Example A:

Runner on first.

Ground ball.

Runner MUST advance to second.

Highlight second base.

Display:

**FORCE PLAY**

Explanation:

"The runner has to go to second. Touch the base with the ball before the runner gets there."

Example B:

Runner on second only.

Ground ball.

Runner does NOT have to advance to third.

Display:

**TAG PLAY**

Explanation:

"The runner does not have to go. You must tag the runner."

Create quizzes where children identify:

FORCE

or

TAG

Keep explanations extremely simple.

---

# 19. Bases Loaded Fly Ball

Create a simplified 8U teaching scenario.

Bases loaded.

Fly ball to LF.

Initial responsibilities:

LF → BALL
LCF → BACKUP LF
SS → CUTOFF / RELAY
3B → THIRD
2B → SECOND
1B → FIRST
C → HOME
P → BACKUP HOME

Other players move into logical backup responsibilities.

When catch occurs:

FREEZE.

Display:

**BALL CAUGHT! RUNNERS CAN TAG UP.**

Then continue animation.

Emphasize:

- Know where the lead runner is going.
- Get ball to cutoff.
- Protect home.

Do not overcomplicate advanced tagging rules.

---

# 20. DON'T CHASE THE BALL

Create a dedicated lesson around a common youth-baseball problem.

Major phrase:

**THE BALL ONLY NEEDS ONE KID. THE PLAY NEEDS EVERYBODY.**

Example:

Ground ball to SS.

SS fields it.

Ask 2B:

"Should you run toward the shortstop?"

NO.

Correct action:

Cover second.

Example:

Ball to LF.

Ask RCF:

"Should you run all the way across the field chasing the ball?"

NO.

Move toward assigned backup responsibility instead.

Teach players that everyone moving toward the baseball leaves bases uncovered.

---

# 21. Lessons

The home screen should prominently present five lessons.

## Lesson 1 — Cover Your Base

Focus:

- SS / 2B relationship
- first base coverage
- third base coverage
- home coverage

## Lesson 2 — Back It Up

Focus:

- RF backs up first
- LF backs up third
- P backs up home
- OF backs up OF

## Lesson 3 — Get It In

Focus:

- outfield
- cutoff players
- relay
- stop trying to make huge throws

## Lesson 4 — Hold the Ball ✋

Focus:

- recognizing when there is no play
- stopping runners
- avoiding unnecessary throws
- preventing extra bases

## Lesson 5 — Force or Tag?

Focus:

- basic force-play recognition
- basic tag-play recognition

Each lesson should contain approximately 3–5 short scenarios.

---

# 22. Learn Mode

Learn Mode demonstrates the play.

Example:

RUNNER ON FIRST
GROUND BALL TO SHORTSTOP

Show initial defense.

Press:

PLAY

Sequence:

1. Pitch / ball-in-play cue.
2. Ball moves toward SS.
3. SS moves to field ball.
4. Other defenders begin moving.
5. 2B covers second.
6. 1B covers first.
7. OF moves to backup positions.
8. Pitcher moves to backup assignment.
9. Catcher protects home.
10. Freeze completed alignment.

Then show each player's responsibility.

Example:

JOSHUA
FIELD BALL

LUCAS
COVER 2ND

KAMERON
COVER 1ST

Tapping a player shows the explanation.

---

# 23. Quiz Mode

Quiz Mode focuses on ONE player.

Example:

Player:
Lucas

Position:
2B

Scenario:

"Runner on first. Ground ball to shortstop."

Question:

**WHERE SHOULD LUCAS GO?**

Highlight Lucas.

Allow the child to tap a destination.

Potential targets:

- first
- second
- third
- home
- ball
- cutoff location
- backup area
- HOLD

If correct:

Celebrate.

Example:

**YES! COVER SECOND! ⚾**

Then animate player.

If incorrect:

Do not use harsh red failure messaging.

Say:

**Good try! Think about which base needs you.**

Allow another attempt.

After two incorrect attempts:

**Let's see it!**

Animate correct movement and explain why.

---

# 24. Practice My Game

This should be a major feature.

Button:

**PRACTICE MY GAME**

Parent/player selects their name.

The app looks at that player's position in each inning.

Example:

Kameron

1st — 1B
2nd — RCF
3rd — 2B
4th — 3B

Generate a practice session based on those positions.

Example:

ROUND 1 — FIRST BASE

- Ground ball to SS
- Ground ball to 2B
- Ball hit to 1B
- First baseman pulled off bag

ROUND 2 — RIGHT CENTER

- Ball to RF
- Throw toward second
- Ball to LF
- backup responsibilities

ROUND 3 — SECOND BASE

- Ball to SS
- Ball to 2B
- Ball to RF
- force play

ROUND 4 — THIRD BASE

- Ball to SS
- Ball to 3B
- Throw from LF
- tag vs force

Generate approximately 8–12 questions.

End screen:

**GREAT WORK! ⚾**

Example:

8 / 10

Show concepts needing additional practice:

COVERING SECOND
BACKING UP FIRST
FORCE VS TAG

No backend required.

Session scoring can exist entirely in React state.

---

# 25. Animation

Animations should be smooth and understandable.

Do not animate everything simultaneously at full speed.

Use deliberate phases.

Example:

PHASE 1
Ball hit.

PHASE 2
Fielder moves.

PHASE 3
Defense reacts.

PHASE 4
Throw occurs.

PHASE 5
Backup responsibility demonstrated.

Allow:

PLAY
PAUSE
REPLAY
RESET

Speed:

0.5x
1x
1.5x

Default should be intentionally slow enough for a child to follow.

---

# 26. Visual Design

The application should feel fun and polished without looking childish.

Use:

- baseball field greens
- dirt/basepath tones
- white
- Cubs-inspired royal blue
- red accents

Do NOT use copyrighted Chicago Cubs logos.

Use:

CUBS

or

Cubs Baseball IQ

as text branding.

Player markers should be highly readable.

Example marker:

┌─────────────┐
│   JOSHUA    │
│     SS      │
└─────────────┘

Selected player's marker should be visually emphasized.

Movement trails/arrows can briefly appear to make responsibilities obvious.

Use subtle visual effects when correct answers occur.

Avoid excessive confetti or distracting animations.

---

# 27. Kid-Friendly Language

Teaching text should be short.

BAD:

"The second baseman assumes responsibility for the second-base bag due to the shortstop vacating his defensive zone."

GOOD:

**Shortstop has the ball. You cover second!**

BAD:

"The right fielder should establish an appropriate backup angle."

GOOD:

**Get behind first in case the throw gets away!**

Design all instructional language for approximately a 7–8-year-old.

---

# 28. Coach Mode

Include a small gear icon that opens Coach Mode.

Coach Mode allows editing the four-inning defensive lineup.

For each inning show:

P
C
1B
2B
SS
3B
LF
LCF
RCF
RF
BENCH
BENCH

Use player dropdowns.

Validate:

- no player can occupy two positions during the same inning
- exactly 10 defensive positions
- exactly 2 bench players
- all 12 roster players accounted for

For v1, changes can remain in application state.

If easy, persist lineup changes using localStorage.

Keep persistence isolated behind a simple storage abstraction so a backend/API can replace it later.

---

# 29. Scenario Data

Do NOT create a giant React component with scenario-specific conditionals.

Scenarios should be declarative.

Example conceptual model:

interface Scenario {
  id: string;

  title: string;

  category:
    | "COVERAGE"
    | "BACKUP"
    | "OUTFIELD"
    | "DECISION"
    | "FORCE_TAG";

  difficulty: 1 | 2 | 3;

  gameState: {
    runners: Base[];
    outs: 0 | 1 | 2;
  };

  event: BallEvent;

  phases: ScenarioPhase[];

  teachingPoints: TeachingPoint[];

  relevantPositions: DefensivePosition[];
}

The rule engine should resolve defensive assignments from the scenario/game state.

---

# 30. Initial Scenario Library

Implement at least:

1. Bases empty — grounder to SS
2. Runner on 1st — grounder to SS
3. Bases empty — grounder to 2B
4. Runner on 1st — grounder to 2B
5. Grounder to 3B
6. Grounder directly to 1B
7. Grounder pulling 1B away from bag
8. Runner on 1st — single to LF
9. Runner on 1st — single to RF
10. Runner on 2nd — single to LF
11. Runner on 2nd — single to RF
12. Throw to first — RF backup
13. Throw to third — LF backup
14. Throw home — pitcher backup
15. No play available — HOLD BALL
16. Runner stopped after defensive mistake — HOLD BALL
17. Runner on first — identify force at second
18. Runner on second only — identify tag play at third
19. Bases loaded — fly ball to LF
20. Bases loaded — fly ball to RF
21. Ball to SS — 2B should not chase
22. Ball to LF — other OF should not chase

Build scenarios so additional situations can be added easily.

---

# 31. Scenario Correctness

IMPORTANT:

Do not invent additional baseball strategy if a scenario is ambiguous.

The rules in this specification are the initial coaching system.

If implementation reveals an ambiguous defensive responsibility, isolate it clearly in the scenario/rules data and add a TODO comment rather than silently deciding advanced baseball strategy.

The coach should be able to change one assignment without rewriting components or animations.

Baseball logic should be easy to audit.

---

# 32. Development Tool

Add a developer-only/debug mode.

When enabled, show:

- normalized x/y coordinates when clicking field
- current scenario state
- current animation phase
- resolved defensive assignments
- current lineup
- player destinations

This will make it dramatically easier to tune player positioning and scenario animations.

Allow clicking a position and seeing:

START:
{x, y}

DESTINATION:
{x, y}

ACTION:
COVER_SECOND

This does not need to be visible to normal users.

---

# 33. README

Create a thorough README explaining:

- project architecture
- local development
- production build
- deployment
- roster model
- lineup model
- defensive rule engine
- scenario resolver
- animation engine
- coordinate system
- how to add a player
- how to modify a lineup
- how to add a scenario
- how to change an assignment
- how to create a new lesson
- how Practice My Game selects questions
- how debug mode works

Include concrete examples.

---

# 34. Testing

Add unit tests for baseball logic.

The highest priority tests are NOT UI snapshot tests.

Test the defensive rule engine.

Examples:

Given:

GROUND_BALL_SS
runner on first

Expect:

SS = FIELD_BALL
2B = COVER_SECOND
1B = COVER_FIRST

Given:

GROUND_BALL_2B
runner on first

Expect:

2B = FIELD_BALL
SS = COVER_SECOND
1B = COVER_FIRST

Given:

GROUND_BALL_1B_OFF_BAG

Expect:

1B = FIELD_BALL
P = COVER_FIRST

Given:

THROW_HOME

Expect:

C = COVER_HOME
P = BACKUP_HOME

Given:

THROW_FIRST

Expect:

1B = COVER_FIRST
RF = BACKUP_FIRST

Given:

NO_PLAY_RUNNERS_STOPPED

Expect:

ballHolder = HOLD_BALL

The defensive engine should be deterministic and testable.

---

# 35. UX Priority

Prioritize development in this order:

1. Excellent SVG baseball field
2. Player positioning
3. Lineup → player mapping
4. Scenario/rule engine
5. Animation
6. Learn Mode
7. Quiz Mode
8. Five lessons
9. Practice My Game
10. Coach lineup editor
11. Scoring/polish

Do not spend excessive time on settings, authentication, backend infrastructure, or unnecessary abstraction.

The first milestone should be:

**Open app → select scenario → press Play → watch all ten Cubs defenders correctly execute their assignments.**

Once that works well, build the teaching experience around it.

---

# 36. Final Product Goal

A parent should be able to receive one URL, open it on their phone, hand it to their 7- or 8-year-old, select their player, and spend five minutes practicing defensive Baseball IQ.

The child should begin recognizing:

**"Ball to short — I cover second."**

**"Throw to first — I back it up."**

**"I'm the pitcher — I back up home."**

**"Ball is in left — get it to the cutoff."**

**"There's no play — HOLD IT."**

The application succeeds if these responsibilities become instinctive during actual games.

Build the application with that objective driving every technical and UX decision.