import { useEffect } from "react";

const SECTION_SELECTOR = "main section:not(.rw-hero)";
const CHILD_SELECTOR = [
  ".container > *",
  ".section-container > *",
  ".rw-container > *",
  ".services-grid > *",
  ".ai-tools-cards > *",
  ".stats-grid > *",
  ".process-grid > *",
  ".industries-grid > *",
  ".industry-grid > *",
  ".testimonial-grid > *",
  ".testimonials-grid > *",
  ".cards-grid > *",
  ".job-grid > *",
  ".jobs-grid > *",
  ".pricing-grid > *",
  ".pricing-cards > *",
  ".features-grid > *",
  ".benefits-grid > *",
].join(",");

const DIRECTIONS = ["up", "right", "left", "down", "right", "left", "up"];
const CHILD_DIRECTIONS = ["left", "right", "up", "down"];

function isInViewport(el, margin = 80) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - margin && rect.bottom > margin;
}

export default function ScrollMotion() {
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    document.documentElement.classList.add("rw-motion-ready");

    if (reduce || !window.IntersectionObserver) {
      document.documentElement.classList.add("rw-motion-reduced");
      return () => document.documentElement.classList.remove("rw-motion-ready", "rw-motion-reduced");
    }

    let serial = 0;
    let childSerial = 0;
    let raf = 0;
    let debounceTimer = 0;

    // Pause every CSS animation inside sections that are far off-screen so the
    // browser is not repainting dozens of infinite animations while scrolling.
    const pauseObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("rw-paused", !entry.isIntersecting);
        });
      },
      { rootMargin: "250px 0px 250px 0px", threshold: 0 },
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("rw-motion-pending");
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    const prepare = (el, direction, delay = 0) => {
      el.classList.add("rw-motion-child", `rw-child-${direction}`);
      el.style.setProperty("--rw-child-delay", `${delay}ms`);
      el.dataset.rwChildMotion = "1";

      // Never hide content that is already on-screen during first paint.
      if (isInViewport(el, 40)) {
        el.classList.add("is-visible");
      } else {
        el.classList.add("rw-motion-pending");
        revealObserver.observe(el);
      }
    };

    const enhance = () => {
      document.querySelectorAll("main section").forEach((section) => pauseObserver.observe(section));
      document.querySelectorAll(SECTION_SELECTOR).forEach((section) => {
        if (section.dataset.rwMotionReady !== "1") {
          section.dataset.rwMotionReady = "1";
          section.classList.add("rw-section-reveal");
          const direction = section.dataset.reveal || DIRECTIONS[serial % DIRECTIONS.length];
          section.classList.add(`rw-reveal-${direction}`);
          serial += 1;

          if (isInViewport(section, 40)) {
            section.classList.add("is-visible");
          } else {
            section.classList.add("rw-motion-pending");
            revealObserver.observe(section);
          }
        }

        const children = Array.from(section.querySelectorAll(CHILD_SELECTOR))
          .filter((el) => !el.closest(".rw-hero"))
          .filter((el) => !el.classList.contains("section-header"))
          .filter((el) => el.parentElement?.closest?.(".rw-motion-child") == null);

        children.forEach((el, index) => {
          if (el.dataset.rwChildMotion === "1") return;
          const direction = CHILD_DIRECTIONS[(childSerial + index) % CHILD_DIRECTIONS.length];
          prepare(el, direction, Math.min(index * 110, 660));
        });
        childSerial += 1;
      });
    };

    const scheduleEnhance = () => {
      // Debounced so a burst of React DOM updates triggers a single pass.
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(enhance);
      }, 120);
    };

    // Let React finish the first paint, then classify only off-screen content as pending.
    scheduleEnhance();

    const mutationObserver = new MutationObserver(scheduleEnhance);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const onResize = scheduleEnhance;
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(debounceTimer);
      mutationObserver.disconnect();
      revealObserver.disconnect();
      pauseObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("rw-motion-ready", "rw-motion-reduced");
    };
  }, []);

  return null;
}
