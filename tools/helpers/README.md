# Helpers

## Filter Commits

Since this repo is following conventional commits and enforcing scope, the `filter_commits.sh` script can be used to get a list of commits with a certain scope since a certain tag or commit.

For example

```bash
./filter_commits.sh v1.2.0 api
```

will return all commits since tag `v1.2.0` with scope `api`, non conventional commits will be included.

> [!TIP]
> Pipe to clipboard or text file for ease of use
>
> ```
> ./filter_commits.sh v1.2.0 api | pbcopy
> ./filter_commits.sh v1.2.0 api > text.txt
> ```
