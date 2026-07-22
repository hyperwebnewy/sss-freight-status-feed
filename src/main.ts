import "./vendor/tokens.css";
import iconUrl from "./assets/sss-icon.png";
import logoUrl from "./assets/sss-logo-white.svg?url";
import { featureNames, sectionNames } from "./client-copy";
import type { EpicView, StatusFeed } from "./feed-types";
import "./styles.css";

const LIVE_FEED =
  "https://raw.githubusercontent.com/hyperwebnewy/sss-freight-status-feed/main/status.json";
const FALLBACK_FEED = `${import.meta.env.BASE_URL}status.json`;
const REFRESH_MS = 30_000;
const LIVE_NOTE = "This page updates live every 1 hour as we progress";

interface DeliveryPhase {
  name: string;
  shortName: string;
  delivers: string;
  notInThisBuild?: boolean;
}

// Phase names are kept word for word from the agreed delivery plan. The "delivers"
// line is the plain-English explanation of what each one gives you.
const deliveryPhases: DeliveryPhase[] = [
  {
    name: "Foundation, Master Data and Rates",
    shortName: "Phase 1",
    delivers:
      "Sign-in for your team, the client, product and vehicle lists everything else hangs off, and the rate cards that price the work.",
  },
  {
    name: "Jobs, Legs and Daysheet",
    shortName: "Phase 2",
    delivers:
      "Booking jobs and the legs that make them up, and the day sheet the office runs the yard from.",
  },
  {
    name: "Driver Mobile, Offline, OCR and Conflict Workflow",
    shortName: "Phase 3",
    delivers:
      "The driver app. It keeps working with no signal, reads dockets from a photo, and sorts out clashes when two people change the same job.",
  },
  {
    name: "Invoicing and Xero",
    shortName: "Phase 4",
    delivers: "Turns finished work into invoices and sends them straight through to Xero.",
  },
  {
    name: "RCTI / Bills Support",
    shortName: "Phase 4 Extension",
    delivers: "Paying subcontractors from the same records.",
    notInThisBuild: true,
  },
  {
    name: "Fuel Surcharge Calculator",
    shortName: "Phase 4 Add-On",
    delivers:
      "Works out the monthly fuel surcharge and puts it on the invoice as its own line, so it is easy to check.",
  },
  {
    name: "Reports, Archive and UAT to Go-live",
    shortName: "Phase 5",
    delivers:
      "The reports you asked for, tidying finished records out of the way, and the final round of checks before you go live.",
  },
];

const statusWording: Record<string, string> = {
  backlog: "Not started",
  "ready-for-dev": "Planned",
  "in-progress": "Building",
  review: "Checking",
  done: "Done",
};

const appElement = document.querySelector<HTMLDivElement>("#app");
const faviconElement = document.querySelector<HTMLLinkElement>("#favicon");
if (!appElement || !faviconElement) {
  throw new Error("Status page shell is missing");
}
const app = appElement;
const favicon = faviconElement;
favicon.href = iconUrl;

let lastFeed: StatusFeed | undefined;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Header and footer both read publishedAt, so the two dates can never disagree.
// The feed also carries lastUpdated, the date written in the sprint file, which
// lags the publish and is not shown.
function formatPublished(value: string, withTime: boolean): string {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    ...(withTime ? ({ timeStyle: "short" } as const) : {}),
    timeZone: "Australia/Sydney",
  }).format(new Date(value));
}

function chip(status: string): string {
  const wording = statusWording[status] ?? status;
  return `<span class="status-chip status-${escapeHtml(status)}">${escapeHtml(wording)}</span>`;
}

// The published feed still calls these epics and stories. That is the data contract
// the generator writes, so it stays; only the wording on screen changes.
function featureRows(section: EpicView): string {
  return section.stories
    .map(
      (feature) => `
        <li class="feature-row">
          <span class="feature-title">${escapeHtml(featureNames[feature.key] ?? feature.title)}</span>
          ${chip(feature.status)}
        </li>`,
    )
    .join("");
}

