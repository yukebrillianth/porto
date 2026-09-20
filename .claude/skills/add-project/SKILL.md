---
name: add-project
description: Add or update a portfolio project in Hygraph from a short brief. Use when the user wants to publish a new project to /projects, fill in an existing project's fields, or rewrite a project's details. Triggers on "tambah project", "add project", "input project ke hygraph", "publish project baru".
---

# Add a project to Hygraph

Turn a short brief from the user into a complete, published `Portfolio` entry.
The user supplies facts; you supply structure, English copy, and the Slate AST.

## Before writing anything

1. Run `mcp__hygraph__get_entity_schema` with `typename: "Portfolio"` to confirm
   the field list. Do not trust this file's field list over live schema.
2. Check whether the slug already exists:
   ```graphql
   query {
     portfolio(where: { slug: "<slug>" }, stage: DRAFT) {
       id
       title
     }
   }
   ```
   If it exists, `updatePortfolio`. If not, `createPortfolio`.

## Fields

| Field           | Type                     | Notes                                                                                                                                                                           |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`         | String, required         | `Name: Short descriptive subtitle`. Keep under ~60 chars.                                                                                                                       |
| `slug`          | String, required         | kebab-case, stable, never changed after publish.                                                                                                                                |
| `description`   | String, required         | One sentence. **Some entries carry a 100-character validation**; if the API rejects with `Expected value to have up to 100 characters`, shorten rather than removing the limit. |
| `date`          | Date, required           | Project start, `YYYY-MM-DD`. The year on cards derives from this.                                                                                                               |
| `endDate`       | Date                     | Omit for ongoing work; that renders as `2024 - Present`.                                                                                                                        |
| `projectStatus` | Enum                     | `SHIPPED`, `IN_PROGRESS`, `RESEARCH`, `ARCHIVED`, `CONCEPT`.                                                                                                                    |
| `category`      | Enum list                | `Website`, `Mobile`, `Robotics`, `Systems`, `Embedded`, `Design`.                                                                                                               |
| `techStack`     | String list              | Concrete names: `ROS 2`, `Nest.js`, `PostgreSQL`. Order by importance - the card shows the first three.                                                                         |
| `role`          | String                   | `Solo Developer`, `Lead Engineer`, `Network Engineer`.                                                                                                                          |
| `highlights`    | String list              | 3-4 outcome bullets. See below.                                                                                                                                                 |
| `featured`      | Boolean                  | `true` puts it on the homepage. Keep at most 3 featured.                                                                                                                        |
| `priority`      | Int                      | Sort weight, higher first. Existing: eKartar 100, DeltaConnect 90, Portfolio V3 50, Upvote 40.                                                                                  |
| `projectUri`    | String                   | Live URL.                                                                                                                                                                       |
| `repoUrl`       | String                   | Public repo, if any.                                                                                                                                                            |
| `public`        | Boolean, required        | `true` to list it.                                                                                                                                                              |
| `cover`         | Asset relation, required | Ask the user for an asset id, or reuse one from `images`.                                                                                                                       |
| `details`       | RichText                 | Optional. Omit when the brief is thin - highlights alone render well.                                                                                                           |

## Writing the copy

Read `docs/bio-context.md` for voice. Then:

- **English only**, even when the brief is in Indonesian.
- **No em dashes, no section signs.** Hard house rule. Use a plain hyphen.
- Lead with the problem, not the technology. "Counting jimpitan by hand meant
  every recount was a chance to lose money" beats "A Laravel application for...".
- Highlights are **outcomes with specifics**, not feature names:
  - Good: `Cut monthly recap from manual tallying to an instant automated report`
  - Bad: `Has an export feature`
- Never invent facts. If the brief does not say who used it or what it achieved,
  ask rather than filling the gap with plausible-sounding detail.

## details: the Slate AST

Hygraph RichText is a Slate AST, **not** HTML and **not** markdown.

Critical: when writing, pass `{children: [...]}` directly. Do **not** wrap in
`raw` - that wrapper only appears in read responses.

Pass the AST as a GraphQL **variable** typed `RichTextAST!`, never inlined into
the query string:

```graphql
mutation Details($d: RichTextAST!) {
  updatePortfolio(where: { slug: "<slug>" }, data: { details: $d }) {
    slug
  }
}
```

Node types: `paragraph`, `heading-two`, `heading-three`, `bulleted-list`,
`numbered-list`, `list-item`, `list-item-child`, `block-quote`, `code-block`,
`link`, `table`, `table_head`, `table_body`, `table_row`, `table_cell`,
`table_header_cell`.

Nesting that trips people up:

- `bulleted-list` > `list-item` > `list-item-child` > `paragraph` > text
- `table` > `table_head`/`table_body` > `table_row` > `table_cell` > `paragraph` > text
- Marks (`bold`, `italic`, `code`) go on the **text node**, not the block.

Start at `heading-two`; the page already renders the title as `h1`.

A shape that reads well: opening paragraph framing the problem, `heading-two`
sections, a numbered list for a process, a three-column table for the stack
(`Component | Technology | Role`), and a closing paragraph on the outcome.

## Publishing

`updatePortfolio` and `createPortfolio` only write DRAFT. Always publish:

```graphql
mutation {
  publishPortfolio(where: { slug: "<slug>" }, to: PUBLISHED) {
    slug
  }
}
```

Batch at most **2 publishes per mutation** - more returns
`429 concurrent operations limit exceeded`.

## After publishing

1. Verify against the PUBLISHED stage, not DRAFT.
2. If the dev server is not running, no rebuild is needed: pages are ISR with a
   1 hour window, and `app/api/revalidate/route.ts` handles webhook busting.
3. Report back what was created, and flag anything you had to guess.
