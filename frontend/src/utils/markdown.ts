/**
 * Simple markdown renderer for demo/full answers
 */
export function renderMarkdown(text: string): string {
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2">$1</li>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-2">$1</li>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    .replace(/\n/gim, '<br>');
  
  // Wrap list items
  html = html.replace(/(<li.*<\/li>)/gim, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>');
  
  // Wrap paragraphs
  if (!html.startsWith('<h') && !html.startsWith('<ul')) {
    html = '<p class="mb-4">' + html;
  }
  if (!html.endsWith('</p>') && !html.endsWith('</ul>') && !html.endsWith('</h')) {
    html = html + '</p>';
  }
  
  return html;
}
