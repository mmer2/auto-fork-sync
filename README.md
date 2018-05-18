# Probot: GitHub Fork Sync

[![npm version](https://img.shields.io/npm/v/probot.svg)](https://www.npmjs.com/package/probot) 

## GitHub Permissions

This plugin requires these **Permissions & events** for the GitHub App:

#### Permissions
This app only makes use of the following permissions

| Permission | Additional Info | Access Level |
| :---: | :---: | :---: |
| `Pull requests` | | **Read & Write**
| `Repository contents` | | **Read & Write** |
| `Single File` | **Path:**`.github/auto-fork-sync.yml` | **Read-only** |

#### Events

These events are all recommended so that the synchronization process happens more regularly, but whether they are _required_ or not is noted in the table below.

| Event | Description | Required |
| :---: | :---: | :---: |
| `Push` | Git push to a repository | Yes |
| `Create` | Branch or tag created | Yes |


## Installing the app

1. Log in to GitHub
2. Navigate to the `Org` settings
3. Click the `GitHub Apps` link on the left
![github-org-settings](https://user-images.githubusercontent.com/865381/40181710-bdec9b5a-59b7-11e8-9175-1e8167ec46e0.png)
4. Provide the details for the app
![github-app-details](https://user-images.githubusercontent.com/865381/40181724-c5a4410e-59b7-11e8-82a0-9f900b8b20f4.png)
5. Select the permissions
![github-app-permissions](https://user-images.githubusercontent.com/865381/40181728-c852754c-59b7-11e8-9ebf-68d77bbd4eec.png)
6. Select the events to subscribe to
![github-app-events](https://user-images.githubusercontent.com/865381/40240036-a08c203e-5a85-11e8-9930-8f27387de402.png)
7. If this app will be used by other users and orgs, be sure to allow this to run on _Any account_
![github-app-make-public](https://user-images.githubusercontent.com/865381/40181781-edd6ee38-59b7-11e8-897e-d6bb2271e309.png)
8. Generate a `private key`
![github-app-generate-key-1](https://user-images.githubusercontent.com/865381/40181782-f1bddb7e-59b7-11e8-9e9b-4d568ec5e1a0.png)
![github-app-generate-key-2](https://user-images.githubusercontent.com/865381/40181790-f4994be4-59b7-11e8-8e95-2b5716409203.png)
9. Download and save the key
![github-app-download-key](https://user-images.githubusercontent.com/865381/40181798-fa39fbf2-59b7-11e8-95cd-eb77f4d30c6d.png)
10. Click on `Install App`
11. Select the `auto-fork-sync` app
12. Choose an organization to install it to
13. Select the repositories, or choose _All repositories_ and click `Install`
![github-app-install-to-org](https://user-images.githubusercontent.com/865381/40181802-fce86a32-59b7-11e8-974c-91cd8caf708b.png)
14. All done! Fork some repos!
![github-app-install-complete](https://user-images.githubusercontent.com/865381/40181808-ff7291d8-59b7-11e8-8b64-1610c2b0bbe0.png)

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
