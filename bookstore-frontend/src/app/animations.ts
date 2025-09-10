import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Set a default style for the container
    style({ position: 'relative' }),

    // Set styles for both the entering and leaving components
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      })
    ], { optional: true }),

    // Set the initial state for the new component
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.98)' })
    ], { optional: true }),

    // Animate both components at the same time
    group([
      // Animate the old component out
      query(':leave', [
        animate('250ms ease-out', style({ opacity: 0, transform: 'scale(1.02)' }))
      ], { optional: true }),

      // Animate the new component in
      query(':enter', [
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ], { optional: true }),
    ])
  ])
]);