# Slack Approval Workflow Bot

This bot enables approval workflows using a `/approval-test` Slack slash command.

## Features

- Slash command: `/approval-test`
- Modal interface to select approver and write a reason
- Message posted in a shared channel
- Approver gets ephemeral buttons (Approve/Reject)
- Requester is notified in DM about the final decision

---

##  Technologies Used

- Node.js
- Express.js
- Slack Bolt SDK

---


## Setup Instructions

###  Clone the Repo

```bash
git clone https://github.com/Aazim-Sadan/Slack_Bot.git
cd Slack_Bot
```

---

### Install dependencies

---
```
npm insatll
```
### Create a .env file

```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
PORT=8000
CHANNEL_NAME=your-workspace
```
---

# Thanks
Thanks for checking out this project! Contributions, suggestions, and feedback are always welcome.
