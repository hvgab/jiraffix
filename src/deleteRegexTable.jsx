import api from "@forge/api";

/**
 * On Issue creation, delete signature table.
 *
 * Code triggers on issue creation.
 * If there's a table in description root, check for regex.
 * If regex matches table, delete table.
 */

export async function run(event, context) {
  console.log("Delete table");
  console.log(`event: ${event}`);
  console.log(`context: ${context}`);

  let signatureRegex = new RegExp(".*maskineriet.no.*.(gif|jpe?g|png|bmp)");

  // Get issue
  let issue = await getIssue(event.issue.id);
  let issueJson = await issue.json();
  let description = issueJson.fields.description;
  console.log(`description.content.length: ${description.content.length}`);

  // Check if table in description
  for (let index = 0; index < description.content.length; index++) {
    console.log(description.content[index]);
    if (description.content[index].type == "table") {
      // check if any media url matches regex
      let tableJson = JSON.stringify(description.content[index]);
      console.log(`regex check: ${signatureRegex.test(tableJson)}`);
      if (signatureRegex.test(tableJson)) {
        description.content.splice(index, 1);
        index--;
      }
    }
  }
  console.log(`description.content.length: ${description.content.length}`);

  // Update issue description
  console.log("Update issue on Jira");
  await updateIssueDescription(event.issue.id, description);
}

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

async function recursiveNullFix(doc) {
  console.log(`Doing recursiveNullFix on: ${doc}`);
  if (!("content" in doc)) {
    console.log("No content to fix, next!");
    return doc;
  }
  for (let index = 0; index < doc.content.length; index++) {
    if (doc.content[index] === null || doc.content[index] === undefined) {
      delete doc.content[index];
    } else {
      await recursiveNullFix(doc.content[index]);
    }
  }
}

async function recursiveTableFix(doc) {
  console.log(`Doing recTableFix on: ${doc}`);
  let signatureRegex = new RegExp(".*maskineriet.no.*.(gif|jpe?g|png|bmp)");
  // If not content, we are at end of recursion.
  if (!("content" in doc)) {
    console.log("no content in doc:");
    console.log(doc);
    console.log(doc.type);
    console.log(`doc.type=media: ${doc.type == "media"}`);
    // Media
    if (doc.type == "media") {
      console.log(doc.attrs);
      console.log(`regex match: ${signatureRegex.test(doc.attrs.url)}`);
      if (signatureRegex.test(doc.attrs.url)) {
        return;
      }
    }
    console.log(
      "Doc has no content, and does not match any other rules. Keeping doc"
    );
    return doc;
  }

  console.log(`doc has content with length: ${doc.content.length}`);

  // Remove empty arrays
  if (doc.content.length == 0) {
    console.log("doc.content.length == 0");
    return;
  }

  // For each content-element do this again.
  console.log("doc.content.length != 0. Do recTableFix for each content in:");
  console.log(doc.content);
  for (let index = 0; index < doc.content.length; index++) {
    doc.content[index] = await recursiveTableFix(doc.content[index]);
    if (doc.content[index] === null || doc.content[index] === undefined) {
      delete doc.content[index];
    }
  }

  // After recursive fix is done, check if content is null
  console.log("check if content is null");
  console.log(doc.content);
  console.log(typeof doc.content);
  console.log(doc.content.length);
  if (
    doc.content.length == 1 &&
    (doc.content[0] === undefined || doc.content[0] === null)
  ) {
    console.log("array with undefined, returning nothing");
    return;
  }
  return doc;
}
