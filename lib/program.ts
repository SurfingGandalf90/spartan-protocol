// ─── SPARTAN PROTOCOL — Program Data & Helpers ───────────────────────────


// ─── WEEK DATA — Claude updates this block each week ───────────────────────
const CURRENT_WEEK = 2;
const WEEK_THEME = "Build on the base — load up, add variety, own the breathing";
const RPE_RANGE = "7–8";

// ─── NRC 8-WEEK PROGRAM — Actual plan from Nike Run Club ────────────────────
// Run days per your schedule: Monday, Tuesday, Thursday, Friday
// Week structure each week: 2 Recovery/Easy + 2 Speed + 1 Long Run
// Long run falls on Friday (run-only day)
const NRC_RUN_DAYS = ["Monday", "Tuesday", "Thursday", "Friday"];

const NRC_PROGRAM = {
  1: {
    theme: "Welcome to the Starting Line",
    description: "Begin your journey with runs and light workouts that introduce you to the training plan.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "20-25 min", distance: "1.5-3K / 1-2 mi",  structure: "Easy conversational pace — no intervals", effort: "Easy", tip: "Start slower than you think you need to. You should be able to hold a full conversation." },
      { runNum: 2, day: "Tuesday",  type: "Speed",    label: "Speed: Intervals",  duration: "20-30 min", distance: "2-4K / 1.5-2.5 mi", structure: "Speed intervals — short hard efforts with recovery", effort: "Hard intervals", tip: "After Day 2 lifting — take extra recovery time between intervals. Legs will be heavy." },
      { runNum: 3, day: "Thursday", type: "Recovery", label: "Recovery Run",      duration: "20-25 min", distance: "1.5-3K / 1-2 mi",  structure: "Easy conversational pace — no intervals", effort: "Easy", tip: "This follows Thursday lifting. Keep it genuinely easy — RPE 4 max." },
      { runNum: 4, day: "Friday",   type: "Long",     label: "Long Run",          duration: "25-35 min", distance: "2.5-5K / 1.5-3 mi", structure: "Continuous easy run — go as far as feels comfortable", effort: "Easy-Moderate", tip: "Run-only day. Fresh legs. This is your longest run of the week — go easy and enjoy it." },
    ],
  },
  2: {
    theme: "Set Good Habits",
    description: "Develop new habits. Special attention on how to have more fun running and recover better.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "20-25 min", distance: "2-3K / 1.5-2 mi",  structure: "Easy conversational pace", effort: "Easy", tip: "Focus on breathing rhythm and relaxed shoulders. Nothing more." },
      { runNum: 2, day: "Tuesday",  type: "Speed",    label: "Speed: Intervals",  duration: "25-30 min", distance: "2.5-4K / 1.5-2.5 mi", structure: "Speed intervals — building on Week 1", effort: "Hard intervals", tip: "After Day 2 lifting. Warm up properly — hips and calves especially." },
      { runNum: 3, day: "Thursday", type: "Recovery", label: "Recovery Run",      duration: "20-25 min", distance: "2-3K / 1.5-2 mi",  structure: "Easy conversational pace", effort: "Easy", tip: "Pure recovery. Think of this as active rest, not training." },
      { runNum: 4, day: "Friday",   type: "Long",     label: "Long Run",          duration: "25-35 min", distance: "3-5K / 2-3 mi",    structure: "Continuous easy run", effort: "Easy-Moderate", tip: "Run-only Friday. Let the pace find itself — don't chase a number." },
    ],
  },
  3: {
    theme: "Develop Consistency",
    description: "Fartlek work this week. You'll start to notice a rhythm that comes from consistency.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "25-30 min", distance: "2.5-4K / 1.5-2.5 mi", structure: "Easy conversational pace", effort: "Easy", tip: "Week 3 — your body is adapting. Trust the easy days." },
      { runNum: 2, day: "Tuesday",  type: "Speed",    label: "Speed: Fartlek",    duration: "25-30 min", distance: "3-4.5K / 2-3 mi",  structure: "Fartlek — surge when you feel like it, recover at will", effort: "Variable", tip: "After Day 2 lifting. Fartlek means play — run fast when it feels natural." },
      { runNum: 3, day: "Thursday", type: "Speed",    label: "Speed: Fartlek",    duration: "25-30 min", distance: "3-4.5K / 2-3 mi",  structure: "Fartlek — second session of the week", effort: "Variable", tip: "Second fartlek. You should feel more comfortable with the surges now." },
      { runNum: 4, day: "Friday",   type: "Long",     label: "Long Run",          duration: "30-40 min", distance: "3.5-6K / 2-4 mi",  structure: "Continuous easy run — longest yet", effort: "Easy-Moderate", tip: "Fresh legs on Friday. Longest run yet — go slow to go long." },
    ],
  },
  4: {
    theme: "Warm Up",
    description: "Hitting your stride. Some days great, some days tired — every day is progress.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "25-30 min", distance: "3-4K / 2-2.5 mi",  structure: "Easy conversational pace", effort: "Easy", tip: "Half way through the plan. Keep the easy days easy." },
      { runNum: 2, day: "Tuesday",  type: "Speed",    label: "Speed: Intervals",  duration: "30-35 min", distance: "3.5-5K / 2-3 mi",  structure: "Speed intervals — increasing intensity", effort: "Hard intervals", tip: "After Day 2 lifting. Reduce interval intensity if legs are heavy. Quality over ego." },
      { runNum: 3, day: "Thursday", type: "Speed",    label: "Speed: Intervals",  duration: "30-35 min", distance: "3.5-5K / 2-3 mi",  structure: "Speed intervals — second session", effort: "Hard intervals", tip: "Second interval session. Focus on form during hard efforts — drive the arms." },
      { runNum: 4, day: "Friday",   type: "Long",     label: "Long Run",          duration: "35-45 min", distance: "4-6.5K / 2.5-4 mi", structure: "Continuous easy run", effort: "Easy-Moderate", tip: "Run-only Friday. 35-45 minutes is a real run. Settle into your rhythm early." },
    ],
  },
  5: {
    theme: "Time To Evolve",
    description: "You are a different athlete now. Time to do the work to become stronger, faster, and better.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "25-30 min", distance: "3-4K / 2-2.5 mi",  structure: "Easy conversational pace", effort: "Easy", tip: "Week 5 — you have genuinely evolved. Protect the easy days." },
      { runNum: 2, day: "Tuesday",  type: "Speed",    label: "Speed: Intervals",  duration: "30-35 min", distance: "4-5.5K / 2.5-3.5 mi", structure: "Speed intervals — Week 5 progression", effort: "Hard intervals", tip: "After Day 2 lifting. Consider moving this to Wednesday if legs are really heavy." },
      { runNum: 3, day: "Thursday", type: "Speed",    label: "Speed: Tempo",      duration: "30-35 min", distance: "4-5.5K / 2.5-3.5 mi", structure: "Tempo Run — comfortably hard sustained pace", effort: "Mod-Hard", tip: "First tempo run. Comfortably hard — short phrases but not full sentences." },
      { runNum: 4, day: "Friday",   type: "Long",     label: "Long Run",          duration: "40-50 min", distance: "5-7K / 3-4.5 mi",  structure: "Continuous easy run — 5K-7K target", effort: "Easy-Moderate", tip: "Biggest long run yet. Go easy — you have speed work in your legs." },
    ],
  },
  6: {
    theme: "Ready to Run",
    description: "Fit, strong and ready to take on any workout. The miles start to pass more quickly.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "25-30 min", distance: "3-4K / 2-2.5 mi",  structure: "Easy conversational pace", effort: "Easy", tip: "6 weeks in. The easy runs feel genuinely easy now — that is fitness." },
      { runNum: 2, day: "Tuesday",  type: "Speed",    label: "Speed: Intervals",  duration: "30-35 min", distance: "4-5.5K / 2.5-3.5 mi", structure: "Speed intervals — near peak intensity", effort: "Hard intervals", tip: "After Day 2 lifting. Move to Wednesday if needed. These are hard intervals." },
      { runNum: 3, day: "Thursday", type: "Speed",    label: "Speed: Tempo",      duration: "30-35 min", distance: "4-5.5K / 2.5-3.5 mi", structure: "Tempo Run — sustained comfortably hard", effort: "Mod-Hard", tip: "Tempo after Thursday lifting. Warm up with 5 min easy before the tempo effort." },
      { runNum: 4, day: "Friday",   type: "Long",     label: "Long Run",          duration: "45-55 min", distance: "6.5-8K / 4-5 mi",  structure: "Continuous easy run — 6.5K-8K target", effort: "Easy-Moderate", tip: "Longest run so far. Fresh legs, easy pace. You are ready for this." },
    ],
  },
  7: {
    theme: "Sharpen Every Step",
    description: "You don't taper, you sharpen. Speed picks up but recovery picks up even more.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "25-30 min", distance: "3-4K / 2-2.5 mi",  structure: "Easy conversational pace", effort: "Easy", tip: "Sharpen week. The easy runs protect your speed work — take them seriously." },
      { runNum: 2, day: "Tuesday",  type: "Speed",    label: "Speed: Hill Workout", duration: "30-35 min", distance: "4-5K / 2.5-3 mi", structure: "Hill repeats — drive up, recover down", effort: "Hard", tip: "Hill workout after Day 2 lifting. Shorten the hill if legs are heavy. Form over effort." },
      { runNum: 3, day: "Thursday", type: "Speed",    label: "Speed: Tempo",      duration: "30-35 min", distance: "4-5.5K / 2.5-3.5 mi", structure: "Tempo Run — race sharpening", effort: "Mod-Hard", tip: "Final tempo before race week. Run at race pace — get a feel for 5K effort." },
      { runNum: 4, day: "Friday",   type: "Long",     label: "Long Run",          duration: "45-55 min", distance: "6.5-8K / 4-5 mi",  structure: "Continuous easy run — last long run", effort: "Easy-Moderate", tip: "Last long run. Keep it easy — you are banking fitness, not spending it." },
    ],
  },
  8: {
    theme: "The Starting Line",
    description: "You've made it. Run strong and confidently. Use what you've learned. You are ready.",
    runs: [
      { runNum: 1, day: "Monday",   type: "Recovery", label: "Recovery Run",      duration: "20-25 min", distance: "2.5-3K / 1.5-2 mi", structure: "Easy recovery run", effort: "Easy", tip: "Race week. Keep this genuinely easy. Stay off your feet the rest of the day." },
      { runNum: 2, day: "Tuesday",  type: "Recovery", label: "Recovery Run",      duration: "20-25 min", distance: "2.5-3K / 1.5-2 mi", structure: "Easy recovery run", effort: "Easy", tip: "Second easy run of race week. Short and light. Legs should feel fresh." },
      { runNum: 3, day: "Thursday", type: "Speed",    label: "Speed: Tempo",      duration: "20-25 min", distance: "3-4K / 2-2.5 mi",  structure: "Short tempo — final sharpener", effort: "Mod-Hard", tip: "Short tempo to stay sharp. Not long — just a reminder to your legs what fast feels like." },
      { runNum: 4, day: "Friday",   type: "Race",     label: "5K Race Run",       duration: "25-35 min", distance: "5K / 3.1 mi",       structure: "5K — The Starting Line", effort: "Race effort", tip: "This is it. Everything you have built leads to this run. Start controlled, finish strong." },
    ],
  },
};




