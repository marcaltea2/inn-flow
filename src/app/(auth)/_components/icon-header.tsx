export function IconHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="bg-secondary flex size-14 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
