import "./vendor/tokens.css";
import iconUrl from "./assets/sss-icon.png";
import logoUrl from "./assets/sss-logo-white.svg?url";
import type { EpicView, StatusFeed, WorkStatus } from "./feed-types";
import "./styles.css";

const LIVE_FEED =
  "https://raw.githubusercontent.com/hyperwebnewy/sss-freight-status-feed/main/status.json";
const FALLBACK_FEED = `${import.meta.env.BASE_URL}status.json`;
const REFRESH_MS = 30_000;

interface DeliveryPhase {
  name: string;
  shortName: string;
  start: string;
  due: string;
  hours: number;
  epics: number[];
  commercialOnly?: boolean;
}

const deliveryPhases: DeliveryPhase[] = [
  {
    name: "Foundation, Master Data and Rates",
    shortName: "Phase 1",
    start: "2026-06-15",
    due: "2026-07-10",
    hours: 120,
    epics: [1, 2, 3],
  },
  {
    name: "Jobs, Legs and Daysheet",
    shortName: "Phase 2",
    start: "2026-07-06",
    due: "2026-08-21",
    hours: 160,
    epics: [4, 5],
  },
  {
    name: "Driver Mobile, Offline, OCR and Conflict Workflow",
    shortName: "Phase 3",
    start: "2026-08-17",
    due: "2026-10-16",
    hours: 280,
    epics: [6, 7, 8],
  },
  {
    name: "Invoicing and Xero",
    shortName: "Phase 4",
    start: "2026-10-12",
    due: "2026-11-20",
    hours: 120,
    epics: [9],
  },
  {
    name: "RCTI / Bills Support",
    shortName: "Phase 4 Extension",
    start: "2026-11-16",
    due: "2026-11-27",
    hours: 40,
    epics: [],
    commercialOnly: true,
  },
  {
    name: "Fuel Surcharge Calculator",
    shortName: "Phase 4 Add-On",
    start: "2026-10-12",
    due: "2026-11-20",
    hours: 40,
    epics: [11],
  },
  {
    name: "Reports, Archive and UAT to Go-live",
    shortName: "Phase 5",
    start: "2026-11-23",
    due: "2027-01-01",
    hours: 120,
    epics: [10, 12],
  },
];

const appElement = document.querySelector<HTMLDivElement>("#app");
const faviconElement = document.querySelector<HTMLLinkElement>("#favicon");
if (!appElement || !faviconElement) {
  throw new Error("Status board shell is missing");
}
const app = appElement;
const favicon = faviconElement;
favicon.href = iconUrl;

let lastFeed: StatusFeed | undefined;
let activeTab: "engineering" | "delivery" = "engineering";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function label(status: string): string {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date(`${value}T00:00:00+10:00`));
}

function chip(status: string): string {
  return `<span class="status-chip status-${escapeHtml(status)}">${escapeHtml(label(status))}</span>`;
}

function storyRows(epic: EpicView): string {
  return epic.stories
    .map(
      (story) => `
        <li class="story-row">
          <span class="story-number">${escapeHtml(story.key.split("-", 2).join("."))}</span>
          <span class="story-title">${escapeHtml(story.title)}</span>
          ${chip(story.status)}
        </li>`,
    )
    .join("");
}

function epicCards(feed: StatusFeed): string {
  return feed.epics
    .map((epic) => {
      const progress =
        epic.total === 0 ? 0 : Math.round((epic.done / epic.total) * 100);
      const isCurrent = epic.number === feed.kpis.currentEpic;
      return `
        <details class="epic-card${isCurrent ? " current" : ""}" ${isCurrent ? "open" : ""}>
          <summary>
            <span class="epic-index">EPIC ${epic.number.toString().padStart(2, "0")}</span>
            <span class="epic-heading">
              <strong>${escapeHtml(epic.title)}</strong>
              <span>${epic.done}/${epic.total} stories done</span>
            </span>
            ${chip(epic.status)}
            <span class="chevron" aria-hidden="true"></span>
          </summary>
          <div class="progress-track" aria-label="${progress}% complete">
            <span style="width: ${progress}%"></span>
          </div>
          <ul class="story-list">${storyRows(epic)}</ul>
          ${
            epic.retrospective
              ? `<div class="retro-row"><span>Retrospective</span>${chip(epic.retrospective)}</div>`
              : ""
          }
        </details>`;
    })
    .join("");
}

