async function getIssue(issueId) {
  const requestUrl = `/rest/api/3/issue/${issueId}`;
  let response = await api.asApp().requestJira(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok === true) {
    console.error(
      `Could not get issue ${issue}: ${response.status} - ${response.statusText}`
    );
    throw `Unable to get issue. issueId: ${issueId}. Status: ${response.status}.`;
  }
  return response;
}

async function updateIssueDescription(issueId, description) {
  console.log("Update issue description");
  console.log(JSON.stringify(description));

  const url = `/rest/api/3/issue/${issueId}`;
  const notifyUsers = false;
  const data = { fields: { description: description } };

  const response = await api.asApp().requestJira(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    notifyUsers: notifyUsers,
  });

  console.log(`Response: ${response.status} ${response.statusText}`);
}

export { getIssue, updateIssueDescription };
