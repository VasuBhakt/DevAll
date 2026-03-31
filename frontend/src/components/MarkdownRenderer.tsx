import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  if (!content)
    return (
      <span className="text-muted-foreground/40 italic">
        No content provided.
      </span>
    );

  return (
    <div
      className={cn(
        "text-[16px] leading-relaxed text-foreground/80",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-2xl font-bold mt-6 mb-4 border-b border-border/20 pb-2"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
          ),
          p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
          ),
          li: ({ ...props }) => <li {...props} />,
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code
                className="bg-secondary/40 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              />
            ) : (
              <code
                className="block bg-secondary/20 p-4 rounded-xl text-sm font-mono overflow-x-auto my-4"
                {...props}
              />
            ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-primary/20 pl-4 italic my-4 text-muted-foreground"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="text-primary inline  hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          img: ({ ...props }) => (
            <img
              className="inline-block align-middle mr-1 last:mr-0 my-1"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table
                className="w-full border-collapse border border-border/20 text-sm"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-secondary/20" {...props} />
          ),
          th: ({ ...props }) => (
            <th
              className="border border-border/20 px-4 py-2 font-bold text-left"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="border border-border/20 px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
