#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Enhanced search and category features for movie booking SDK: Create dynamic search categories per film (not just IMAX - also Live Q&A, Live Activations, etc.), enable creation/deletion of search categories, implement enhanced time-based filtering (day vs evening showtimes), and optimize for mobile (iOS/Android focus). This SDK will be used in a decentralized media ecosystem."

backend:
  - task: "Dynamic Screening Categories API"
    implemented: true
    working: "NA"
    file: "/app/backend/routes/categories.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created new screening categories API with CRUD operations, default category initialization, and support for format/experience/special_event types. Includes 11 default categories like IMAX, Live Q&A, Live Activations, etc."

  - task: "Time Categorization System"
    implemented: true
    working: "NA"
    file: "/app/backend/routes/movies.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added automatic time categorization function that categorizes showtimes into morning, afternoon, evening, late_night. Added endpoint for getting available time categories with descriptions."

  - task: "Enhanced Movie Categories Management"
    implemented: true
    working: "NA"
    file: "/app/backend/routes/movies.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added endpoints to add/remove screening categories from movies and get categorized showtimes with filtering by time category and screening category."

  - task: "Updated Data Models"
    implemented: true
    working: "NA"
    file: "/app/backend/models.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Extended models to support ScreeningCategory, TimeSlot, ScreeningFormat with enhanced time and category support while maintaining backwards compatibility."

frontend:
  - task: "SDK Types Updated"
    implemented: true
    working: "NA"
    file: "/app/sdk/src/types/index.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated TypeScript interfaces to support new ScreeningCategory, TimeSlot, ScreeningFormat types with backwards compatibility for legacy TheaterFormat."

  - task: "Enhanced TheaterListings Component"
    implemented: true
    working: "NA"
    file: "/app/sdk/src/react/TheaterListings.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated TheaterListings component with tabbed filtering (formats/time), time category icons, enhanced mobile UI, and support for both new and legacy data structures."

  - task: "Utility Functions for Time/Categories"
    implemented: true
    working: "NA"
    file: "/app/sdk/src/utils/index.ts"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added utility functions for time categorization, category grouping, icon/label helpers, and filtering functions to support the enhanced search features."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Dynamic Screening Categories API"
    - "Time Categorization System"
    - "Enhanced TheaterListings Component"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Implemented Phase 1 of enhanced search and category features. Added backend APIs for dynamic screening categories (11 default types including IMAX, Live Q&A, Live Activations), time categorization system (morning/afternoon/evening/late_night), and enhanced movie category management. Updated SDK types and TheaterListings component to support new features with mobile optimization and backwards compatibility. Ready for testing of new API endpoints and component functionality."