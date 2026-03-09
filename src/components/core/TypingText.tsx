import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface TypewriterHoverProps {
  content?: string;
  className?: string;
  fontSizeClassName?: string;
  speed?: number;
  cursorClassName?: string;
  activeClassName?: string;
  mutedClassName?: string;
}

const TypewriterHover: React.FC<TypewriterHoverProps> = ({
  content = "Frontend Developer",
  className = "",
  fontSizeClassName = "text-2xl",
  speed = 0.05,
  cursorClassName = "bg-white",
  activeClassName = "text-white",
  mutedClassName = "text-white/20",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const blinkTween = useRef<gsap.core.Tween | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (!cursorRef.current || !containerRef.current) return;

      const chars = gsap.utils.toArray<HTMLElement>(".char-unit");

      blinkTween.current = gsap.to(cursorRef.current, {
        opacity: 0,
        yoyo: true,
        duration: 0.5,
        paused: true,
        repeat: -1,
      });

      tl.current = gsap.timeline({
        paused: true,
        onComplete: () => {
          blinkTween.current?.restart();
        },
        onReverseComplete: () => {
          blinkTween.current?.pause();
        },
      });

      tl.current.fromTo(
        cursorRef.current,
        { opacity: 0, left: 0 },
        { opacity: 1, left: 0, duration: 0.01 },
      );

      chars.forEach((char) => {
        const charPos = char.offsetLeft + char.offsetWidth;

        tl.current
          ?.to(
            char,
            {
              onStart: () => {
                char.classList.remove(...mutedClassName.split(" "));
                char.classList.add(...activeClassName.split(" "));
              },
              onReverseComplete: () => {
                char.classList.remove(...activeClassName.split(" "));
                char.classList.add(...mutedClassName.split(" "));
              },
              duration: speed,
              ease: "none",
            },
            ">",
          )
          .to(
            cursorRef.current,
            {
              left: charPos + 5,
              duration: speed,
              ease: "none",
            },
            "<",
          );
      });
    },
    {
      scope: containerRef,
      dependencies: [content, activeClassName, mutedClassName],
    },
  );

  const handleMouseEnter = contextSafe(() => tl.current?.play());
  const handleMouseLeave = contextSafe(() => tl.current?.reverse());

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center p-2 cursor-pointer overflow-hidden rounded-lg select-none group ${className}`}
    >
      <div
        className={`flex font-mono font-bold tracking-tight ${fontSizeClassName}`}
      >
        {content.split("").map((char, index) => (
          <span
            key={index}
            className={`char-unit ${mutedClassName} inline-block whitespace-pre transition-colors duration-150`}
          >
            {char}
          </span>
        ))}
      </div>

      <div
        ref={cursorRef}
        className={`absolute left-0 w-[2px] h-[1.2em] opacity-0 pointer-events-none shadow-[0_0_8px_currentColor] ${cursorClassName}`}
      />
    </div>
  );
};

export default TypewriterHover;
