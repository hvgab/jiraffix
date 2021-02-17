import api from "@forge/api";

/* Jira Forge Tutorial */

export async function run(event, context) {
  console.log("Hello World!");
  const response = await addComment(
    event.issue.id,
    "Hello, comment from jiraffix"
  );
  console.log(`Response: ${JSON.stringify(response)}`);
}

async function addComment(issueId, message) {
  /**
   * @issueId - the jira issueid number for the issue
   *
   * @message {string} - the mesasge to comment
   *
   * @example addComment('1234', 'asødflkjwe', 'Hello World')
   */

  const requestUrl = `/rest/api/3/issue/${issueId}/comment`;
  const body = {
    body: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: message,
            },
          ],
        },
      ],
    },
  };

  let response = await api.asApp().requestJira(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status !== 201) {
    console.log(response.status);
    throw `Unable to add comment to issueId ${issueId}. Status: ${response.status}.`;
  }

  return response.json();
}
