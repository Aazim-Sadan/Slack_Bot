// utils/getChannelId.js
export async function getChannelIdByName(client, name) {
    try {
      const list = await client.conversations.list({ exclude_archived: true });
      const found = list.channels.find(ch => ch.name === name.replace('#', ''));
      return found?.id;
    } catch (error) {
      console.error('Error fetching channel ID:', error);
      return null;
    }
  }
  