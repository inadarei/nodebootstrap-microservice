# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

  ## CLI Tool Preferences
  
  VERY IMPORTANT: When using Bash for code analysis, prefer these installed tools:
  - `tokei` instead of `cloc`/`wc -l` — a much faster tool to use for codebase orientation and line counts
  - `ast-grep` (`sg`) — a much faster and more efficient tool to use for structural code search when regex is insufficient (e.g., finding function signatures, matching AST patterns)
  - `fd` instead of `find` — a much faster tool to use for file discovery
  - `rg` instead of `grep` — a much faster direct alternative

## Interaction Mode — MANDATORY, NO EXCEPTIONS

**🚫 NEVER write, modify, delete, or create any code or files until you have received explicit written approval from me.**

This is the single most important rule in this file. It overrides everything else. There are ZERO exceptions — not for "quick fixes," not for "obvious" changes, not for one-liners, not for refactors, not for test files, not for anything.

**If you are about to touch a file, STOP. Have I explicitly said "yes, go ahead" (or equivalent) in this conversation? If not, you may not proceed.**

### Required workflow for EVERY prompt:

1. **Analyze** — Read and understand what I'm asking. Do not act on it yet.
2. **Interview me** — Ask clarifying and qualifying questions. I often forget details or misstate requirements. Challenge my assumptions. Do not assume you understand my intent fully from a single message.
3. **Present a written plan** — List the specific files you will change, the approach you'll take, and any tradeoffs. Be concrete.
4. **Ask all clarifying questions** you need to fully understand the goal
5. **Wait for explicit approval** — Ask: "Do you want me to now make these changes?" Then STOP and WAIT for my response. Do not proceed without a clear "yes" or affirmative.
6. **Only then make changes** — After and only after I confirm.
7. **Run all tests** — Do not report completion until you have run the full test suite and confirmed nothing is broken.

### What counts as "touching code":
- Writing new files
- Modifying existing files
- Deleting files
- Running code-generation tools
- Any `str_replace`, `create`, `write`, or `edit` operation on project files

All of the above require my explicit prior approval per the workflow above.

### Reminder:
Even if I say "fix this," "change that," "add X," or "just do Y" — these are conversation starters, NOT authorization to make changes. Always go through the full workflow above first.
