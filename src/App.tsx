// App.tsx
import { useState, useEffect } from "react";

type RiskLevel = {
  label: string;
  color: string;
  gradient: string;
  emoji: string;
  message: string;
  subMessage: string;
};

function getRiskLevel(score: number, isFridayAfternoon: boolean): RiskLevel {
  if (isFridayAfternoon) {
    return {
      label: "YOLO RISK",
      color: "text-purple-300",
      gradient: "from-purple-600 via-pink-600 to-red-600",
      emoji: "🎲",
      message: "It's Friday... but hey, YOLO! «",
      subMessage:
        "Weekend hotfix incoming? Your on-call engineer hates you already.",
    };
  }
  if (score <= 20) {
    return {
      label: "ALL CLEAR",
      color: "text-green-400",
      gradient: "from-green-500 to-emerald-400",
      emoji: "🚀",
      message: "Ship it! What could go wrong?",
      subMessage: "Everything looks good. Deploy with confidence!",
    };
  }
  if (score <= 40) {
    return {
      label: "LOW RISK",
      color: "text-lime-400",
      gradient: "from-lime-500 to-green-400",
      emoji: "😎",
      message: "Looking pretty chill. Go for it.",
      subMessage: "Minor changes, low risk. You've got this.",
    };
  }
  if (score <= 60) {
    return {
      label: "MEDIUM RISK",
      color: "text-yellow-400",
      gradient: "from-yellow-500 to-orange-400",
      emoji: "🤔",
      message: "Hmm... maybe double-check first?",
      subMessage: "Consider a staging deploy and extra monitoring.",
    };
  }
  if (score <= 80) {
    return {
      label: "HIGH RISK",
      color: "text-orange-400",
      gradient: "from-orange-500 to-red-500",
      emoji: "😬",
      message: "Are you sure about this?",
      subMessage: "This feels sketchy. Have your rollback plan ready.",
    };
  }
  return {
    label: "DANGER ZONE",
    color: "text-red-400",
    gradient: "from-red-600 to-rose-500",
    emoji: "🔥",
    message: "Step away from the keyboard.",
    subMessage:
      "Nothing good comes from deploying this. Sleep on it, chief.",
  };
}

function calculateRisk(
  filesChanged: number,
  linesAdded: number,
  hoursSinceLastDeploy: number,
  isFridayAfternoon: boolean
): number {
  if (isFridayAfternoon) {
    const base = Math.min(
      95 +
        Math.floor(filesChanged / 5) +
        Math.floor(linesAdded / 100) +
        (hoursSinceLastDeploy < 24 ? 2 : 0),
      100
    );
    return base;
  }

  let score = 0;

  // Files changed scoring
  if (filesChanged <= 3) score += 5;
  else if (filesChanged <= 10) score += 15;
  else if (filesChanged <= 25) score += 30;
  else if (filesChanged <= 50) score += 50;
  else score += 70;

  // Lines added scoring
  if (linesAdded <= 50) score += 0;
  else if (linesAdded <= 200) score += 10;
  else if (linesAdded <= 500) score += 20;
  else if (linesAdded <= 1000) score += 30;
  else score += 40;

  // Time since last deploy scoring
  if (hoursSinceLastDeploy < 1) score += 20;
  else if (hoursSinceLastDeploy < 6) score += 10;
  else if (hoursSinceLastDeploy < 24) score += 5;
  else if (hoursSinceLastDeploy < 72) score += 0;
  else score += 15;

  return Math.min(score, 100);
}

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gray-950" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  icon,
  min = 0,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <div className="group flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">
        <span className="text-lg">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-full bg-gray-800/80 border border-gray-700 hover:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-xl px-4 py-3 text-white text-xl font-bold transition-all duration-200 outline-none appearance-none [&::-webkit-inner-spin-button]:opacity-0 [&::-webkit-outer-spin-button]:opacity-0"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            onClick={() => onChange(value + step)}
            className="w-6 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-xs transition-colors"
          >
            ▲
          </button>
          <button
            onClick={() => onChange(Math.max(min, value - step))}
            className="w-6 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-xs transition-colors"
          >
            ▼
          </button>
        </div>
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function RiskBar({
  score,
  gradient,
  isFridayAfternoon,
}: {
  score: number;
  gradient: string;
  isFridayAfternoon: boolean;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const start = animatedScore;
    const end = score;
    const duration = 600;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [score]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Risk Score
        </span>
        <span
          className={`text-5xl font-black tabular-nums ${
            isFridayAfternoon
              ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
              : "text-white"
          }`}
        >
          {animatedScore}
          <span className="text-2xl text-gray-500">/100</span>
        </span>
      </div>
      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out relative`}
          style={{ width: `${animatedScore}%` }}
        >
          {isFridayAfternoon && (
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          )}
        </div>
        {/* Tick marks */}
        {[25, 50, 75].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-gray-900/50"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Safe</span>
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
        <span>🔥</span>
      </div>
    </div>
  );
}

function FridayCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-12 h-6 rounded-full transition-all duration-300 ${
            checked
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-gray-700"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
              checked ? "left-7" : "left-1"
            }`}
          />
        </div>
      </div>
      <div>
        <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
          Is it Friday after 3pm? 😱
        </p>
        <p className="text-xs text-gray-500">The sacred rule of deployment</p>
      </div>
    </label>
  );
}

