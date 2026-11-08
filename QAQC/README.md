# QAQC E2E

Headed Playwright CRUD tests using installed Brave. Current schema targets outlet `4` only.

## Setup

From `gaspol-cms`:

```bash
npm ci
```

Copy `QAQC/.env.qaqc.example` to `QAQC/.env.qaqc`, then set `QAQC_USERNAME` and `QAQC_PASSWORD`. The account JWT must contain `outlet_id: 4`.

No Playwright browser download is required. The default Brave path is `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`; override it with `QAQC_BROWSER_PATH` when needed.

Set `QAQC_HEADLESS=false` for visible Brave UI or `QAQC_HEADLESS=true` for background execution.

Set `QAQC_START_CMS=true` to let Playwright start the CMS. Otherwise, run CMS and API separately.

## Run

From the repository root:

```bash
node gaspol-cms/QAQC/run-all.js
node gaspol-cms/QAQC/schema/01-menu.js
```

From `gaspol-cms`:

```bash
node QAQC/run-all.js
node QAQC/schema/01-menu.js
```

Append Playwright arguments when needed:

```bash
node gaspol-cms/QAQC/run-all.js --list
node gaspol-cms/QAQC/schema/01-menu.js --debug
```

`run-all.js` discovers and runs every numbered `QAQC/schema/NN-name.js` file sequentially.

After execution, the console prints a CRUD table with each action, `PASS`/`FAIL`, and duration. The HTML report is written to `QAQC/playwright-report`; failure screenshots and traces are written to `QAQC/test-results`.

Playwright and dotenv are root `devDependencies`. Standard `npm ci` installs them; production installs must use `npm ci --omit=dev` to skip them.