function phaseProgress(
  phase: DeliveryPhase,
  epics: EpicView[],
): { done: number; total: number; percent: number } {
  const mapped = epics.filter((epic) => phase.epics.includes(epic.number));
  const done = mapped.reduce((sum, epic) => sum + epic.done, 0);
  const total = mapped.reduce((sum, epic) => sum + epic.total, 0);
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function deliveryCards(feed: StatusFeed): string {
  return deliveryPhases
    .map((phase) => {
      const progress = phaseProgress(phase, feed.epics);
      return `
        <article class="phase-card">
          <div class="phase-topline">
            <span class="phase-label">${escapeHtml(phase.shortName)}</span>
            ${
              phase.commercialOnly
                ? '<span class="commercial-only">Commercial only</span>'
                : `<span class="phase-percent">${progress.percent}% engineering</span>`
            }
          </div>
          <h3>${escapeHtml(phase.name)}</h3>
          <div class="phase-meta">
            <span>${formatDate(phase.start)} – ${formatDate(phase.due)}</span>
            <span>${phase.hours} hours</span>
          </div>
          ${
            phase.commercialOnly
              ? '<p class="phase-note">Outside the v1 engineering board.</p>'
              : `
                <div class="progress-track">
                  <span style="width: ${progress.percent}%"></span>
                </div>
                <p class="phase-note">${progress.done}/${progress.total} mapped stories done · Epics ${phase.epics.join(", ")}</p>
              `
          }
        </article>`;
    })
    .join("");
}

function actionItems(feed: StatusFeed): string {
  if (feed.openActionItems.length === 0) return "";
  return `
    <section class="action-panel" aria-labelledby="action-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">FOLLOW-UP</p>
          <h2 id="action-title">Open action items</h2>
        </div>
      </div>
      <ul>
        ${feed.openActionItems
          .map(
            (item) => `
              <li>
                <span>${escapeHtml(item.action)}</span>
                <small>Epic ${item.epic} · ${escapeHtml(item.owner)}</small>
              </li>`,
          )
          .join("")}
      </ul>
    </section>`;
}

function render(feed: StatusFeed, stale = false): void {
  lastFeed = feed;
  app.innerHTML = `
    <header class="topnav">
      <div class="topnav-inner">
        <img src="${logoUrl}" alt="SSS Group" />
        <div class="header-copy">
          <span>SSS Freight</span>
          <strong>Project Status</strong>
        </div>
        <div class="header-date">
          <span>SPRINT UPDATED</span>
          <strong>${formatDate(feed.lastUpdated)}</strong>
        </div>
      </div>
    </header>

    <main>
      <div class="page-intro">
        <div>
          <p class="eyebrow">BUILD OVERVIEW</p>
          <h1>Freight build at a glance</h1>
          <p>Live engineering progress from the BMAD sprint file.</p>
        </div>
        <div class="feed-state ${stale ? "is-stale" : ""}">
          <span class="feed-dot"></span>
          ${stale ? "Live feed unavailable · showing last update" : "Live from sprint-status.yaml"}
        </div>
      </div>

      <nav class="tabs" aria-label="Status views">
        <button type="button" data-tab="engineering" class="${activeTab === "engineering" ? "active" : ""}">Engineering</button>
        <button type="button" data-tab="delivery" class="${activeTab === "delivery" ? "active" : ""}">Delivery plan</button>
      </nav>

      <section id="engineering" class="tab-panel ${activeTab === "engineering" ? "active" : ""}">
        <div class="kpi-grid">
          <article><span>STORIES DONE</span><strong>${feed.kpis.overallPercent}%</strong><small>${feed.epics.reduce((sum, epic) => sum + epic.done, 0)} of ${feed.epics.reduce((sum, epic) => sum + epic.total, 0)}</small></article>
          <article><span>EPICS DONE</span><strong>${feed.kpis.epicsDone}<i>/${feed.kpis.epicTotal}</i></strong><small>Programme total</small></article>
          <article><span>IN REVIEW</span><strong>${feed.kpis.storiesInReview}</strong><small>Awaiting close-out</small></article>
          <article><span>OPEN ACTIONS</span><strong>${feed.kpis.openActionItems}</strong><small>Retro follow-up</small></article>
          <article class="brand-kpi"><span>CURRENT EPIC</span><strong>${feed.kpis.currentEpic.toString().padStart(2, "0")}</strong><small>${escapeHtml(feed.epics.find((epic) => epic.number === feed.kpis.currentEpic)?.title ?? "")}</small></article>
        </div>

        <section class="focus-card" aria-labelledby="focus-title">
          <div>
            <p class="eyebrow">CURRENT FOCUS</p>
            <h2 id="focus-title">${escapeHtml(feed.currentFocus.storyTitle)}</h2>
            <p>${escapeHtml(feed.currentFocus.summary)}</p>
          </div>
          <div class="focus-status">
            <span>Story ${escapeHtml(feed.currentFocus.storyKey.split("-", 2).join("."))}</span>
            ${chip(feed.currentFocus.status)}
          </div>
        </section>

        ${actionItems(feed)}

        <section aria-labelledby="epics-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">ENGINEERING ROADMAP</p>
              <h2 id="epics-title">Epics and stories</h2>
            </div>
            <p>Select an epic to view its stories.</p>
          </div>
          <div class="epic-grid">${epicCards(feed)}</div>
        </section>
      </section>

      <section id="delivery" class="tab-panel ${activeTab === "delivery" ? "active" : ""}">
        <div class="delivery-intro">
          <div>
            <p class="eyebrow">COMMERCIAL SCHEDULE</p>
            <h2>Delivery plan</h2>
          </div>
          <p>Schedule snapshot from SSS Hub · 20 Jul 2026. Engineering progress comes from the live sprint feed. Commercial investment is intentionally hidden.</p>
        </div>
        <div class="phase-grid">${deliveryCards(feed)}</div>
      </section>
    </main>

    <footer>
      <span>Reads sprint-status.yaml · not a substitute for the product app</span>
      <span>Feed published ${new Intl.DateTimeFormat("en-AU", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Australia/Sydney",
      }).format(new Date(feed.publishedAt))}</span>
    </footer>
  `;

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-tab]")) {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab === "delivery" ? "delivery" : "engineering";
      render(feed, stale);
    });
  }
}

async function fetchFeed(url: string): Promise<StatusFeed> {
  const response = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Status feed returned ${response.status}`);
  return (await response.json()) as StatusFeed;
}

async function refresh(initial = false): Promise<void> {
  try {
    const feed = await fetchFeed(LIVE_FEED);
    if (!lastFeed || feed.publishedAt !== lastFeed.publishedAt) render(feed);
  } catch {
    if (!lastFeed && initial) {
      try {
        render(await fetchFeed(FALLBACK_FEED), true);
        return;
      } catch {
        app.innerHTML =
          '<div class="fatal"><strong>Status unavailable</strong><p>The status feed could not be loaded. Refresh the page to try again.</p></div>';
        return;
      }
    }
    if (lastFeed) render(lastFeed, true);
  }
}

void refresh(true);
window.setInterval(() => void refresh(), REFRESH_MS);