function ResultCard({
  risk,
  score,
  isFridayAfternoon,
}: {
  risk: RiskLevel;
  score: number;
  isFridayAfternoon: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 border overflow-hidden transition-all duration-500 ${
        isFridayAfternoon
          ? "border-purple-500/50 bg-purple-950/30"
          : score > 60
          ? "border-red-500/30 bg-red-950/20"
          : score > 40
          ? "border-yellow-500/30 bg-yellow-950/20"
          : "border-green-500/30 bg-green-950/20"
      }`}
    >
      {isFridayAfternoon && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 animate-pulse" />
      )}
      <div className="relative flex items-start gap-4">
        <span className="text-5xl animate-bounce">{risk.emoji}</span>
        <div className="flex-1">
          <div
            className={`text-xs font-black uppercase tracking-widest mb-1 ${risk.color}`}
          >
            {risk.label}
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            {risk.message}
          </h2>
          <p className="text-gray-400 text-sm mt-2">{risk.subMessage}</p>
        </div>
      </div>
    </div>
  );
}

function QuickFacts({
  filesChanged,
  linesAdded,
  hoursSinceLastDeploy,
  isFridayAfternoon,
}: {
  filesChanged: number;
  linesAdded: number;
  hoursSinceLastDeploy: number;
  isFridayAfternoon: boolean;
}) {
  const facts = [
    {
      condition: filesChanged > 20,
      text: `${filesChanged} files changed is a lot, pal.`,
      icon: "📁",
    },
    {
      condition: linesAdded > 500,
      text: "500+ lines? Nobody's reviewing this properly.",
      icon: "📜",
    },
    {
      condition: hoursSinceLastDeploy < 2,
      text: "Last deploy was less than 2 hours ago. Brave.",
      icon: "⏰",
    },
    {
      condition: hoursSinceLastDeploy > 168,
      text: "A week since last deploy? Big bang incoming.",
      icon: "💥",
    },
    {
      condition: isFridayAfternoon && filesChanged > 0,
      text: "Your on-call engineer is already crying.",
      icon: "😭",
    },
    {
      condition: filesChanged === 0 && linesAdded === 0,
      text: "Deploying nothing? Respect the discipline.",
      icon: "🧘",
    },
  ].filter((f) => f.condition);

  if (facts.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Fun Facts
      </p>
      <div className="space-y-2">
        {facts.map((fact, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50"
          >
            <span>{fact.icon}</span>
            <span>{fact.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [filesChanged, setFilesChanged] = useState(5);
  const [linesAdded, setLinesAdded] = useState(120);
  const [hoursSinceLastDeploy, setHoursSinceLastDeploy] = useState(48);
  const [isFridayAfternoon, setIsFridayAfternoon] = useState(false);

  const score = calculateRisk(
    filesChanged,
    linesAdded,
    hoursSinceLastDeploy,
    isFridayAfternoon
  );
  const risk = getRiskLevel(score, isFridayAfternoon);

  // Auto-detect Friday afternoon
  useEffect(() => {
    const now = new Date();
    const isFri = now.getDay() === 5 && now.getHours() >= 15;
    if (isFri) setIsFridayAfternoon(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <AnimatedBackground />

      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-full px-4 py-1.5 text-xs text-gray-400 font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Deploy Risk Calculator
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Should I{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Deploy?
            </span>
          </h1>
          <p className="text-gray-500 text-sm">
            Science-based™ deployment risk assessment
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          {/* Inputs */}
          <div className="space-y-4">
            <NumberInput
              label="Files Changed"
              value={filesChanged}
              onChange={setFilesChanged}
              icon="📁"
              min={0}
              hint="How many files did you touch?"
            />
            <NumberInput
              label="Lines Added"
              value={linesAdded}
              onChange={setLinesAdded}
              icon="✍️"
              min={0}
              hint="Net lines added (not counting deletions)"
            />
            <NumberInput
              label="Hours Since Last Deploy"
              value={hoursSinceLastDeploy}
              onChange={setHoursSinceLastDeploy}
              icon="⏱️"
              min={0}
              step={1}
              hint="How long has production been stable?"
            />
          </div>

          <div className="h-px bg-gray-800" />

          {/* Friday Checkbox */}
          <FridayCheckbox
            checked={isFridayAfternoon}
            onChange={setIsFridayAfternoon}
          />

          <div className="h-px bg-gray-800" />

          {/* Risk Bar */}
          <RiskBar
            score={score}
            gradient={risk.gradient}
            isFridayAfternoon={isFridayAfternoon}
          />
        </div>

        {/* Result Card */}
        <ResultCard
          risk={risk}
          score={score}
          isFridayAfternoon={isFridayAfternoon}
        />

        {/* Fun Facts */}
        <QuickFacts
          filesChanged={filesChanged}
          linesAdded={linesAdded}
          hoursSinceLastDeploy={hoursSinceLastDeploy}
          isFridayAfternoon={isFridayAfternoon}
        />

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 pb-4">
          Not responsible for production outages. Deploy at your own risk. 🙃
        </p>
      </div>
    </div>
  );
}
