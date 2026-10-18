import React from "react";

const inline = (text) =>
  String(text)
    .split(/(\*\*[^*]+\*\*)/)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>,
    );

export default function SopContent({ content = "" }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes = [];
  let list = [];
  let headingIndex = 0;

  const flushList = () => {
    if (!list.length) return;
    nodes.push(
      <ul className="sop-content-list" key={`list-${nodes.length}`}>
        {list.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line === "---") {
      flushList();
      if (line === "---") {
        nodes.push(<hr key={`hr-${index}`} />);
      }
      return;
    }

    if (line.startsWith("* ")) {
      list.push(line.slice(2));
      return;
    }

    flushList();

    if (line.startsWith("### ")) {
      nodes.push(<h3 id={`sop-heading-${headingIndex++}`} key={index}>{inline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      nodes.push(<h2 id={`sop-heading-${headingIndex++}`} key={index}>{inline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      nodes.push(<h2 id={`sop-heading-${headingIndex++}`} key={index}>{inline(line.slice(2))}</h2>);
    } else {
      nodes.push(<p key={index}>{inline(line)}</p>);
    }
  });

  flushList();

  return <div className="sop-content">{nodes}</div>;
}
