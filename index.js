import express from 'express';
import pkg from '@slack/bolt';
import dotenv from 'dotenv';
import { getChannelIdByName } from './utils/getChannelId.js';

dotenv.config();

const expressApp = express();
const { App, ExpressReceiver } = pkg;

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

const CHANNEL_NAME = process.env.CHANNEL_NAME; 
// Slash Command
slackApp.command('/approval-test', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'approval_modal',
        title: {
          type: 'plain_text',
          text: 'Create Approval',
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
        },
        blocks: [
          {
            type: 'input',
            block_id: 'approver_block',
            label: {
              type: 'plain_text',
              text: 'Select Approver',
            },
            element: {
              type: 'users_select',
              action_id: 'approver',
              placeholder: {
                type: 'plain_text',
                text: 'Choose a team member',
              },
            },
          },
          {
            type: 'input',
            block_id: 'reason_block',
            label: {
              type: 'plain_text',
              text: 'Request for Approval',
            },
            element: {
              type: 'plain_text_input',
              multiline: true,
              action_id: 'reason',
            },
          },
        ],
      },
    });
  } catch (err) {
    console.error(err);
  }
});

// Modal Submission
slackApp.view('approval_modal', async ({ ack, body, view, client }) => {
  await ack();

  const approverId = view.state.values.approver_block.approver.selected_user;
  const reason = view.state.values.reason_block.reason.value;
  const requesterId = body.user.id;

  // Get channel ID from name
  const channelId = await getChannelIdByName(client, CHANNEL_NAME);

  if (!channelId) {
    console.error('Channel not found.');
    return;
  }

  // Post shared message in the channel
  await client.chat.postMessage({
    channel: channelId,
    text: `📩 <@${requesterId}> requested approval from <@${approverId}>:\n>${reason}`,
  });

  // Send ephemeral message with buttons 
  await client.chat.postEphemeral({
    channel: channelId,
    user: approverId,
    text: `Approval request from <@${requesterId}>`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Approval Request from <@${requesterId}>:*\n>${reason}`,
        },
      },
      {
        type: 'actions',
        block_id: 'approval_action',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Approve',
            },
            style: 'primary',
            value: JSON.stringify({ requesterId }),
            action_id: 'approve_action',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Reject',
            },
            style: 'danger',
            value: JSON.stringify({ requesterId }),
            action_id: 'reject_action',
          },
        ],
      },
    ],
  });
});

// Approve Action
slackApp.action('approve_action', async ({ ack, body, client }) => {
  await ack();
  const { requesterId } = JSON.parse(body.actions[0].value);
  const approverId = body.user.id;

  // Notify in channel
  await client.chat.postMessage({
    channel: body.channel.id,
    text: `✅ <@${approverId}> approved request from <@${requesterId}>.`,
  });

  // DM requester
  await client.chat.postMessage({
    channel: requesterId,
    text: `✅ Your approval request was *approved* by <@${approverId}>.`,
  });
});

// Reject Action
slackApp.action('reject_action', async ({ ack, body, client }) => {
  await ack();
  const { requesterId } = JSON.parse(body.actions[0].value);
  const approverId = body.user.id;

  // Notify in channel
  await client.chat.postMessage({
    channel: body.channel.id,
    text: `❌ <@${approverId}> rejected request from <@${requesterId}>.`,
  });

  // DM requester
  await client.chat.postMessage({
    channel: requesterId,
    text: `❌ Your approval request was *rejected* by <@${approverId}>.`,
  });
});

// Start server
(async () => {
  await slackApp.start(process.env.PORT || 8000);
  console.log('Slack_Bot is running!!');
})();
