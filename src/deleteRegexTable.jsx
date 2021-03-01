import api from "@forge/api";
import { getIssue, updateIssueDescription } from "./jiraApi.js";

/**
 * On Issue creation, delete signature table.
 *
 * Code triggers on issue creation.
 * If there's a table in description root, check for regex.
 * If regex matches table, delete table.
 */

//  TODO: Add this where the table was removed
/* 
{
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Signature removed",
          "marks": [
            {
              "type": "code"
            }
          ]
        }
      ]
    }
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
