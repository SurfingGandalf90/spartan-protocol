// @ts-nocheck
// lib/program.ts

// ─── WEEK DATA — Claude updates this block each week ───────────────────────
const CURRENT_WEEK = 3;
const WEEK_THEME = "Slow it down to build it up — tempo reveals everything";
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
    id: 1, label: "Day 1", title: "Upper Body — Push", accent: "#E8C547",
    note: "FBB focus: feel the pec and delt load, not just move the weight. Pause and breathe at the stretched position on every rep.",
    supersets: [
      { id: "A", name: "Superset A — Chest + Core", exercises: [
        { name: "Deficit Push-Up (hands on dip bar handles)", sets: "4", reps: "8", load: "Bodyweight", note: "3-1-1-0 tempo. At the bottom, pause and take one breath before pressing. Feel the chest fully loaded at the bottom — that's the functional range. Elbows 45 degrees." },
        { name: "Heel Tap (supine)", sets: "4", reps: "12/side", load: "Bodyweight", note: "Lower back glued to floor. Exhale fully before each rep. Core activation reset between pressing sets." },
      ]},
      { id: "B", name: "Superset B — Unilateral Press + Loaded Carry", exercises: [
        { name: "Single Arm KB Press (kneeling)", sets: "3", reps: "8/side", load: "26 lb KB", note: "3-1-1-0 tempo. FBB cue: at the bottom, feel the shoulder loaded in the socket before you press. Don't rush the start. Kneeling kills the leg drive — pure shoulder and core. Left then right, full focus each side." },
        { name: "KB Farmer Carry (pause at turn)", sets: "3", reps: "20m", load: "53 lb KBs", note: "Packed shoulders, tall spine. Pause 2 full seconds at each turn. FBB carry cue: feel the lats engaged like you're protecting your armpits." },
      ]},
      { id: "C", name: "Superset C — Dip + Delt Isolation", exercises: [
        { name: "Dip (bodyweight, upright torso)", sets: "3", reps: "8", load: "BW + band assist", note: "3-1-1-0 tempo. Stay upright. At the bottom, pause and breathe. Band assist is intentional — own the pattern before loading it." },
        { name: "DB Lateral Raise", sets: "3", reps: "12", load: "15 lb DBs", note: "FBB cue: lead with elbows, hands are just hooks. 2-sec eccentric. Keep tension at the bottom — don't let the delts fully relax. Stop at shoulder height." },
      ]},
    ]
  },
  {
    id: 2, label: "Day 2", title: "Lower Body — Glute & Ham", accent: "#6EC6A0",
    note: "FBB focus: find the glute and hamstring in every rep. If you feel it in your lower back, you've lost the position.",
    supersets: [
      { id: "A", name: "Superset A — Hip Thrust + Abduction", exercises: [
        { name: "KB Hip Thrust (bench, 3-sec squeeze)", sets: "4", reps: "10", load: "35 lb KB", note: "3-1-1-0 tempo. FBB cue: at the bottom, feel the glute fully stretched before driving up. At the top, posterior tilt and squeeze for 3 full seconds — count it out. Don't hyperextend." },
        { name: "Side-Lying Hip Abduction (glute band)", sets: "4", reps: "15/side", load: "Glute band", note: "FBB cue: at the top of each rep, pause and consciously squeeze the glute med before lowering. Heel slightly higher than toes. Feel it working." },
      ]},
      { id: "B", name: "Superset B — Staggered Hinge + Loaded Lunge", exercises: [
        { name: "KB Staggered Stance RDL", sets: "4", reps: "8/side", load: "26 lb KB", note: "3-1-1-0 tempo. FBB cue: at the bottom, pause and breathe into the hamstring stretch. Feel the proximal hamstring loaded before you drive back up. Lower back working = you've gone too far." },
        { name: "Slant Board Reverse Lunge (DB)", sets: "3", reps: "10/side", load: "10 lb DBs", note: "First week with load. FBB cue: at the bottom, pause 1 second and feel the front quad loaded before driving through the heel. Heels on slope, front shin vertical." },
      ]},
      { id: "C", name: "Superset C — Nordic + Anti-Rotation", exercises: [
        { name: "Nordic Curl Eccentric (5-sec)", sets: "3", reps: "5", load: "Bodyweight", note: "FBB cue: the lowering IS the set. 5-sec minimum, 8-sec if you can. Feel the hamstring tendon loading as you descend. Hips fully extended throughout." },
        { name: "Pallof Press (band)", sets: "3", reps: "12/side", load: "Small band", note: "Rib stack before you press. FBB cue: at the end of the press, pause and feel the obliques bracing against rotation. That's the muscle you're training." },
      ]},
    ]
  },
  {
    id: 3, label: "Day 3", title: "Upper Body — Pull", accent: "#7EB8F7",
    note: "FBB focus: every pull starts with the shoulder blade, not the arm. Initiate every rep by retracting the scapula first.",
    supersets: [
      { id: "W", name: "Warmup — Decompress + Activate", exercises: [
        { name: "Dead Hang (bar)", sets: "2", reps: "20 sec", load: "Bodyweight", note: "FBB cue: actively let the shoulder socket decompress. Breathe into the sides of your ribcage. Feel the lats engaging passively — that's the lat activation you want before pulling." },
      ]},
      { id: "A", name: "Superset A — Vertical Pull + Horizontal Row", exercises: [
        { name: "Pull-Up (3-sec eccentric)", sets: "3", reps: "max-2", load: "Bodyweight", note: "FBB cue: initiate by depressing and retracting the scapula before you pull. At the top, pause 1 second — feel the lat fully contracted. Lower over 3 full seconds, feel the stretch at the bottom. Stop 2 reps short of failure every set." },
        { name: "Chest-Supported KB Row (incline bench)", sets: "3", reps: "10/side", load: "35 lb KB", note: "FBB cue: initiate with the shoulder blade, not the elbow. At the top, pause and squeeze the rhomboid — feel the space between your shoulder blades close. 3-sec lower into a full hang." },
      ]},
      { id: "B", name: "Superset B — Bicep + Rear Delt", exercises: [
        { name: "DB Hammer Curl", sets: "3", reps: "10", load: "Same as Week 2", note: "FBB cue: at the top, pause and squeeze the brachialis. 2-sec eccentric into full elbow extension — feel the bicep fully stretched before the next rep. Elbows pinned, no swing." },
        { name: "Face Pull (band)", sets: "3", reps: "15", load: "Band", note: "FBB cue: pull toward your nose, not your chin. At end position, externally rotate maximally — double bicep pose. Hold 1 second, feel the rear delt contracted. These muscles are almost always undertrained." },
      ]},
      { id: "C", name: "Carry Finisher", exercises: [
        { name: "Suitcase Carry", sets: "3", reps: "20m/side", load: "53 lb KB", note: "FBB cue: feel the opposite oblique working to keep you upright. Don't lean toward the weight — stand as if there's nothing in your hand. That tension is the training stimulus." },
      ]},
    ]
  },
  {
    id: 4, label: "Day 4", title: "Full Body — Functional", accent: "#E87A5D",
    note: "FBB focus: quality reps through full functional ranges. AMRAP finisher at the end — quality enforced throughout, no form breakdown.",
    supersets: [
      { id: "A", name: "Superset A — Squat + Rotation", exercises: [
        { name: "Slant Board Goblet Squat (KB)", sets: "4", reps: "8", load: "35 lb KB", note: "3-sec descent. FBB cue: at the bottom, pause and take one breath — feel the hips fully open and quads loaded. That's your functional range. Drive through heels, tall chest on the way up." },
        { name: "Medicine Ball Rotational Slam (20 lb)", sets: "3", reps: "8/side", load: "20 lb", note: "FBB cue: load the hip away from the direction of the slam — feel the oblique and glute coiling before you release. Hips drive first, arms follow. Catch the rebound — the deceleration is part of the training." },
      ]},
      { id: "B", name: "Superset B — Single Leg + Hip Extension", exercises: [
        { name: "Step-Up (DB, slow eccentric)", sets: "3", reps: "8/side", load: "10 lb DBs", note: "FBB cue: at the top, pause and feel the glute of the working leg fully contracted before you lower. Drive through heel only. 3-sec eccentric. The step down is where the strength is built." },
        { name: "Glute Bridge (BB, light)", sets: "3", reps: "12", load: "Light BB", note: "FBB cue: at the top, posterior tilt and hold 2 seconds. Feel the difference between glute squeeze and lower back extension — you want all glute, zero lumbar." },
      ]},
      { id: "C", name: "Carry + Breathwork", exercises: [
        { name: "KB Waiter Carry", sets: "3", reps: "20m/side", load: "35 lb KB", note: "FBB cue: feel the serratus anterior working to keep the KB stable overhead. Wrist over elbow over shoulder. Ribs down, core braced." },
        { name: "Crocodile Breathing", sets: "1", reps: "5 min", load: "Bodyweight", note: "FBB finish: completely passive. Breathe into your lower back and feel it expand. Activates multifidus and deep stabilisers. Exhale fully before each breath." },
      ]},
      { id: "D", name: "AMRAP Finisher — 6 min, quality enforced", exercises: [
        { name: "Goblet Squat x5 / Push-Up x5 / Dead Bug x5/side", sets: "1", reps: "AMRAP 6 min", load: "20 lb KB / Bodyweight", note: "FBB AMRAP rules: every rep is a quality rep. The moment form breaks, rest. No grinding bad reps. Goblet squat — full depth, breathe at bottom. Push-up — full chest stretch at bottom. Dead bug — lower back flat always. Track your rounds." },
      ]},
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

// ─── LOGO ──────────────────────────────────────────────────────────────────

// ─── WIFE'S PROGRAM — Week 1 ─────────────────────────────────────────────────
export const WIFE_CURRENT_WEEK = 1;
export const WIFE_WEEK_THEME = "Build the base — own the movement, feel the burn";
export const WIFE_RPE_RANGE = "6–7";

export const WIFE_DAYS = [
  {
    id: 1, label: "Day 1", title: "Full Body Circuit A", accent: "#F472B6",
    duration: "35 min", focus: "Lower body + core",
    note: "Move station to station with 15-20 sec transition only. No sitting down.",
    supersets: [
      { id: "W", name: "Warmup — 2 rounds", exercises: [
        { name: "World\'s Greatest Stretch", sets: "2", reps: "5/side", load: "Bodyweight", note: "Hip flexor + thoracic rotation. Do it slow." },
        { name: "Glute Bridge (bodyweight)", sets: "2", reps: "15", load: "Bodyweight", note: "Squeeze hard at top, 1 second hold." },
        { name: "Band Pull-Apart", sets: "2", reps: "15", load: "Light band", note: "Wake up the upper back." },
      ]},
      { id: "A", name: "Circuit A — 3 rounds", exercises: [
        { name: "KB Goblet Squat", sets: "3", reps: "12", load: "20-26 lb KB", note: "Chest tall, elbows inside knees. Sit into it." },
        { name: "KB Deadlift (elevated)", sets: "3", reps: "10", load: "26-35 lb KB", note: "KB on step or plate. Push hips back, neutral spine. Stand tall." },
        { name: "Plank Hold", sets: "3", reps: "30 sec", load: "Bodyweight", note: "Squeeze glutes, don\'t let hips drop. Breathe." },
      ]},
      { id: "B", name: "Circuit B — 3 rounds", exercises: [
        { name: "Reverse Lunge (DB)", sets: "3", reps: "8/side", load: "10-15 lb DBs", note: "Step back, front knee over ankle. Tall torso." },
        { name: "Chest-Supported DB Row (incline bench)", sets: "3", reps: "10", load: "15-20 lb DBs", note: "Chest on incline bench. Row elbows back. Spine fully supported." },
        { name: "Dead Bug", sets: "3", reps: "6/side", load: "Bodyweight", note: "Lower back flat to floor the whole time. Slow and controlled." },
      ]},
      { id: "F", name: "Finisher — 1 round", exercises: [
        { name: "KB Farmer Carry", sets: "1", reps: "3x20m", load: "26-35 lb KBs", note: "Walk tall, packed shoulders. Rest 30 sec between laps." },
      ]},
      { id: "C", name: "Cooldown", exercises: [
        { name: "90/90 Hip Stretch", sets: "1", reps: "60 sec/side", load: "Bodyweight", note: "Sit tall, breathe into the hip." },
        { name: "Cat-Cow", sets: "1", reps: "10 slow reps", load: "Bodyweight", note: "Full spinal wave. Exhale on round, inhale on extend." },
      ]},
    ]
  },
  {
    id: 2, label: "Day 2", title: "Full Body Circuit B", accent: "#F472B6",
    duration: "35 min", focus: "Upper body + conditioning",
    note: "Keep moving. If you need to pause, 15 seconds max then go again.",
    supersets: [
      { id: "W", name: "Warmup — 2 rounds", exercises: [
        { name: "Arm Circle + Shoulder Roll", sets: "2", reps: "10 each direction", load: "Bodyweight", note: "Loosen the shoulder girdle." },
        { name: "Bodyweight Squat", sets: "2", reps: "10", load: "Bodyweight", note: "Controlled, full depth, chest tall." },
        { name: "Hip Circle (standing)", sets: "2", reps: "10/side", load: "Bodyweight", note: "Hands on hips, make big circles." },
      ]},
      { id: "A", name: "Circuit A — 3 rounds", exercises: [
        { name: "Push-Up (from knees or full)", sets: "3", reps: "8-12", load: "Bodyweight", note: "Elbows at 45 degrees. Lower slow. Knees totally fine." },
        { name: "DB Lateral Raise", sets: "3", reps: "12", load: "8-10 lb DBs", note: "Lead with elbows. Stop at shoulder height. Don\'t swing." },
        { name: "Glute Bridge (KB)", sets: "3", reps: "12", load: "26-35 lb KB", note: "Drive through heels. Squeeze hard at top. 1-sec hold." },
      ]},
      { id: "B", name: "Circuit B — 3 rounds", exercises: [
        { name: "Chest-Supported KB Row (incline bench)", sets: "3", reps: "10/side", load: "20-26 lb KB", note: "Lie chest-down on incline bench. Row to hip. Spine fully supported." },
        { name: "Step-Up (bodyweight)", sets: "3", reps: "10/side", load: "Bodyweight", note: "Drive through heel on box. Tall torso. Don\'t push off bottom foot." },
        { name: "Side-Lying Hip Abduction", sets: "3", reps: "15/side", load: "Glute band", note: "Heel slightly higher than toes. Pause at top." },
      ]},
      { id: "F", name: "Finisher — 2 rounds", exercises: [
        { name: "Bike Erg (easy pace)", sets: "2", reps: "3 min", load: "Bodyweight", note: "Easy effort. Zero back demand. Just move." },
      ]},
      { id: "C", name: "Cooldown", exercises: [
        { name: "Doorway Chest Stretch", sets: "1", reps: "45 sec/side", load: "Bodyweight", note: "Elbow at 90 degrees, lean through doorway gently." },
        { name: "Child\'s Pose", sets: "1", reps: "60 sec", load: "Bodyweight", note: "Arms extended, breathe into lower back." },
      ]},
    ]
  },
  {
    id: 3, label: "Day 3", title: "Full Body Circuit C", accent: "#F472B6",
    duration: "38 min", focus: "Total body + metabolic",
    note: "This one moves fastest. Station to station. You\'ll feel this one.",
    supersets: [
      { id: "W", name: "Warmup — 2 rounds", exercises: [
        { name: "Jumping Jack (low impact march if needed)", sets: "2", reps: "20", load: "Bodyweight", note: "Get the heart rate up gently." },
        { name: "Leg Swing (front/back)", sets: "2", reps: "10/side", load: "Bodyweight", note: "Hold wall for balance. Controlled swing." },
        { name: "Hip Flexor Lunge + Reach", sets: "2", reps: "5/side", load: "Bodyweight", note: "Step into lunge, reach opposite arm overhead. Hold 2 sec." },
      ]},
      { id: "A", name: "Circuit A — 3 rounds", exercises: [
        { name: "KB Deadlift (elevated)", sets: "3", reps: "10", load: "35-44 lb KB", note: "KB on step or plate. Push hips back, chest tall, neutral spine." },
        { name: "Push-Up (from knees or full)", sets: "3", reps: "8-10", load: "Bodyweight", note: "Control the lowering. Elbows 45 degrees." },
        { name: "Pallof Press Hold (band)", sets: "3", reps: "20 sec/side", load: "Light-medium band", note: "Press out, hold, don\'t rotate. Pure back protection." },
      ]},
      { id: "B", name: "Circuit B — 3 rounds", exercises: [
        { name: "Sumo Squat (KB)", sets: "3", reps: "12", load: "20-26 lb KB", note: "Wide stance, toes out. KB hangs between legs. Chest tall." },
        { name: "DB Hammer Curl", sets: "3", reps: "10", load: "12-15 lb DBs", note: "Neutral grip, elbows pinned. Slow lower." },
        { name: "Suitcase Carry", sets: "3", reps: "20m/side", load: "26-35 lb KB", note: "Walk tall. Don\'t lean toward weight. Hips level." },
      ]},
      { id: "F", name: "Finisher — 5 min AMRAP", exercises: [
        { name: "Squat x5 / Push-Up x5 / Plank 10 sec", sets: "1", reps: "AMRAP 5 min", load: "Bodyweight", note: "As many rounds as possible. Rest only when needed." },
      ]},
      { id: "C", name: "Cooldown", exercises: [
        { name: "Figure-4 Hip Stretch (lying)", sets: "1", reps: "60 sec/side", load: "Bodyweight", note: "Lie on back, cross ankle over knee, pull toward chest." },
        { name: "Thread the Needle", sets: "1", reps: "8/side", load: "Bodyweight", note: "On all fours, thread one arm under. Thoracic rotation — not lumbar." },
      ]},
    ]
  }
];

// ─── SHORT ON TIME — 25 min versions ─────────────────────────────────────────
const SHORT_DAYS = [
  {
    id: 1, label: "Day 1", title: "Upper Body — Push", accent: "#E8C547",
    duration: "25 min",
    note: "Short version — highest value movements only. Full compounds, FBB cues intact.",
    supersets: [
      { id: "A", name: "Superset A — Chest + Unilateral Press", exercises: [
        { name: "Deficit Push-Up (hands on dip bar handles)", sets: "3", reps: "8", load: "Bodyweight", note: "3-1-1-0 tempo. Pause and breathe at the bottom. Elbows 45 degrees." },
        { name: "Single Arm KB Press (kneeling)", sets: "3", reps: "8/side", load: "26 lb KB", note: "3-1-1-0 tempo. Feel the shoulder loaded before you press. Left then right." },
      ]},
      { id: "B", name: "Superset B — Vertical Push", exercises: [
        { name: "Dip (bodyweight, upright torso)", sets: "3", reps: "8", load: "BW + band assist", note: "3-1-1-0 tempo. Stay upright. Pause and breathe at the bottom." },
        { name: "Heel Tap (supine)", sets: "3", reps: "10/side", load: "Bodyweight", note: "Lower back flat. Slow. Core reset between sets." },
      ]},
    ]
  },
  {
    id: 2, label: "Day 2", title: "Lower Body — Glute & Ham", accent: "#6EC6A0",
    duration: "25 min",
    note: "Short version — hip thrust, hinge, and nordic. The three highest-value glute and hamstring movements.",
    supersets: [
      { id: "A", name: "Superset A — Hip Thrust + Hinge", exercises: [
        { name: "KB Hip Thrust (bench, 3-sec squeeze)", sets: "4", reps: "10", load: "35 lb KB", note: "3-1-1-0 tempo. Feel the glute fully stretched at bottom. 3-sec squeeze at top. Posterior tilt." },
        { name: "KB Staggered Stance RDL", sets: "4", reps: "8/side", load: "26 lb KB", note: "3-1-1-0 tempo. Breathe into the hamstring stretch at the bottom. Stop before lower back." },
      ]},
      { id: "B", name: "Superset B — Nordic", exercises: [
        { name: "Nordic Curl Eccentric (5-sec)", sets: "3", reps: "5", load: "Bodyweight", note: "5-sec lower. Hips fully extended. Catch, reset, go again." },
        { name: "Pallof Press (band)", sets: "3", reps: "10/side", load: "Small band", note: "Rib stack. Pause at end. Quick but quality." },
      ]},
    ]
  },
  {
    id: 3, label: "Day 3", title: "Upper Body — Pull", accent: "#7EB8F7",
    duration: "25 min",
    note: "Short version — decompress, pull, row. Everything you need for the back in 25 minutes.",
    supersets: [
      { id: "W", name: "Warmup", exercises: [
        { name: "Dead Hang (bar)", sets: "2", reps: "20 sec", load: "Bodyweight", note: "Decompress, breathe, feel the lats engage passively." },
      ]},
      { id: "A", name: "Superset A — Vertical Pull + Row", exercises: [
        { name: "Pull-Up (3-sec eccentric)", sets: "3", reps: "max-2", load: "Bodyweight", note: "Scapula first. Pause at top. 3-sec lower. Stop 2 short of failure." },
        { name: "Chest-Supported KB Row (incline bench)", sets: "3", reps: "10/side", load: "35 lb KB", note: "Initiate with the shoulder blade. Pause at top, squeeze rhomboid. 3-sec lower." },
      ]},
      { id: "B", name: "Finisher", exercises: [
        { name: "Face Pull (band)", sets: "3", reps: "15", load: "Band", note: "Elbows high. External rotate at end. Hold 1 second. Rear delt health." },
      ]},
    ]
  },
  {
    id: 4, label: "Day 4", title: "Full Body — Functional", accent: "#E87A5D",
    duration: "25 min",
    note: "Short version — squat, single leg, bridge, and a 3-min AMRAP to finish. Full body in 25.",
    supersets: [
      { id: "A", name: "Superset A — Squat + Single Leg", exercises: [
        { name: "Slant Board Goblet Squat (KB)", sets: "3", reps: "8", load: "35 lb KB", note: "3-sec descent. Pause at bottom, breathe. Drive through heels." },
        { name: "Step-Up (DB, slow eccentric)", sets: "3", reps: "8/side", load: "10 lb DBs", note: "Drive through heel only. Pause at top. 3-sec lower." },
      ]},
      { id: "B", name: "Superset B — Hip Extension", exercises: [
        { name: "Glute Bridge (BB, light)", sets: "3", reps: "12", load: "Light BB", note: "Posterior tilt at top. 2-sec hold. All glute, zero lumbar." },
      ]},
      { id: "C", name: "AMRAP Finisher — 3 min", exercises: [
        { name: "Goblet Squat x5 / Push-Up x5 / Dead Bug x5/side", sets: "1", reps: "AMRAP 3 min", load: "20 lb KB / Bodyweight", note: "Half the time, same quality rules. Every rep counts. Form breaks = rest. Track your rounds." },
      ]},
    ]
  },
];


export {
  CURRENT_WEEK,
  WEEK_THEME,
  RPE_RANGE,
  NRC_RUN_DAYS,
  NRC_PROGRAM,
  WEEKLY_SCHEDULE,
  NEURO_SNACKS,
  DAYS,
  COOLDOWNS,
  SHORT_DAYS,
  WIFE_DAYS,
  WIFE_CURRENT_WEEK,
  WIFE_WEEK_THEME,
  WIFE_RPE_RANGE,
};
