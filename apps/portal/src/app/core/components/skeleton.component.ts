import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'viajes-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [class]="'skeleton--' + variant()" [style.height]="height()" [style.width]="width()">
      <div class="skeleton__shimmer"></div>
    </div>
  `,
  styles: [`
    .skeleton {
      position: relative;
      background: var(--viajes-line);
      border-radius: var(--viajes-radius-md);
      overflow: hidden;
      isolation: isolate;
    }

    .skeleton__shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.35) 50%,
        transparent 100%
      );
      animation: shimmer 1.8s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .skeleton--text {
      height: 14px;
      width: 100%;
      border-radius: 4px;
    }

    .skeleton--title {
      height: 24px;
      width: 60%;
      border-radius: 6px;
    }

    .skeleton--avatar {
      height: 48px;
      width: 48px;
      border-radius: 50%;
    }

    .skeleton--card {
      height: 320px;
      width: 100%;
    }

    .skeleton--badge {
      height: 22px;
      width: 80px;
      border-radius: 999px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  readonly variant = input<'text' | 'title' | 'avatar' | 'card' | 'badge'>('text');
  readonly height = input<string>('');
  readonly width = input<string>('');
}