// ─── WEEKLY SCHEDULE ────────────────────────────────────────────────────────
const WEEKLY_SCHEDULE = [
  {
    day: "Monday",
    sessions: [
      { type: "lift", label: "Day 1 — Upper Body Push", accent: "#E8C547", icon: "⚡" },
      { type: "run",  label: "NRC Run (after lifting)", accent: "#6EC6A0", icon: "🏃" },
    ],
    note: "Lift first, run after. Never reverse this order.",
    rest: false,
  },
  {
    day: "Tuesday",
    sessions: [
      { type: "lift", label: "Day 2 — Glute & Ham", accent: "#6EC6A0", icon: "⚡" },
      { type: "run",  label: "NRC Run (after lifting)", accent: "#6EC6A0", icon: "🏃" },
    ],
    note: "Hardest combo of the week. While NRC runs are short walk/run intervals this is fine. Once runs hit 25+ min continuous (Week 4–5), move the run to Wednesday or replace with a walk.",
    warning: true,
    rest: false,
  },
  {
    day: "Wednesday",
    sessions: [],
    note: "Full rest or gentle walk. Let Tuesday's load absorb.",
    rest: true,
    danceSlot: true,
  },
  {
    day: "Thursday",
    sessions: [
      { type: "lift", label: "Day 3 — Upper Body Pull", accent: "#E87A5D", icon: "⚡" },
      { type: "run",  label: "NRC Run (after lifting)", accent: "#6EC6A0", icon: "🏃" },
    ],
    note: "Lift first, run after. Good day — upper body lifting doesn't tax the legs for the run.",
    rest: false,
  },
  {
    day: "Friday",
    sessions: [
      { type: "run", label: "NRC Run only", accent: "#6EC6A0", icon: "🏃" },
    ],
    note: "Run only. No lifting. Light day before Saturday's session.",
    rest: false,
    danceSlot: true,
  },
  {
    day: "Saturday",
    sessions: [
      { type: "lift", label: "Day 4 — Full Body Functional", accent: "#A78BFA", icon: "⚡" },
    ],
    note: "Lifting only. Fresh legs after Friday's light day.",
    rest: false,
  },
  {
    day: "Sunday",
    sessions: [],
    note: "Full rest. Non-negotiable. This is where adaptation happens.",
    rest: true,
  },
];


