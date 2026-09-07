import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  Content: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Footer: React.FC<React.HTMLAttributes<HTMLDivElement>>;
} = ({ variant = 'default', className = '', children, ...props }) => {
  const baseStyles = 'rounded-lg bg-[var(--mq-surface)] transition-all duration-200 overflow-hidden';

  const variants = {
    default: 'border border-[var(--mq-border)] shadow-xs',
    bordered: 'border-2 border-[var(--mq-border)]',
    elevated: 'border border-[var(--mq-border)] shadow-md',
    interactive: 'border border-[var(--mq-border)] shadow-xs hover:border-[var(--mq-border-focus)] hover:shadow-md cursor-pointer',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-5 pb-3 border-b border-[var(--mq-border)] ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`text-lg font-bold text-[var(--mq-text-primary)] ${className}`} {...props}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-xs text-[var(--mq-text-secondary)] mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

Card.Content = function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`p-4 bg-[var(--mq-surface-muted)] border-t border-[var(--mq-border)] flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};
