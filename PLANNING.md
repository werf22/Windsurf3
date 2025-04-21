# PLANNING

Tags: Productivity, Task Management
AI keywords: Productivity, Task Management
AI summary: A personalized AI task management application aims to automate organization and data entry, featuring hierarchical task management, AI auto-categorization, task-specific chat, and comprehensive filtering. The MVP will focus on core task management and basic AI integration, with plans for advanced features and a robust technology stack.
Parent item: KÓD Potrebné (https://www.notion.so/K-D-Potrebn-1d675c7df218801dbe7dddc173b8cd28?pvs=21)

**I. High-Level Specification**

1. **Vision:** To create a personalized, intelligent task management application (Cerulík AI Task Manager) that leverages AI to automate categorization, data enrichment, and task assistance, acting as a central hub for managing all aspects of your personal and professional life based on your defined structure (Portfolio -> Project -> Section -> Task -> Subtask).
2. **Core Problem:** Traditional task managers require significant manual effort for organization, data entry, and planning. This app aims to minimize that effort by using AI to understand intent and context from minimal user input, keeping the detailed structure updated automatically.
3. **Key Features:**
    - **Hierarchical Task Management:** Strict adherence to the Portfolio -> Project -> Section -> Task -> Subtask structure.
    - **Rich Data Model:** Implementation of *all* your defined CSV fields as the core data structure for each task.
    - **Form-Based Input:** Simple form for creating new tasks, requiring only essential information.
    - **AI Auto-Categorization & Field Population:** AI analyzes new tasks (from form) and automatically fills/suggests values for Portfolio, Project, Section, Tags, Priority, Estimates, etc., based on your defined logic and documentation.
    - **Database-Wide AI Chat:** A global chat interface allowing natural language queries about the entire task database (e.g., "What should I focus on today?", "Show me all overdue tasks related to AI & Tech", "Plan my week"). AI can *modify* task data based on these commands.
    - **Task-Specific AI Chat:** An integrated chat within the detail view of each task. AI has full context of *that specific task's data* and can assist with:
        - Research relevant to the task.
        - Generating content (drafts, summaries).
        - Creating/suggesting actionable subtasks.
        - Answering questions about the task's context.
        - Updating the task's fields based on the chat conversation.
    - **Comprehensive Filtering & Sorting:** Ability to filter and sort the task list based on *any* field/column using various operators (equals, contains, greater/less than, P0-P100 priority sorting, date ranges, etc.).
    - **Intuitive UI:** Clear tree view navigation, detailed task view displaying all fields logically, and integrated chat interfaces.
4. **Target Platform:** Web application accessible via desktop (MacBook) and mobile browser (iPhone), potentially evolving into a Progressive Web App (PWA) or Electron desktop app later.

---

# PLANNING: Cerulík AI Task Manager

## 1. Vision & Mission

**Vision:** An intelligent, personalized task management system that acts as a proactive assistant, automating organization and aiding execution based on Jakub Cerulík's defined workflow and data structure.

**Mission:** To build a standalone web application that leverages AI to:
1.  Drastically reduce manual effort in task categorization and data entry.
2.  Provide contextual AI assistance directly within each task.
3.  Enable natural language interaction with the entire task database for planning and querying.
4.  Serve as the central, independent system for managing all tasks, replacing the need for external tools like Asana for this specific workflow.

## 2. Scope

### MVP (Minimum Viable Product) Scope:

- **Core Task Management:**
    - Create tasks via a dedicated form (capturing essential fields).
    - View tasks in a hierarchical tree structure (Portfolio -> Project -> Section -> Task).
    - View task details (displaying *all* defined fields).
    - Manually update task fields.
    - Delete tasks.
- **AI Integration (Core):**
    - **Auto-Categorization:** On new task creation via form, AI analyzes input (Name, Goal, Input Data, etc.) and populates Portfolio, Project, Section, and key Tags.
    - **AI Field Population:** AI attempts to fill other relevant fields (e.g., Priority estimation, Task Type, basic Notes summary) based on input and documentation.
    - **Task-Specific Chat (Basic):** Chat interface within task detail view. AI can answer questions based *only* on the provided task data and assist with simple actions like summarizing Input Data or suggesting initial Subtasks (for user) within the chat or Notes. AI updates Notes/Description and Task Comments based on chat.
- **Data & Display:**
    - Database implementation based on the full CSV field specification.
    - **Comprehensive Filtering & Sorting Foundation:** Implement backend API support and database indexing to enable filtering and sorting by **any** field/column. The frontend UI will initially expose controls for key fields (Priority, Due Date, AI Workflow Status, Project, Portfolio), but the underlying system must support querying by any field.
    - Initial import of existing tasks from the provided CSV.
- **Dropdown/Multi-select Options:** All Dropdown and Multi-select Dropdown fields **must** be implemented with the **exact options** specified in the user's documentation, loaded during database setup.
- **Foundation:**
    - User Authentication (Single user initially - Jakub Cerulík).
    - Basic responsive web UI for Desktop (Mac) and Mobile (iPhone).

### Post-MVP Scope:

- **Advanced AI:**
    - Global AI Chat for database-wide queries and actions.
    - AI automatically generating *and creating* structured Subtasks (for user) and Subtasks (for AI) entries.
    - AI proactively suggesting actions or identifying potential issues.
    - AI updating *any* task field based on chat commands (Global & Task-specific).
    - AI estimating time/cost fields more accurately.
    - T.V.G.R.O.W. coaching integration (potentially via chat/form).
- **Enhanced UI/UX:**
    - **Full Filtering/Sorting UI:** Expose frontend controls for filtering/sorting based on **all** fields with complex logic (contains, ranges, P0-100, etc.).
    - Customizable views (Board, Calendar).
    - Improved mobile experience / PWA.
    - Bulk editing capabilities.
- **Integrations:**
    - Calendar integration (read/write).
    - Pomodoro timer integration.
- **Other:**
    - Reporting & Analytics.
    - Offline capabilities.
    - AI fine-tuning/personalization based on user feedback/data.
    - In-app management of dropdown/multi-select options.

## 3. Technology Stack (Proposal)

- **Frontend:** **React** or **Vue.js** (Mature ecosystems, component-based, good for complex UIs). Tailwind CSS for styling.
- **Backend:** **Python** with **Flask** or **Django** (Excellent AI/ML library support, strong ORMs, suitable for building robust APIs).
- **Database:** **PostgreSQL** (Robust, handles relational data well, good text search capabilities, supports JSONB for flexible fields if needed, suitable for complex filtering/indexing).
- **AI:** **OpenAI API** (GPT-4 / GPT-4o or later models) - Primary choice for powerful language understanding and generation.
- **Deployment:**
    - Frontend: Vercel / Netlify (Easy deployment for React/Vue).
    - Backend & DB: Render / Heroku / AWS EC2 or Lightsail / Google Cloud Run (Choose based on cost/scalability needs).
- **(Optional) Real-time:** WebSockets (Libraries like [Socket.IO](http://socket.io/) for Python/Node.js) for instant chat updates.

## 4. Architecture Overview

1. **Frontend:** Handles user interface, form input, displays task data, constructs filter/sort requests, interacts with the Backend API. Manages UI state.
2. **Backend API:** Exposes endpoints for task CRUD, user auth, AI interactions (triggering categorization, chat processing). Contains business logic for workflow states. **Crucially, the task listing endpoint must accept dynamic filtering and sorting parameters for any field.**
3. **Database:** Stores all user data, task information (based on the defined fields), options for dropdowns, comments, etc. **Indexes will be critical for filtering/sorting performance.**
4. **AI Service Layer (Backend):** A dedicated module within the backend responsible for:
    - Securely managing the AI API key.
    - Constructing prompts for the AI (including task data and field documentation snippets).
    - Calling the external AI API (e.g., OpenAI).
    - Parsing the AI's response (e.g., JSON with field updates, chat message).
    - Updating the database based on the AI response.

## 5. Data Model

- The primary source of truth is the user's comprehensive CSV field documentation.
- This will be translated into a relational database schema using appropriate data types (TEXT, INTEGER, TIMESTAMP, VARCHAR, BOOLEAN, etc.).
- Relationships:
    - Tasks have a self-referencing relationship for Parent/Subtasks.
    - Tasks have relationships to Portfolio, Project, Section (potentially separate tables or foreign keys).
    - Multi-select fields (Tags, Related Portfolios/Projects/Sections/Tasks/Entities, Optimal Time of Day, etc.) will require separate join tables (Many-to-Many relationships).
    - **Dropdown fields will reference lookup tables containing the exact, allowed options from the user's documentation.** (e.g., status_options, priority_options, portfolio_options, etc.).
- **Database Indexes:** Need to be carefully planned and created on columns frequently used for filtering and sorting to ensure performance.

## 6. Key Challenges & Risks

- **AI Prompt Engineering:** Crafting effective and reliable prompts for categorization, field filling, and chat assistance across diverse task types. Ensuring the AI understands the *nuance* of each field.
- **UI Complexity:** Displaying and managing potentially ~60+ fields per task cleanly. Implementing a flexible and intuitive UI for filtering/sorting across *all* these fields.
- **Database Design & Performance:** Correctly modeling the complex relationships. Ensuring efficient querying (**especially universal filtering/sorting**) with proper indexing across a potentially large dataset.
- **AI Costs:** Managing OpenAI API usage costs.
- **Real-time Updates:** Implementing seamless updates in the UI after AI modifications.
- **Data Integrity:** Ensuring AI updates don't corrupt data. Maintaining consistency of dropdown options.

## 7. Success Metrics (Initial - MVP)

- User (Jakub Cerulík) can successfully create tasks via the form.
- AI correctly categorizes >80% of new tasks into the right Portfolio/Project/Section.
- AI successfully populates >70% of designated fields with reasonable suggestions.
- User can view all task details accurately, including correctly populated dropdowns.
- Task-specific chat provides relevant answers based on task data.
- Backend API supports filtering/sorting on *any* specified task field. Frontend UI allows filtering/sorting on key fields.
- MVP deployed and usable for daily task management, replacing the CSV workflow.