// ─── NEURO SNACKS — Z-Health inspired 5-min evening drills ─────────────────
const NEURO_SNACKS = [
  {
    day: "Monday",
    title: "Eye Circles",
    subtitle: "Visual system reset",
    duration: "5 min",
    steps: [
      "Sit tall, head completely still. Only your eyes move.",
      "Slowly trace a large circle clockwise with your eyes — as large as your visual field allows. 5 reps.",
      "Reverse — counter-clockwise. 5 reps.",
      "Now trace a horizontal figure-8 (infinity sign) — smooth, no jerking. 5 reps each direction.",
      "Finish: hold your thumb 6 inches from your face. Focus on thumb. Focus on something far away. Alternate 10 times.",
      "Rest with eyes closed. Notice any asymmetry or strain — that's your nervous system telling you where to focus next session.",
    ],
    why: "Your visual system drives 70% of your proprioceptive input. Poor eye movement = poor body map = compensation patterns that load your disc. 5 minutes of deliberate eye work recalibrates threat perception and reduces global tone.",
    cue: "Head stays still. Only eyes move. Slow is smooth.",
  },
  {
    day: "Tuesday",
    title: "Vestibular Circles",
    subtitle: "Inner ear + balance calibration",
    duration: "5 min",
    steps: [
      "Stand with feet hip-width. Fix your gaze on a point at eye level.",
      "Slowly nod your head YES — chin to chest, chin up. 5 reps. Keep the gaze point.",
      "Slowly shake head NO — ear to shoulder, ear to shoulder. 5 reps. Eyes stay on target.",
      "Now combine: small slow head circles clockwise. 5 reps. Counter-clockwise. 5 reps.",
      "Single leg balance: stand on right foot, eyes open. 30 sec. Switch. Then eyes closed. 20 sec each.",
      "Finish: walk a slow figure-8 around two points on the floor, head turning smoothly as you change direction.",
    ],
    why: "The vestibular system tells your brain where your head is in space. When it's poorly calibrated, your brain defaults to high-threat patterns — tight muscles, guarded movement. This drill directly improves balance output and calms the nervous system.",
    cue: "Move the head slowly and deliberately. Never force past discomfort.",
  },
  {
    day: "Wednesday",
    title: "Spinal Mobility Flow",
    subtitle: "Segmental awareness drill",
    duration: "5 min",
    steps: [
      "Stand tall. Imagine your spine has 24 separate moving parts.",
      "Starting at the top: slowly nod your chin forward just 1 cm. Then add one more vertebra. Then one more — stacking a gentle C-curve top to bottom. No forcing.",
      "Reverse from the bottom up — tailbone first, then lumbar, then thoracic, then cervical. Slow stack back to neutral.",
      "Side bend: slowly reach right hand toward right knee — one vertebra at a time. Return. Repeat left. 3 each.",
      "Rotation: standing, rotate torso right as far as comfortable. Eyes follow the rotation. Hold 3 seconds. Return. Repeat left. 5 each.",
      "Finish in mountain pose: feet planted, spine tall, slow 4-count breath in, 6-count out. Repeat 5 times.",
    ],
    why: "Segmental spinal mobility tells your brain each joint is safe to move. Joints that feel unsafe get protected by muscle guarding. This drill systematically de-threatens the spine, reducing the protective tone that creates stiffness and pain.",
    cue: "One vertebra at a time. If a segment feels stuck, breathe into it — don't force through it.",
  },
  {
    day: "Thursday",
    title: "Grip & Hand Neurology",
    subtitle: "Cortical hand map activation",
    duration: "5 min",
    steps: [
      "Spread your fingers as wide as possible. Hold 3 seconds. Release. 5 reps.",
      "Individually curl each finger to your palm — starting with pinky, working to index. Then reverse. 3 rounds each hand.",
      "Make a fist. Squeeze maximally for 3 seconds. Release fully. 5 reps each hand.",
      "Thumb opposition: touch thumb to each fingertip in sequence, forward and backward. Go as fast as you can with control. 3 rounds.",
      "Hold both hands in front, palms up. Make a fist with the right hand while keeping left open. Alternate rapidly. 20 reps.",
      "Finish: shake both hands out loosely. Place them on your thighs, palms up, fully relaxed. Notice the sensation.",
    ],
    why: "Your hands occupy an enormous portion of your motor cortex — roughly as much as your entire torso. Deliberate hand drills literally expand your neural real estate, improve grip for training, and calm the entire nervous system through the rich sensory feedback.",
    cue: "Full range, full attention. This is a brain drill, not a hand drill.",
  },
  {
    day: "Friday",
    title: "Foot & Ankle Neurology",
    subtitle: "Ground contact and proprioception",
    duration: "5 min",
    steps: [
      "Sit barefoot. Spread your toes as wide as possible. Hold 3 seconds. Release. 10 reps.",
      "Lift and lower each toe individually — big toe, then the others. Most people find this surprisingly hard. 3 rounds.",
      "Slow ankle circles — full range, both directions. 8 each direction, each foot.",
      "Stand. Slowly shift weight forward onto toes, then back onto heels, then left, then right. Feel each zone of contact. 10 slow shifts.",
      "Calf raises — very slow, 3 seconds up, 3 seconds down. Focus on balance and proprioception, not strength. 10 reps.",
      "Finish: stand still barefoot, close your eyes. Focus on the sensation of the floor. Notice where your weight falls naturally. 30 seconds.",
    ],
    why: "Your feet are your only contact with the ground. Poor foot-brain communication means every step and lift starts with bad input. Rich foot proprioception directly improves your squat pattern, hip stability, and lower back loading — all relevant to your disc.",
    cue: "Barefoot if possible. Slow and deliberate. Feel the floor.",
  },
  {
    day: "Saturday",
    title: "Breath & CO2 Tolerance",
    subtitle: "Nervous system regulation",
    duration: "5 min",
    steps: [
      "Sit or lie comfortably. Close your eyes.",
      "Baseline: breathe normally for 60 seconds. Notice rate, depth, any tension.",
      "Box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. 5 rounds.",
      "Extended exhale: inhale 4 counts, exhale 8 counts. The longer exhale activates the parasympathetic system directly. 8 rounds.",
      "CO2 tolerance test: take a normal breath in, exhale normally, then hold after the exhale. Count how many seconds until you feel the first strong urge to breathe. No heroics — this is just a baseline number. Note it.",
      "Finish with 5 deep slow breaths. Feel your body drop weight into the floor or chair with each exhale.",
    ],
    why: "CO2 tolerance is the single best predictor of nervous system regulation. People with back pain consistently have poor breath mechanics and low CO2 tolerance — this creates a background threat state that keeps muscles guarded. This drill builds the regulation capacity that makes everything else work better.",
    cue: "Never strain. Never force. The goal is calm, not performance.",
  },
  {
    day: "Sunday",
    title: "Joint CARs Flow",
    subtitle: "Full body controlled articular rotation",
    duration: "5 min",
    steps: [
      "Cervical: slow head circles — maximize every point of the circle. 3 each direction.",
      "Shoulder: one arm at a time, full shoulder CAR. Maximize the arc — front, overhead, behind, down. 3 each direction each arm.",
      "Thoracic: hands on hips, rotate your rib cage on your pelvis. Pelvis stays still. 5 each direction.",
      "Hip: standing hip CAR — lift one knee, circle the hip in full range. Go as large as you can. 3 each direction each hip.",
      "Knee: seated, full knee flexion and extension. Then 5 slow circles each direction. Both knees.",
      "Ankle: slow full circles. 8 each direction each foot.",
      "Finish: stand tall. Take 3 slow breaths and feel the difference in your body from start to now.",
    ],
    why: "CARs are the foundation of Z-Health — controlled articular rotations send rich joint-position signals to the brain, maintain full joint health, and systematically de-threaten every major joint. Done daily, they are the most efficient insurance policy for long-term durability.",
    cue: "Maximize every inch of range. Slow is the point. Never force the end range.",
  },
];


