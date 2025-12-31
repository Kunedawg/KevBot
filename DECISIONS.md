# Decisions

This document is just to track some decisions made for KevBot.

1. The authentication workflow will result in 401 status code if a user is not logged in. A side effect will be red errors in the console, which happens when fetch does not return a 200 status code. This is expected behavior and will not be "fixed".
