# Cursor: How to Use Builder and Skills (backend-2.0)

Documentation for the AI-assisted development setup in this repo: **Builder** (rule) and **skills** get-context and unit-tests-staged.

---

## What’s in `.cursor/`

| Location                           | What it is                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `rules/builder.mdc`                | **Builder** rule: 6-step protocol for developing backend features.                                              |
| `skills/get-context/SKILL.md`      | **get-context** skill: how to get 100% context before coding (Jira, SQL Server, MongoDB, code).                  |
| `skills/unit-tests-staged/SKILL.md` | **unit-tests-staged** skill: write or update Jest tests for code that is ready to commit.                        |

---

## Required configuration

For the Builder and get-context to work with Jira, SQL Server, and MongoDB, you need the following.

### 1. Environment variables (`.env`)

In the project root, the `.env` file must contain connection details for **testing environments only** (never production):

- **SQL Server (testing):** `SQLSERVER_HOST`, `SQLSERVER_PORT`, `SQLSERVER_USER`, `SQLSERVER_PASSWORD`, `SQLSERVER_DATABASE`. The SQL Server MCP (`mcp.json`) uses this file; it must point only to testing databases (e.g. testdev, cincdefault).
- **MongoDB (testing):** The variable used by the MongoDB MCP (e.g. `MONGODB_ENV_CNN`) must be a connection string to a **testing** environment.

This way the agent only queries test data and does not touch production.

### 2. Atlassian (Jira) login

For the Jira connection to work (reading tickets, acceptance criteria, etc.) you must **sign in to Atlassian** from Cursor:

- In Cursor’s MCP configuration, the Atlassian server uses OAuth. The first time (or when the session expires) Cursor will prompt you to log in to Atlassian.
- Without that login, get-context and the Builder cannot read Jira tickets.

### 3. Disable write operations on MCPs (important)

The skills and Builder are designed for **read-only** use: querying Jira, SQL Server, and MongoDB, not creating or modifying data. To prevent the agent from accidentally running write operations:

- **You must manually disable** in Cursor the MCP tools that allow writes (PUT, POST, CREATE, UPDATE, DELETE, etc.) for each MCP server you use (Atlassian, SQL Server, MongoDB).
- How to do this depends on your Cursor version: usually under **Settings → MCP** (or the section where servers are configured) you can choose which tools for each server are enabled. Keep only read tools (e.g. GET, list, query, find, describe, `execute_query` with SELECT).
- **This step is important**; otherwise a misinterpreted instruction could run a CREATE/UPDATE/DELETE on Jira, SQL Server, or MongoDB.

Summary: `.env` with **testing** data, **Atlassian** login for Jira, and **manually disable** write tools for all MCPs.

---

## How to invoke them

- **Rule (Builder):** invoked with `@` → `@builder`
- **Skills:** invoked with `/` → `/get-context`, `/unit-tests-staged`

| What to use              | How to invoke    | Example message                                                                 |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------- |
| **Builder** (rule)       | `@builder`       | _Use @builder and develop ticket SUPER-522_                                     |
| **get-context** (skill)  | `/get-context`   | _Use /get-context and investigate how the Units flow works_                     |
| **unit-tests-staged** (skill) | `/unit-tests-staged` | _Use /unit-tests-staged and add tests for the code that was just developed_ |

- **Builder:** Use it when you want the full flow (analysis → context → TDD → implementation → wrap-up). The Builder already applies get-context in step 2, so you don’t need to mention both.
- **get-context only:** Use `/get-context` when you only want to **investigate** or gather context without implementing (e.g. before planning or in a separate conversation).
- **unit-tests-staged only:** Use `/unit-tests-staged` when you already have code ready to commit and only want to **add or update tests** for that code.

If you don’t invoke them explicitly, Cursor may still apply the rule or skill based on your message; using `@` or `/` ensures they are included in context.

---

## How to use the Builder

**When it runs:** When you ask to develop a **requirement, feature, or user story** from a Jira ticket or a text description.

**Examples:** _“Develop ticket SUPER-550”_ · _“Implement the X flow from the description I gave you”_

**The Builder’s 6 steps:**

1. **Requirements analysis** — Analyzes the ticket (Jira MCP if there’s an ID) or the text; identifies impact. If acceptance criteria are missing or scope is unclear, **asks for clarification** before coding.
2. **Context retrieval** — Applies the **get-context** skill: consults Jira, SQL Server, MongoDB, and code until it has full context. Does not implement until it knows which modules, tables/collections, and interfaces are affected.
3. **TDD** — Writes tests first (project style); tests must fail initially. For tickets with multiple parts, writes tests for **each** part before implementing.
4. **Development and iteration** — Implements until tests pass. Keeps the cycle: tests first → implementation. Iterates until tests and linter are green.
5. **Validation and refactoring** — Checks that the code follows the project’s modular pattern and re-runs the module’s tests.
6. **Wrap-up** — Delivers a **Backend feature summary** (what was done, endpoints, model changes, how to test). **Never** approves or merges to main; it only notifies the user.

**Important rules:**

- If scope is unclear (_“only X is left”_), it asks: _What deliverables do you want in this task?_
- For multi-part tickets, it gathers context for **all** parts before implementing.
- TDD is mandatory: tests first for each deliverable, then code.

---

## How to use get-context

**When:** Used automatically in **Builder step 2**. Also in any task that requires understanding the project before acting (_“Investigate how the Units flow works”_).

**Golden rule:** Have **100% of the context** before working. Don’t start until you can answer “yes” to: _Do I have everything I need to develop this task?_

**Loop (max 5 times):**

1. Ask: Do I have everything I need? **Yes** → exit and continue. **No** → consult.
2. Consult in one round: **Jira** (ticket, criteria), **SQL Server** (tables/columns if applicable), **MongoDB** (collections if applicable), **code** (modules, patterns, who consumes the flow).
3. Repeat. If after 5 iterations context is still incomplete: **do not** implement; return a concrete list of questions for the user.

Read-only operations only in Jira, SQL Server, and MongoDB.

---

## How to use unit-tests-staged

**When:** When you ask for tests for the code you just developed or for what you’re about to commit.

**Examples:** _“Add tests for the code I just developed”_ · _“Unit tests for what’s in the commit”_ · _“Tests for staged changes”_

**What it does:**

1. Lists changed files (`git status`, `git diff --name-only`).
2. Filters to production code in `src/` only (services, controllers, repos, etc.).
3. For each relevant file: if there’s no test, creates `src/<module>/tests/<Name>.test.js`; if one exists, updates it according to the change.
4. Runs `npm test` (or `npm test -- --testPathPattern=<module>`) to confirm tests pass.

It follows project conventions: Jest, repository mocks, `describe`/`it`, happy path + errors + edge cases.

---

## Quick reference

| Goal                          | What to say in Cursor                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Develop a Jira ticket        | _Use @builder and develop ticket SUPER-XXX_ (or without @: _“Develop ticket SUPER-XXX”_) |
| Develop a story from text    | _Use @builder and implement [flow description]_                                      |
| Investigate / context only   | _Use /get-context and investigate how X works_                                        |
| Tests for developed code     | _Use /unit-tests-staged and add tests for the code that was just developed_            |

The Builder **never** approves or merges; it only delivers the summary and notifies you to review and open the PR.
