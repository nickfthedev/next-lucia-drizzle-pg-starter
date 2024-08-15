export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <small className="text-gray-500">{description}</small>}
    </div>
  );
}
