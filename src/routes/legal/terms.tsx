import { createSignal, onMount, Show } from "solid-js";
import { Title, Meta } from "@solidjs/meta";

export default function TermsOfService() {
  const [content, setContent] = createSignal<string>("");
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    setContent(`# Terms of Service

Please read these Terms of Service carefully before using our Lirld mockup interface.

## 1. Acceptable Use
You agree to use this mockup only for design evaluations and client reviews.

## 2. Intellectual Property
All UI elements, custom animations, and layout themes are protected under copyright.

## 3. Disclaimers
This is a local mockup sandbox client with no real live communication APIs.
`);
    setLoading(false);
  });

  // Simple markdown to HTML converter for basic formatting
  const renderMarkdown = (markdown: string) => {
    return markdown
      .split("\n")
      .map((line) => {
        // Headers
        if (line.startsWith("# ")) {
          return `<h1 class="text-3xl font-bold text-slate-900 mt-8 mb-4">${line.slice(2)}</h1>`;
        }
        if (line.startsWith("## ")) {
          return `<h2 class="text-2xl font-bold text-slate-900 mt-6 mb-3">${line.slice(3)}</h2>`;
        }
        if (line.startsWith("### ")) {
          return `<h3 class="text-xl font-semibold text-slate-900 mt-4 mb-2">${line.slice(4)}</h3>`;
        }
        if (line.startsWith("#### ")) {
          return `<h4 class="text-lg font-semibold text-slate-900 mt-3 mb-2">${line.slice(5)}</h4>`;
        }

        // Bold text
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');

        // Links
        line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

        // Horizontal rule
        if (line.trim() === "---") {
          return '<hr class="border-slate-900/10 my-6" />';
        }

        // List items
        if (line.startsWith("- ")) {
          return `<li class="text-[#1e293b] ml-6 mb-2">${line.slice(2)}</li>`;
        }

        // Empty lines
        if (line.trim() === "") {
          return "<br />";
        }

        // Regular paragraphs
        return `<p class="text-[#1e293b] mb-3 leading-relaxed">${line}</p>`;
      })
      .join("\n");
  };

  return (
    <main class="min-h-screen bg-white">
      <Title>Terms of Service - Lirld</Title>
      <Meta name="description" content="Read our terms of service to understand the rules and guidelines for using Lirld." />
      <div class="max-w-7xl mx-auto px-2 sm:px-2 py-8">
        {/* Content */}
        <Show
          when={!loading()}
          fallback={
            <div class="flex justify-center items-center py-20">
              <div class="flex items-center gap-3 text-slate-900/60">
                <svg
                  class="animate-spin h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading...</span>
              </div>
            </div>
          }
        >
          <article
            class="prose max-w-none"
            innerHTML={renderMarkdown(content())}
          />
        </Show>
      </div>
    </main>
  );
}
