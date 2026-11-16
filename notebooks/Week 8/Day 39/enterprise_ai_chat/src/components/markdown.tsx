"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CopyButton } from "./copy-button";

function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  return <div className="code-block">
    <div className="code-header"><span>Code</span><CopyButton text={() => ref.current?.textContent || ""} label="Copy code" showLabel /></div>
    <pre ref={ref} {...props}>{children}</pre>
  </div>;
}

export function Markdown({ content }: { content: string }) {
  return <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}
    components={{
      pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
      a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
      table: ({ children }) => <div className="table-scroll"><table>{children}</table></div>,
      img: ({ alt }) => <span className="image-description">{alt || "Image"}</span>,
    }}>{content}</ReactMarkdown></div>;
}
