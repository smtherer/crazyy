// app/api/groq-benchmark/route.ts
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const latency = parseFloat(Number(body.latency).toFixed(1));
    const mode: "VISUAL" | "AUDITORY" = body.mode === "AUDITORY" ? "AUDITORY" : "VISUAL";
    const subjectName: string = body.subjectName || "Driver";

    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey.startsWith("gsk_")) {
      const groq = new Groq({ apiKey });

      const prompt = `You are an elite F1 telemetry engineer with sharp wit and deep neuroscience expertise.
Analyze this human reflex test:
- Subject Name: "${subjectName}"
- Recorded Latency: ${latency} ms
- Modality: ${mode}

RULES:
1. "verdict": 2-4 word punchy technical verdict (e.g., "NEURAL OVERDRIVE", "GLITCH IN THE MATRIX", "SEVERE SYNAPTIC TRAFFIC", "COGNITIVE SCREEN SAVER").
2. "aiAnalysis": Exactly 2 sentences explaining the biological pathway (${
        mode === "AUDITORY"
          ? "cochlear hair cells -> brainstem -> motor cortex -> median nerve"
          : "retinal photoreceptors -> visual cortex (V1) -> motor cortex -> median nerve"
      }) and what ${latency}ms proves about their alertness.
3. "comparisons": Exactly 5 wildly creative, colorful, and diverse comparison entities scaled around ${latency}ms (2-3 faster, 2-3 slower).
   DO NOT give boring entries. Mix from:
   - High speed motorsport / gaming (e.g., "Ferrari 1.8s Wheel Gun", "CS2 Flick Shot", "F1 Pitstop Fuel Flap")
   - Wildlife & biology (e.g., "Mantis Shrimp Cavitation Punch", "Peregrine Falcon Dive Snap", "Chameleon Tongue Strike")
   - Everyday hilarious life latency (e.g., "Realizing you left stove on", "Arthur Morgan Deadeye Draw", "Cat knocking glass off table", "Microwave door grab", "Windows 95 Dial-up Handshake", "Tectonic Plate Drift")
   Each item MUST contain:
   - "label": Short entity name (e.g., "Cat Swat Reflex", "Arthur Morgan Draw")
   - "sublabel": Funny/vivid context
   - "ms": Number in ms
   - "avatar": Single emoji

Format strictly as JSON with keys: "verdict", "aiAnalysis", "comparisons". Return ONLY raw JSON without markdown or LaTeX symbols.`;

      const chat = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "openai/gpt-oss-20b",
        temperature: 0.75,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(chat.choices[0]?.message?.content || "{}");
      if (parsed.verdict && parsed.comparisons?.length >= 4) {
        return NextResponse.json({ fallback: false, ...parsed });
      }
    }
  } catch (err) {
    // Falls back to creative generator below
  }

  // High-flavor creative fallback generator
  const { latency = 350, mode = "VISUAL", subjectName = "Driver" } = await req
    .clone()
    .json()
    .catch(() => ({}));

  return NextResponse.json({
    fallback: true,
    ...generateCreativeFallback(parseFloat(Number(latency).toFixed(1)), mode, subjectName),
  });
}

function generateCreativeFallback(ms: number, mode: string, name: string) {
  if (ms > 850) {
    return {
      verdict: "COGNITIVE SCREEN SAVER",
      aiAnalysis: `At ${ms}ms, sensory transduction proceeded normally, but central prefrontal gating experienced massive hesitation before authorizing motor neuron firing.`,
      comparisons: [
        { label: "Mantis Shrimp Punch", sublabel: "Biological hyper-velocity", ms: 90, avatar: "🦐" },
        { label: "F1 Pit Crew Wheel Nut", sublabel: "Red Bull sub-2s pit stop", ms: 180, avatar: "🏎️" },
        { label: "Cat Swatting Glass", sublabel: "Spiteful feline acceleration", ms: 320, avatar: "🐱" },
        { label: "Microwave Door Grab", sublabel: "Stopping at 00:01", ms: 550, avatar: "⏱️" },
        { label: "Dial-up Modem Connect", sublabel: "1998 AOL handshake latency", ms: Math.max(1400, Math.round(ms * 1.3)), avatar: "📠" },
      ],
    };
  }

  if (ms > 340) {
    return {
      verdict: "ELEVATED BRAIN BUFFER",
      aiAnalysis: `At ${ms}ms, A-alpha axonal conduction was intact, but efferent signal release exhibited latency typical of divided attention or low sympathetic priming.`,
      comparisons: [
        { label: "Max Verstappen Launch", sublabel: "Red Bull start gantry", ms: 140, avatar: "🏎️" },
        { label: "CS2 AWP Snap Flick", sublabel: "Esports muscle memory", ms: 175, avatar: "🎯" },
        { label: "Arthur Morgan Quickdraw", sublabel: "Deadeye revolver cock", ms: 260, avatar: "🤠" },
        { label: "Toaster Pop Flinch", sublabel: "Startled morning jump", ms: 420, avatar: "🍞" },
        { label: "Sloth Deciding to Blink", sublabel: "Arboreal metabolic chill", ms: 890, avatar: "🦥" },
      ],
    };
  }

  return {
    verdict: "NEURAL WARP DRIVE",
    aiAnalysis: `At ${ms}ms, ${mode === "AUDITORY" ? "cochlear transduction" : "retinal phototransduction"} and motor cortex recruitment fired with apex biological synchrony.`,
    comparisons: [
      { label: "Peregrine Falcon Snap", sublabel: "Supersonic optic lock", ms: 75, avatar: "🦅" },
      { label: "F1 World Champion", sublabel: "Clutch release reaction", ms: 140, avatar: "🏎️" },
      { label: "Esports Pro Reflex", sublabel: "Frame-perfect click", ms: 165, avatar: "🎮" },
      { label: "Coffee Mug Catch", sublabel: "Accidental drop save", ms: 280, avatar: "☕" },
      { label: "Sleepy Monday Morning", sublabel: "First alarm realization", ms: 450, avatar: "🥱" },
    ],
  };
}