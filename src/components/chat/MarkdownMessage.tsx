import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom component styling for better integration with our design
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          
          strong: ({ children }) => <strong className="font-semibold text-current">{children}</strong>,
          
          em: ({ children }) => <em className="italic text-current">{children}</em>,
          
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code 
                className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-current" 
                {...props}
              >
                {children}
              </code>
            ) : (
              <code 
                className="block bg-muted p-2 rounded text-sm font-mono overflow-x-auto" 
                {...props}
              >
                {children}
              </code>
            );
          },
          
          ul: ({ children }) => <ul className="mb-2 list-disc list-inside space-y-1">{children}</ul>,
          
          ol: ({ children }) => <ol className="mb-2 list-decimal list-inside space-y-1">{children}</ol>,
          
          li: ({ children }) => <li className="text-current">{children}</li>,
          
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-current">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-current">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-current">{children}</h3>,
          
          a: ({ children, href }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          
          hr: () => <hr className="my-4 border-muted-foreground/20" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 