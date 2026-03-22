interface SectionProps {
  children: React.ReactNode;
  background?: 'default' | 'raised' | 'sunken' | 'navy';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Section({
  children,
  background = 'default',
  spacing = 'md',
  className = ''
}: SectionProps) {
  const bgMap = {
    default: 'bg-surface',
    raised: 'bg-surface-raised',
    sunken: 'bg-surface-sunken',
    navy: 'bg-navy text-white',
  };
  const spacingMap = {
    xs: 'py-6 md:py-8',
    sm: 'py-8 md:py-12',
    md: 'py-10 md:py-16',
    lg: 'py-12 md:py-20',
    xl: 'py-14 md:py-24',
  };

  return (
    <section className={`${bgMap[background]} ${spacingMap[spacing]} ${className}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
}
