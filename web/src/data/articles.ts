
interface Article {
  title: string;
  description: string;
  slug: string;
  markdown: string;
  warningMessage?: string;
}

const articles: Article[] = [
  {
    title: 'Why security matters?',
    description: 'Why your personal digital security and privacy needs to be taken seriously.',
    slug: 'importance-of-digital-security',
    markdown: 'https://raw.githubusercontent.com/avii2/personal-security-guide/HEAD/articles/0_Why_It_Matters.md',
  },
  {
    title: 'Security List: Short Version',
    description: 'Main lists too long? Here\'s the TL;DR',
    slug: 'short-list',
    markdown: 'https://raw.githubusercontent.com/avii2/personal-security-guide/HEAD/articles/2_TLDR_Short_List.md',
  },
  {
    title: 'Helpful Links',
    description: 'Directory of links to additional tools, resources and information.',
    slug: 'helpful-links',
    markdown: 'https://raw.githubusercontent.com/avii2/personal-security-guide/HEAD/articles/4_Privacy_And_Security_Links.md',
    warningMessage: 'This article was written in 2020, and needs updating.',
  },
  {
    title: 'Security Gadgets',
    description: 'Handy hardware devices that can help protect your privacy and security.',
    slug: 'privacy-gadgets',
    markdown: 'https://raw.githubusercontent.com/avii2/personal-security-guide/HEAD/articles/6_Privacy_and-Security_Gadgets.md',
    warningMessage: 'This article is outdated and may contain incorrect information. '
      +'It is recommended to verify the information before using any of the products listed.',
  },
];

export default articles;
