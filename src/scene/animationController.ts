export type RouteMode = 'home' | 'fixtures';

class SharedSceneController {
  /** 0..1 continuous GSAP ScrollTrigger progress on Home */
  public scrollProgress = 0;

  /** Active page mode so the persistent Canvas adapts smoothly without remounting */
  public routeMode: RouteMode = 'home';

  /** Normalized pointer coordinates (-1..1) for subtle cursor parallax tilt */
  public pointer = { x: 0, y: 0 };

  /** Stored scroll Y positions per route for clean scroll restoration */
  public savedScrollY: Record<RouteMode, number> = {
    home: 0,
    fixtures: 0,
  };

  /** True when user prefers reduced motion */
  public reducedMotion = false;

  /** Viewport flags evaluated without triggering React re-renders */
  public isMobile = false;

  public setScrollProgress(value: number) {
    this.scrollProgress = Math.max(0, Math.min(1, value));
  }

  public setRouteMode(mode: RouteMode) {
    this.routeMode = mode;
  }

  public setPointer(nx: number, ny: number) {
    this.pointer.x = Math.max(-1, Math.min(1, nx));
    this.pointer.y = Math.max(-1, Math.min(1, ny));
  }
}

export const sceneController = new SharedSceneController();
