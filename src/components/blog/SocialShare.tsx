import { Linkedin, Mail, Share2 } from 'lucide-react';

type ShareLabels = {
  title: string;
  linkedIn: string;
  email: string;
  copyHint: string;
};

export default function SocialShare({
  labels,
  url,
  title,
}: {
  labels: ShareLabels;
  url: string;
  title: string;
}) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      id: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      text: labels.linkedIn,
      icon: Linkedin,
    },
    {
      id: 'email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      text: labels.email,
      icon: Mail,
    },
  ];

  return (
    <div className="border border-industrial-200 bg-white p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3 text-industrial-700">
        <Share2 className="w-4 h-4" />
        <h3 className="text-sm font-bold uppercase tracking-wider">{labels.title}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target={link.id === 'email' ? undefined : '_blank'}
            rel={link.id === 'email' ? undefined : 'noopener noreferrer'}
            className="inline-flex items-center gap-2 border border-industrial-200 px-4 py-2 text-sm font-medium text-industrial-700 hover:text-accent-orange hover:border-accent-orange transition-colors"
          >
            <link.icon className="w-4 h-4" />
            {link.text}
          </a>
        ))}
      </div>

      <p className="text-xs text-industrial-500 mt-3">{labels.copyHint}</p>
    </div>
  );
}
