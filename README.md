# ubermetroid.github.io

Personal GitHub Pages site — live at **[ubermetroid.github.io](https://ubermetroid.github.io/)**.

A deliberately boring single-page portfolio: one hand-written `index.html`, one inline
stylesheet, no framework, no build step, no JavaScript. Nothing here to install.

## What this repo is

This repo owns only the *index page* and the project pages that are hosted in-place
alongside it. Most linked projects live in their own repositories and deploy their own
Pages sites into subpaths of this domain (`/ahamkara/`, `/glances-rs/`).

| Path | Served from |
|---|---|
| `/` | `index.html` (this repo) |
| `/dockd/` | `dockd/` (this repo) |
| `/glances-rs/` | `glances-rs/` (this repo) |
| `/ahamkara/` | deployed by [ahamkara](https://github.com/UberMetroid/ahamkara) |

## Files

```
index.html              the portfolio index — all project cards live here
dockd/                  dockd landing page + install.sh / uninstall.sh
glances-rs/             glances-rs landing page + about page
package.json            metadata only; no dependencies, nothing to install
LICENSE                 Apache-2.0
```

## Adding a project

Add an `<a class="project">` block to the `.projects` container in `index.html`.
The CSS class handles all styling — a project card is a heading and one sentence:

```html
<a class="project" href="https://github.com/UberMetroid/example">
  <h2>example &rarr;</h2>
  <p>One sentence on what it is and why it exists.</p>
</a>
```

Use a `target="_blank" rel="noopener"` link for anything off-domain.

## Deployment

GitHub Pages serves `master` directly — there is no CI workflow and no build to wait on.
A push to `master` goes live in a minute or two. To sanity-check a change before pushing:

```sh
python3 -m http.server 8000
```

then open <http://localhost:8000>.

## Conventions

- Keep `index.html` hand-editable. No frameworks, no bundlers, no inline scripts.
- Respect `prefers-color-scheme` — the dark palette is a `:root` override block.
- Internal project links are root-relative (`/project/`), never relative (`../`).

## License

Apache-2.0 — see [LICENSE](LICENSE).