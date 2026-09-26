# Product and Business Principles

## 1. Business Planning Before Implementation
Treat every project as a serious product asset, even if it begins as a personal utility.
Before large implementation, define:
- Who is this for?
- What problem does it solve?
- Why would someone use it?
- What is the core value?
- What is the smallest useful version (MVP)?
- What are the goals and constraints?
- How does it create value or generate revenue if monetization applies?

## 2. Velocity with Rigor
- Rapid iteration is essential, but speed without structure creates instant technical debt.
- Fast iteration must be protected by automated tests, explicit invariants, and clean boundaries.

## 3. Responsive Interaction and Performance Budgets
- User interactions must feel immediate. Do not block local interaction waiting for remote network roundtrips when cached state exists.
- Establish concrete performance budgets in `docs/engineering/PERFORMANCE.md` tailored to the specific project.

## 4. Data Integrity and User Autonomy
- User data is sacred. Never silently overwrite or erase historical records.
- Exportability and transparency are fundamental rights of the user.

## 5. Minimum Viable Polish
- Do not ship rough prototypes with missing loading states or broken empty screens.
- Every user-facing view must handle: Idle, Loading, Success, Error, and Empty states.
