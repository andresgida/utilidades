import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TitleService {
  readonly pageTitle    = signal('Utilidades');
  readonly pageBadge    = signal('');
  readonly badgeVariant = signal<'default' | 'success' | 'warning'>('default');

  set(title: string, badge = '', variant: 'default' | 'success' | 'warning' = 'default'): void {
    this.pageTitle.set(title);
    this.pageBadge.set(badge);
    this.badgeVariant.set(variant);
  }

  reset(): void {
    this.pageTitle.set('Utilidades');
    this.pageBadge.set('');
    this.badgeVariant.set('default');
  }
}
