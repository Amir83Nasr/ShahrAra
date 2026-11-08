/**
 * رنگ نوار مرورگر/PWA برای هر تم.
 * این مقادیر باید با `--background` در globals.css یکی باشند:
 * روشن: oklch(0.985 0.004 246) — تاریک: oklch(0.235 0.024 250)
 *
 * هم اسکریپت قبل از hydration در layout و هم همگام‌سازی تم در providers از
 * همین ثابت‌ها استفاده می‌کنند تا رنگ نوار مرورگر هرگز از پس‌زمینه جدا نشود.
 */
export const THEME_COLORS = {
  light: "#f8fafd",
  dark: "#151f29",
} as const;

export type ThemeColorName = keyof typeof THEME_COLORS;

/**
 * اسکریپت همگام که قبل از اولین رندر اجرا می‌شود: کلاس تم و متای theme-color
 * را از localStorage ست می‌کند تا نوار مرورگر از همان ابتدا هم‌رنگ تم باشد.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("shahr_ara_theme");var d=t==="dark";if(t==="dark"||t==="light"){document.documentElement.classList.toggle("dark",d);}var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");document.head.appendChild(m);}m.setAttribute("content",d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}");}catch(e){}})();`;
