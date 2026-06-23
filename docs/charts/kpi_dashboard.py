"""
KPI Dashboard — 5 KPI cards + type + status breakdown
English labels, ShahrAra theme colors
"""

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ── Theme ──────────────────────────────────────────────
PRIMARY_BLUE = "#4A7CF7"
ACCENT_GREEN = "#10B981"
ACCENT_RED = "#f87171"
ACCENT_AMBER = "#F59E0B"
ACCENT_PURPLE = "#8B5CF6"
BG_CARD = "#F8FAFC"
TEXT_DARK = "#1E293B"
TEXT_MUTED = "#64748B"

# ── Layout ─────────────────────────────────────────────
fig = plt.figure(figsize=(16, 8))
fig = plt.figure(figsize=(16, 8))
fig.patch.set_facecolor(BG_CARD)

# GridSpec for flexible placement
gs = fig.add_gridspec(2, 6, hspace=0.35, wspace=0.3, height_ratios=[1, 1.5])

# ── Row 0: 5 KPI Cards ────────────────────────────────
kpi_data = [
    ("Total Requests", "61", PRIMARY_BLUE),
    ("Resolved", "10", ACCENT_GREEN),
    ("Resolution Rate", "16%", ACCENT_AMBER),
    ("Total Likes", "1,686", ACCENT_RED),
    ("Registered Users", "4", ACCENT_PURPLE),
]

for i, (label, value, color) in enumerate(kpi_data):
    ax = fig.add_subplot(gs[0, i])
    ax.set_facecolor("white")
    for spine in ax.spines.values():
        spine.set_color("#E2E8F0")
        spine.set_linewidth(0.8)

    # Background card
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_xticks([])
    ax.set_yticks([])

    # Value
    ax.text(
        0.5,
        0.62,
        value,
        ha="center",
        va="center",
        fontsize=26,
        fontweight="bold",
        color=color,
    )
    # Label
    ax.text(
        0.5,
        0.25,
        label,
        ha="center",
        va="center",
        fontsize=9,
        fontweight="bold",
        color=TEXT_MUTED,
    )
    # Thin color bar at top
    ax.axhline(y=0.92, xmin=0.1, xmax=0.9, linewidth=3, color=color)

# ── Row 1, Col 0-2: Type Breakdown (Problems vs Ideas) ─
ax_type = fig.add_subplot(gs[1, 0:2])
ax_type.set_facecolor("white")
for spine in ax_type.spines.values():
    spine.set_color("#E2E8F0")
    spine.set_linewidth(0.8)

categories = ["Problems", "Ideas"]
values = [38, 23]
bar_colors = [ACCENT_RED, ACCENT_GREEN]

bars = ax_type.bar(
    categories,
    values,
    width=0.4,
    color=bar_colors,
    edgecolor="white",
    linewidth=1.2,
    alpha=0.9,
)

for bar, val in zip(bars, values):
    ax_type.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 1,
        str(val),
        ha="center",
        va="bottom",
        fontsize=13,
        fontweight="bold",
        color=TEXT_DARK,
    )

# Pie inset: 38 problems, 23 ideas
inset = ax_type.inset_axes([0.65, 0.45, 0.3, 0.5])
pie_colors = [ACCENT_RED, ACCENT_GREEN]
wedges, texts, autotexts = inset.pie(
    [38, 23],
    labels=None,
    autopct="%1.0f%%",
    colors=pie_colors,
    startangle=90,
    wedgeprops={"edgecolor": "white", "linewidth": 1.2},
)
for t in autotexts:
    t.set_fontsize(7)
    t.set_fontweight("bold")
    t.set_color("white")

ax_type.set_title(
    "Request Type Distribution", fontsize=10, fontweight="bold", color=TEXT_DARK, pad=8
)
ax_type.set_ylabel("Count", fontsize=8.5, color=TEXT_MUTED)
ax_type.spines["top"].set_visible(False)
ax_type.spines["right"].set_visible(False)
ax_type.tick_params(colors=TEXT_MUTED, labelsize=8.5)

# ── Row 1, Col 2-4: Status Breakdown ───────────────────
ax_status = fig.add_subplot(gs[1, 2:5])
ax_status.set_facecolor("white")
for spine in ax_status.spines.values():
    spine.set_color("#E2E8F0")
    spine.set_linewidth(0.8)

status_labels = ["Submitted", "Under\nReview", "In\nProgress", "Resolved", "Archived"]
status_values = [15, 12, 18, 10, 6]
status_colors = ["#94A3B8", ACCENT_AMBER, PRIMARY_BLUE, ACCENT_GREEN, ACCENT_RED]

bars = ax_status.bar(
    status_labels,
    status_values,
    width=0.5,
    color=status_colors,
    edgecolor="white",
    linewidth=1.2,
    alpha=0.9,
)

for bar, val in zip(bars, status_values):
    ax_status.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 0.5,
        str(val),
        ha="center",
        va="bottom",
        fontsize=11,
        fontweight="bold",
        color=TEXT_DARK,
    )

ax_status.set_title(
    "Request Status Breakdown", fontsize=10, fontweight="bold", color=TEXT_DARK, pad=8
)
ax_status.set_ylabel("Count", fontsize=8.5, color=TEXT_MUTED)
ax_status.spines["top"].set_visible(False)
ax_status.spines["right"].set_visible(False)
ax_status.tick_params(colors=TEXT_MUTED, labelsize=8)

# ── Rightmost cell (col 5): Summary note ───────────────
ax_note = fig.add_subplot(gs[1, 5])
ax_note.set_facecolor("white")
ax_note.set_xlim(0, 1)
ax_note.set_ylim(0, 1)
ax_note.set_xticks([])
ax_note.set_yticks([])
for spine in ax_note.spines.values():
    spine.set_color("#E2E8F0")
    spine.set_linewidth(0.8)

summary_lines = [
    "ShahrAra KPIs",
    "",
    "[*] 61 Total Requests",
    "[+] 10 Resolved (16%)",
    "[~] 1,686 Total Likes",
    "[o] 4 Registered Users",
    "",
    "Avg likes/request: 28",
    "Problems dominate: 62%",
    "",
    "Data: Jun 12-23, 2025",
    "3 Sprints - 11 Commits",
]
for i, line in enumerate(summary_lines):
    c = TEXT_DARK if i == 0 else TEXT_MUTED
    fw = "bold" if i == 0 else "normal"
    fs = 9 if i == 0 else 7.5
    ax_note.text(
        0.08,
        0.96 - i * 0.065,
        line,
        ha="left",
        va="top",
        fontsize=fs,
        fontweight=fw,
        color=c,
    )

# ── Main Title ─────────────────────────────────────────
fig.suptitle(
    "ShahrAra — Performance Dashboard",
    fontsize=15,
    fontweight="bold",
    color=TEXT_DARK,
    y=0.98,
)

plt.savefig(
    "/Users/amir/Desktop/ShahrAra/docs/charts/kpi_dashboard.png",
    dpi=200,
    bbox_inches="tight",
    facecolor=BG_CARD,
)
plt.close()
print("✅ kpi_dashboard.png — English labels")
