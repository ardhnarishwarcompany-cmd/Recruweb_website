import { useEffect, useState } from "react";

export default function PageIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="rw-page-intro" aria-hidden="true">
      <div className="rw-intro-glow"></div>
      <div className="rw-intro-logo">
        <img src="/images/RW_LOGO_Black_page-0001-removebg-preview.png" alt="" />
      </div>
      <div className="rw-intro-line"></div>
      <span>RECRUWEB • TALENT INTELLIGENCE</span>
    </div>
  );
}
