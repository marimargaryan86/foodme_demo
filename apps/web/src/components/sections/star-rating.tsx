import { useRef } from "react";
import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5] as const;

/** Read-only stars; announced as a single image, e.g. "4 out of 5 stars". */
export function StarDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="inline-flex items-center gap-0.5">
      {STARS.map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.75}
          aria-hidden="true"
          className={n <= value ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
        />
      ))}
    </span>
  );
}

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

/**
 * 1-5 star picker as a radio group: mouse/touch click a star, keyboard uses
 * arrow keys (roving tabindex), and screen readers hear "N stars, radio button".
 */
export function StarInput({ value, onChange, label = "Rating" }: StarInputProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, n: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      move(n + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      move(n - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(1);
    } else if (e.key === "End") {
      e.preventDefault();
      move(5);
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className="flex items-center justify-center gap-1">
      {STARS.map((n) => (
        <button
          key={n}
          ref={(el) => {
            refs.current[n - 1] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          onClick={() => onChange(n)}
          onKeyDown={(e) => onKeyDown(e, n)}
          className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <Star
            size={30}
            strokeWidth={1.5}
            aria-hidden="true"
            className={n <= value ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
          />
        </button>
      ))}
    </div>
  );
}
