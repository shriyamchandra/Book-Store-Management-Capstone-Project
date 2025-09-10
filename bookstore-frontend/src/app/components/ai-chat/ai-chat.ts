import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { filter, Subscription } from 'rxjs';
import { AiMessage, AiService } from '../../services/ai';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ChatBubble { role: 'user' | 'model'; text: string; }

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css']
})
export class AiChatComponent implements OnInit, OnDestroy {
  isOpen = false;
  input = '';
  busy = false;
  convo: ChatBubble[] = [
    { role: 'model', text: 'Hi! I can find, summarize, and recommend books. Ask away!' }
  ];
  bookId: number | undefined;

  private sub?: Subscription;

  constructor(private ai: AiService, private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.sub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.detectBookId());
    this.detectBookId();
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  toggle(): void { this.isOpen = !this.isOpen; }

  send(): void {
    const msg = (this.input || '').trim();
    if (!msg || this.busy) return;
    this.input = '';
    this.convo.push({ role: 'user', text: msg });
    this.busy = true;

    const history: AiMessage[] = this.convo.map(m => ({ role: m.role, content: m.text }));
    this.ai.chat({ messages: history, bookId: this.bookId }).subscribe({
      next: (res) => {
        const text = (res && res.reply) ? res.reply : '...';
        this.convo.push({ role: 'model', text });
        this.busy = false;
        setTimeout(this.scrollToBottom, 50);
      },
      error: () => {
        this.convo.push({ role: 'model', text: 'Sorry, something went wrong reaching the AI service.' });
        this.busy = false;
      }
    });
  }

  summarizeCurrent(): void {
    if (!this.bookId || this.busy) return;
    this.busy = true;
    this.ai.summarizeBook(this.bookId).subscribe({
      next: (res) => {
        this.convo.push({ role: 'model', text: res.summary || 'No summary available.' });
        this.busy = false;
        setTimeout(this.scrollToBottom, 50);
      },
      error: () => {
        this.convo.push({ role: 'model', text: 'Could not summarize this book.' });
        this.busy = false;
      }
    });
  }

  recommendFromCurrent(): void {
    if (this.busy) return;
    this.busy = true;
    this.ai.recommendations(this.bookId, undefined).subscribe({
      next: (res) => {
        const lines = (res.recommendations || []).map(r => `• #${r.bookId} — ${r.reason}`);
        this.convo.push({ role: 'model', text: lines.length ? lines.join('\n') : 'No recommendations right now.' });
        this.busy = false;
        setTimeout(this.scrollToBottom, 50);
      },
      error: () => {
        this.convo.push({ role: 'model', text: 'Could not get recommendations.' });
        this.busy = false;
      }
    });
  }

  private detectBookId(): void {
    const m = this.router.url.match(/\/books\/(\d+)/);
    this.bookId = m ? Number(m[1]) : undefined;
  }

  private scrollToBottom(): void {
    const el = document.querySelector('.ai-chat-body');
    if (el) el.scrollTop = el.scrollHeight;
  }

  // Render minimal Markdown (bold, italics, lists, headings, links, code)
  renderMessage(text: string): SafeHtml {
    const html = this.markdownToHtml(text || '');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private markdownToHtml(src: string): string {
    // Escape HTML first
    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Handle fenced code blocks ``` ... ```
    const fences: string[] = [];
    let i = 0;
    src = src.replace(/```([\s\S]*?)```/g, (_m, code) => {
      const idx = fences.push(`<pre class=\"md-code\"><code>${escapeHtml(code)}</code></pre>`) - 1;
      return `[[CODE_BLOCK_${idx}]]`;
    });

    // Escape remaining text
    let out = escapeHtml(src);

    // Headings: ###, ##, #
    out = out.replace(/^###\s+(.*)$/gm, '<h4>$1</h4>');
    out = out.replace(/^##\s+(.*)$/gm, '<h4>$1</h4>');
    out = out.replace(/^#\s+(.*)$/gm, '<h4>$1</h4>');

    // Bold and italics
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|\W)\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');

    // Auto-link URLs
    out = out.replace(/(https?:\/\/[^\s)]+)(?![^<]*>|[^<>]*<\/(?:a|code|pre)>)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>');

    // Lists: group consecutive lines starting with -, * or • into <ul>
    const lines = out.split(/\r?\n/);
    const chunks: string[] = [];
    let inList = false;
    for (const line of lines) {
      const m = line.match(/^\s*(?:[-•\*])\s+(.*)$/);
      if (m) {
        if (!inList) { chunks.push('<ul class="md-list">'); inList = true; }
        chunks.push(`<li>${m[1]}</li>`);
      } else {
        if (inList) { chunks.push('</ul>'); inList = false; }
        if (line.trim().length) chunks.push(`<p>${line}</p>`); else chunks.push('');
      }
    }
    if (inList) chunks.push('</ul>');
    out = chunks.filter(Boolean).join('\n');

    // Restore code fences
    out = out.replace(/\[\[CODE_BLOCK_(\d+)\]\]/g, (_m, idx) => fences[Number(idx)] || '');

    return out;
  }
}
