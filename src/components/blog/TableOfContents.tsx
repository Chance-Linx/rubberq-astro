type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export default function TableOfContents({
  title,
  items,
}: {
  title: string;
  items: TocItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="border border-industrial-200 bg-industrial-50 p-6 mb-8">
      <h2 className="text-sm font-bold uppercase tracking-wider text-industrial-500 mb-4">{title}</h2>
      <nav aria-label={title}>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
              <a href={`#${item.id}`} className="text-sm text-industrial-700 hover:text-accent-orange transition-colors">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
