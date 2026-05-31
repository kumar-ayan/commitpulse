# Fix Plan for Issue #2017

## Issue: GitHub token stored in client-side localStorage for API calls — token can be exfiltrated via XSS. Move all GitHub API calls to server-side with httpOnly cookies.

## Approach
The fix follows the steps described in issue #2017.

## Changes to Make
1. Identify the affected code
2. Apply the fix as described
3. Add tests to prevent regression

*This file was auto-generated. Actual code changes should be made per the issue description.*
