#!/bin/bash
# Usage: ./filter_commits.sh <tag> <scope>
# Example: ./filter_commits.sh v1.2.0 api

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <tag> <scope>"
    exit 1
fi

TAG="$1"
TARGET_SCOPE="$2"

# List commits since the tag with their commit hash and subject.
git log "${TAG}"..HEAD --pretty=format:"%H %s" | while read -r commit rest; do
    subject="$rest"
    # Check if subject matches conventional commit pattern with a scope
    if echo "$subject" | grep -qE '^[a-z]+\([^)]*\):'; then
        # Extract the scope using sed (matches string between '(' and ')')
        scope=$(echo "$subject" | sed -E 's/^[a-z]+\(([^)]+)\):.*/\1/')
        if [ "$scope" = "$TARGET_SCOPE" ]; then
            echo "------------------------------------------------------------------------" #72
            echo "Commit: $commit"
            commit_msg=$(git show --no-patch --pretty=format:"%B" "$commit")
            printf "%s\n" "$commit_msg"
        fi
    else
        # For non-conventional commits, do the same.
        echo "------------------------------------------------------------------------" #72
        echo "Commit: $commit (non conventional commit)"
        commit_msg=$(git show --no-patch --pretty=format:"%B" "$commit")
        printf "%s\n" "$commit_msg"
    fi
done
