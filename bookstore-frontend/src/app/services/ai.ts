import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatRequest {
  messages: AiMessage[];
  bookId?: number;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private baseUrl = 'http://localhost:8080/api/ai';

  constructor(private http: HttpClient) {}

  chat(req: ChatRequest): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.baseUrl}/chat`, req);
  }

  summarizeBook(bookId: number): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.baseUrl}/summarize`, { bookId });
  }

  recommendations(seedBookId?: number, q?: string): Observable<{ recommendations: { bookId: number; reason: string }[] }> {
    const params: any = {};
    if (seedBookId != null) params.seedBookId = seedBookId;
    if (q) params.q = q;
    return this.http.get<{ recommendations: { bookId: number; reason: string }[] }>(`${this.baseUrl}/recommendations`, { params });
  }
}

