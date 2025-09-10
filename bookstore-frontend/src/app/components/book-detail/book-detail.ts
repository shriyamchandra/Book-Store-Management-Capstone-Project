import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BookService, BookDetail, Review } from '../../services/book'; // Import Review from book.ts
import { CartService, OrderItemDto } from '../../services/cart';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ReviewFormComponent } from '../review-form/review-form';
import { ReviewService } from '../../services/review'; // Import ReviewService only
import { AuthService } from '../../services/auth'; // Import AuthService
import { AiService } from '../../services/ai';

// --- Types to make numeric star keys type-safe ---
const STAR_VALUES = [1, 2, 3, 4, 5] as const;
type Star = typeof STAR_VALUES[number];

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatListModule, MatSnackBarModule],
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.css']
})
export class BookDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  bookDetail: BookDetail | null = null;

  quantity = 1;
  quantityInCart = 0;
  isOutOfStock = false;

  stockState = '';
  stockLabel = '';
  stockPercent = 0;
  stockHint = '';

  showFullDesc = false;

  // >>> NEW: stars list for template loops and typed breakdown
  starsDesc: readonly Star[] = [5, 4, 3, 2, 1];
  breakdownPercent: Record<Star, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  private bookDetailSubscription?: Subscription;
  private cartSubscription?: Subscription;

  // --- Chart animation helpers ---
  readonly ratingRadius = 36;
  readonly ratingCircumference = 2 * Math.PI * this.ratingRadius;
  animateCharts = false;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private title: Title,
    private meta: Meta,
    private dialog: MatDialog, // Inject MatDialog
    private reviewService: ReviewService, // Inject ReviewService
    private authService: AuthService, // Inject AuthService
    private aiService: AiService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.bookDetailSubscription = this.route.paramMap
      .pipe(
        switchMap(params => {
          const bookId = params.get('id');
          return bookId ? this.bookService.getBookById(+bookId) : of(null);
        })
      )
      .subscribe(data => {
        this.bookDetail = data;
        this.updateStockInfo();

        if (this.bookDetail) {
          this.subscribeToCart();

          const b = this.bookDetail.book;
          this.title.setTitle(`${b.title} · ${b.author} | Bookstore`);
          this.meta.updateTag({ name: 'description', content: b.description?.slice(0, 150) || '' });

          this.computeBreakdown();
        } else {
          this.quantityInCart = 0;
          this.checkStock();
          this.updateStockInfo();
          this.title.setTitle('Book Not Found | Bookstore');
          this.meta.updateTag({ name: 'description', content: 'Details for a book not found.' });
        }
      });

    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      if (cart && this.bookDetail) {
        const itemInCart = cart.items.find(i => i.bookId === this.bookDetail!.book.bookId);
        this.quantityInCart = itemInCart ? itemInCart.quantity : 0;
      } else {
        this.quantityInCart = 0;
      }
      this.checkStock();
      this.updateStockInfo();
    });
  }

  ngAfterViewInit(): void {
    // Kick chart animation on first paint
    setTimeout(() => (this.animateCharts = true), 30);
  }

  ngOnDestroy(): void {
    this.bookDetailSubscription?.unsubscribe();
    this.cartSubscription?.unsubscribe();
  }

  subscribeToCart(): void {
    this.cartSubscription?.unsubscribe();
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      if (cart && this.bookDetail) {
        const itemInCart = cart.items.find(i => i.bookId === this.bookDetail!.book.bookId);
        this.quantityInCart = itemInCart ? itemInCart.quantity : 0;
      } else {
        this.quantityInCart = 0;
      }
      this.checkStock();
      this.updateStockInfo();
    });
  }

  checkStock(): void {
    if (!this.bookDetail) return;
    const available = this.bookDetail.book.quantityInStock - this.quantityInCart;
    if (this.quantity > available) this.quantity = available > 0 ? available : 1;
    this.isOutOfStock = available <= 0;
  }

  updateStockInfo(): void {
    if (!this.bookDetail?.book) {
      this.stockState = 'unavailable';
      this.stockLabel = 'Unavailable';
      this.stockPercent = 0;
      this.stockHint = 'Book details not loaded.';
      return;
    }

    const total = this.bookDetail.book.quantityInStock;
    const available = total - this.quantityInCart;

    if (total === 0 || available <= 0) {
      this.stockState = 'out-of-stock';
      this.stockLabel = 'Out of Stock';
      this.stockPercent = 0;
      this.stockHint = total === 0 ? 'This book is currently out of stock.' : 'All available copies are in your cart.';
    } else if (available < 5) {
      this.stockState = 'low-stock';
      this.stockLabel = 'Low Stock';
      this.stockPercent = (available / total) * 100;
      this.stockHint = `Only ${available} left!`;
    } else {
      this.stockState = 'in-stock';
      this.stockLabel = 'In Stock';
      this.stockPercent = (available / total) * 100;
      this.stockHint = `${available} available`;
    }
  }

  addToCart(): void {
    if (!this.bookDetail) return;

    const available = this.bookDetail.book.quantityInStock - this.quantityInCart;
    if (this.quantity > available) {
      this.isOutOfStock = true;
      this.snackBar.open('Not enough items in stock.', 'Close', { duration: 3000 });
      return;
    }

    const item: OrderItemDto = {
      bookId: this.bookDetail.book.bookId,
      quantity: this.quantity,
      title: this.bookDetail.book.title,
      author: this.bookDetail.book.author,
      imageUrl: this.bookDetail.book.imageUrl,
      price: this.bookDetail.book.price,
      quantityInStock: this.bookDetail.book.quantityInStock
    };

    this.cartService.addToCart(item).subscribe({
      next: () => this.snackBar.open('Added to cart!', 'Close', { duration: 2000 }),
      error: err => {
        if (err.status === 400) {
          this.isOutOfStock = true;
        } else {
          this.snackBar.open('Error adding to cart. Please try again.', 'Close', { duration: 3000 });
        }
      }
    });
  }

  incrementQuantity(): void {
    if (!this.bookDetail) return;
    const available = this.bookDetail.book.quantityInStock - this.quantityInCart;
    if (this.quantity < available) this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  get avgRating(): number {
    const rs = this.bookDetail?.reviews || [];
    if (!rs.length) return 0;
    return rs.reduce((a, r) => a + (r.rating || 0), 0) / rs.length;
  }

  get ratingDashoffset(): number {
    const pct = Math.max(0, Math.min(1, this.avgRating / 5));
    return this.ratingCircumference * (1 - pct);
  }

  // >>> NEW: compute review distribution safely typed
  computeBreakdown(): void {
    const rs = this.bookDetail?.reviews || [];
    const counts: Record<Star, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const r of rs) {
      const val = Math.round(Number(r.rating) || 0);
      const clamped = (val < 1 ? 1 : val > 5 ? 5 : val) as Star;
      counts[clamped] = (counts[clamped] || 0) + 1;
    }
    const total = rs.length || 1;
    this.breakdownPercent = {
      5: (counts[5] * 100) / total,
      4: (counts[4] * 100) / total,
      3: (counts[3] * 100) / total,
      2: (counts[2] * 100) / total,
      1: (counts[1] * 100) / total
    };
  }

  openReviewDialog(): void {
    if (!this.bookDetail) return;

    const dialogRef = this.dialog.open(ReviewFormComponent, {
      width: '400px',
      data: {
        bookId: this.bookDetail.book.bookId,
        bookTitle: this.bookDetail.book.title
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Only send fields required; username is set by backend from JWT
        const newReview = {
          bookId: this.bookDetail!.book.bookId,
          rating: result.rating,
          comment: result.comment
        };

        console.log('Frontend: Submitting review:', newReview); // Debugging statement

        this.reviewService.submitReview(newReview).subscribe({
          next: (review) => {
            console.log('Frontend: Review submitted successfully:', review); // Debugging statement
            this.snackBar.open('Review submitted successfully!', 'Close', { duration: 2000 });
            this.loadReviews(this.bookDetail!.book.bookId); // Refresh reviews
          },
          error: (err) => {
            console.error('Frontend: Error submitting review:', err); // Debugging statement
            this.snackBar.open('Error submitting review. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  private loadReviews(bookId: number): void {
    this.bookService.getBookById(bookId).subscribe(data => {
      if (this.bookDetail && data) {
        this.bookDetail.reviews = data.reviews;
        this.computeBreakdown();
      }
    });
  }

  Math = Math;
  // AI summary
  aiLoading = false;
  aiSummary: string | null = null;
  aiSummaryHtml: SafeHtml | null = null;

  loadAiSummary(): void {
    if (!this.bookDetail || this.aiLoading) return;
    this.aiLoading = true;
    const id = this.bookDetail.book.bookId;
    this.aiService.summarizeBook(id).subscribe({
      next: (res) => {
        this.aiSummary = res.summary || 'No summary available.';
        this.aiSummaryHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(this.aiSummary));
        this.aiLoading = false;
      },
      error: () => {
        this.aiSummary = 'Sorry, could not load AI summary.';
        this.aiSummaryHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(this.aiSummary));
        this.aiLoading = false;
      }
    });
  }

  // Minimal Markdown renderer for headings, emphasis, lists, links, code
  private markdownToHtml(src: string): string {
    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Code fences
    const fences: string[] = [];
    src = src.replace(/```([\s\S]*?)```/g, (_m, code) => {
      const idx = fences.push(`<pre class=\"md-code\"><code>${escapeHtml(code)}</code></pre>`) - 1;
      return `[[CODE_BLOCK_${idx}]]`;
    });

    let out = escapeHtml(src);

    // Headings
    out = out.replace(/^###\s+(.*)$/gm, '<h4>$1</h4>');
    out = out.replace(/^##\s+(.*)$/gm, '<h4>$1</h4>');
    out = out.replace(/^#\s+(.*)$/gm, '<h4>$1</h4>');

    // Bold/italics
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|\W)\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');

    // Links
    out = out.replace(/(https?:\/\/[^\s)]+)(?![^<]*>|[^<>]*<\/(?:a|code|pre)>)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>');

    // Lists
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
