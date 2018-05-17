# auto-fork-sync
[![npm version](https://img.shields.io/npm/v/probot.svg)](https://www.npmjs.com/package/probot) 

a GitHub App built with [probot](https://github.com/probot/probot) that automatically syncs upstream changes to forks.


## Installing the app

### GitHub Permissions

This plugin requires these **Permissions & events** for the GitHub App:

- Issues - **Read & Write**
  - [ ] Check the box for **Issue comment** events
  - [ ] Check the box for **Issues** events
- Pull requests - **Read & Write**
  - [ ] Check the box for **Pull request** events
  - [ ] Check the box for **Pull request review** events
  - [ ] Check the box for **Pull request review comment** events
- Single File - **Read-only**
  - Path: `.github/auto-fork-sync.yml`
  
## Running the app

### Running in native NodeJS

```bash
# Install dependencies
npm install
```
```bash
# Start the bot
npm start
```

### Running in Docker
1. Clone the repository
```bash
$ git clone https://github.com/primetheus/auto-fork-sync.git
$ cd auto-fork-sync
```
2. Build the image
```bash
docker build -t github/auto-fork-sync .
```
3. Run the container
```bash
docker run -ditp 3000:3000 --restart unless-stopped --name auto-fork-sync github/auto-fork-sync
```
