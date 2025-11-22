import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import Icon from "~/components/core/icon";
import { projects, socials, intro, contributing, license } from './about-content';
import { marked } from "marked";

export default component$(() => {

  const parseMarkdown = (text: string | undefined): string => {
    return marked.parse(text || '', { async: false }) as string || '';
  };

  return (
    <div class="m-4 md:mx-16">
      <article class="bg-back p-8 mx-auto max-w-[1200px] m-8 rounded-lg shadow-md">
        <h2 class="text-3xl mb-2">About the Security Checklist</h2>
        {intro.map((paragraph, index) => (
          <p class="mb-2" key={index}>{paragraph}</p>
        ))}        
      </article>
      <div class="divider"></div>

      <article class="bg-back p-8 mx-auto max-w-[1200px] m-8 rounded-lg shadow-md">
        <h2 class="text-3xl mb-2">Contributing</h2>
        {contributing.map((paragraph, index) => (
          <p class="mb-2" key={index} dangerouslySetInnerHTML={parseMarkdown(paragraph)}></p>
        ))}        
      </article>
      <div class="divider"></div>

      <article class="bg-back p-8 mx-auto max-w-[1200px] my-8 rounded-lg shadow-md">
        <h2 class="text-3xl mb-2" id="author">About the Author</h2>
          <p>
            Hi, I’m <b>Anil Kumar</b>—an AI and security-focused engineer who enjoys shipping practical tools with a clean UX.
            This checklist is a personal project I use to demonstrate how I think about secure-by-default design.
          </p>
          <div class="flex gap-2 my-4">
            {socials.map((social, index) => (
              <a key={index} href={social.link} class="btn btn-sm btn-outline flex gap-2 items-center">
                <Icon icon={social.icon} width={18} height={18} />
                {social.title}
              </a>
            ))}
          </div>
          <p class="text-lg italic font-thin">
            Want to see more of my work? Explore the featured links below.
          </p>
          <ul class="list-disc pl-8 mt-4 space-y-2">
            {projects.map((project, index) => (
              <li key={index}>
                <img class="rounded inline mr-1" width="20" height="20" alt={project.title} src={project.icon} />
                <a href={project.link} class="link link-secondary" target="_blank" rel="noreferrer">
                  {project.title}
                </a> - {project.description}
              </li>
            ))}
          </ul>

      </article>

      <div class="divider"></div>

      <article class="bg-back p-8 mx-auto max-w-[1200px] m-8 rounded-lg shadow-md">
        <h2 class="text-3xl mb-2">License</h2>
        <p>
          All code and content here is licensed under MIT by Anil Kumar. The checklist data lives in
          <a class="link" href="https://github.com/avii2/personal-security-guide/blob/main/personal-security-checklist.yml">
            <code>personal-security-checklist.yml</code>
          </a>.
        </p>
        <pre class="bg-front whitespace-break-spaces rounded text-xs my-2 mx-auto p-2">
          {license}
        </pre>
        <details class="collapse">
          <summary class="collapse-title">
            <h3 class="mt-2">What does this means for you?</h3>
          </summary>
          <div class="collapse-content">
            <p class="mb-2">
              You’re free to use, copy, modify, and distribute this project as long as you keep the MIT notice above.
            </p>
          </div>
        </details>

      </article>

    </div>
  );
});

export const head: DocumentHead = {
  title: "About | Personal Security Guide",
  meta: [
    {
      name: "description",
      content: "This project aims to give you practical guidance on how to improve your digital security, and protect your privacy online",
    },
  ],
};
