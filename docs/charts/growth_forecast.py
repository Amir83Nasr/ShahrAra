"""
User Growth Forecast — 4 months: Launch → 150 users
English labels, ShahrAra theme colors
"""

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

# ── Theme ──────────────────────────────────────────────
PRIMARY_BLUE = "#4A7CF7"
ACCENT_GREEN = "#10B981"
BG_CARD = "#F8FAFC"
TEXT_DARK = "#1E293B"
TEXT_MUTED = "#64748B"

# ── Data ───────────────────────────────────────────────
months = [
    "Month 1\n(Launch)",
    "Month 2\n(Growth)",
    "Month 3\n(Scale)",
    "Month 4\n(Target)",
]
users = [4, 60, 100, 150]
colors = [PRIMARY_BLUE, PRIMARY_BLUE, PRIMARY_BLUE, ACCENT_GREEN]

x = np.arange(len(months))
# Trend line (quadratic fit — realistic S-curve start)
z = np.polyfit(x, users, 2)
p = np.poly1d(z)
x_smooth = np.linspace(0, 3, 100)

# ── Plot ───────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5))
fig.patch.set_facecolor(BG_CARD)
ax.set_facecolor(BG_CARD)

# Bars
bars = ax.bar(
    x,
    users,
    width=0.5,
    color=colors,
    edgecolor="white",
    linewidth=1.2,
    zorder=3,
    alpha=0.92,
)

# Trend curve
ax.plot(
    x_smooth,
    p(x_smooth),
    linestyle="--",
    linewidth=1.8,
    color="#F59E0B",
    label="Growth Trend (Forecast)",
    zorder=2,
)

# Value labels on bars
for bar, val in zip(bars, users):
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 3,
        str(val),
        ha="center",
        va="bottom",
        fontsize=12,
        fontweight="bold",
        color=TEXT_DARK,
    )

# Axes
ax.set_ylabel("Registered Users", fontsize=10, fontweight="bold", color=TEXT_MUTED)
ax.set_xticks(x)
ax.set_xticklabels(months, fontsize=8.5, fontweight="bold", color=TEXT_MUTED)
ax.set_ylim(0, 180)

# Grid
ax.yaxis.grid(True, alpha=0.2, linestyle="--", linewidth=0.6, color="#94A3B8")
ax.set_axisbelow(True)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.spines["left"].set_color("#CBD5E1")
ax.spines["bottom"].set_color("#CBD5E1")
ax.tick_params(axis="y", colors=TEXT_MUTED, labelsize=9)

# Legend
legend = ax.legend(
    loc="upper left",
    fontsize=8.5,
    framealpha=0.85,
    edgecolor="#CBD5E1",
    facecolor="white",
)
legend.get_frame().set_linewidth(0.8)

# Title
ax.set_title(
    "ShahrAra — User Growth Forecast",
    fontsize=13,
    fontweight="bold",
    color=TEXT_DARK,
    pad=12,
)

# Annotations
ax.annotate(
    "4 real users\n(Jun 2025)",
    xy=(0, 4),
    xytext=(0.3, 35),
    arrowprops=dict(arrowstyle="->", color="#94A3B8", lw=1.2),
    fontsize=7.5,
    color=TEXT_MUTED,
    fontweight="bold",
)
ax.annotate(
    "150 target\nby month 4",
    xy=(3, 150),
    xytext=(2.2, 160),
    arrowprops=dict(arrowstyle="->", color=ACCENT_GREEN, lw=1.2),
    fontsize=7.5,
    color=ACCENT_GREEN,
    fontweight="bold",
)

plt.tight_layout()
fig.savefig(
    "/Users/amir/Desktop/ShahrAra/docs/charts/growth_forecast.png",
    dpi=200,
    bbox_inches="tight",
    facecolor=BG_CARD,
)
plt.close()
print("✅ growth_forecast.png — English labels")
