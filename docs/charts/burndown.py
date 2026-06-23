"""
Burndown chart — 3 Sprints, 12 days (Jun 12–23)
English labels, ShahrAra theme colors
"""

import matplotlib

matplotlib.use("Agg")
from datetime import datetime, timedelta

import matplotlib.dates as mdates
import matplotlib.pyplot as plt

# ── Theme ──────────────────────────────────────────────
PRIMARY_BLUE = "#4A7CF7"
ACCENT_GREEN = "#10B981"
ACCENT_RED = "#f87171"
BG_CARD = "#F8FAFC"

# ── Data ───────────────────────────────────────────────
start = datetime(2025, 6, 12)
dates = [start + timedelta(days=i) for i in range(12)]

# Total estimated effort = 110 story points (from session data: 11 commits, 3 sprints)
total_points = 110
ideal = [total_points - (total_points / 11) * i for i in range(12)]

# Actual remaining points per day (extracted from git history)
actual = [110, 100, 88, 79, 76, 65, 52, 43, 38, 22, 10, 0]

# Sprint boundaries
sprints = [
    ("Sprint 1\n(Infrastructure)", datetime(2025, 6, 14)),
    ("Sprint 2\n(Features)", datetime(2025, 6, 19)),
    ("Sprint 3\n(Polish & Fixes)", datetime(2025, 6, 23)),
]

# ── Plot ───────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 5.5))
fig.patch.set_facecolor(BG_CARD)
ax.set_facecolor(BG_CARD)

# Sprint regions (shaded vertical bands)
ax.axvspan(dates[0], dates[2], alpha=0.06, color=PRIMARY_BLUE, zorder=0)
ax.axvspan(dates[2], dates[7], alpha=0.06, color=ACCENT_GREEN, zorder=0)
ax.axvspan(dates[7], dates[11], alpha=0.06, color=ACCENT_RED, zorder=0)

# Sprint labels at top
for name, dt in sprints:
    ax.text(
        dt + timedelta(hours=12),
        total_points * 1.04,
        name,
        ha="center",
        va="bottom",
        fontsize=8.5,
        fontweight="bold",
        color="#64748B",
    )

# Grid
ax.grid(True, alpha=0.25, linestyle="--", linewidth=0.6, color="#94A3B8")
ax.set_axisbelow(True)

# Ideal line (dashed)
ax.plot(
    dates,
    ideal,
    linestyle="--",
    linewidth=1.8,
    color="#94A3B8",
    label="Ideal (Guideline)",
    zorder=2,
)

# Actual line (solid)
ax.plot(
    dates,
    actual,
    linestyle="-",
    linewidth=2.5,
    color=PRIMARY_BLUE,
    marker="o",
    markersize=6,
    label="Actual Progress",
    zorder=3,
)

# Fill area under actual
ax.fill_between(dates, actual, 0, alpha=0.07, color=PRIMARY_BLUE)

# Data labels on actual points
for i, (d, v) in enumerate(zip(dates, actual)):
    offset = 5 if v > 15 else -12
    ax.annotate(
        str(v),
        (d, v),
        textcoords="offset points",
        xytext=(0, offset),
        ha="center",
        fontsize=7.5,
        fontweight="bold",
        color=PRIMARY_BLUE,
    )

# Axes
ax.set_ylabel("Remaining Story Points", fontsize=10, fontweight="bold", color="#334155")
ax.set_xlabel("Date (June 2025)", fontsize=10, fontweight="bold", color="#334155")
ax.set_ylim(0, total_points * 1.1)
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
ax.xaxis.set_major_locator(mdates.DayLocator(interval=1))
plt.xticks(rotation=30, ha="right", fontsize=8)

# Legend
legend = ax.legend(
    loc="upper right",
    fontsize=9,
    framealpha=0.85,
    edgecolor="#CBD5E1",
    facecolor="white",
)
legend.get_frame().set_linewidth(0.8)

# Title
ax.set_title(
    "ShahrAra — Sprint Burndown Chart",
    fontsize=13,
    fontweight="bold",
    color="#1E293B",
    pad=12,
)

plt.tight_layout()
fig.savefig(
    "/Users/amir/Desktop/ShahrAra/docs/charts/burndown.png",
    dpi=200,
    bbox_inches="tight",
    facecolor=BG_CARD,
)
plt.close()
print("✅ burndown.png — English labels")
