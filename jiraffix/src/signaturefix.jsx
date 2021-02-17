import api from "@forge/api";
import { isNull } from "util";
let fs = require("fs");

/**
 * Signature fixer 2.0
 * To replace deleteRegexTable.
 */

export async function run(event, context) {
  console.log("Fix signature i description");
  console.log(`event: ${event}`);
  console.log(`context: ${context}`);
  let issue = await getIssue(event.issue.id);
  let issueJson = await issue.json();
  let description = issueJson.fields.description;

  // Recursivly fix description
  console.log(`description.content.length: ${description.content.length}`);

  // description = await recursiveTableFix(description);

  for (let index = 0; index < description.content.length; index++) {
    description.content[index] = await recursiveTableFix(
      description.content[index]
    );
    console.log("description.content.index");
    console.log(description.content[index]);
    if (
      description.content[index] === null ||
      description.content[index] === undefined
    ) {
      console.log("Delete node");
      delete description.content[index];
    }
  }

  // Update description
  console.log("Description after recursive fix");
  console.log(JSON.stringify(description, null, 2));

  // console.log("Fixing nulls in description");
  // description = await recursiveNullFix(description);
  // console.log("Description after remove null from array");
  // console.log(description);
  // console.log(JSON.stringify(description, null, 2));

  console.log("Update Jira");
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
  console.log(JSON.stringify(description, null, 2));

  const url = `/rest/api/3/issue/${issueId}`;
  const notifyUsers = false;
  const data = { fields: { description: description } };
  console.log(JSON.stringify(data, null, 2));

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
  console.log(await response.json());
}

async function recursiveTableFix(doc) {
  // console.log(`Doing recTableFix on: ${doc}`);
  let signatureRegex = new RegExp(".*maskineriet.no.*.(gif|jpe?g|png|bmp)");

  console.log(doc.content);

  // If not content, we are at end of recursion.
  if (!("content" in doc)) {
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
  } else {
    // Has content
    // Remove empty arrays
    if (doc.content === null || doc.content === undefined) {
      return;
    } else if (doc.content.length == 0) {
      return;
    } else {
      // For each content-element do this again.
      for (let index = 0; index < doc.content.length; index++) {
        doc.content[index] = await recursiveTableFix(doc.content[index]);
        console.log("result of nested content:");
        console.log(doc.content[index]);
        if (doc.content[index].content.length == 1) {
          if (
            doc.content[index].content[0] === null ||
            doc.content[index].content[0] === undefined
          ) {
            delete doc.content[index];
          }
        }
        if (doc.content[index] === null || doc.content[index] === undefined) {
          delete doc.content[index];
        }
      }
    }
    // Return fixed doc
    return doc;
  }
}
