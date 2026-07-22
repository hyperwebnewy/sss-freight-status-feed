// Client-facing names for the things the feed calls epics and stories.
//
// The engineering plan keeps its own names, which are precise but mean nothing to
// someone running a freight business. This file is the translation layer, and it is
// the only place that wording lives. Anything without an entry falls back to the
// name in the feed, so a new item shows up rather than disappearing.

export const sectionNames: Record<number, string> = {
  1: "Sign-in and user accounts",
  2: "Your clients, products and vehicles",
  3: "Rates and pricing",
  4: "Jobs and the day sheet",
  5: "Repeat jobs",
  6: "Driver app and offline working",
  7: "Docket photos",
  8: "Problem flags and clashes",
  9: "Invoicing, Xero and load reports",
  10: "Reports",
  11: "Fuel surcharge",
  12: "Getting ready to go live",
};

export const featureNames: Record<string, string> = {
  // Sign-in and user accounts
  "1-1-monorepo-foundation-green-ci": "Project set-up and automatic checks",
  "1-2-design-tokens-package": "Shared look and branding",
  "1-3-supabase-auth-with-phone-identity": "Signing in with a mobile number",
  "1-4-append-only-audit-substrate": "A permanent record of every change",
  "1-5-web-sign-in-app-shell": "Office sign-in and main screen",
  "1-6-user-management-w12": "Adding and removing staff",
  "1-7-system-constants-company-info-w11": "Company details and settings",
  "1-8-driver-sign-in-m1": "Driver sign-in on the phone",
  "1-9-driver-pin-unlock-offline": "PIN unlock that works without signal",

  // Your clients, products and vehicles
  "2-1-w9-entitymanager-clients-with-four-roles": "Client list",
  "2-2-products-units": "Product list and units",
  "2-3-vehicles-with-ownership": "Vehicle list, yours and subcontractors'",
  "2-4-driver-records": "Driver list",
  "2-5-archive-hygiene-duplicate-handling": "Tidying old records and merging duplicates",

  // Rates and pricing
  "3-1-rate-card-model-w9-editor": "Building and editing rate cards",
  "3-2-effective-dating-fy-rollover": "Rate changes by date, and the new financial year",
  "3-3-three-tier-rate-resolver": "Picking the right rate for each job",
  "3-4-snapshot-off-card-domain-contract": "Locking the agreed rate onto the job",
  "3-5-subbie-rate-cards": "Subcontractor rates",
  "3-6-rate-card-csv-export-seed-import-path": "Loading and exporting rates in bulk",

  // Jobs and the day sheet
  "4-1-job-leg-model-with-version-tokens-and-snapshot-enforcement":
    "How jobs and their legs are stored",
  "4-2-status-machine": "Job stages, from booked to done",
  "4-3-job-authoring-w4": "Booking a job",
  "4-4-daysheet-grid-w2": "The day sheet",
  "4-5-live-ingest-kpi-strip": "Live updates as drivers work",
  "4-6-job-detail-w3": "The job detail screen",
  "4-7-find-jobs-archive-w5": "Searching past jobs",

  // Repeat jobs
  "5-1-save-as-template-one-tap-copy": "Saving a job to reuse",
  "5-2-scheduled-morning-generation": "Repeat jobs created each morning",

  // Driver app and offline working
  "6-1-powersync-chaos-spike-epic-entry-gate": "Proving the app copes with no signal",
  "6-2-driver-sync-streams-offline-legs-m2-m3": "Drivers seeing their work offline",
  "6-3-atomic-ingest-rpc": "Saving driver updates safely",
  "6-4-delivery-confirmation-manual-path-m5-m7": "Confirming a delivery by hand",
  "6-5-sync-queue-honest-states-m6": "Showing drivers what has and has not sent",
  "6-6-exactly-once-flush-proof-chaos-hardening": "Making sure nothing is sent twice",
  "6-7-driver-conflict-state-deactivation-grace-m9": "What a driver sees when something clashes",

  // Docket photos
  "7-1-storage-port-7-year-retention": "Keeping dockets for seven years",
  "7-2-camera-capture-photo-gallery-m4": "Taking docket photos",
  "7-3-photo-attachment-sync": "Sending photos up when signal returns",
  "7-4-ocr-pipeline-provider-port": "Reading the docket from the photo",
  "7-5-ocr-prefill-confirm-integrity-m5": "Filling the form in from the photo",
  "7-6-ocr-golden-set-regression-guard-ci": "Checking docket reading stays accurate",

  // Problem flags and clashes
  "8-1-flag-raising-completion-re-evaluation": "Raising a problem on a job",
  "8-2-flag-review-clearing": "Reviewing and clearing problems",
  "8-3-conflict-resolution-w10": "Sorting out clashing changes",

  // Invoicing, Xero and load reports
  "9-1-xero-connection-token-custody": "Connecting to Xero",
  "9-2-invoice-run-selection-w6-w7": "Choosing what to invoice",
  "9-3-deterministic-invoice-construction": "Building the invoice",
  "9-4-posting-pipeline-four-layer-duplicate-defence": "Sending to Xero without duplicates",
  "9-5-invoiced-locking-uninvoice": "Locking invoiced work, and undoing it",
  "9-6-load-report-pdf": "The load report",

  // Reports
  "10-1-six-standing-favourites-w8": "Six ready-made reports",
  "10-2-custom-filter-report-favourites-csv": "Your own reports, and export to a spreadsheet",

  // Fuel surcharge
  "11-1-surcharge-scheme-model-w9-editor": "Setting up the surcharge",
  "11-2-domain-calculator-golden-set": "Working out the surcharge",
  "11-3-monthly-tpg-entry-historical-record": "Entering the monthly fuel price",
  "11-4-surcharge-invoice-line-applicability-flag-tpg-gate":
    "Putting the surcharge on the invoice",

  // Getting ready to go live
  "12-1-go-live-data-seeding": "Loading your real data in",
  "12-2-backup-restore-reconciliation-drill": "Practising backup and restore",
  "12-3-gates-verification-parallel-run-uat": "Final checks, running alongside your old system",
};