function sectionCards(feed: StatusFeed): string {
  return feed.epics
    .map((section) => {
      const isCurrent = section.number === feed.kpis.currentEpic;
      return `
        <details class="section-card${isCurrent ? " current" : ""}" ${isCurrent ? "open" : ""}>
          <summary>
            <span class="section-index">SECTION ${section.number.toString().padStart(2, "0")}</span>
            <span class="section-heading">
              <strong>${escapeHtml(sectionNames[section.number] ?? section.title)}</strong>
              <span>${section.done} of ${section.total} features done</span>
            </span>
            ${chip(section.status)}
            <span class="chevron" aria-hidden="true"></span>
          </summary>
          <ul class="feature-list">${featureRows(section)}</ul>
        </details>`;
    })
    .join("");
}

function deliveryCards(): string {
  return deliveryPhases
    .map(
      (phase) => `
        <article class="phase-card">
          <div class="phase-topline">
            <span class="phase-label">${escapeHtml(phase.shortName)}</span>
            ${phase.notInThisBuild ? '<span class="not-in-build">Not part of this build</span>' : ""}
          </div>
          <h3>${escapeHtml(phase.name)}</h3>
          <p class="phase-delivers">${escapeHtml(phase.delivers)}</p>
        </article>`,
    )
    .join("");
}

function render(feed: StatusFeed, stale = false): void {
  lastFeed = feed;
  const featuresDone = feed.epics.reduce((sum, section) => sum + section.done, 0);
  const featuresTotal = feed.epics.reduce((sum, section) => sum + section.total, 0);
  const currentSection = feed.epics.find((section) => section.number === feed.kpis.currentEpic);

  app.innerHTML = `
    <header class="topnav">
      <div class="topnav-inner">
        <img src="${logoUrl}" alt="SSS Group" />
        <div class="header-copy">
          <span>SSS Freight</span>
          <strong>Project Status</strong>
        </div>
        <div class="header-date">
          <span>LAST UPDATED</span>
          <strong>${formatPublished(feed.publishedAt, false)}</strong>
        </div>
      </div>
    </header>

    <main>
      <p class="live-note${stale ? " is-stale" : ""}">
        <span class="live-dot"></span>
        ${stale ? "Showing the last update we published" : LIVE_NOTE}
      </p>

      <div class="kpi-grid">
        <article>
          <span>FEATURES DONE</span>
          <strong>${featuresDone}<i>/${featuresTotal}</i></strong>
        </article>
        <article>
          <span>SECTIONS DONE</span>
          <strong>${feed.kpis.epicsDone}<i>/${feed.kpis.epicTotal}</i></strong>
        </article>
        <article class="brand-kpi">
          <span>CURRENTLY BUILDING</span>
          <strong>${escapeHtml(
            currentSection ? (sectionNames[currentSection.number] ?? currentSection.title) : "",
          )}</strong>
        </article>
      </div>

      <section aria-labelledby="plan-title">
        <div class="section-heading-row">
          <h2 id="plan-title">Delivery plan</h2>
        </div>
        <div class="phase-grid">${deliveryCards()}</div>
      </section>

      <details class="detail-block">
        <summary>
          <span>Detailed progress</span>
          <span class="chevron" aria-hidden="true"></span>
        </summary>
        <p class="detail-intro">Open a section to see what is inside it.</p>
        <div class="section-grid">${sectionCards(feed)}</div>
      </details>
    </main>

    <footer>
      <span>Last updated ${formatPublished(feed.publishedAt, true)}</span>
    </footer>
  `;
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
          '<div class="fatal"><strong>Status unavailable</strong><p>We could not load the latest status. Refresh the page to try again.</p></div>';
        return;
      }
    }
    if (lastFeed) render(lastFeed, true);
  }
}

void refresh(true);
window.setInterval(() => void refresh(), REFRESH_MS);