const DAYS = [
  {
    id: 1, label: "Day 1", title: "Upper Body — Push",
    accent: "#E8C547",
    quote: "The secret of getting ahead is getting started.",
    quoteAuthor: "Mark Twain",
    preview: "Week 2 Push day. Floor press is out — deficit push-ups are in based on your feedback. KB press moves to 35lb. Dips join the program for a new pressing angle. Your core needs to earn breathing under load — heel taps stay until dead bugs are achievable.",
    tips: [
      "Deficit push-ups off the dip bar handles give you more range than the floor and load the pec fully. Lower until you feel the stretch, pause 1 second, press.",
      "KB Goblet Press moves to 35lb this week. If form breaks at any point, drop back to 26lb — never sacrifice position for load.",
      "Heel taps are your dead bug regression. Lower back stays glued to the floor the entire time. If it lifts even slightly, your range is too big — shorten it.",
    ],
    warmup: [
      { name: "Pelvic Tilts (standing)", reps: "10 slow", focus: "Lumbar decompression before loading", cue: "Tuck & untuck only — nothing else moves" },
      { name: "Cat-Cow (all fours)", reps: "8 slow breaths", focus: "Thoracic segmentation, spine prep", cue: "Move one vertebra at a time" },
      { name: "Thread the Needle", reps: "6/side", focus: "Rib cage & upper back mobility", cue: "Ground arm stays still, reach through as far as possible" },
      { name: "Wall Slide", reps: "10 reps", focus: "Scapular upward rotation, shoulder prep", cue: "Keep low back flat against wall throughout" },
      { name: "Shoulder CAR", reps: "4 slow circles/side", focus: "Full shoulder joint range of motion", cue: "Maximize every inch of the circle" },
      { name: "Bear Crawl Hold (hover, 5 sec)", reps: "4 holds", focus: "Serratus activation, shoulder stability", cue: "Knees 1 inch off ground, push the floor away" },
      { name: "Band Pull-Apart", reps: "15 reps", focus: "Rear delt & chest opener before pressing", cue: "Squeeze shoulder blades together at the back" },
    ],
    supersets: [
      {
        id: "A", name: "Superset A — Chest & Shoulder Power",
        exercises: [
          { name: "Deficit Push-Up (hands on dip bar handles)", sets: 3, reps: "10-12", load: "Bodyweight", note: "Pause at bottom — better chest stimulus than floor press per your log" },
          { name: "KB Goblet Press (kneeling)", sets: 3, reps: "10", load: "35 lb KB", note: "Up from 26lb — kneeling removes spinal load, own the position first" },
        ]
      },
      {
        id: "B", name: "Superset B — Dip & Core",
        exercises: [
          { name: "Dip (bodyweight, upright torso)", sets: 3, reps: "8-10", load: "Bodyweight", note: "Stay upright — forward lean shifts load to chest but risks lumbar extension" },
          { name: "Heel Tap (supine)", sets: 3, reps: "10/side", load: "Bodyweight", note: "Dead bug regression — lower back glued to floor, alternate heel to floor slowly and deliberately" },
        ]
      },
      {
        id: "C", name: "Superset C — Lateral Raise & Carry",
        exercises: [
          { name: "DB Lateral Raise", sets: 3, reps: "15", load: "15 lb DB", note: "Same load as Week 1, added 3 reps — more volume, same quality" },
          { name: "KB Farmer Carry (pause at turn)", sets: 3, reps: "20m", load: "53 lb KB", note: "Same load, add 3-sec pause at each end — increases stability demand" },
        ]
      },
    ]
  },
  {
    id: 2, label: "Day 2", title: "Lower Body — Glute & Ham",
    accent: "#6EC6A0",
    quote: "Your body can stand almost anything. It's your mind you have to convince.",
    quoteAuthor: "Unknown",
    preview: "Posterior chain week 2. Hip thrusts load up and hold longer at the top. RDL moves to staggered stance for more single-leg stimulus without full instability risk. Slant board reverse lunges are new — the elevated heel changes loading angle, increases quad depth, and keeps the spine completely neutral. Glute bands are added to the warmup for stronger activation before loading.",
    tips: [
      "Slant board reverse lunges will feel different from flat ground — the elevated heel shifts more load into the quad. Start lighter than you think and learn the pattern first.",
      "Staggered stance RDL: back foot barely touches the floor for balance. Think 90% weight on the front leg. Feel the hamstring on the working side.",
      "Hip thrust 3-sec squeeze at the top is the whole point. Posterior pelvic tilt at lockout — don't hyperextend the lower back.",
    ],
    warmup: [
      { name: "Pelvic Tilts (standing)", reps: "10 slow", focus: "Establish neutral pelvis — the whole session lives here", cue: "Find neutral between tuck and arch" },
      { name: "Hip Circles (standing)", reps: "8 each direction", focus: "Hip joint lubrication, full pelvic mobility", cue: "Smooth and continuous — connect every point of the circle" },
      { name: "90/90 Hip Flow (floor)", reps: "6 transitions/side", focus: "Hip internal & external rotation", cue: "Shift slowly — feel the pull change with every degree" },
      { name: "Quadruped Hip CARs", reps: "4 full circles/side", focus: "Hip joint full range of motion", cue: "Maximize the circle, minimize spine compensation" },
      { name: "Glute Bridge with Pelvic Tilt Hold", reps: "10 reps, 3-sec hold", focus: "Glute activation & posterior tilt pattern", cue: "Posterior tilt at the top — don't hyperextend" },
      { name: "Glute Band Lateral Walk (band above knees)", reps: "15 steps/side", focus: "Glute med activation with band resistance — stronger stimulus than bodyweight", cue: "Stay low, drive knees out against band, don't let hips shift" },
      { name: "Standing Hamstring Pendulum Swing", reps: "10 slow swings/side", focus: "Hamstring dynamic lengthening, hip hinge prep", cue: "Control the swing both ways — don't let it flop" },
    ],
    supersets: [
      {
        id: "A", name: "Superset A — Hip Drive & Hinge",
        exercises: [
          { name: "KB Hip Thrust (bench, 3-sec squeeze)", sets: 4, reps: "10", load: "35 lb KB", note: "Up in load — add 3-sec glute squeeze at top every single rep, posterior tilt at lockout" },
          { name: "KB Staggered Stance RDL", sets: 4, reps: "8/side", load: "35 lb KB", note: "Back foot lightly contacts floor for balance only — more single-leg stimulus, neutral spine always" },
        ]
      },
      {
        id: "B", name: "Superset B — Slant Board & Lateral",
        exercises: [
          { name: "Slant Board Reverse Lunge (DB)", sets: 3, reps: "8/side", load: "15 lb DB", note: "New this week — heels elevated on slant board, increases quad depth, torso stays upright" },
          { name: "Side-Lying Hip Abduction (glute band)", sets: 3, reps: "15/side", load: "Glute band", note: "Band added above knee for progressive overload vs Week 1 bodyweight" },
        ]
      },
      {
        id: "C", name: "Superset C — Hamstring & Anti-Rotation",
        exercises: [
          { name: "Nordic Curl Eccentric (5-sec)", sets: 3, reps: "6", load: "Bodyweight", note: "Up from 5 reps — 5 seconds down, catch yourself, reset fully" },
          { name: "Pallof Press Hold (band)", sets: 3, reps: "12/side", load: "Light band", note: "Up from 10 reps — brace, don't rotate, breathe through the hold" },
        ]
      },
    ]
  },
  {
    id: 3, label: "Day 3", title: "Upper Body — Pull",
    accent: "#E87A5D",
    quote: "You don't have to be extreme. Just consistent.",
    quoteAuthor: "Unknown",
    preview: "Pull day week 2. Pull-ups are anchored in with a 3-second eccentric this week — that's where the strength is built. The rower opens the session dynamically instead of static mobility. Chest-supported KB row is new — chest on the bench means zero spinal compensation and pure lat and rhomboid work. Dead hangs added to the warmup to decompress the shoulder before loading.",
    tips: [
      "500m easy row to open — legs drive first, body swings back, arms pull last. Don't rush. This primes your lats and posterior chain before you touch the bar.",
      "Chest-supported row: your chest stays in contact with the bench the entire set. If you're rising off the bench to get the weight up, it's too heavy.",
      "Pull-ups: same max minus 2 reps, but now add a 3-second lowering. You will feel this difference immediately. That eccentric is the training stimulus.",
    ],
    warmup: [
      { name: "500m Easy Row (Concept 2)", reps: "~2 min, easy pace", focus: "Dynamic posterior chain warmup — primes lats, rhomboids, legs before pulling", cue: "Legs-body-arms sequence — don't pull with arms early in the drive" },
      { name: "Pelvic Tilts (standing)", reps: "10 slow", focus: "Lumbar baseline", cue: "Tuck & untuck — feel your spine find neutral" },
      { name: "Thread the Needle", reps: "6/side", focus: "Upper back rotation — unlocks pulling mechanics", cue: "Start from the rib cage, not the arm" },
      { name: "Scapular Wall Slide", reps: "10 reps", focus: "Scapular upward rotation & serratus activation", cue: "Maintain contact the entire time — no peeling away" },
      { name: "Quadruped Scapular CARs", reps: "4 circles/side", focus: "Full scapulothoracic range of motion prep", cue: "Feel the shoulder blade move independently from the arm" },
      { name: "Band Pull-Apart (palms up)", reps: "15 reps", focus: "Rear delt, mid trap, rhomboid activation", cue: "Pull to the hips — not just shoulder width" },
      { name: "Dead Hang (bar)", reps: "2 x 20 sec", focus: "Shoulder decompression & grip prep before pull-ups", cue: "Relax into the hang — feel the shoulder open and decompress" },
    ],
    supersets: [
      {
        id: "A", name: "Superset A — Vertical Pull & Scapular Control",
        exercises: [
          { name: "Pull-Up (3-sec eccentric)", sets: 3, reps: "Max -2", load: "Bodyweight", note: "3-second controlled lowering — this is where the strength is built, no rushing" },
          { name: "Band Pull-Apart", sets: 3, reps: "15", load: "Light band", note: "Rear delt + external rotation — immediate superset after vertical pulling" },
        ]
      },
      {
        id: "B", name: "Superset B — Chest-Supported Row & Curl",
        exercises: [
          { name: "Chest-Supported KB Row (incline bench)", sets: 3, reps: "10/side", load: "35 lb KB", note: "New this week — chest on bench eliminates spinal compensation completely, pure pulling" },
          { name: "DB Hammer Curl", sets: 3, reps: "12", load: "20-25 lb DB", note: "Biceps pre-fatigued from pull-ups — go with feel, control the eccentric" },
        ]
      },
      {
        id: "C", name: "Superset C — Posterior Shoulder & Loaded Carry",
        exercises: [
          { name: "Face Pull (band)", sets: 3, reps: "15", load: "Light band", note: "External rotation finisher — non-negotiable after pull-up volume" },
          { name: "Suitcase Carry", sets: 3, reps: "20m/side", load: "35-53 lb KB", note: "Resist the lean — stand completely tall like the weight isn't there" },
        ]
      },
    ]
  },
  {
    id: 4, label: "Day 4", title: "Full Body — Functional",
    accent: "#A78BFA",
    quote: "Fall in love with the process and the results will come.",
    quoteAuthor: "Eric Thomas",
    preview: "Full body week 2. Slant board goblet squat replaces flat ground — elevated heel unlocks more depth safely and changes the muscular demand. Medicine ball rotational slam is new — this is the first transverse plane core work in the program and it fills a real gap. Step-up off the step board joins for single-leg quad work with a controlled eccentric. Bike erg available as a run substitute if legs are heavy.",
    tips: [
      "Slant board goblet squat: elbows inside knees at the bottom, sit deep, breathe at the bottom. The heel elevation makes a significant difference in depth — go slow.",
      "Medicine ball rotational slam: hips rotate first, arms follow. This is not an arm exercise. Feel the obliques and hip rotators driving the movement.",
      "Step-up: drive through the heel of the elevated foot. Don't push off the bottom foot — that defeats the purpose of the single-leg stimulus.",
    ],
    warmup: [
      { name: "Pelvic Tilts (standing)", reps: "10 slow", focus: "Lumbar neutral — full body session starts here", cue: "Own this position before you load anything" },
      { name: "Hip Circles (standing)", reps: "8 each direction", focus: "Hip joint prep for squat + step-up patterns", cue: "Let the pelvis drive — smooth and full" },
      { name: "Ankle CARs", reps: "6 full circles/side", focus: "Ankle mobility — directly improves squat depth on slant board", cue: "Maximize each circle, feel the resistance at end range" },
      { name: "Goblet Squat Hold (slant board, BW)", reps: "3 x 10-sec hold at bottom", focus: "Hip, ankle & thoracic mobility — slant board squat pattern prep", cue: "Elbows inside knees, chest tall, breathe at the bottom" },
      { name: "Thread the Needle", reps: "5/side", focus: "Upper back rotation for overhead carry", cue: "Open the chest — reach long with the top arm" },
      { name: "Shoulder CAR", reps: "4 slow circles/side", focus: "Shoulder joint prep for waiter carry", cue: "Full arc — behind the head and around, zero shortcuts" },
      { name: "Step-Up (bodyweight, slow)", reps: "8/side", focus: "Single-leg pattern prep and balance before loading", cue: "Drive through heel of elevated foot, don't push off bottom foot" },
    ],
    supersets: [
      {
        id: "A", name: "Superset A — Squat Pattern & Rotational Core",
        exercises: [
          { name: "Slant Board Goblet Squat (KB)", sets: 4, reps: "10", load: "35 lb KB", note: "Heels elevated on slant board — sit deep, chest tall, breathe at the bottom" },
          { name: "Medicine Ball Rotational Slam (20 lb)", sets: 4, reps: "8/side", load: "20 lb med ball", note: "New — hips rotate first, slam to the side, catch and control. First transverse plane core work in program" },
        ]
      },
      {
        id: "B", name: "Superset B — Step-Up & Glute Bridge",
        exercises: [
          { name: "Step-Up (DB, slow eccentric)", sets: 3, reps: "8/side", load: "15 lb DB", note: "New — step up platform, 3-sec lower back down, drive through heel only on way up" },
          { name: "Glute Bridge (BB, light)", sets: 3, reps: "12", load: "Light BB", note: "Posterior tilt at top — drive through heels, 2-sec hold at lockout" },
        ]
      },
      {
        id: "C", name: "Superset C — Overhead Carry & Breathe",
        exercises: [
          { name: "KB Waiter Carry", sets: 3, reps: "20m/side", load: "20-26 lb KB", note: "Wrist stacked over elbow over shoulder — no drifting forward, core braced" },
          { name: "Crocodile Breathing", sets: 3, reps: "5 breaths", load: "Bodyweight", note: "Prone, breathe into your back — PT recovery, finish every session with this" },
        ]
      },
    ]
  },
];

