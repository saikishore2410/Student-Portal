# Security Specification & "Dirty Dozen" Test Spec

This document details the security contracts, invariants, and mock penetration test cases ("Dirty Dozen") designed to verify that the application's Firestore security rules cannot be breached.

## 1. Core Data Invariants

1. **User Identity & Role Access**: A user cannot claim a `role` of `teacher` during self-signup or edit unless they has been explicitly whitelisted.
2. **Document Ownership**: For cloud documents (`/documents/{docId}`), the `ownerId` MUST match the logged-in user’s authenticated email or UID. No student can read or edit another student's offline note.
3. **Secure Messaging Integrity**: A secure message must have `senderId` equal to the logged-in user's UID. A student can only view messages where they are the sender OR the receiver.
4. **Analytic Logs Protection**: Aggregated analytics are read-only for students and writeable only under system/educator credentials.
5. **No Orphaned Quiz Attempts**: Quiz attempts must capture accurate scores and lock in as immutable history. A student cannot alter their score after submission.

---

## 2. The "Dirty Dozen" Pen-Test Payloads

Below are the 12 JSON payloads designed to violate system constraints. The Firestore rules MUST reject each and every one of these.

### Payload 1: Privilege Escalation (Self-Assigned Teacher Key)
*   **Target**: `/users/student_hacker`
*   **Action**: `create` or `update`
*   **Vulnerability**: Student attempts to assign themselves the `teacher` role.
*   **Payload**:
    ```json
    { "id": "student_hacker", "name": "Evil Student", "email": "evil@university.edu", "role": "teacher" }
    ```

### Payload 2: Shadow Field Injection
*   **Target**: `/documents/doc_alice`
*   **Action**: `create`
*   **Vulnerability**: Attacking user Alice injects a shadow field `isVerifiedAdmin: true` to bypass structural checks.
*   **Payload**:
    ```json
    { "id": "doc_alice", "title": "Math Note", "content": "XYZ", "fileType": "note", "ownerId": "student_alice", "createdAt": "2026-06-06T00:00:00.000Z", "isVerifiedAdmin": true }
    ```

### Payload 3: Identity Spoofing in Secure Messages (Impersonating Sarah Jenkins)
*   **Target**: `/messages/msg_fraud`
*   **Action**: `create`
*   **Vulnerability**: A rogue student sends a message spoofing Dr. Sarah Jenkins' sender identity.
*   **Payload**:
    ```json
    { "id": "msg_fraud", "senderId": "teacher_sarah", "senderName": "Dr. Sarah Jenkins", "receiverId": "student_bob", "text": "A+ awarded, no final exam needed.", "timestamp": "2026-06-06T00:00:00.000Z" }
    ```

### Payload 4: Accessing Someone Else's PII Note
*   **Target**: `/documents/doc_private_bob`
*   **Action**: `get`
*   **Vulnerability**: Alice attempts to read Bob's personal study journal.
*   **Permission**: `PERMISSION_DENIED` expected for reads by non-owner.

### Payload 5: Overwriting Historic Quiz Attempt Scores
*   **Target**: `/quizAttempts/attempt_123`
*   **Action**: `update`
*   **Vulnerability**: Student attempts to alter an old failing quiz attempt score to 100%.
*   **Payload**:
    ```json
    { "score": 100, "passed": true }
    ```

### Payload 6: Resource Poisoning (Giant ID attack)
*   **Target**: `/calendar/OVER_THE_LIMIT_ID_JUNK_JUNK_JUNK_JUNK_JUNK_JUNK_JUNK_JUNK_JUNK_JUNK_JUNK_JUNK`
*   **Action**: `create`
*   **Vulnerability**: Attacker injects a massive string as the event ID to trigger memory exhaustion.
*   **Permission**: `PERMISSION_DENIED` expected via `isValidId()` checks.

### Payload 7: Client-Side Timestamp Tampering
*   **Target**: `/notifications/notif_spoof`
*   **Action**: `create`
*   **Vulnerability**: Student tries to backdate a notification alert.
*   **Payload**:
    ```json
    { "id": "notif_spoof", "title": "Slight alert", "message": "Done", "type": "info", "createdAt": "1999-01-01T00:00:00.000Z", "read": false }
    ```

### Payload 8: Blanket Scraping of Other Quiz Attempts
*   **Target**: `/quizAttempts`
*   **Action**: `list`
*   **Vulnerability**: Student tries to fetch all quiz attempts of other students by omission of where filters.
*   **Permission**: `PERMISSION_DENIED` expected unless proper query constraints are present.

### Payload 9: Hijacking Education Path Curriculums
*   **Target**: `/paths/path_quantum`
*   **Action**: `update`
*   **Vulnerability**: Student attempts to lock modules or change descriptions in the official courses.
*   **Permission**: `PERMISSION_DENIED` since only authorized educators/teachers can write to paths.

### Payload 10: Injecting Malicious Types in Course Notifications
*   **Target**: `/notifications/notif_malicious`
*   **Action**: `create`
*   **Vulnerability**: Injecting arrays where strings are required for alert level or messages.
*   **Payload**:
    ```json
    { "id": "notif_malicious", "title": [ "hack", "hack" ], "message": "Hacked", "type": "alert", "createdAt": "2026-06-06T00:00:00.000Z", "read": false }
    ```

### Payload 11: Modifying Immutable Historical Analytics
*   **Target**: `/analytics/student_1`
*   **Action**: `update`
*   **Vulnerability**: Student tries to decrement their active alert levels or change study hours.
*   **Permission**: `PERMISSION_DENIED` - student lacks write access.

### Payload 12: Messaging Leakage
*   **Target**: `/messages` (listing)
*   **Action**: `list`
*   **Vulnerability**: Querying messages without specifying `senderId` or `receiverId` checks in filters.
*   **Permission**: `PERMISSION_DENIED` unless properly scoped.

---

## 3. Test Runner Design

We can configure a declarative verification mapping for our test harness. The security rules will enforce:
1. `request.auth != null`
2. `isValidId(id)`
3. Valid payload shape checking via `isValid[Entity]()` helper functions
4. Precise `dataType` and `size()` checks.
