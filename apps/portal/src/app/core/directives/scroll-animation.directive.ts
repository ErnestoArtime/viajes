import { AfterViewInit, Directive, ElementRef, inject, input, NgZone, output } from '@angular/core';

export type AnimationVariant = 'fade-in-up' | 'fade-in' | 'fade-in-left' | 'fade-in-right' | 'scale-in';

@Directive({
  selector: '[viajesScrollAnim]',
  standalone: true,
  host: {
    '[style.opacity]': 'hasAnimated ? "1" : "0"',
    '[style.transform]': 'transformStyle',
    '[style.transition]': '"opacity 0.6s ease-out, transform 0.6s ease-out"',
    '[style.transition-delay]': 'delay() + "ms"'
  }
})
export class ScrollAnimationDirective implements AfterViewInit {
  private readonly el = inject(ElementRef);
  private readonly ngZone = inject(NgZone);

  readonly viajesScrollAnim = input<AnimationVariant>('fade-in-up');
  readonly delay = input(0);
  readonly threshold = input(0.15);
  readonly animated = output<void>();

  protected hasAnimated = false;
  protected transformStyle = '';

  private readonly variants: Record<AnimationVariant, string> = {
    'fade-in-up': 'translateY(24px)',
    'fade-in': 'none',
    'fade-in-left': 'translateX(-24px)',
    'fade-in-right': 'translateX(24px)',
    'scale-in': 'scale(0.92)'
  };

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.hasAnimated = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.ngZone.run(() => {
            this.hasAnimated = true;
            this.animated.emit();
          });
          observer.disconnect();
        }
      },
      { threshold: this.threshold() }
    );

    observer.observe(this.el.nativeElement);
  }

  ngOnInit(): void {
    const variant = this.viajesScrollAnim();
    this.transformStyle = this.variants[variant] ?? this.variants['fade-in-up'];
  }
}