const COOLDOWNS = {
  // Day 1 — Upper Body Push: chest, shoulders, triceps, serratus
  1: [
    { name: "Doorway Chest Stretch", reps: "45 sec/side", focus: "Pec minor & major — releases post-pressing tightness" },
    { name: "Child's Pose with Lateral Reach", reps: "30 sec/side", focus: "Lat & serratus lengthening after pressing and carries" },
    { name: "Thread the Needle", reps: "5 slow reps/side", focus: "Thoracic rotation — undoes the stiffness from kneeling and floor work" },
    { name: "Sleeper Stretch", reps: "30 sec/side", focus: "Posterior shoulder capsule — protects the joint after pressing volume" },
    { name: "Crocodile Breathing", reps: "5 deep breaths", focus: "Diaphragmatic reset — decompress the thorax after loaded pressing" },
  ],
  // Day 2 — Glute & Ham: glutes, hamstrings, hip flexors, adductors
  2: [
    { name: "Supine Figure-4 Stretch", reps: "60 sec/side", focus: "Glute med & piriformis — direct release after hip thrust volume" },
    { name: "90/90 Hip Stretch (floor)", reps: "45 sec/side", focus: "Hip internal & external rotators — essential after RDL and lunge work" },
    { name: "Supine Hamstring Stretch (strap or towel)", reps: "45 sec/side", focus: "Hamstring lengthening — counters the loading from RDL and Nordic work" },
    { name: "Kneeling Hip Flexor Stretch", reps: "45 sec/side", focus: "Hip flexor release — reverse lunges shorten this aggressively" },
    { name: "Legs Up the Wall", reps: "90 sec", focus: "Full posterior chain decompression + lumbar reset after heavy hip work" },
  ],
  // Day 3 — Upper Body Pull: lats, rhomboids, rear delts, biceps
  3: [
    { name: "Overhead Lat Stretch (arm on wall)", reps: "45 sec/side", focus: "Lat lengthening — direct release after rows and carries" },
    { name: "Cross-Body Shoulder Stretch", reps: "30 sec/side", focus: "Posterior delt & rhomboid — releases the back of the shoulder after pulling" },
    { name: "Child's Pose with Arms Extended", reps: "60 sec", focus: "Full lat and thoracic spine decompression after suitcase and farmer carries" },
    { name: "Supine Thoracic Extension (over foam roller or rolled towel)", reps: "60 sec", focus: "Opens the thoracic spine — counters the forward-rounding of rows" },
    { name: "Crocodile Breathing", reps: "5 deep breaths", focus: "Nervous system reset — the pulling volume activates a lot of tension" },
  ],
  // Day 4 — Full Body Functional: quads, glutes, shoulders, full spine
  4: [
    { name: "Pigeon Pose (or Figure-4 supine)", reps: "60 sec/side", focus: "Hip external rotators & glutes — direct release after split squat and goblet squat" },
    { name: "Quad Stretch (standing or side-lying)", reps: "45 sec/side", focus: "Quad & hip flexor lengthening after split squat volume" },
    { name: "Child's Pose with Lateral Reach", reps: "30 sec/side", focus: "Lat, QL, and thoracic decompression after overhead carries" },
    { name: "Supine Spinal Twist", reps: "45 sec/side", focus: "Lumbar rotation release — full body sessions create asymmetric tension" },
    { name: "Legs Up the Wall", reps: "90 sec", focus: "Full body decompression — the capstone session demands a full reset" },
  ],
};

// ─── SCHEDULE TIMING ─────────────────────────────────────────────────────────
const SESSION_DURATIONS = { lift: 50, run: 30, dance: 60 };
const WORK_END = { h: 14, m: 30 };
const FAMILY_TARGET = { h: 17, m: 30 };

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────
export function fmtTime(h: number, m: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return hour + ":" + String(m).padStart(2, "0") + " " + ampm;
}

export function buildTimeline(sessions: any[]): any[] {
  let h = WORK_END.h, m = WORK_END.m;
  return sessions.map(s => {
    const start = fmtTime(h, m);
    const dur = SESSION_DURATIONS[s.type as keyof typeof SESSION_DURATIONS] || 45;
    m += dur;
    h += Math.floor(m / 60);
    m = m % 60;
    const end = fmtTime(h, m);
    return { ...s, start, end, dur };
  });
}

export {
  CURRENT_WEEK, WEEK_THEME, RPE_RANGE,
  NRC_RUN_DAYS, NRC_PROGRAM,
  WEEKLY_SCHEDULE, DAYS, COOLDOWNS,
  NEURO_SNACKS,
  SESSION_DURATIONS, WORK_END, FAMILY_TARGET,
}
// rebuild
